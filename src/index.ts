const grpc = require('@grpc/grpc-js');
const protoLoader = require("@grpc/proto-loader");

import FxEvents from './events';
import FxControl from './control';

const PROTO_PATH = '../fxsrv.proto';
const packageDef = protoLoader.loadSync(PROTO_PATH);
const proto = grpc.loadPackageDefinition(packageDef).rpcservice;


export default class FxRpc {

	public static readonly credentials = grpc.credentials;

	public readonly service;
	private _eventsStream: FxEvents;
	private _controlStream: FxControl;

	constructor(address, credentials) {
		this.service = new proto.RpcService(address, credentials);
	}

	private _getControlStream() {
		if (this._controlStream) return this._controlStream;
		this._controlStream = new FxControl(this.service);
		return this._controlStream;
	}

	public async get(...path: string[]) {
		if (path.length === 0) return null;
		if (['emit', 'emitNet', 'on', 'onNet'].includes(path[0])) {
			throw new Error(
				`The '${path[0]}' method must be called directly on the FxRpc instance, not through the get method.`
			);
		}
		return this._getControlStream().get(...path);
	}

	public emit(event: string, ...args: any[]) {
		return this._getControlStream().emit(event, ...args);
	}

	public emitNet(event: string, ...args: any[]) {
		return this._getControlStream().emitNet(event, ...args);
	}


	private _getEventsStream() {
		if (this._eventsStream) return this._eventsStream;
		this._eventsStream = new FxEvents(this.service);
		return this._eventsStream;
	}

	public on(event: string, callback: (...args: any[]) => void) {
		return this._getEventsStream().on(event, callback);
	}

	public onNet(event: string, callback: (...args: any[]) => void) {
		return this._getEventsStream().onNet(event, callback);
	}

}
