declare global {
  type ServerWebSocket = import('ws');
  interface WebSocket extends Pick<ServerWebSocket, 'CONNECTING' | 'OPEN' | 'CLOSING' | 'CLOSED'> {}
}
type ClientWebsocket = {} extends WebSocket ? ServerWebSocket : WebSocket;
type WebSocketClient = ClientWebsocket | ServerWebSocket;
type MessageInput<T extends string, U extends any[], V> = [T, [number, (...args: U) => V]];

function SocketMessageAgent<I extends Record<string, MessageInput<any, any, any>[1]>>(entries: I) {
  type OneOfType = keyof I;
  type OneOfMessageObject = { [T in OneOfType]: { type: T; value: ReturnType<I[T][1]> } }[OneOfType];

  const createMessageObject = <T extends OneOfType>(
    type: T,
    args: Parameters<I[T][1]>,
    create: I[T][1] = entries[type][1],
  ) => ({ type, value: create(...args) as ReturnType<I[T][1]> });

  const send = <T extends OneOfType>(client: WebSocketClient, type: T, ...args: Parameters<I[T][1]>) => {
    const [, create] = entries[type];
    const message = createMessageObject(type, args, create);
    client.send(JSON.stringify(message));
    return message;
  };

  const close = <T extends OneOfType>(client: WebSocketClient, type: T, ...args: Parameters<I[T][1]>) => {
    if (client.readyState !== client.OPEN) return null;
    const [code, create] = entries[type];
    const message = createMessageObject(type, args, create);
    client.close(code, JSON.stringify(message));
    return message;
  };

  const parse = (message: string): OneOfMessageObject | null => {
    try {
      return JSON.parse(message);
    } catch {
      return null;
    }
  };

  return { send, close, parse };
}

const SocketMessages = SocketMessageAgent({
  // server
  ROOM_FULLED: [1000, () => ({ message: 'The room is fulled' })],
  EXISTED_ROOM: [1000, () => ({ message: 'A room with the code has already existed' })],
  NO_ROOM: [1000, () => ({ message: 'A room with the code is not existed' })],
  CLOSE_ROOM: [1000, (server?: boolean) => ({ message: server ? 'Room is closed' : 'Close Room' })],
  EXIT_ROOM: [1000, (server?: boolean) => ({ message: server ? 'Exited from room' : 'exit from room' })],

  SUCCESS_JOIN_ROOM: [1000, () => 0],

  TIMEOUT: [1011, () => ({ message: 'No message cought after the connection' })],
  // client
  JOIN: [1000, (code: string) => ({ code })],
  CREATE: [1000, (code: string) => ({ code })],
});
type SocketMessages = NonNullable<ReturnType<typeof SocketMessages.parse>>;

export default SocketMessages;
