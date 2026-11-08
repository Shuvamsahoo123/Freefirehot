import Notification from '../models/Notification.js';

// Get all notifications
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// Create a new notification
export const createNotification = async (req, res) => {
  try {
    const { title, message, type, isActive, expiresAt } = req.body;
    const newNotification = new Notification({
      title,
      message,
      type,
      isActive,
      expiresAt
    });
    
    await newNotification.save();
    res.status(201).json({ success: true, data: newNotification });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create notification', error: error.message });
  }
};

// Update an existing notification
export const updateNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, message, type, isActive, expiresAt } = req.body;

    const notification = await Notification.findByIdAndUpdate(
      id,
      { title, message, type, isActive, expiresAt },
      { new: true, runValidators: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update notification', error: error.message });
  }
};

// Delete a notification
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndDelete(id);
    
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.status(200).json({ success: true, message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete notification', error: error.message });
  }
};

// Toggle notification active status
export const toggleNotificationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const notification = await Notification.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to toggle status', error: error.message });
  }
};
