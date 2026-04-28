const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Almacenar conexiones de usuarios autenticados
const userSockets = new Map(); // userId -> socket.id
const socketUsers = new Map(); // socket.id -> userId

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal server error');
    }
  });

  // Configurar Socket.io
  const io = new Server(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    path: '/api/socket',
  });

  // Middleware de autenticación para Socket.io
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      console.log('Socket connection rejected: No token provided');
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      socket.userId = decoded.userId;
      console.log('Socket authenticated for user:', decoded.userId);
      next();
    } catch (error) {
      console.log('Socket connection rejected: Invalid token');
      return next(new Error('Authentication error'));
    }
  });

  // Manejar conexiones
  io.on('connection', (socket) => {
    const userId = socket.userId;
    console.log(`User ${userId} connected via WebSocket (socket: ${socket.id})`);
    
    // Guardar referencia del usuario
    userSockets.set(userId, socket.id);
    socketUsers.set(socket.id, userId);
    
    // Unirse a room personal del usuario
    socket.join(`user:${userId}`);
    
    // Notificar al cliente que está conectado
    socket.emit('connected', { userId, socketId: socket.id });

    // Manejar desconexión
    socket.on('disconnect', () => {
      console.log(`User ${userId} disconnected (socket: ${socket.id})`);
      userSockets.delete(userId);
      socketUsers.delete(socket.id);
    });

    // Solicitar recuento de notificaciones no leídas
    socket.on('request-unread-count', async () => {
      try {
        // El cliente manejará esto a través de la API REST
        socket.emit('refresh-notifications');
      } catch (error) {
        console.error('Error handling unread count request:', error);
      }
    });

    // Ping para mantener conexión viva
    socket.on('ping', () => {
      socket.emit('pong');
    });
  });

  // Función global para enviar notificaciones a un usuario específico
  global.emitNotificationToUser = (userId, notification) => {
    const socketId = userSockets.get(userId);
    if (socketId) {
      io.to(`user:${userId}`).emit('new-notification', notification);
      console.log(`Notification sent to user ${userId}:`, notification.title);
    } else {
      console.log(`User ${userId} not connected, notification stored only in DB`);
    }
  };

  // Función global para broadcast a todos los usuarios conectados
  global.broadcastNotification = (notification) => {
    io.emit('broadcast-notification', notification);
    console.log('Broadcast notification sent to all connected users');
  };

  server
    .once('error', (err) => {
      console.error('Server error:', err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log(`> WebSocket server running on path: /api/socket`);
    });
});
