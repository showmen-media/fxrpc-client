import FxRpcStream from "./fxrpc-stream";


export default class FxEvents {

	private stream: FxRpcStream;
	private subs = {};
	private netSubs = {};

	constructor(client) {
		this.stream = new FxRpcStream(client, "EventsStream");
		this.stream.subscribe(this._onData);
	}

	private _onData = (data) => {
		const { event, isNet, args } = data;
		if (!isNet && this.subs[event]) {
			this.subs[event].forEach(callback => callback(...args));
		}
		else if (isNet && this.netSubs[event]) {
			this.netSubs[event].forEach(callback => callback(...args));
		}
	};

	public on(event: string, callback: (...args: any[]) => void) {
		if (!this.subs[event]) {
			this.subs[event] = [];
			this.stream.send({ event, net: false, subscribe: true });
		}
		this.subs[event].push(callback);
	}

	public onNet(event: string, callback: (...args: any[]) => void) {
		if (!this.netSubs[event]) {
			this.netSubs[event] = [];
			this.stream.send({ event, net: true, subscribe: true });
		}
		this.netSubs[event].push(callback);
	}

}
