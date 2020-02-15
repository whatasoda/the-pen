import https from 'https';
import { readFileSync } from 'fs';
import { Server } from 'ws';
import SocketMessages from '../src/socket-message';
import createRoom from './room';

const host = '0.0.0.0';
const port = 8000;

type Room = ReturnType<typeof createRoom>;

interface Profile {
  role: 'host' | 'player';
  room: Room;
}

const startServer = () => {
  const server = https.createServer({
    key: readFileSync('/Users/whatasoda/.ssl/localhost-nopass.key'),
    cert: readFileSync('/Users/whatasoda/.ssl/localhost.crt'),
  });
  const s = new Server({ server });

  const rooms = Object.create(null) as Record<string, Room>;

  s.on('connection', (client) => {
    let profile: Profile | null = null;

    client.on('message', (data) => {
      // if (Buffer.isBuffer(data)) {
      //   const buffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
      //   return handleBuffer(buffer);
      // }

      if (typeof data === 'string') {
        const msg = SocketMessages.parse(data);
        if (msg) return handleMessage(msg);
      }
    });

    client.on('close', (code, reason) => {
      // eslint-disable-next-line no-console
      console.log({ code, reason });
      if (!profile) return;
      profile.room.exit(client);
    });

    // const handleBuffer = () => {
    //   // if (profile?.role === 'player') profile.room.update(buffer);
    // };

    const handleMessage = (msg: SocketMessages): void => {
      if (!profile) return handleInitMessage(msg);
      if (profile.role === 'player') {
        switch (msg.type) {
          case 'BUFFER': {
            return profile.room.update(msg.value);
          }
        }
      }

      if (profile.role === 'host') {
        switch (msg.type) {
          case 'REQUEST_RELOAD': {
            return profile.room.requestReload();
          }
        }
      }
      // eslint-disable-next-line no-console
      console.log(msg);
    };

    const handleInitMessage = (msg: SocketMessages) => {
      switch (msg.type) {
        case 'CREATE': {
          const { code } = msg.value;
          if (rooms[code]) {
            SocketMessages.close(client, 'EXISTED_ROOM');
          } else {
            const room = (rooms[code] = createRoom(code, client));
            profile = { role: 'host', room };
            const onClose = () => (delete rooms[code], (profile = null));
            room.on('close', onClose);
            client.on('close', () => room.off('close', onClose));
            SocketMessages.send(client, 'SUCCESS_JOIN_ROOM');
          }
          return;
        }
        case 'JOIN': {
          const { code } = msg.value;
          const room = rooms[code];
          if (!room) {
            SocketMessages.close(client, 'NO_ROOM');
          } else {
            profile = { role: 'player', room };
            const onClose = () => (profile = null);
            room.on('close', onClose);
            client.on('close', () => (room.off('close', onClose), room.exit(client)));
            room.join(client);
            SocketMessages.send(client, 'SUCCESS_JOIN_ROOM');
          }
          return;
        }
      }
    };
  });

  server.listen(port, host);
  // eslint-disable-next-line no-console
  console.log(`websocket server is started on wss://${host}:${port}`);
};

startServer();
