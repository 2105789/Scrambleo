import { Server as SocketIOServer } from 'socket.io';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { Server as NetServer } from 'http';
import type { Socket as NetSocket } from 'net';
import redis from '@/lib/redis';

interface SocketServer extends NetServer {
  io?: SocketIOServer;
}

interface SocketWithIO extends NetSocket {
  server: SocketServer;
}

interface NextApiResponseWithSocket extends NextApiResponse {
  socket: SocketWithIO;
}

const SocketHandler = (req: NextApiRequest, res: NextApiResponseWithSocket) => {
  if (res.socket.server.io) {
    console.log('Socket is already running');
    res.end();
    return;
  }

  console.log('Socket is initializing');
  const io = new SocketIOServer(res.socket.server as any);
  res.socket.server.io = io;

  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    redis.hgetall('color_grid').then((data) => {
      socket.emit('initialData', data || {});
    });

    socket.on('colorChange', async ({ x, y, color }) => {
      try {
        const key = `${x}:${y}`;
        await redis.hset('color_grid', key, color);
        socket.broadcast.emit('colorChange', { x, y, color });
      } catch (error) {
        console.error('Error updating color:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  res.end();
};

export default SocketHandler;