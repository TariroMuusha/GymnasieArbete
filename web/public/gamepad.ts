interface Axis {
	x: number;
	y: number;
	x2: number;
	y2: number;
}

export class Gamepad {
	gamepad: boolean[] = [];
	axis = { x: 0, y: 0, x2: 0, y2: 0 };

	private updateGamepad(): void {
		const pads = navigator.getGamepads();
		this.axis = { x: 0, y: 0, x2: 0, y2: 0 };
		if (pads[0]) {
			const pad = pads[0];
			this.gamepad = pad.buttons.map((v) => v.pressed) as boolean[];
			this.axis.x = Math.abs(pad.axes[0]) > 0.15 ? pad.axes[0] : 0;
			this.axis.y = -(Math.abs(pad.axes[1]) > 0.15 ? pad.axes[1] : 0);
			this.axis.x2 = Math.abs(pad.axes[2]) > 0.15 ? pad.axes[2] : 0;
			this.axis.y2 = -(Math.abs(pad.axes[3]) > 0.15 ? pad.axes[3] : 0);
		}
	}

	public update = (): void => this.updateGamepad();

	public getButtonDown = (e: number): boolean => Boolean(this.gamepad[e]);

	public getAxis = (): Axis => this.axis;
}
