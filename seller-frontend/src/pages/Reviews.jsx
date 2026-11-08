import { useState, useEffect } from 'react';
import { Star, MessageSquare, Trash2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { fetchReviewsAPI, toggleReviewVerificationAPI, deleteReviewAPI } from '../services/api';

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await fetchReviewsAPI();
      if (data.success) {
        setReviews(data.data);
      } else {
        setError('Failed to load reviews.');
      }
    } catch (err) {
      setError(err.message || 'Could not load reviews.');
    } finally {
      setLoading(false);
    }
  };

  const toggleVerification = async (id, currentStatus) => {
    try {
      const data = await toggleReviewVerificationAPI(id);
      if (data.success) {
        setReviews((prev) =>
          prev.map((r) => (r._id === id ? { ...r, isApproved: !currentStatus } : r))
        );
      }
    } catch (err) {
      alert('Failed to update verification status');
    }
  };

  const deleteReview = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      const data = await deleteReviewAPI(id);
      if (data.success) {
        setReviews((prev) => prev.filter((r) => r._id !== id));
      }
    } catch (err) {
      alert('Failed to delete review');
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, idx) => (
      <Star
        key={idx}
        size={14}
        className={`${idx < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`}
      />
    ));
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
        <button onClick={fetchReviews} className="mt-4 text-sm font-semibold underline">Retry</button>
      </div>
    );
  }

  const verifiedCount = reviews.filter((r) => r.isApproved).length;
  const unverifiedCount = reviews.length - verifiedCount;

  return (
    <div className="px-4 py-5 pb-32 animate-fade-in max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center">
            <Star className="text-yellow-500 fill-yellow-500" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Customer Reviews</h1>
            <p className="text-sm text-gray-500 mt-0.5">Verify reviews to show them on the public website</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
          <div className="text-center">
            <span className="block text-xs font-semibold text-gray-400 uppercase">Verified</span>
            <span className="block text-lg font-bold text-green-600">{verifiedCount}</span>
          </div>
          <div className="w-px h-8 bg-gray-100" />
          <div className="text-center">
            <span className="block text-xs font-semibold text-gray-400 uppercase">Pending</span>
            <span className="block text-lg font-bold text-yellow-600">{unverifiedCount}</span>
          </div>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="text-gray-300" size={24} />
          </div>
          <h3 className="text-gray-900 font-bold mb-1">No reviews yet</h3>
          <p className="text-gray-500 text-sm">When customers leave reviews, they will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((review) => (
            <div
              key={review._id}
              className={`bg-white rounded-2xl p-5 border shadow-sm transition-all duration-300 relative overflow-hidden flex flex-col ${
                review.isApproved ? 'border-green-200 ring-1 ring-green-50' : 'border-yellow-200 ring-1 ring-yellow-50'
              }`}
            >
              <div className={`absolute top-0 left-0 w-1 h-full ${review.isApproved ? 'bg-green-500' : 'bg-yellow-400'}`} />
              
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-base font-bold text-gray-900">{review.customerName || review.name || 'Anonymous'}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    {renderStars(review.rating || 5)}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
                  {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mt-2 mb-4 border border-gray-100 flex-grow">
                <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed italic">
                  "{review.comment}"
                </p>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-gray-50 mt-auto">
                {review.isApproved ? (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-bold">
                    <CheckCircle2 size={14} />
                    Verified & Public
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-lg text-xs font-bold">
                    <Clock size={14} />
                    Pending Verification
                  </span>
                )}
                
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleVerification(review._id, review.isApproved)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border transition-colors font-bold text-xs ${
                      review.isApproved 
                        ? 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50' 
                        : 'bg-green-500 border-green-600 text-white hover:bg-green-600 shadow-sm'
                    }`}
                  >
                    {review.isApproved ? (
                      <>
                        <XCircle size={14} />
                        Unverify
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={14} />
                        Verify
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => deleteReview(review._id)}
                    className="flex items-center justify-center p-2 bg-white border border-gray-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                    title="Delete Review"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
