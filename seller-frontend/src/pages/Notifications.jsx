import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Tag,
  AlertCircle,
  X,
  Check
} from 'lucide-react';
import { 
  getNotificationsAPI,
  createNotificationAPI,
  updateNotificationAPI,
  deleteNotificationAPI,
  toggleNotificationStatusAPI
} from '../services/api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentNotification, setCurrentNotification] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'offer',
    isActive: true,
  });

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const result = await getNotificationsAPI();
      if (result.success) {
        setNotifications(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleOpenModal = (notification = null) => {
    if (notification) {
      setCurrentNotification(notification);
      setFormData({
        title: notification.title,
        message: notification.message,
        type: notification.type,
        isActive: notification.isActive,
      });
    } else {
      setCurrentNotification(null);
      setFormData({
        title: '',
        message: '',
        type: 'offer',
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentNotification(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let result;
      if (currentNotification) {
        result = await updateNotificationAPI(currentNotification._id, formData);
      } else {
        result = await createNotificationAPI(formData);
      }
      
      if (result.success) {
        fetchNotifications();
        handleCloseModal();
      }
    } catch (error) {
      console.error('Failed to save notification:', error);
      alert('Failed to save notification: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      try {
        const result = await deleteNotificationAPI(id);
        if (result.success) {
          fetchNotifications();
        }
      } catch (error) {
        console.error('Failed to delete notification:', error);
      }
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const result = await toggleNotificationStatusAPI(id, !currentStatus);
      if (result.success) {
        setNotifications(notifications.map(n => 
          n._id === id ? { ...n, isActive: !currentStatus } : n
        ));
      }
    } catch (error) {
      console.error('Failed to toggle status:', error);
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'offer': return <Tag className="text-pink-500" size={18} />;
      case 'alert': return <AlertCircle className="text-red-500" size={18} />;
      default: return <Bell className="text-gray-500" size={18} />;
    }
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'offer': return 'bg-pink-100 text-pink-700';
      case 'alert': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredNotifications = notifications.filter(n => 
    n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    n.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Notifications & Offers
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage customer offers and service alerts.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-bold shadow-lg shadow-primary-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus size={20} />
          <span>New Notification</span>
        </button>
      </div>

      {/* Controls */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative w-full sm:w-96">
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell size={32} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No notifications found</h3>
          <p className="text-gray-500 max-w-sm mx-auto">
            {searchTerm ? 'Try adjusting your search terms.' : 'Create your first notification to inform your customers about offers and updates.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredNotifications.map((notification) => (
            <div 
              key={notification._id} 
              className={`bg-white rounded-2xl border p-5 transition-all hover:shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-6 ${
                notification.isActive ? 'border-gray-200' : 'border-gray-200 opacity-75 bg-gray-50'
              }`}
            >
              <div className="flex items-start gap-4 flex-1">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${notification.isActive ? 'bg-primary-50' : 'bg-gray-200'}`}>
                  {getTypeIcon(notification.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-bold text-lg ${notification.isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                      {notification.title}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getTypeColor(notification.type)}`}>
                      {notification.type === 'announcement' ? 'Update' : notification.type}
                    </span>
                    {!notification.isActive && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-200 text-gray-600">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-2 font-medium">
                    Created: {new Date(notification.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:border-l sm:border-gray-100 sm:pl-6 pt-4 sm:pt-0 border-t sm:border-t-0">
                <button
                  onClick={() => handleToggleStatus(notification._id, notification.isActive)}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                    notification.isActive 
                      ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' 
                      : 'bg-green-50 text-green-600 hover:bg-green-100'
                  }`}
                >
                  {notification.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => handleOpenModal(notification)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-50 text-gray-600 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(notification._id)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in touch-none">
          <div 
            className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl animate-scale-up relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
            
            <h3 className="text-xl font-bold text-gray-900 mb-6 pr-8">
              {currentNotification ? 'Edit Notification' : 'Create New Notification'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Weekend Special 50% Off!"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
                <textarea
                  name="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Describe the offer or service alert..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, type: 'offer'})}
                    className={`py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-bold border transition-all ${
                      formData.type === 'offer' 
                        ? 'bg-pink-50 border-pink-200 text-pink-700 ring-2 ring-pink-100' 
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Tag size={16} /> Offer
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, type: 'alert'})}
                    className={`py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-bold border transition-all ${
                      formData.type === 'alert' 
                        ? 'bg-red-50 border-red-200 text-red-700 ring-2 ring-red-100' 
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <AlertCircle size={16} /> Alert
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2 pb-2">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-5 h-5 text-primary-500 rounded border-gray-300 focus:ring-primary-500"
                />
                <label htmlFor="isActive" className="text-sm font-bold text-gray-700 select-none cursor-pointer">
                  Activate immediately
                </label>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  className="w-full py-4 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-primary-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] flex justify-center items-center gap-2"
                >
                  <Check size={20} />
                  {currentNotification ? 'Update Notification' : 'Publish Notification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
