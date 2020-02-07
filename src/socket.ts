import SocketMessages from './socket-message';
import createWebSocketHook, { SocketProviderAttributes } from './utils/useWebSocket';

const INIT_MESSAGES = {
  host: 'CREATE',
  player: 'JOIN',
} as const;

interface WebSocketProps {
  code: string;
}

const dataTransformer = ({ data }: WebSocketEventMap['message']) => {
  if (typeof data === 'string') {
    const message = SocketMessages.parse(data);
    if (message) {
      return { type: 'message', value: message } as const;
    } else {
      return { type: 'text', value: data } as const;
    }
  } else if (data instanceof ArrayBuffer) {
    return { type: 'binary', value: data } as const;
  } else {
    return { type: 'unknown', value: data } as const;
  }
};

const createAttribute = (role: 'host' | 'player'): SocketProviderAttributes<WebSocketProps> => ({
  judgeOnOpen: (client, _, { code }) => SocketMessages.send(client, INIT_MESSAGES[role], code),
  judgeOnMessage: (_0, { data }, _1, done) => {
    const message = typeof data === 'string' ? SocketMessages.parse(data) : null;
    if (message && message.type === 'SUCCESS_JOIN_ROOM') done();
  },
  closeWithUnmount: (client) => SocketMessages.close(client, 'EXIT_ROOM'),
});

export const [useHostSocket, HostSocketProvider] = createWebSocketHook(dataTransformer, createAttribute('host'));
export const [usePlayerSocket, PlayerSocketProvider] = createWebSocketHook(dataTransformer, createAttribute('player'));
