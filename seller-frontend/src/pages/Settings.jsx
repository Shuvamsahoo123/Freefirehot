import { useEffect, useState } from 'react';
import {
  Settings as SettingsIcon,
  Store,
  Clock,
  Phone,
  MapPin,
  CreditCard,
  Power,
  Calendar,
  ChefHat,
  Save,
  X,
  Plus,
  QrCode,
  UploadCloud,
  CheckCircle2,
  BellRing,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { uploadQrCodeAPI, fetchPushPublicKeyAPI, savePushSubscriptionAPI } from '../services/api';
import { initialStoreSettings } from '../data/mockData';

function normalizeSettings(value = {}) {
  return {
    ...initialStoreSettings,
    ...value,
    isShopOpen: value.isShopOpen ?? initialStoreSettings.onlineOrderingEnabled,
    openingHours: {
      ...initialStoreSettings.openingHours,
      ...(value.openingHours || {}),
    },
    temporaryClosure: {
      ...initialStoreSettings.temporaryClosure,
      ...(value.temporaryClosure || {}),
    },
    paymentSettings: {
      isUpiEnabled: false,
      upiId: '',
      upiName: '',
      upiInstructions: 'Please pay 50% advance to confirm your order.',
      ...(value.paymentSettings || {}),
      upiQrImage: {
        url: '',
        publicId: '',
        ...(value.paymentSettings?.upiQrImage || {}),
      },
    },
    holidays: Array.isArray(value.holidays) ? value.holidays : [],
  };
}

function decodeApplicationServerKey(base64UrlKey) {
  const padding = '='.repeat((4 - (base64UrlKey.length % 4)) % 4);
  const base64 = `${base64UrlKey.replace(/-/g, '+').replace(/_/g, '/')}${padding}`;
  const raw = window.atob(base64);
  return Uint8Array.from(raw, (character) => character.charCodeAt(0));
}

export default function Settings() {
  const { storeSettings, updateStoreSettings } = useApp();
  const [settings, setSettings] = useState(() => normalizeSettings(storeSettings));
  const [saved, setSaved] = useState(false);
  const [newHoliday, setNewHoliday] = useState('');
  const [qrUploading, setQrUploading] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(() =>
    typeof window !== 'undefined' && 'Notification' in window
      ? Notification.permission
      : 'unsupported'
  );
  const [notificationsConnected, setNotificationsConnected] = useState(false);
  const [notificationError, setNotificationError] = useState('');

  useEffect(() => {
    setSettings(normalizeSettings(storeSettings));
  }, [storeSettings]);

  const handleChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handlePaymentChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      paymentSettings: field === 'upiQrImage'
        ? { ...prev.paymentSettings, upiQrImage: value }
        : { ...prev.paymentSettings, [field]: value },
    }));
  };

  const handleHoursChange = (day, field, value) => {
    setSettings((prev) => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [day]: { ...prev.openingHours[day], [field]: value },
      },
    }));
  };

  const handleClosureChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      temporaryClosure: { ...prev.temporaryClosure, [field]: value },
    }));
  };

  const addHoliday = () => {
    if (newHoliday && !settings.holidays.includes(newHoliday)) {
      setSettings((prev) => ({
        ...prev,
        holidays: [...prev.holidays, newHoliday],
      }));
      setNewHoliday('');
    }
  };

  const removeHoliday = (date) => {
    setSettings((prev) => ({
      ...prev,
      holidays: prev.holidays.filter((h) => h !== date),
    }));
  };

  const handleSave = async () => {
    try {
      await updateStoreSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert(error.message || 'Failed to save settings. Please try again.');
    }
  };

  const handleQrUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setQrUploading(true);
    try {
      const uploadedImage = await uploadQrCodeAPI(file);
      handlePaymentChange('upiQrImage', uploadedImage);
    } catch (error) {
      console.error('Failed to upload QR:', error);
      alert('Failed to upload QR code. Please try again.');
    } finally {
      setQrUploading(false);
    }
  };

  const enableOrderNotifications = async () => {
    setNotificationError('');
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      setNotificationPermission('unsupported');
      return;
    }
    try {
      const permission = Notification.permission === 'default'
        ? await Notification.requestPermission()
        : Notification.permission;
      setNotificationPermission(permission);
      if (permission !== 'granted') return;

      const registration = await navigator.serviceWorker.ready;
      const applicationServerKey = await fetchPushPublicKeyAPI();
      const existingSubscription = await registration.pushManager.getSubscription();
      const subscription = existingSubscription || await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: decodeApplicationServerKey(applicationServerKey),
      });
      await savePushSubscriptionAPI(subscription.toJSON());
      setNotificationsConnected(true);
    } catch (error) {
      console.error('Could not request notification permission:', error);
      setNotificationError(error.message || 'Could not connect this phone for order notifications.');
    }
  };

  const days = Object.keys(settings.openingHours);

  return (
    <div className="px-4 py-5 animate-fade-in pb-36">
      {/* Header */}
      <div className="mb-5 px-1">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 bg-gradient-to-br from-gray-500 to-gray-700 rounded-xl flex items-center justify-center shadow-md">
            <SettingsIcon size={18} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Restaurant Settings</h2>
            <p className="text-xs text-gray-500 font-medium">Manage your store configuration</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Phone/browser order alerts */}
        <div className="bg-white rounded-2xl p-4 shadow-card border border-gray-100/80">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
                <BellRing size={18} className="text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">New Order Alerts</h3>
                <p className="text-xs text-gray-400">
                  {notificationsConnected
                    ? 'This phone will receive new-order alerts, even when the app is closed.'
                    : notificationPermission === 'denied'
                      ? 'Blocked. Allow notifications in browser settings.'
                      : notificationPermission === 'unsupported'
                        ? 'Notifications are not supported here'
                        : notificationPermission === 'granted'
                          ? 'Finish connecting this phone for order alerts'
                          : 'Get a notification when an order arrives'}
                </p>
                {notificationError && <p className="mt-1 text-xs text-red-600">{notificationError}</p>}
              </div>
            </div>
            {notificationsConnected ? (
              <span className="text-xs font-bold text-green-600">Enabled</span>
            ) : notificationPermission === 'unsupported' || notificationPermission === 'denied' ? null : (
              <button
                onClick={enableOrderNotifications}
                className="flex-shrink-0 rounded-xl bg-orange-500 px-3 py-2 text-xs font-bold text-white hover:bg-orange-600"
              >
                {notificationPermission === 'granted' ? 'Connect this phone' : 'Enable'}
              </button>
            )}
          </div>
        </div>

        {/* Online Ordering Toggle */}
        <div className="bg-white rounded-2xl p-4 shadow-card border border-gray-100/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-md">
                <Power size={18} className="text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Online Ordering</h3>
                <p className="text-xs text-gray-400">{settings.onlineOrderingEnabled ? 'Accepting orders' : 'Orders paused'}</p>
              </div>
            </div>
            <button
              onClick={() => handleChange('isShopOpen', !settings.isShopOpen)}
              className={`relative w-12 h-7 rounded-full transition-colors duration-300 flex-shrink-0 ${
                settings.isShopOpen ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${
                  settings.isShopOpen ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Temporary Closure */}
        <div className="bg-white rounded-2xl p-4 shadow-card border border-gray-100/80">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-xl flex items-center justify-center shadow-md">
                <Calendar size={18} className="text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Temporary Closure</h3>
                <p className="text-xs text-gray-400">Close for a specific period</p>
              </div>
            </div>
            <button
              onClick={() => handleClosureChange('enabled', !settings.temporaryClosure.enabled)}
              className={`relative w-12 h-7 rounded-full transition-colors duration-300 flex-shrink-0 ${
                settings.temporaryClosure.enabled ? 'bg-red-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${
                  settings.temporaryClosure.enabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
          {settings.temporaryClosure.enabled && (
            <div className="space-y-3 mt-3 pt-3 border-t border-gray-100 animate-fade-in">
              <input
                type="text"
                value={settings.temporaryClosure.reason}
                onChange={(e) => handleClosureChange('reason', e.target.value)}
                placeholder="Reason (e.g. Renovation)"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400/50"
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 mb-1 uppercase">From</label>
                  <input
                    type="date"
                    value={settings.temporaryClosure.fromDate}
                    onChange={(e) => handleClosureChange('fromDate', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:border-red-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 mb-1 uppercase">To</label>
                  <input
                    type="date"
                    value={settings.temporaryClosure.toDate}
                    onChange={(e) => handleClosureChange('toDate', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:border-red-400"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Store Info */}
        <div className="bg-white rounded-2xl p-4 shadow-card border border-gray-100/80">
          <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider flex items-center gap-2">
            <Store size={14} />
            Store Information
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Restaurant Name</label>
              <input
                type="text"
                value={settings.restaurantName}
                onChange={(e) => handleChange('restaurantName', e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-400 mb-1.5 uppercase tracking-wider flex items-center gap-1"><Phone size={10} /> Phone</label>
              <input
                type="tel"
                value={settings.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-400 mb-1.5 uppercase tracking-wider flex items-center gap-1"><MapPin size={10} /> Address</label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-400 mb-1.5 uppercase tracking-wider flex items-center gap-1"><ChefHat size={10} /> Estimated Prep Time (min)</label>
              <input
                type="number"
                value={settings.estimatedPrepTime}
                onChange={(e) => handleChange('estimatedPrepTime', Number(e.target.value))}
                min="5"
                max="120"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50"
              />
            </div>
          </div>
        </div>

        {/* UPI Payment Settings */}
        <div className="bg-white rounded-2xl p-4 shadow-card border border-gray-100/80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <QrCode size={14} />
              UPI Payment Settings
            </h3>
            <button
              onClick={() => handlePaymentChange('isUpiEnabled', !settings.paymentSettings?.isUpiEnabled)}
              className={`relative w-12 h-7 rounded-full transition-colors duration-300 flex-shrink-0 ${
                settings.paymentSettings?.isUpiEnabled ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${
                  settings.paymentSettings?.isUpiEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
          
          <div className={`space-y-4 ${!settings.paymentSettings?.isUpiEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
            <div>
              <label className="block text-[10px] font-semibold text-gray-400 mb-1.5 uppercase tracking-wider flex items-center gap-1">Shop UPI ID</label>
              <input
                type="text"
                value={settings.paymentSettings?.upiId || ''}
                onChange={(e) => handlePaymentChange('upiId', e.target.value)}
                placeholder="e.g. yourshop@upi"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium font-mono focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-400 mb-1.5 uppercase tracking-wider flex items-center gap-1">UPI Display Name</label>
              <input
                type="text"
                value={settings.paymentSettings?.upiName || ''}
                onChange={(e) => handlePaymentChange('upiName', e.target.value)}
                placeholder="e.g. FreeFire Hotel"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-400 mb-1.5 uppercase tracking-wider flex items-center gap-1">Payment Instructions</label>
              <textarea
                value={settings.paymentSettings?.upiInstructions || ''}
                onChange={(e) => handlePaymentChange('upiInstructions', e.target.value)}
                placeholder="Instructions shown to customer"
                rows={2}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 resize-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">QR Code Image</label>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl overflow-hidden flex items-center justify-center relative">
                  {settings.paymentSettings?.upiQrImage?.url ? (
                    <img src={settings.paymentSettings.upiQrImage.url} alt="UPI QR" className="w-full h-full object-contain p-2" />
                  ) : (
                    <QrCode size={24} className="text-gray-300" />
                  )}
                  {qrUploading && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg cursor-pointer transition-colors">
                    <UploadCloud size={16} />
                    Upload QR
                    <input type="file" accept="image/*" onChange={handleQrUpload} className="hidden" />
                  </label>
                  <p className="text-xs text-gray-400 mt-2">Upload a clear screenshot of your shop's UPI QR code.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Opening Hours */}
        <div className="bg-white rounded-2xl p-4 shadow-card border border-gray-100/80">
          <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider flex items-center gap-2">
            <Clock size={14} />
            Opening Hours
          </h3>
          <div className="space-y-3">
            {days.map((day) => {
              const hours = settings.openingHours[day];
              return (
                <div key={day} className="flex items-center gap-3">
                  <span className={`text-sm font-semibold w-12 ${hours.closed ? 'text-gray-300' : 'text-gray-700'}`}>
                    {day.slice(0, 3)}
                  </span>
                  {hours.closed ? (
                    <span className="flex-1 text-sm text-red-400 font-medium">Closed</span>
                  ) : (
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="time"
                        value={hours.open}
                        onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                        className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-medium focus:outline-none focus:border-primary-500"
                      />
                      <span className="text-gray-400 text-xs">to</span>
                      <input
                        type="time"
                        value={hours.close}
                        onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                        className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-medium focus:outline-none focus:border-primary-500"
                      />
                    </div>
                  )}
                  <button
                    onClick={() => handleHoursChange(day, 'closed', !hours.closed)}
                    className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                      hours.closed ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {hours.closed ? 'Closed' : 'Open'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Holidays */}
        <div className="bg-white rounded-2xl p-4 shadow-card border border-gray-100/80">
          <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider flex items-center gap-2">
            <Calendar size={14} />
            Holiday Dates
          </h3>
          <div className="flex gap-2 mb-3">
            <input
              type="date"
              value={newHoliday}
              onChange={(e) => setNewHoliday(e.target.value)}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:border-primary-500"
            />
            <button
              onClick={addHoliday}
              className="px-4 py-2.5 bg-primary-500 text-white rounded-xl font-semibold text-sm hover:bg-primary-600 transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>
          {settings.holidays.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {settings.holidays.map((date) => (
                <span key={date} className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-semibold">
                  {date}
                  <button onClick={() => removeHoliday(date)} className="text-red-400 hover:text-red-600">
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400">No holidays set</p>
          )}
        </div>

      </div>

      {/* Save button */}
      <div className="fixed bottom-24 lg:bottom-6 left-0 right-0 px-4 lg:pl-72 z-30">
        <div className="max-w-3xl mx-auto lg:max-w-5xl">
          <button
            onClick={handleSave}
            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 touch-active shadow-md flex items-center justify-center gap-2 ${
              saved
                ? 'bg-green-500 text-white shadow-green-500/25'
                : 'bg-primary-500 text-white hover:bg-primary-600 shadow-primary-500/25'
            }`}
          >
            <Save size={16} />
            {saved ? 'Saved ✓' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
