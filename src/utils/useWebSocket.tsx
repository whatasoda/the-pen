import React, { useState, useEffect, useRef, useContext, createContext, PropsWithChildren } from 'react';

export interface SocketProviderAttributes<P> {
  judgeOnOpen?: (client: WebSocket, event: WebSocketEventMap['open'], props: P, done: () => void) => void;
  judgeOnMessage?: (client: WebSocket, event: WebSocketEventMap['message'], props: P, done: () => void) => void;
  closeWithUnmount: (client: WebSocket) => void;
}

export default function createWebSocketHook<P extends object, T>(
  dataTransformer: (event: WebSocketEventMap['message'], props: P) => T,
  { judgeOnOpen: onOpen, judgeOnMessage: onMessage, closeWithUnmount }: SocketProviderAttributes<P>,
) {
  type MessageHandler = (data: T) => void;
  type MessageHandlerWithProps<T> = (data: T) => void;
  type Value = readonly [WebSocket | null, Set<MessageHandler>];

  const useWebSocket = (callback?: MessageHandlerWithProps<T>, deps: any[] = []) => {
    const [socket, registry] = useContext(useWebSocket.context);
    const callbackRef = useRef<MessageHandlerWithProps<T>>();
    useEffect(() => void (callbackRef.current = callback), deps);
    useEffect(() => {
      if (!registry) return;
      const callbackEntry: MessageHandler = (data) => callbackRef.current?.(data);
      registry.add(callbackEntry);
      return () => void registry.delete(callbackEntry);
    }, [registry]);
    return socket;
  };
  useWebSocket.context = createContext<Value>([null, null] as any);

  const WebSocketProvider = ({ children, url, ...props }: PropsWithChildren<P & { url: string }>) => {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [registry] = useState(() => new Set<MessageHandler>());

    useEffect(() => {
      const client = new WebSocket(url);
      client.binaryType = 'arraybuffer';

      const handleOpen = onOpen && ((event: WebSocketEventMap['open']) => onOpen(client, event, props as P, done));
      const handleMessage =
        onMessage && ((event: WebSocketEventMap['message']) => onMessage(client, event, props as P, done));

      if (handleOpen) client.addEventListener('open', handleOpen);
      if (handleMessage) client.addEventListener('message', handleMessage);

      const handleGeneralMessage = (event: WebSocketEventMap['message']) => {
        const data = dataTransformer(event, props as P);
        registry.forEach((callback) => callback(data));
      };

      // TODO: implement feature to close socket
      const done = () => {
        if (handleOpen) client.removeEventListener('open', handleOpen);
        if (handleMessage) client.removeEventListener('message', handleMessage);

        setSocket(client);
        client.addEventListener('message', handleGeneralMessage);
      };

      client.addEventListener('close', () => setSocket(null));
      return () => {
        closeWithUnmount(client);
        setSocket(null);
      };
    }, []);

    // we don't have to need "useMemo" here since the render call happens only if "socket" changes
    const value = [socket, registry] as const;
    return <useWebSocket.context.Provider value={value} children={children} />;
  };

  return [useWebSocket, WebSocketProvider] as const;
}
