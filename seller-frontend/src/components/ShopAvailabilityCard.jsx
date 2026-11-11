import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function ShopAvailabilityCard() {
  const { storeSettings, updateStoreSettings } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [closureReason, setClosureReason] = useState('sold_out');
  const [customClosureMessage, setCustomClosureMessage] = useState('');
  const [closureType, setClosureType] = useState('end_of_day');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isShopOpen = storeSettings?.isShopOpen ?? true;

  const handleToggle = async () => {
    setErrorMessage('');
    if (isShopOpen) {
      setShowModal(true);
    } else {
      setIsLoading(true);
      try {
        await updateStoreSettings({ isShopOpen: true });
      } catch (error) {
        console.error(error);
        setErrorMessage(error.message || 'Could not reopen the shop. Check the backend connection and try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCloseShop = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      await updateStoreSettings({
        isShopOpen: false,
        closureReason,
        customClosureMessage: closureReason === 'other' ? customClosureMessage : '',
        closureType,
      });
      setShowModal(false);
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message || 'Could not save shop availability. Check the backend connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-5 mb-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-neutral-800">Shop Availability</h2>
          <div className="flex items-center mt-2">
            {isShopOpen ? (
              <span className="flex items-center text-green-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 mr-2"></span>
                Shop Open
              </span>
            ) : (
              <span className="flex items-center text-red-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 mr-2"></span>
                Shop Closed
              </span>
            )}
          </div>
          {!isShopOpen && storeSettings?.closureReason && (
            <p className="text-sm text-neutral-500 mt-1">
              Reason: {storeSettings.closureReason === 'other' ? storeSettings.customClosureMessage : storeSettings.closureReason.replace(/_/g, ' ')}
            </p>
          )}
        </div>
        <button
          onClick={handleToggle}
          disabled={isLoading}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            isShopOpen
              ? 'bg-red-50 text-red-600 hover:bg-red-100'
              : 'bg-green-500 text-white hover:bg-green-600'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? 'Updating...' : isShopOpen ? 'Close Shop' : 'Reopen Shop'}
        </button>
      </div>

      {errorMessage && !showModal && (
        <p role="alert" className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </p>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-neutral-800 mb-4">Close Shop</h3>

            {errorMessage && (
              <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {errorMessage}
              </p>
            )}
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-700 mb-2">Select Reason</label>
              <select
                value={closureReason}
                onChange={(e) => setClosureReason(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="sold_out">All items sold out</option>
                <option value="closed_for_today">Shop closed for today</option>
                <option value="temporary_break">Temporary break</option>
                <option value="other">Other</option>
              </select>
            </div>

            {closureReason === 'other' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-700 mb-2">Custom Reason</label>
                <input
                  type="text"
                  value={customClosureMessage}
                  onChange={(e) => setCustomClosureMessage(e.target.value)}
                  placeholder="E.g., Kitchen maintenance"
                  className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-700 mb-2">Duration</label>
              <select
                value={closureType}
                onChange={(e) => setClosureType(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="end_of_day">Close for Today (Auto reopen at midnight)</option>
                <option value="manual">Close Until Reopened Manually</option>
              </select>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg text-neutral-600 hover:bg-neutral-100 font-medium"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleCloseShop}
                disabled={isLoading}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 font-medium flex items-center"
              >
                {isLoading ? 'Closing...' : 'Confirm Close Shop'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
