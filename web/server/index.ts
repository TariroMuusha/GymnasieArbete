import { createServer } from 'https';
import { resolve } from 'path';
import { readFileSync } from 'fs';

import sirv from 'sirv';
import polka from 'polka';
import compression from 'compression';

const app = polka();
const https = createServer(
	{
		key: readFileSync(resolve(`${__dirname}/../keys/key.pem`), 'utf-8'),
		cert: readFileSync(resolve(`${__dirname}/../keys/cert.pem`), 'utf-8'),
	},
	app.handler as RequestListener
);

const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const sPort = new SerialPort(process.argv[2] || 'COM1', { baudRate: 9600 });
const parser = sPort.pipe(new Readline({ delimiter: '\n' }));
let write = (data: string | Buffer): Promise<void> =>
	new Promise((resolve, reject) =>
		sPort.write(data, (err: Error) => {
			if (err) reject(err);
			else resolve();
		})
	);

sPort.on('error', (error: Error) => {
	console.log('Serial error, please restart server to reconnect.');
	console.log(error.message);
	write = async () => {};
});
sPort.on('open', () => console.log('Serial connection established on', process.argv[2] || 'COM1'));
parser.on('data', (data: string) => console.log('Serial data:', data));

const communicate = ({ x, y }: { x: number; y: number }) => {
	const X = Math.min(Math.max(Math.floor(((x + 1) / 2) * 255), 0), 255);
	const Y = Math.min(Math.max(Math.floor(((-y + 1) / 8) * 255 + 96), 0), 255);
	write(((X << 8) | Y).toString());
};

let i: { x: number; y: number } = { x: 0, y: 0 };
setInterval(() => {
	communicate(i);
}, 50);

import { Socket } from './socket';

let currentSocket = '';

require('socket.io')(https).on('connection', (socket: Socket) => {
	currentSocket = socket.id;
	socket.on('input', (input) => {
		if (currentSocket === socket.id) i = input;
	});
	socket.on('setPriority', () => (currentSocket = socket.id));
	socket.on('disconnect', () => {
		if (socket.id === currentSocket) {
			currentSocket = '';
			i = { x: 0, y: 0 };
		}
	});
});

const dev = process.env.NODE_ENV === 'development';

app.use(compression({ threshold: 0 }), sirv(resolve(`${__dirname}/../public`), { dev }));

import { lookup } from 'dns';
import { hostname } from 'os';
import { RequestListener } from 'http';

const port = process.env.PORT || 3000;

https.listen(port, () =>
	lookup(hostname(), function (err, addr) {
		if (err) throw err;
		console.log(`https://localhost:${port}`);
		console.log(`https://${addr}:${port}`);
	})
);
