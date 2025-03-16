# `@mrwhale-io/gamejolt-client`

Client that allows you to connect and interact with the [Game Jolt](https://gamejolt.com) chat server and site API.

## Table of Contents

- [Install](#install)
- [Usage](#usage)
- [Features](#features)
- [Configuration](#configuration)
- [Examples](#examples)
- [License](#license)

## Install

```bash
$ npm install @mrwhale-io/gamejolt-client
```

## Usage

```typescript
import { Client, Message } from "@mrwhale-io/gamejolt-client";

import * as config from "./config.json";

// Create an instance of the client
const client = new Client({
  userId: 12345,
  frontend: config.frontend,
  mrwhaleToken: config.mrwhaleToken,
});

// Join a group chat
client.chat.joinRoom(12345);

// Listen for chat message events
client.on("message", (message: Message) => {
  if (message.textContent === "ping") {
    // Reply to the received chat message
    message.reply("pong");
  }
});
```

## Features

- Connect to Game Jolt chat server
- Interact with Game Jolt site API
- Send and receive chat messages from private and group chats
- Manage friends and groups
- Handle notifications and other events

## Configuration

### Client Options

- `userId`: The user ID of the client.
- `frontend`: The frontend token for authentication.
- `apiBaseUrl`: The base URL for the Game Jolt API (optional).
- `chatBaseUrl`: The base URL for the Game Jolt chat server (optional).
- `rateLimitRequests`: The max number of requests that can be made before rate limiting. (optional)
- `rateLimitDuration`: The max duration of rate limiting. (optional)
- `mrwhaleToken`: The token that let's Game Jolt know that the client is Mr. Whale.

## Examples

### Sending a Message

```ts
const roomId = 12345;
client.chat.sendMessage("Hello, Game Jolt!", roomId);
```

### Join a Chat Room

Before you can receive messages from a chat you must join it.

```ts
const roomId = 12345;
client.chat.joinRoom(roomId);
```

A list of group chats the client is a member of can be found on the following property

```ts
const groupIds = client.chat.groupIds;
```

### Fetching Friend Requests

You can fetch friend requests using the following method

```ts
const friendRequests = await client.fetchFriendRequests();
```

Or you can listen on the `friend_requests` event which fires every minute

```ts
client.on("friend_requests", (requests: FriendRequest[]) => {
  console.log(requests);
}
```

### Accepting a Friend Request

```ts
const friendRequestId = 67890;
client.api.friends.acceptFriendRequest(friendRequestId);
```

### Sending a Friend Request

```ts
const userId = 12345;
client.api.friends.sendFriendRequest(userId);
```

## License

[MIT](https://tldrlegal.com/license/mit-license)
