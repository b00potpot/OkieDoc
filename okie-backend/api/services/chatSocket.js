/**
 * chatSocket.js
 *
 * @description :: A service to handle real-time chat functionality using Sails' native Pub/Sub.
 */

module.exports = {
  
  /**
   * Subscribe a client socket to a specific chat room.
   * * @param {Object} req - The incoming socket request object
   * @param {String} roomId - The unique ID of the room (e.g., followUpId or ticketId)
   * @returns {Boolean} - Returns true if successful
   */
  joinChatRoom: function(req, roomId) {
    // Ensure the incoming request is actually from a socket
    if (!req.isSocket) {
      sails.log.warn('Attempted to join a room without a socket connection.');
      return false;
    }

    // Subscribe the socket to the room
    sails.sockets.join(req, roomId);
    sails.log.info(`Socket ${sails.sockets.getId(req)} joined room: ${roomId}`);
    return true;
  },

  /**
   * Unsubscribe a client socket from a specific chat room.
   * * @param {Object} req - The incoming socket request object
   * @param {String} roomId - The unique ID of the room
   * @returns {Boolean} - Returns true if successful
   */
  leaveChatRoom: function(req, roomId) {
    if (!req.isSocket) {
      return false;
    }

    sails.sockets.leave(req, roomId);
    sails.log.info(`Socket ${sails.sockets.getId(req)} left room: ${roomId}`);
    return true;
  },

  /**
   * Broadcast a new message payload to all subscribers in a room.
   * * @param {String} roomId - The unique ID of the room to broadcast to
   * @param {Object} messageData - The message payload to send
   * @param {String} eventName - (Optional) The socket event name to emit to the client
   */
  broadcastMessage: function(roomId, messageData, eventName = 'newMessage') {
    // Broadcast the payload to all sockets currently joined to `roomId`
    sails.sockets.broadcast(roomId, eventName, messageData);
    sails.log.info(`Broadcasted '${eventName}' to room ${roomId}`);
  }
};