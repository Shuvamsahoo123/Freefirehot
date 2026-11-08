// =============================================
// Mock Data for FreeFire Hotel Seller App
// =============================================

export const FOOD_IMAGES = {
  'Chicken Biryani': '/images/chicken-biryani.png',
  'Mutton Biryani': '/images/mutton-biryani.png',
  'Egg Biryani': '/images/egg-biryani.png',
  'Veg Biryani': '/images/veg-biryani.png',
};

// ---------- ORDERS ----------
export const initialOrders = [
  {
    id: 1,
    orderId: 'BRY1024',
    customerName: 'Rahul Kumar',
    phone: '98765 43210',
    items: [{ name: 'Chicken Biryani', quantity: 2, price: 120, image: FOOD_IMAGES['Chicken Biryani'] }],
    totalAmount: 240,
    advanceAmount: 120,
    remainingAmount: 120,
    orderType: 'Delivery',
    paymentStatus: 'verified',
    orderStatus: 'accepted',
    orderTime: '10:30 AM',
    date: '25 Nov 2024',
    upiTransactionId: '412345678901',
    paymentScreenshot: null,
    paymentTime: '10:28 AM',
    paymentVerifiedAt: '10:32 AM',
    remainingPaidAt: null,
    rejectionReason: null,
    deliveryAddress: 'Patia, Bhubaneswar, Odisha 751024',
    scheduledTime: '7:30 PM (Today)',
    specialInstructions: 'Extra spicy please',
  },
  {
    id: 2,
    orderId: 'BRY1025',
    customerName: 'Neha Patnaik',
    phone: '87654 32109',
    items: [{ name: 'Mutton Biryani', quantity: 1, price: 180, image: FOOD_IMAGES['Mutton Biryani'] }],
    totalAmount: 180,
    advanceAmount: 90,
    remainingAmount: 90,
    orderType: 'Pickup',
    paymentStatus: 'verification_pending',
    orderStatus: 'pending',
    orderTime: '10:20 AM',
    date: '25 Nov 2024',
    upiTransactionId: '412345678901',
    paymentScreenshot: null,
    paymentTime: '10:18 AM',
    paymentVerifiedAt: null,
    remainingPaidAt: null,
    rejectionReason: null,
    deliveryAddress: '',
    scheduledTime: '6:00 PM (Today)',
    specialInstructions: '',
  },
  {
    id: 3,
    orderId: 'BRY1026',
    customerName: 'Amit Shah',
    phone: '76543 21098',
    items: [{ name: 'Chicken Biryani', quantity: 3, price: 120, image: FOOD_IMAGES['Chicken Biryani'] }],
    totalAmount: 360,
    advanceAmount: 180,
    remainingAmount: 180,
    orderType: 'Pickup',
    paymentStatus: 'verified',
    orderStatus: 'preparing',
    orderTime: '10:15 AM',
    date: '25 Nov 2024',
    upiTransactionId: '312345678901',
    paymentScreenshot: null,
    paymentTime: '10:13 AM',
    paymentVerifiedAt: '10:16 AM',
    remainingPaidAt: null,
    rejectionReason: null,
    deliveryAddress: '',
    scheduledTime: '5:30 PM (Today)',
    specialInstructions: 'Pack separately',
  },
  {
    id: 4,
    orderId: 'BRY1027',
    customerName: 'Priya Das',
    phone: '65432 10987',
    items: [{ name: 'Egg Biryani', quantity: 1, price: 100, image: FOOD_IMAGES['Egg Biryani'] }],
    totalAmount: 100,
    advanceAmount: 50,
    remainingAmount: 50,
    orderType: 'Dine-In',
    paymentStatus: 'verified',
    orderStatus: 'confirmed',
    orderTime: '10:10 AM',
    date: '25 Nov 2024',
    upiTransactionId: '212345678901',
    paymentScreenshot: null,
    paymentTime: '10:08 AM',
    paymentVerifiedAt: '10:12 AM',
    remainingPaidAt: null,
    rejectionReason: null,
    deliveryAddress: '',
    scheduledTime: '7:00 PM (Today)',
    specialInstructions: '',
  },
  {
    id: 5,
    orderId: 'BRY1028',
    customerName: 'Suman Das',
    phone: '54321 09876',
    items: [
      { name: 'Chicken Biryani', quantity: 1, price: 120, image: FOOD_IMAGES['Chicken Biryani'] },
      { name: 'Veg Biryani', quantity: 1, price: 90, image: FOOD_IMAGES['Veg Biryani'] },
    ],
    totalAmount: 210,
    advanceAmount: 105,
    remainingAmount: 105,
    orderType: 'Delivery',
    paymentStatus: 'verification_pending',
    orderStatus: 'pending',
    orderTime: '09:50 AM',
    date: '25 Nov 2024',
    upiTransactionId: '987654321098',
    paymentScreenshot: null,
    paymentTime: '09:48 AM',
    paymentVerifiedAt: null,
    remainingPaidAt: null,
    rejectionReason: null,
    deliveryAddress: 'Saheed Nagar, Bhubaneswar, Odisha 751007',
    scheduledTime: '1:00 PM (Today)',
    specialInstructions: 'Call before delivery',
  },
  {
    id: 6,
    orderId: 'BRY1029',
    customerName: 'Ananya Mishra',
    phone: '91234 56789',
    items: [{ name: 'Mutton Biryani', quantity: 2, price: 180, image: FOOD_IMAGES['Mutton Biryani'] }],
    totalAmount: 360,
    advanceAmount: 180,
    remainingAmount: 180,
    orderType: 'Pickup',
    paymentStatus: 'verified',
    orderStatus: 'ready',
    orderTime: '09:30 AM',
    date: '25 Nov 2024',
    upiTransactionId: '112233445566',
    paymentScreenshot: null,
    paymentTime: '09:28 AM',
    paymentVerifiedAt: '09:32 AM',
    remainingPaidAt: null,
    rejectionReason: null,
    deliveryAddress: '',
    scheduledTime: '12:00 PM (Today)',
    specialInstructions: '',
  },
  {
    id: 7,
    orderId: 'BRY1030',
    customerName: 'Deepak Jena',
    phone: '89012 34567',
    items: [{ name: 'Veg Biryani', quantity: 2, price: 90, image: FOOD_IMAGES['Veg Biryani'] }],
    totalAmount: 180,
    advanceAmount: 90,
    remainingAmount: 90,
    orderType: 'Delivery',
    paymentStatus: 'verified',
    orderStatus: 'confirmed',
    orderTime: '09:15 AM',
    date: '25 Nov 2024',
    upiTransactionId: '998877665544',
    paymentScreenshot: null,
    paymentTime: '09:13 AM',
    paymentVerifiedAt: '09:17 AM',
    remainingPaidAt: null,
    rejectionReason: null,
    deliveryAddress: 'Jaydev Vihar, Bhubaneswar, Odisha 751013',
    scheduledTime: '12:30 PM (Today)',
    specialInstructions: 'Less oil',
  },
  {
    id: 8,
    orderId: 'BRY1031',
    customerName: 'Kavita Panda',
    phone: '78901 23456',
    items: [
      { name: 'Chicken Biryani', quantity: 2, price: 120, image: FOOD_IMAGES['Chicken Biryani'] },
      { name: 'Egg Biryani', quantity: 1, price: 100, image: FOOD_IMAGES['Egg Biryani'] },
    ],
    totalAmount: 340,
    advanceAmount: 170,
    remainingAmount: 0,
    orderType: 'Dine-In',
    paymentStatus: 'verified',
    orderStatus: 'completed',
    orderTime: '08:45 AM',
    date: '25 Nov 2024',
    upiTransactionId: '556677889900',
    paymentScreenshot: null,
    paymentTime: '08:43 AM',
    paymentVerifiedAt: '08:48 AM',
    remainingPaidAt: '11:15 AM',
    rejectionReason: null,
    deliveryAddress: '',
    scheduledTime: '11:00 AM (Today)',
    specialInstructions: '',
  },
];

// ---------- MENU ITEMS ----------
export const initialMenuItems = [
  {
    id: 1,
    name: 'Chicken Biryani',
    price: 120,
    dailyQty: 50,
    booked: 42,
    remaining: 8,
    status: 'available',
    description: 'Chicken biryani with fragrant basmati rice, tender chicken pieces, and authentic spices.',
    image: { url: FOOD_IMAGES['Chicken Biryani'], publicId: '' },
    labels: ['Most Popular', 'Spicy'],
    availableDays: [],
    category: 'Non-Veg',
  },
  {
    id: 2,
    name: 'Mutton Biryani',
    price: 180,
    dailyQty: 30,
    booked: 30,
    remaining: 0,
    status: 'soldout',
    description: 'Premium mutton biryani with slow-cooked mutton, saffron rice, and rich masala.',
    image: { url: FOOD_IMAGES['Mutton Biryani'], publicId: '' },
    labels: ['Spicy'],
    availableDays: [],
    category: 'Non-Veg',
  },
  {
    id: 3,
    name: 'Egg Biryani',
    price: 100,
    dailyQty: 20,
    booked: 8,
    remaining: 12,
    status: 'available',
    description: 'Flavorful egg biryani with boiled eggs, aromatic rice, and special spice blend.',
    image: { url: FOOD_IMAGES['Egg Biryani'], publicId: '' },
    labels: [],
    availableDays: [],
    category: 'Non-Veg',
  },
  {
    id: 4,
    name: 'Veg Biryani',
    price: 90,
    dailyQty: 25,
    booked: 10,
    remaining: 15,
    status: 'available',
    description: 'Garden-fresh vegetable biryani with mixed veggies, paneer, and fragrant spices.',
    image: { url: FOOD_IMAGES['Veg Biryani'], publicId: '' },
    labels: ['Pure Veg'],
    availableDays: [],
    category: 'Veg',
  },
];


// ---------- DINE-IN BOOKINGS ----------
export const initialDineInBookings = [
  {
    id: 1,
    bookingId: 'DIN1021',
    customerName: 'Amit',
    phone: '91234 56700',
    people: 4,
    items: [{ name: 'Chicken Biryani', quantity: 4, price: 120 }],
    totalAmount: 480,
    time: '7:30 PM',
    date: '25 Nov 2024',
    paymentStatus: 'verified',
    bookingStatus: 'confirmed',
  },
  {
    id: 2,
    bookingId: 'DIN1022',
    customerName: 'Sneha',
    phone: '89012 34500',
    people: 2,
    items: [
      { name: 'Mutton Biryani', quantity: 1, price: 180 },
      { name: 'Chicken Biryani', quantity: 1, price: 120 },
    ],
    totalAmount: 300,
    time: '8:00 PM',
    date: '25 Nov 2024',
    paymentStatus: 'verified',
    bookingStatus: 'confirmed',
  },
  {
    id: 3,
    bookingId: 'DIN1023',
    customerName: 'Rajesh',
    phone: '78901 23400',
    people: 6,
    items: [{ name: 'Chicken Biryani', quantity: 6, price: 120 }],
    totalAmount: 720,
    time: '7:00 PM',
    date: '25 Nov 2024',
    paymentStatus: 'verification_pending',
    bookingStatus: 'pending',
  },
  {
    id: 4,
    bookingId: 'DIN1024',
    customerName: 'Priyanka',
    phone: '67890 12345',
    people: 3,
    items: [
      { name: 'Veg Biryani', quantity: 2, price: 90 },
      { name: 'Egg Biryani', quantity: 1, price: 100 },
    ],
    totalAmount: 280,
    time: '6:30 PM',
    date: '25 Nov 2024',
    paymentStatus: 'verified',
    bookingStatus: 'confirmed',
  },
  {
    id: 5,
    bookingId: 'DIN1025',
    customerName: 'Vikram',
    phone: '56789 01234',
    people: 8,
    items: [
      { name: 'Chicken Biryani', quantity: 4, price: 120 },
      { name: 'Mutton Biryani', quantity: 4, price: 180 },
    ],
    totalAmount: 1200,
    time: '8:30 PM',
    date: '25 Nov 2024',
    paymentStatus: 'verified',
    bookingStatus: 'completed',
  },
  {
    id: 6,
    bookingId: 'DIN1026',
    customerName: 'Meera',
    phone: '45678 90123',
    people: 2,
    items: [{ name: 'Egg Biryani', quantity: 2, price: 100 }],
    totalAmount: 200,
    time: '9:00 PM',
    date: '25 Nov 2024',
    paymentStatus: 'verified',
    bookingStatus: 'confirmed',
  },
];

// ---------- NOTIFICATIONS ----------
export const initialNotifications = [
  {
    id: 1,
    type: 'new_order',
    title: 'New Order Received',
    message: 'Order #BRY1024 from Rahul Kumar – 2× Chicken Biryani',
    time: '2 min ago',
    read: false,
    icon: 'ShoppingBag',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
  },
  {
    id: 2,
    type: 'payment',
    title: 'Payment Submitted',
    message: 'Neha Patnaik submitted payment for #BRY1025 – ₹180',
    time: '5 min ago',
    read: false,
    icon: 'CreditCard',
    color: 'text-green-500',
    bgColor: 'bg-green-50',
  },
  {
    id: 3,
    type: 'payment_verify',
    title: 'Payment Verification Required',
    message: 'Verify payment for order #BRY1028 from Suman Das – ₹240',
    time: '15 min ago',
    read: false,
    icon: 'AlertCircle',
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
  },
  {
    id: 4,
    type: 'order_ready',
    title: 'Order Ready',
    message: 'Order #BRY1029 for Ananya Mishra is ready for pickup',
    time: '30 min ago',
    read: true,
    icon: 'CheckCircle',
    color: 'text-green-500',
    bgColor: 'bg-green-50',
  },
  {
    id: 5,
    type: 'dinein',
    title: 'Dine-In Booking Received',
    message: 'New dine-in booking #DIN1023 from Rajesh – 6 people at 7:00 PM',
    time: '45 min ago',
    read: true,
    icon: 'UtensilsCrossed',
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
  },
  {
    id: 6,
    type: 'inventory',
    title: 'Inventory Running Low',
    message: 'Chicken Biryani has only 8 remaining out of 50',
    time: '1 hour ago',
    read: true,
    icon: 'AlertTriangle',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
  },
  {
    id: 7,
    type: 'inventory',
    title: 'Item Sold Out',
    message: 'Mutton Biryani is now sold out (30/30 booked)',
    time: '1.5 hours ago',
    read: true,
    icon: 'XCircle',
    color: 'text-red-500',
    bgColor: 'bg-red-50',
  },
  {
    id: 8,
    type: 'new_order',
    title: 'New Order Received',
    message: 'Order #BRY1031 from Kavita Panda – 3 items',
    time: '2 hours ago',
    read: true,
    icon: 'ShoppingBag',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
  },
];

// ---------- STORE SETTINGS ----------
export const initialStoreSettings = {
  restaurantName: 'FreeFire Hotel',
  phone: '91234 56789',
  address: 'Patia, Bhubaneswar, Odisha 751024',
  upiId: 'freefirehotel@upi',
  onlineOrderingEnabled: true,
  estimatedPrepTime: 30,
  openingHours: {
    Monday: { open: '10:00', close: '22:00', closed: false },
    Tuesday: { open: '10:00', close: '22:00', closed: false },
    Wednesday: { open: '10:00', close: '22:00', closed: false },
    Thursday: { open: '10:00', close: '22:00', closed: false },
    Friday: { open: '10:00', close: '23:00', closed: false },
    Saturday: { open: '10:00', close: '23:00', closed: false },
    Sunday: { open: '11:00', close: '22:00', closed: false },
  },
  temporaryClosure: {
    enabled: false,
    reason: '',
    fromDate: '',
    toDate: '',
  },
  holidays: [],
};

// ---------- HELPER FUNCTIONS ----------
export const getOrderStatusLabel = (status) => {
  const labels = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    accepted: 'Accepted',
    preparing: 'Preparing',
    ready: 'Ready',
    'out-for-delivery': 'Out for Delivery',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };
  return labels[status] || status;
};

export const getOrderStatusColor = (status) => {
  const colors = {
    pending: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', dot: 'bg-yellow-500' },
    confirmed: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
    accepted: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-500' },
    preparing: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' },
    ready: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' },
    'out-for-delivery': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-500' },
    completed: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', dot: 'bg-gray-500' },
    cancelled: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
  };
  return colors[status] || colors.pending;
};

export const getPaymentStatusColor = (status) => {
  const colors = {
    verified: { bg: 'bg-green-50', text: 'text-green-600', dot: 'bg-green-500' },
    verification_pending: { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500' },
    rejected: { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500' },
  };
  return colors[status] || colors.verification_pending;
};

export const getPaymentStatusLabel = (status) => {
  const labels = {
    verified: 'Payment Confirmed',
    verification_pending: 'Payment Pending',
    rejected: 'Payment Rejected',
  };
  return labels[status] || status;
};

export const getOrderTypeColor = (type) => {
  const colors = {
    Delivery: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
    Pickup: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
    'Dine-In': { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
  };
  return colors[type] || colors.Pickup;
};

export const getNextOrderAction = (orderStatus, paymentStatus, orderType) => {
  if (paymentStatus === 'verification_pending') {
    return { label: 'Verify Payment First', action: null, disabled: true };
  }
  if (paymentStatus === 'rejected') {
    return { label: 'Payment Rejected', action: null, disabled: true };
  }

  const isDelivery = orderType === 'Delivery' || orderType === 'delivery';

  if (isDelivery) {
    const deliveryActions = {
      pending: { label: 'Accept Order', action: 'accepted', disabled: false },
      confirmed: { label: 'Accept Order', action: 'accepted', disabled: false },
      accepted: { label: 'Deliver', action: 'completed', disabled: false },
      preparing: { label: 'Deliver', action: 'completed', disabled: false },
      ready: { label: 'Deliver', action: 'completed', disabled: false },
      'out-for-delivery': { label: 'Deliver', action: 'completed', disabled: false },
      completed: { label: 'Order Completed', action: null, disabled: true },
      cancelled: { label: 'Order Cancelled', action: null, disabled: true },
    };
    return deliveryActions[orderStatus] || deliveryActions.pending;
  }

  const actions = {
    pending: { label: 'Accept Order', action: 'accepted', disabled: false },
    confirmed: { label: 'Accept Order', action: 'accepted', disabled: false },
    accepted: { label: 'Mark as Completed', action: 'completed', disabled: false },
    preparing: { label: 'Mark as Completed', action: 'completed', disabled: false },
    ready: { label: 'Mark as Completed', action: 'completed', disabled: false },
    'out-for-delivery': { label: 'Mark as Completed', action: 'completed', disabled: false },
    completed: { label: 'Order Completed', action: null, disabled: true },
    cancelled: { label: 'Order Cancelled', action: null, disabled: true },
  };
  return actions[orderStatus] || actions.pending;

};

// ---------- LABEL HELPERS ----------
export const AVAILABLE_LABELS = ['Pure Veg', 'Most Popular', 'Spicy', 'New', 'Chef Special'];

export const LABEL_COLORS = {
  'Pure Veg': { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
  'Most Popular': { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  'Spicy': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
  'New': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  'Chef Special': { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
};

export const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const REJECTION_REASONS = [
  'Item out of stock',
  'Kitchen closed',
  'Too many orders',
  'Delivery area not serviceable',
  'Invalid payment',
  'Customer request',
  'Other',
];
