import { EventEmitter } from 'events';
import SocketMessages from '../src/socket-message';
import { BallBuffer } from '../src/shared/buffer';

interface Emitter<T extends string, U extends any[]> extends EventEmitter {
  emit(type: T, ...args: U): boolean;
  on(type: T, cb: (...args: U) => void): this;
  off(type: T, cb: (...args: U) => void): this;
  addListener(type: T, cb: (...args: U) => void): this;
  removeListener(type: T, cb: (...args: U) => void): this;
}

type MyEmitter = Emitter<'update', [BallBuffer]> & Emitter<'close', []>;

const createRoom = (code: string, host: ServerWebSocket) => {
  const buffer = BallBuffer();
  const player = { current: null as null | ServerWebSocket };
  const emitter = new EventEmitter() as MyEmitter;

  const join = (client: ServerWebSocket) => {
    if (player.current) return SocketMessages.close(client, 'ROOM_FULLED');
    player.current = client;
  };

  const update = (next: ArrayBuffer) => {
    // if (!buffer.checkBufferType(next)) return;
    // buffer.copyFrom(next);
    host.send(next);
    emitter.emit('update', buffer);
  };

  const exit = (client: ServerWebSocket) => {
    if (host === client) return close();
    if (player.current === client) {
      player.current = null;
      SocketMessages.close(client, 'EXIT_ROOM', true);
    }
  };

  const close = () => {
    emitter.emit('close');
    SocketMessages.close(host, 'CLOSE_ROOM', true);
    if (player.current) SocketMessages.close(player.current, 'CLOSE_ROOM', true);
  };

  const on = emitter.on.bind(emitter);
  const off = emitter.off.bind(emitter);
  const addListener = emitter.addListener.bind(emitter);
  const removeListener = emitter.removeListener.bind(emitter);

  return {
    code,
    join,
    update,
    exit,
    close,
    on,
    off,
    addListener,
    removeListener,
  } as const;
};

export default createRoom;
