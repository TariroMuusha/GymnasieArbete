import { Socket } from '../server/socket';
// @ts-expect-error
import { io } from 'socket.io/client-dist/socket.io.js';

const socket = io() as Socket;
const input = { x: 0, y: 0 };
const prev = { x: Infinity, y: Infinity };
const wheel = document.getElementById('wheel') as HTMLElement;
const throttle = document.getElementById('throttle') as HTMLElement;
const throttleContainer = document.getElementById('throttleContainer') as HTMLElement;
let tiltMode = true;

setInterval(() => {
	tiltMode ? throttleHandler() : gamepadHandler();
	input.y = Math.max(Math.min(input.y, 1), -1);
	input.x = Math.max(Math.min(input.x, 1), -1);
	if (prev.x !== input.x || prev.y !== input.y) {
		wheel.style.transform = `rotate(${input.x * 60}deg)`;
		throttle.style.top = `calc(${50 - input.y * 50}% - 4pt)`;
		throttleContainer.style.backgroundColor = `hsl(${(1 - Math.abs(input.y)) * 120}, 50%, ${
			Math.abs(input.y) * 30 + 20
		}%)`;
		prev.x = input.x;
		prev.y = input.y;
	}
	socket.emit('input', input);
}, 20);

const delay = async (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const notification = document.getElementById('notification') as HTMLElement;
const notificationText = document.querySelector('#notification h1') as HTMLTitleElement;

async function notify(content: string, ms = 2000) {
	notificationText.innerText = content;
	notification.classList.add('active');
	await delay(ms);
	notification.classList.remove('active');
	return;
}

import { Gamepad } from './gamepad.js';

const gamepad = new Gamepad();
const buttonMap = new Map<string, number>();
const gamepadBtn = document.getElementById('gamepad') as HTMLElement;

gamepadBtn.addEventListener('click', async () => {
	if (tiltMode) {
		gamepad.update();
		await notify('Hold down gas', 2000);
		gamepad.update();
		buttonMap.set(
			'gas',
			gamepad.gamepad.findIndex((v) => v)
		);
		await delay(500);
		await notify('Hold down break', 2000);

		gamepad.update();
		buttonMap.set(
			'break',
			gamepad.gamepad.findIndex((v) => v)
		);
		tiltMode = false;
	} else tiltMode = true;
});

function gamepadHandler() {
	gamepad.update();
	const { x, x2 } = gamepad.getAxis();
	input.x = x || x2;

	if (gamepad.getButtonDown(buttonMap.get('gas') || 0)) {
		input.y += 0.1;
	} else if (gamepad.getButtonDown(buttonMap.get('break') || 0)) {
		input.y -= 0.1;
	} else {
		input.y = 0;
	}
}

const angleHelper = (n: number, max: number) => (n > max ? max : n < -max ? -max : n) / max;

window.addEventListener('deviceorientation', ({ beta }: DeviceOrientationEvent) => {
	if (beta != null) input.x = angleHelper(beta, 45);
});

const gas = document.getElementById('gas') as HTMLElement;
const Break = document.getElementById('break') as HTMLElement;
const heldDown = { break: false, gas: false };

function throttleHandler() {
	if (heldDown.gas) input.y += 0.1;
	else if (heldDown.break) input.y -= 0.1;
	else input.y = 0;
}

(() => {
	const setThrottle = (throttle: boolean) => (heldDown.gas = throttle);
	gas.addEventListener('touchstart', () => setThrottle(true));
	gas.addEventListener('mousedown', () => setThrottle(true));
	gas.addEventListener('touchend', () => setThrottle(false));
	gas.addEventListener('mouseup', () => setThrottle(false));
	gas.addEventListener('mouseleave', () => setThrottle(false));

	const setBreak = (throttle: boolean) => (heldDown.break = throttle);
	Break.addEventListener('touchstart', () => setBreak(true));
	Break.addEventListener('mousedown', () => setBreak(true));
	Break.addEventListener('touchend', () => setBreak(false));
	Break.addEventListener('mouseup', () => setBreak(false));
	Break.addEventListener('mouseleave', () => setBreak(false));
})();

const fullscreen = document.getElementById('fullscreen') as HTMLElement;

fullscreen.addEventListener('click', () => {
	if (fullscreen.classList.contains('exit')) {
		if (document.exitFullscreen) document.exitFullscreen();
		fullscreen.classList.remove('exit');
	} else {
		if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
		fullscreen.classList.add('exit');
	}
});

const priority = document.getElementById('priority');
priority?.addEventListener('click', () => socket.emit('setPriority', null));
