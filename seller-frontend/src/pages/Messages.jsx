import { useState, useEffect } from 'react';
import { Mail, Phone, Clock, MessageSquare, Trash2, CheckCircle2 } from 'lucide-react';
import { fetchMessagesAPI, markMessageAsReadAPI, deleteMessageAPI } from '../services/api';

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const data = await fetchMessagesAPI();
      if (data.success) {
        setMessages(data.data);
      } else {
        setError('Failed to load messages.');
      }
    } catch (err) {
      setError(err.message || 'Could not load messages.');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const data = await markMessageAsReadAPI(id);
      if (data.success) {
        setMessages((prev) =>
          prev.map((m) => (m._id === id ? { ...m, status: 'read' } : m))
        );
      }
    } catch (err) {
      alert('Failed to mark as read');
    }
  };

  const deleteMessage = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    try {
      const data = await deleteMessageAPI(id);
      if (data.success) {
        setMessages((prev) => prev.filter((m) => m._id !== id));
      }
    } catch (err) {
      alert('Failed to delete message');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-500">
        <p>{error}</p>
        <button onClick={fetchMessages} className="mt-4 text-sm font-semibold underline">Retry</button>
      </div>
    );
  }

  return (
    <div className="px-4 py-5 pb-32 animate-fade-in max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
          <MessageSquare className="text-primary-500" size={20} />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Customer Messages</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage messages from the contact form</p>
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="text-gray-300" size={24} />
          </div>
          <h3 className="text-gray-900 font-bold mb-1">No messages yet</h3>
          <p className="text-gray-500 text-sm">When customers contact you, their messages will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg._id}
              className={`bg-white rounded-2xl p-5 border shadow-sm transition-all duration-300 relative overflow-hidden ${
                msg.status === 'unread' ? 'border-primary-200 shadow-md ring-1 ring-primary-50' : 'border-gray-100'
              }`}
            >
              {msg.status === 'unread' && (
                <div className="absolute top-0 left-0 w-1 h-full bg-primary-500" />
              )}
              
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className={`text-base font-bold ${msg.status === 'unread' ? 'text-gray-900' : 'text-gray-700'}`}>
                    {msg.name}
                  </h3>
                  <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                    <a href={`mailto:${msg.email}`} className="text-xs text-blue-600 hover:underline flex items-center gap-1.5 font-medium">
                      <Mail size={12} />
                      {msg.email}
                    </a>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    <Clock size={10} />
                    {new Date(msg.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  
                  {/* Contact Button */}
                  {(msg.phone || msg.contactNo || msg.contactNumber || msg.mobile) && (
                    <a 
                      href={`tel:${msg.phone || msg.contactNo || msg.contactNumber || msg.mobile}`} 
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-lg text-xs font-bold transition-colors"
                    >
                      <Phone size={14} className="fill-green-700/20" />
                      Contact: {msg.phone || msg.contactNo || msg.contactNumber || msg.mobile}
                    </a>
                  )}
                </div>
              </div>

              <div className="bg-gray-50/50 rounded-xl p-4 mt-4 border border-gray-100">
                {msg.subject && (
                  <p className="text-xs font-bold text-gray-900 mb-1.5 uppercase tracking-wider">{msg.subject}</p>
                )}
                <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                  {msg.message}
                </p>
              </div>

              <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-50">
                {msg.status === 'unread' && (
                  <button
                    onClick={() => markAsRead(msg._id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-600 rounded-lg text-xs font-bold hover:bg-primary-100 transition-colors"
                  >
                    <CheckCircle2 size={14} />
                    Mark as Read
                  </button>
                )}
                <button
                  onClick={() => deleteMessage(msg._id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-red-500 rounded-lg text-xs font-bold hover:bg-red-50 hover:border-red-200 transition-colors"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
