import FxRpcStream from "./fxrpc-stream";


type ObjControlStreamPackage = {
	fnId: string;
	resultId?: string;
	resultObjects?: Record<string, object>;
	error?: string;
};

export default class FxControl {

	private stream: FxRpcStream;
	private registry: FinalizationRegistry<string>;
	private resolvers = {};

	constructor(client) {
		this.stream = new FxRpcStream(client, "ObjControlStream");
		this.stream.subscribe(this._onData);
		this.registry = new FinalizationRegistry<string>(this._release);
	}

	private _onData = (data: ObjControlStreamPackage) => {
		const { fnId, resultId, resultObjects, error } = data;
		const proxies = {};

		Object.entries(resultObjects || {}).forEach(([id, object]) => {
			if (!(object instanceof Object)) {
				proxies[id] = object;
				return;
			}

			if (object['__##function']) {
				proxies[id] = (...args) => this._call(
					object['__##function'],
					...args
				);
			}
			else {
				proxies[id] = new Proxy(object, {
					get(target, key) {
						const value = target[key];
						if (value) {
							if (value['__##object'])
								return proxies[value['__##object']];
							if (value['__##function']) {
								const fn = (...args) => this._call(
									value['__##function'],
									...args
								);
								return new Proxy(fn, {
									get(target, prop) {
										return target[prop] || value[prop];
									}
								});
							}
						}
						return value;
					}
				});
			}

			this.registry.register(proxies[id], id);
		});

		// if (!fnId) return;

		const resolver = this.resolvers[fnId];
		delete this.resolvers[fnId];

		if (!resolver)
			return console.warn(`No resolver found for fnId: ${fnId}`);

		if (error)
			return resolver.reject(new Error(error));

		if (resultId === null)
			return resolver.resolve(undefined);

		if (resultId === undefined) {
			resolver.reject(new Error(`No resultId provided`));
			return console.error(`No resultId provided in data:`, data);
		}

		if (proxies[resultId] === undefined) {
			resolver.reject(new Error(`Object not found`));
			return console.error(`No object found for resultId: ${resultId} in data:`, data);
		}

		resolver.resolve(proxies[resultId]);
	}

	private _call(fn: string, ...args: any[]) {
		const id = crypto.randomUUID();
		const promise = new Promise((resolve, reject) => {
			this.resolvers[id] = { resolve, reject };
		});
		this.stream.send({ id, fn, args });
		return promise;
	}

	private _release = (id: string) =>
		 this._call("_release", id);

	public get = (...path: string[]) =>
		 this._call("_get", ...path);

	public emit = (event: string, ...args: any[]) =>
		 this._call("emit", event, ...args);

	public emitNet = (event: string, ...args: any[]) =>
		 this._call("emitNet", event, ...args);

}
