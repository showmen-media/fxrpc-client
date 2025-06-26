const BSON = require('bson');


export default class FxRpcStream {

	public readonly client;
	public readonly stream;
	public readonly method;

	constructor(client, method) {
		this.client = client;
		this.stream = client[method]();
		this.method = method;
	}

	subscribe(callback) {
		return this.stream.on('data', (msg) => {
			const data = BSON.deserialize(msg.data);
			if (this.client.debug) {
				console.debug(`${this.method} received data:`, data);
			}
			return callback(data);
		});
	}

	send(data) {
		if (this.client.debug) {
			console.debug(`${this.method} sending data:`, data);
		}
		const bsonBuffer = BSON.serialize(data);
		return this.stream.write({ data: bsonBuffer });
	}

	end() {
		return this.stream.end();
	}
}
