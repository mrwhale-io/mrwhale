declare module "phoenix-channels" {
  export class Push {
    constructor(
      channel: Channel,
      event: string,
      payload: Record<string, unknown>,
      timeout: number
    );
    send(): void;
    resend(timeout: number): void;
    receive(status: string, callback: (response?: unknown) => unknown): this;
  }

  export class Channel {
    constructor(
      topic: string,
      params?: Record<string, unknown> | (() => Record<string, unknown>),
      socket?: Socket
    );
    join(timeout?: number): Push;
    leave(timeout?: number): Push;
    onClose(
      callback: (payload: unknown, ref: unknown, joinRef: unknown) => void
    ): void;
    onError(callback: (reason?: unknown) => void): void;
    onMessage(event: string, payload: unknown, ref: unknown): unknown;
    on(event: string, callback: (response?: unknown) => void): number;
    off(event: string, ref?: number): void;
    push(
      event: string,
      payload: Record<string, unknown>,
      timeout?: number
    ): Push;
  }

  export type BinaryType = "arraybuffer" | "blob";
  export type ConnectionState = "connecting" | "open" | "closing" | "closed";

  export interface SocketConnectOptions {
    binaryType: BinaryType;
    params: Record<string, unknown> | (() => Record<string, unknown>);
    transport: string;
    timeout: number;
    heartbeatIntervalMs: number;
    longpollerTimeout: number;
    encode: (
      payload: Record<string, unknown>,
      callback: (encoded: unknown) => void
    ) => void;
    decode: (payload: string, callback: (decoded: unknown) => void) => void;
    logger: (kind: string, message: string, data: unknown) => void;
    reconnectAfterMs: (tries: number) => number;
    rejoinAfterMs: (tries: number) => number;
  }

  export interface SocketMessage {
    event: string;
    payload: unknown;
    ref: string | null;
    topic: string;
  }

  export class Socket {
    conn: unknown;
    channels: Channel[];
    constructor(endPoint: string, opts?: Partial<SocketConnectOptions>);
    protocol(): string;
    endPointURL(): string;
    connect(params?: unknown): void;
    disconnect(callback?: () => void, code?: number, reason?: string): void;
    connectionState(): ConnectionState;
    isConnected(): boolean;
    remove(channel: Channel): void;
    channel(topic: string, chanParams?: Record<string, unknown>): Channel;
    push(data: Record<string, unknown>): void;
    log(kind: string, message: string, data: unknown): void;
    hasLogger(): boolean;
    onOpen(callback: (cb: unknown) => void): void;
    onClose(callback: (cb: unknown) => void): void;
    onError(callback: (cb: unknown) => void): void;
    onMessage(callback: (cb: SocketMessage) => void): void;
    makeRef(): string;
  }
}
