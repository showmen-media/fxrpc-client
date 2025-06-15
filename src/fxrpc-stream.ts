const BSON = require('bson');


export default class FxRpcStream {

	public readonly client;
	public readonly stream;

	constructor(client, method) {
		this.client = client;
		this.stream = client[method]();
	}

	subscribe(callback) {
		return this.stream.on('data', (msg) => callback(
			BSON.deserialize(msg.data)
		));
	}

	send(data) {
		const bsonBuffer = BSON.serialize(data);
		return this.stream.write({ data: bsonBuffer });
	}

	end() {
		return this.stream.end();
	}
}
