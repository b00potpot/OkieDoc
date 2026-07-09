/**
 * WebSocket Configuration
 * (sails.config.sockets)
 *
 * These settings configure the built-in real-time socket features in Sails.
 */

module.exports.sockets = {
  // Only allow WebSocket connections (disables long-polling fallback for better performance if supported)
  transports: ['websocket'],

  // Configure CORS specifically for socket connections to allow your Expo app to connect
  cors: {
    origin: '*', // In production, replace '*' with your specific allowed domains
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
  },

  // Optional: Add custom logic when a socket connects
  onConnect: function(session, socket) {
    // console.log('A socket connected with ID:', socket.id);
  },

  // Optional: Add custom logic when a socket disconnects
  onDisconnect: function(session, socket) {
    // console.log('A socket disconnected:', socket.id);
  },
  
  // Granting access to all socket methods
  grantAccessTo: function (session, socket, cb) {
    return cb(null, true);
  }
};