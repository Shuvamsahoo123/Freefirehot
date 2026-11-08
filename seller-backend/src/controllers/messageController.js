import Message from '../models/Message.js';

// Get all messages
export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    console.error('Failed to get messages:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch messages.' });
  }
};

// Create a message (Used by customer frontend)
export const createMessage = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Name, email, and message are required.' });
    }
    const newMessage = await Message.create({ name, email, phone, subject, message });
    res.status(201).json({ success: true, data: newMessage });
  } catch (error) {
    console.error('Failed to create message:', error);
    res.status(500).json({ success: false, message: 'Failed to create message.' });
  }
};

// Mark a message as read
export const markMessageAsRead = async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { status: 'read' },
      { new: true }
    );
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found.' });
    }
    res.status(200).json({ success: true, data: message });
  } catch (error) {
    console.error('Failed to mark message as read:', error);
    res.status(500).json({ success: false, message: 'Failed to update message.' });
  }
};

// Delete a message
export const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found.' });
    }
    res.status(200).json({ success: true, message: 'Message deleted successfully.' });
  } catch (error) {
    console.error('Failed to delete message:', error);
    res.status(500).json({ success: false, message: 'Failed to delete message.' });
  }
};
