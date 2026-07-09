module.exports = {

  // ==========================================
  // GET /followups/:id/messages
  // Fetch all messages for a specific follow-up
  // ==========================================
  find: async function (req, res) {
    try {
      const { id } = req.params;

      const followUp = await FollowUp.findOne({ id });
      if (!followUp) return res.notFound({ error: "Follow-up record not found." });

      // Fetch messages and sort chronologically 
      const messages = await ChatMessage.find({ followUp: id })
        .populate('senderId') // Populate user details if needed
        .sort('sentAt ASC');

      return res.json(messages);
    } catch (err) {
      console.error("Fetch messages error:", err);
      return res.serverError(err);
    }
  },

  // ==========================================
  // POST /followups/:id/messages
  // Send a new message within a follow-up
  // ==========================================
  create: async function (req, res) {
    try {
      const { id } = req.params;
      const { message, messageType, attachments, senderType } = req.body;

      if (!message) return res.badRequest({ error: "Message content is required." });

      const followUp = await FollowUp.findOne({ id });
      if (!followUp) return res.notFound({ error: "Follow-up record not found." });

      // ------------------------------------------
      // CRITICAL VALIDATION: Closed Follow-Up
      // ------------------------------------------
      if (followUp.status === "Closed" || followUp.isClosed) {
        return res.status(403).json({
          message: "Follow-up is closed. Cannot send new messages."
        });
      }

      // Determine sender context (Auth session vs Body payload)
      const actualSenderId = req.user?.id || req.body.senderId;
      const actualSenderType = senderType || req.user?.role || 'patient';

      // Create the chat message
      const newMessage = await ChatMessage.create({
        followUp: id,
        senderId: actualSenderId,
        senderType: actualSenderType,
        message: message,
        messageType: messageType || 'text',
        attachments: attachments || null,
        sentAt: new Date().toISOString()
      }).fetch();

      // Determine new follow-up state based on who sent the message
      const newStatus = (actualSenderType === 'patient') ? 'Replied' : 'WaitingForPatient';

      // Update the parent follow-up state and activity dates
      await FollowUp.updateOne({ id }).set({ 
        status: newStatus,
        lastMessageAt: new Date().toISOString(),
        lastActivityDate: new Date().toISOString()
      });

      return res.status(201).json(newMessage);
    } catch (err) {
      console.error("Send message error:", err);
      return res.serverError(err);
    }
  },

  // ==========================================
  // PATCH /messages/:id/read
  // Mark a specific message as read (Read Receipts)
  // ==========================================
  markRead: async function (req, res) {
    try {
      const { id } = req.params; // This is the Message ID, not FollowUp ID

      const chatMessage = await ChatMessage.findOne({ id });
      if (!chatMessage) return res.notFound({ error: "Message not found." });

      // If already read, just return to save database execution
      if (chatMessage.isRead) return res.json(chatMessage);

      const updatedMessage = await ChatMessage.updateOne({ id }).set({
        isRead: true,
        readAt: new Date().toISOString()
      });

      // Optional: You could also update `lastReadByPatientAt` or `lastReadByStaffAt` 
      // on the parent FollowUp model here if tracking high-level read state.

      return res.json(updatedMessage);
    } catch (err) {
      console.error("Read receipt error:", err);
      return res.serverError(err);
    }
  }

};