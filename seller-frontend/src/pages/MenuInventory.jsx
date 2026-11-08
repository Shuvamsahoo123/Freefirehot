import { useNavigate } from 'react-router-dom';
import { Plus, Grid3X3 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import FoodItemCard from '../components/FoodItemCard';

export default function MenuInventory() {
  const navigate = useNavigate();
  const { menuItems, updateMenuItem } = useApp();

  const handleToggleStatus = (itemId, currentStatus) => {
    const newStatus = currentStatus === 'available' ? 'disabled' : 'available';
    updateMenuItem(itemId, { status: newStatus });
  };

  const availableCount = menuItems.filter((i) => i.status === 'available').length;

  return (
    <div className="px-4 py-5 animate-fade-in pb-28">
      {/* Header */}
      <div className="mb-5 px-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center shadow-md">
              <Grid3X3 size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Menu & Inventory</h2>
              <p className="text-xs text-gray-500 font-medium">{menuItems.length} items · {availableCount} available</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/menu/add')}
            className="flex items-center gap-1 px-3 py-1.5 bg-primary-500 text-white rounded-lg font-semibold text-xs transition-all duration-200 touch-active shadow-sm hover:bg-primary-600"
          >
            <Plus size={14} />
            Add
          </button>
        </div>
      </div>

      {/* Menu items list */}
      <div className="space-y-3 stagger-children">
        {menuItems.map((item) => (
          <FoodItemCard
            key={item.id}
            item={item}
            onToggleStatus={() => handleToggleStatus(item.id, item.status)}
          />
        ))}
      </div>
    </div>
  );
}
