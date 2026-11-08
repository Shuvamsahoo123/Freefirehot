import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AVAILABLE_LABELS, LABEL_COLORS, DAYS_OF_WEEK } from '../data/mockData';
import MenuItemImageUpload from '../components/menu/MenuItemImageUpload';

export default function EditFoodItem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { menuItems, updateMenuItem, deleteMenuItem } = useApp();

  const item = menuItems.find((i) => i.id === Number(id) || i._id === id || String(i.id) === String(id));

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [dailyQty, setDailyQty] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [imageStatus, setImageStatus] = useState({ isPending: false, isUploading: false });
  const [labels, setLabels] = useState([]);
  const [category, setCategory] = useState('Non-Veg');

  // Image state — stores the Cloudinary { url, publicId } object
  const [imageData, setImageData] = useState(null);

  useEffect(() => {
    if (item) {
      setName(item.name);
      setPrice(String(item.price));
      setDailyQty(String(item.dailyQty));
      setDescription(item.description || '');
      setLabels(item.labels || []);
      setCategory(item.category || 'Non-Veg');

      // Handle both old-format string images and new-format { url, publicId } objects
      if (item.image && typeof item.image === 'object' && item.image.url) {
        setImageData(item.image);
      } else if (item.image && typeof item.image === 'string') {
        // Legacy: treat old string URL as an image with no publicId
        setImageData({ url: item.image, publicId: '' });
      } else {
        setImageData(null);
      }
    }
  }, [item]);

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <p className="text-gray-400 text-sm mb-4">Item not found</p>
        <button
          onClick={() => navigate('/menu')}
          className="text-primary-500 font-semibold text-sm"
        >
          Back to Menu
        </button>
      </div>
    );
  }

  const handleImageChange = (data) => {
    setImageData(data);
  };

  const toggleLabel = (label) => {
    setLabels((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!name.trim() || !price || !dailyQty) return;
    if (imageStatus.isPending) {
      setFormError(imageStatus.isUploading
        ? 'Wait for the image upload to finish before saving the menu item.'
        : 'Click Upload to finish attaching the selected image before saving.');
      return;
    }

    setSaving(true);
    try {
      await updateMenuItem(item.id || item._id, {
        name: name.trim(),
        price: Number(price),
        dailyQty: Number(dailyQty),
        description: description.trim(),
        image: imageData
          ? imageData
          : { url: '', publicId: '' },
        labels,
        category,
      });
      navigate('/menu');
    } catch (error) {
      console.error("Failed to update menu item", error);
      setFormError(error.message || 'Could not save the menu item. Check the server connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Delete "${item.name}"? This cannot be undone.`)) {
      deleteMenuItem(item.id || item._id).then(() => {
        navigate('/menu');
      }).catch(err => console.error("Failed to delete menu item", err));
    }
  };

  return (
    <div className="px-4 py-5 animate-fade-in pb-36">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Image upload */}
        <MenuItemImageUpload
          existingImage={imageData}
          onImageChange={handleImageChange}
          onUploadStatusChange={setImageStatus}
          disabled={saving}
        />

        {/* Food name */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
            Food Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 transition-all duration-200 text-sm font-medium"
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
            Category
          </label>
          <div className="flex gap-2">
            {['Veg', 'Non-Veg'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
                  category === cat
                    ? cat === 'Veg'
                      ? 'bg-green-100 text-green-700 border-2 border-green-300'
                      : 'bg-red-100 text-red-700 border-2 border-red-300'
                    : 'bg-gray-50 text-gray-500 border border-gray-200'
                }`}
              >
                {cat === 'Veg' ? '🟢 ' : '🔴 '}{cat}
              </button>
            ))}
          </div>
        </div>

        {/* Price */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
            Price (₹)
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            min="0"
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 transition-all duration-200 text-sm font-medium"
            required
          />
        </div>

        {/* Daily quantity */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
            Today's Available Quantity
          </label>
          <input
            type="number"
            value={dailyQty}
            onChange={(e) => setDailyQty(e.target.value)}
            min="0"
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 transition-all duration-200 text-sm font-medium"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 transition-all duration-200 text-sm font-medium resize-none"
          />
        </div>

        {/* Labels */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
            Labels
          </label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_LABELS.map((label) => {
              const isSelected = labels.includes(label);
              const colors = LABEL_COLORS[label] || {};
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => toggleLabel(label)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isSelected
                      ? `${colors.bg} ${colors.text} border-2 ${colors.border}`
                      : 'bg-gray-50 text-gray-500 border border-gray-200'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Fixed bottom buttons */}
        <div className="fixed bottom-24 lg:bottom-6 left-0 right-0 px-4 lg:pl-72 z-30">
          <div className="max-w-3xl mx-auto lg:max-w-5xl">
            {formError && <p role="alert" className="mb-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">{formError}</p>}
            {imageStatus.isPending && !formError && <p className="mb-2 text-center text-xs font-medium text-amber-700">{imageStatus.isUploading ? 'Uploading image… Save will unlock when it finishes.' : 'Image upload failed. Retry the upload above before saving.'}</p>}
            <div className="flex gap-3">
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-red-200 text-red-500 rounded-xl font-semibold text-sm hover:bg-red-50 transition-all duration-200 touch-active bg-white shadow-md"
            >
              <Trash2 size={16} />
            </button>
            <button
              type="submit"
              disabled={saving || imageStatus.isPending || !name.trim() || !price || !dailyQty}
              className="flex-1 py-3 bg-primary-500 text-white rounded-xl font-semibold text-sm hover:bg-primary-600 transition-all duration-200 touch-active shadow-md shadow-primary-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                'Save Changes'
              )}
            </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
