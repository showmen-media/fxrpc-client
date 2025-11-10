# fxrpc-client

Typed RPC client for remote execution on Cfx.re/FiveM servers. Works with the companion [`fxrpc-server`](https://github.com/showmen-media/fxrpc-server) resource to send and receive strongly-typed requests and responses over Protobuf.

Useful when you want to develop a Node.js application without being restricted to developing within a FiveM resource or using the often outdated Node.js version required by FXServer.

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](#license)

## What is it?

**fxrpc-client** is a lightweight, TypeScript-first client library that speaks to a FiveM/Cfx.re server over a small RPC layer (using a shared `fxsrv.proto` schema). It’s designed to be fast, predictable, and easy to integrate in Node.js apps, game services, dashboards, bots, or back-office tools that need to call into your FiveM server.

- ⚡ **Fast & lean:** minimal overhead around request/response.
- 🔒 **Predictable contracts:** Protobuf messages for schemas.
- 🧪 **DX-focused:** TypeScript types, simple API.
- 🤝 **Made to pair with:** [`fxrpc-server`](https://github.com/showmen-media/fxrpc-server).

## Use cases

- External web service calling server logic (e.g., whitelist checks, economy ops).
- Dev tools to run admin or maintenance commands safely.
- Analytics/telemetry collectors requesting data snapshots.

## Requirements

- Node.js 18+ (recommended)
- Access to a running FiveM/Cfx.re server using `fxrpc-server`

## Installation

### NPM
Build this repository into a `.tgz` and `npm install` the file for now

## Quick start/Example

```ts
import FxRpc from 'fxrpc-client';

const FXRPC_URL = process.env.FXRPC_URL;
const FxServer = new FxRpc(FXRPC_URL, FxRpc.credentials.createInsecure());

// Log QBCore citizenid of players in game
const QBCore = await FxServer.call(["exports", "qb-core", "GetCoreObject"]);
const players = await QBCore.Functions.GetQBPlayers();
console.log(
	Object.values(players).map(p => p.PlayerData.citizenid)
);
```

## API

```ts
new FxRpc(address, credentials, optionalDebugBool)
```

### Methods
#### Remote Objects & Execution
These two main methods handle basic functionality
- `.get()` an FXServer variable
	```ts
	get(...path: string[]): Promise<unknown>
	```
- `.call()` an FXServer function
	```ts
	call(path: string[], ...args: any[]): Promise<any>;
	```

#### Remote Events
The following four methods mirror their counterpart [FiveM server-side JavaScript functions](https://docs.fivem.net/docs/scripting-reference/runtimes/javascript/server-functions/).

If you attempt to call them remotely via the previously mentioned `.call()` function, you will get an error. It is best the functions are used as described below.

- `.emit()`
	```ts
	emit(event: string, ...args: any[]): Promise<unknown>;
	```
- `.emitNet()`
	```ts
	emitNet(event: string, ...args: any[]): Promise<unknown>;
	```
- `.on()`
	```ts
	on(event: string, callback: (...args: any[]) => void): void;
	```
- `.onNet()`
	```ts
	onNet(event: string, callback: (...args: any[]) => void): void;
	```
