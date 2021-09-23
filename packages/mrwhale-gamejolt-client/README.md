# `@mrwhale-io/gamejolt-client`

Client that allows you to connect and interact with the [Game Jolt](https://gamejolt.com) chat server and site API.

## Install

```bash
$ npm install @mrwhale-io/gamejolt-client
```

## Usage

```typescript

import { Client, Message } from "@mrwhale-io/gamejolt-client";

const client = new Client({
  userId: 12345,
  frontend: "63236usr1f9oqq0p4aksa9ql4c",
});

client.on("message", (message: Message) => {
  if (message.textContent === "ping") {
    message.reply("pong");
  }
});
```

## License

[MIT](https://tldrlegal.com/license/mit-license)