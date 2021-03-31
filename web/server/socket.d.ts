import socketio from 'socket.io';

export interface Events {
	input: {
		x: number;
		y: number;
	};
	setPriority: null;
	disconnect: string;
}

export interface Socket extends socketio.Socket {
	on: <K extends keyof Events>(event: K, listener: (data: Events[K]) => void) => this;
	emit: <K extends keyof Events>(event: K, data: Events[K]) => boolean;
}
