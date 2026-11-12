import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Pencil, Package, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LABEL_COLORS } from '../data/mockData';

export default function FoodItemCard({ item, onToggleStatus }) {
  const navigate = useNavigate();
  const { restockMenuItem, deleteMenuItem } = useApp();
  const [showRestock, setShowRestock] = useState(false);
  const [addedQty, setAddedQty] = useState('');

  const isLowStock = item.remaining > 0 && item.remaining <= 5;
  const isSoldOut = item.remaining <= 0;

  const handleRestock = async () => {
    const qty = Number(addedQty);
    if (qty > 0 && Number.isInteger(qty)) {
      const newDailyQty = item.dailyQty + qty;
      try {
        await restockMenuItem(item._id || item.id, newDailyQty);
        setShowRestock(false);
        setAddedQty('');
      } catch (error) {
        window.alert(error.message || 'Could not restock this item. Please try again.');
      }
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${item.name}"? This cannot be undone.`)) return;

    try {
      await deleteMenuItem(item._id || item.id);
    } catch (error) {
      window.alert(error.message || 'Could not delete this menu item. Please try again.');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-card border border-gray-100/80 overflow-hidden hover-lift gradient-border transition-all duration-300">
      <div className="flex gap-3 p-3">
        {/* Image */}
        <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 relative">
          {(item.image && (typeof item.image === 'string' ? item.image : item.image.url)) ? (
            <img
              src={typeof item.image === 'string' ? item.image : item.image.url}
              alt={item.name}
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
              <Package size={24} className="text-orange-400" />
            </div>
          )}
          {/* Status overlay */}
          {isSoldOut && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
              <span className="text-white text-[10px] font-bold uppercase">
                Sold Out
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-gray-900 truncate">{item.name}</h3>
              <p className="text-base font-extrabold text-gray-900 mt-0.5">₹{item.price}</p>
            </div>
            <button
              onClick={() => navigate(`/menu/edit/${item._id || item.id}`)}
              className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
            >
              <Pencil size={14} className="text-gray-500" />
            </button>
          </div>

          {/* Labels */}
          {item.labels && item.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {item.labels.map((label) => {
                const colors = LABEL_COLORS[label] || { bg: 'bg-gray-100', text: 'text-gray-600' };
                return (
                  <span key={label} className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${colors.bg} ${colors.text} uppercase tracking-wide`}>
                    {label}
                  </span>
                );
              })}
            </div>
          )}

          {/* Stock info */}
          <div className="mt-2 space-y-1">
            <div className="text-xs text-gray-600 font-medium">
              Available: <span className="font-bold text-gray-900">{item.remaining} portions</span>
            </div>
            <div className="text-xs text-gray-600 font-medium flex items-center gap-1.5">
              Status: 
              {isSoldOut ? (
                <span className="font-bold text-red-500 uppercase text-[10px] tracking-wide">Sold Out</span>
              ) : isLowStock ? (
                <span className="font-bold text-amber-500 uppercase text-[10px] tracking-wide">Only {item.remaining} left</span>
              ) : (
                <span className="font-bold text-green-500 uppercase text-[10px] tracking-wide">Available</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex border-t border-gray-100">
        <button
          onClick={() => navigate(`/menu/edit/${item._id || item.id}`)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <Pencil size={13} />
          Edit
        </button>
        <div className="w-px bg-gray-100" />
        <button
          onClick={() => setShowRestock(!showRestock)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
        >
          <Package size={13} />
          Restock
        </button>
        <div className="w-px bg-gray-100" />
        <button
          onClick={handleDelete}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors"
          aria-label={`Delete ${item.name}`}
        >
          <Trash2 size={13} />
          Delete
        </button>
      </div>

      {/* Restock Modal using Portal to avoid overflow clipping */}
      {showRestock && createPortal(
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Restock Item</h2>
              <p className="text-sm text-gray-500 mt-1">{item.name}</p>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 font-medium">Current stock:</span>
                <span className="font-bold text-gray-900">{item.remaining} portions</span>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                  How many additional portions are you adding?
                </label>
                <input
                  type="number"
                  value={addedQty}
                  onChange={(e) => setAddedQty(e.target.value)}
                  min="1"
                  step="1"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all font-medium"
                  placeholder="e.g. 20"
                />
              </div>
              
              <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-50">
                <span className="text-gray-600 font-medium">New available stock:</span>
                <span className="font-bold text-blue-600">
                  {item.remaining + (Number(addedQty) || 0)} portions
                </span>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 flex gap-3 border-t border-gray-100">
              <button
                onClick={() => {
                  setShowRestock(false);
                  setAddedQty('');
                }}
                className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRestock}
                disabled={!addedQty || Number(addedQty) <= 0 || !Number.isInteger(Number(addedQty))}
                className="flex-1 py-2.5 bg-blue-500 text-white rounded-xl font-semibold text-sm hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Restock
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
