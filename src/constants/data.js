import ProductImage from '../assets/productimage.png'
 export const storeOptions = [
    { id: 'pharmacy', name: 'Go To Pharmacy', icon: 'pharmacy' },
    { id: 'restaurant', name: 'Go To Restaurant', icon: 'restaurant' },
    { id: 'lounge', name: 'Go To Lounge', icon: 'lounge' }
  ];

  
export const sampleProducts = [
    {
      id: 1,
      name: 'Chicken Shawarma',
      image: ProductImage,
      price: 120.00,
      rating: 6,
      stockCount: 12,
      stockStatus: 'In Stock'
    },
    {
      id: 2,
      name: 'Chicken Shawarma',
      image: ProductImage,
      price: 120.00,
      rating: 6,
      stockCount: 12,
      stockStatus: 'In Stock'
    },
    {
      id: 3,
      name: 'Chicken Shawarma',
      image: ProductImage,
      price: 120.00,
      rating: 6,
      stockCount: 12,
      stockStatus: 'In Stock'
    },
    {
      id: 4,
      name: 'Chicken Shawarma',
      image: ProductImage,
      price: 120.00,
      rating: 6,
      stockCount: 12,
      stockStatus: 'In Stock'
    },
    {
      id: 5,
      name: 'Chicken Shawarma',
      image: ProductImage,
      price: 120.00,
      rating: 6,
      stockCount: 12,
      stockStatus: 'In Stock'
    },
    {
      id: 6,
      name: 'Chicken Shawarma',
      image: ProductImage,
      price: 120.00,
      rating: 6,
      stockCount: 12,
      stockStatus: 'In Stock'
    },
    {
      id: 7,
      name: 'Chicken Shawarma',
      image: ProductImage,
      price: 120.00,
      rating: 6,
      stockCount: 12,
      stockStatus: 'In Stock'
    },
    {
      id: 8,
      name: 'Chicken Shawarma',
      image: ProductImage,
      price: 120.00,
      rating: 6,
      stockCount: 12,
      stockStatus: 'In Stock'
    }
  ];
  
 export const mockCategories = [
    { label: "Beverages", value: "beverages" },
    { label: "Snacks", value: "snacks" },
    { label: "Personal Care", value: "personal_care" },
    { label: "Supplements", value: "supplements" },
    { label: "Household", value: "household" },
  ];
  

export const mockProduct = {
  id: 'prod-001',
  name: 'UltraComfort Ergonomic Chair',
  price: 199.99,
  stockCount: 42,
  inStock: true,
  isFavorite: true,
  likes: 137,
  shortDescription: 'A comfortable, adjustable ergonomic chair for daily use.',
  longDescription: `This UltraComfort Ergonomic Chair is designed to provide superior support for long hours of sitting. 
It features breathable mesh fabric, adjustable height, reclining backrest, and smooth-rolling wheels. 
Perfect for home offices, gaming setups, or workspaces. Built with durability and comfort in mind.`,
  images: [
  
    {
      url:   ProductImage,
    },
    {
      url:   ProductImage,
    },
    {
      url:   ProductImage,
    },
    {
      url:   ProductImage,
    },
    {
      url:   ProductImage,
    },
  ],

};
export const messages = [
  { 
    id: 'MSG001',
    product: 'Chicken',
    customer: 'Jane Roe',
    status: 'Pending',
    preview: 'Payment Deline',

  },
    { 
    id: 'MSG001',
    product: 'Chicken',
    customer: 'Jane Roe',
    status: 'Pending',
    preview: 'Payment Deline',
    
  },
    { 
    id: 'MSG001',
    product: 'Chicken',
    customer: 'Jane Roe',
    status: 'Pending',
    preview: 'Payment Deline',
    
  },
    { 
    id: 'MSG001',
    product: 'Chicken',
    customer: 'Jane Roe',
    status: 'Pending',
    preview: 'Payment Deline',
    
  }
]

 export const initialOrders = [
    { 
      id: '#12345', 
      customer: 'Mark Lee', 
      status: 'Failed', 
      amount: 'N35,000', 
      date: '12/06/2025',
      // Additional properties needed for OrderSummary
      customerName: 'Mark Lee',
       customerEmail: "john.doe@email.com", 

      phoneNumber: '+2476936374',
      orderDate: '12/06/2025',
      paymentMethod: 'Bank Transfer',
      paymentStatus: 'Failed',
      notes: 'Customer reported issue with delivery',
      products: [
        {
          id: 1,
          name: 'Chicken Shawarma',
          image: ProductImage,
          price: 120.00,
          quantity: 3,
          stockCount: 12,
          stockStatus: 'In stock'
        }
      ],
      payments: [
        {
          id: 'TX14001',
          amount: 'N35,000',
          method: 'Bank Transfer',
          status: 'Failed',
          date: '12/06/2025'
        }
      ]
    },
    { 
      id: '#12346', 
      customer: 'Sarah Smith', 
      status: 'Delivered', 
      amount: 'N42,000', 
      date: '11/06/2025',
      customerName: 'Sarah Smith',
        customerEmail: "john.doe@email.com", 
      phoneNumber: '+2473214567',
      orderDate: '11/06/2025',
      paymentMethod: 'Card Payment',
      paymentStatus: 'Paid',
      notes: 'Leave package at the door',
      products: [
        {
          id: 2,
          name: 'Beef Burger',
            image: ProductImage,
          price: 85.00,
          quantity: 5,
          stockCount: 20,
          stockStatus: 'In stock'
        }
      ],
      payments: [
        {
          id: 'TX14002',
          amount: 'N42,000',
          method: 'Card Payment',
          status: 'Completed',
          date: '11/06/2025'
        }
      ]
    },
    { 
      id: '#12347', 
      customer: 'Alex Johnson', 
      status: 'On transit', 
      amount: 'N35,000', 
      date: '10/06/2025',
      customerName: 'Alex Johnson',
        customerEmail: "john.doe@email.com", 
      phoneNumber: '+2479876543',
      orderDate: '10/06/2025',
      paymentMethod: 'Cash on Delivery',
      paymentStatus: 'Pending',
      notes: 'Call when arriving',
      products: [
        {
          id: 3,
          name: 'Pizza Margherita',
          image: ProductImage,
          price: 130.00,
          quantity: 2,
          stockCount: 15,
          stockStatus: 'In stock'
        },
        {
          id: 4,
          name: 'Garlic Bread',
            image: ProductImage,
          price: 65.00,
          quantity: 1,
          stockCount: 25,
          stockStatus: 'In stock'
        }
      ],
      payments: [
        {
          id: 'TX14003',
          amount: 'N35,000',
          method: 'Cash on Delivery',
          status: 'Pending',
          date: '10/06/2025'
        }
      ]
    },
    // You can add the rest of your sample data here
  ];

  // Sample data for charts
export  const performanceData = [
    { name: 'Jan', value: 20 },
    { name: 'Feb', value: 45 },
    { name: 'Mar', value: 28 },
    { name: 'Apr', value: 80 },
    { name: 'May', value: 35 },
    { name: 'Jun', value: 65 },
    { name: 'Jul', value: 40 },
    { name: 'Aug', value: 120 },
    { name: 'Sep', value: 30 },
    { name: 'Oct', value: 50 },
    { name: 'Nov', value: 25 },
    { name: 'Dec', value: 35 }
  ];
  export const activities = [
  {
    id: 1,
    name: 'Math Quiz Prep',
    date: 'May 16, 2025',
    time: '09:22 AM',
  },
  {
    id: 2,
    name: 'Science Fair Project',
    date: 'May 16, 2025',
    time: '09:22 AM',
  },
  {
    id: 3,
    name: 'History Presentation',
  date: 'May 16, 2025',
    time: '09:22 AM',
  },
];

 export const paymentsData = [
    { name: 'Jan', value: 2000 },
    { name: 'Feb', value: 3000 },
    { name: 'Mar', value: 4500 },
    { name: 'Apr', value: 3800 },
    { name: 'May', value: 5200 },
    { name: 'Jun', value: 6000 }
  ];
  
  // Sample product data
 export const topSellingProducts = [
    {
      id: 1,
      name: "Chicken Shawarma",
      image: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=150&h=150&fit=crop&crop=center",
      price: "120.00",
      rating: 4.5,
      stockCount: 15,
      stockStatus: "In Stock"
    },
    {
      id: 2,
      name: "Chicken Shawarma",
      image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=150&h=150&fit=crop&crop=center",
      price: "120.00",
      rating: 4.5,
      stockCount: 10,
      stockStatus: "In Stock"
    },
    {
      id: 3,
      name: "Chicken Shawarma",
      image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=150&h=150&fit=crop&crop=center",
      price: "120.00",
      rating: 4.5,
      stockCount: 8,
      stockStatus: "In Stock"
    },
    {
      id: 4,
      name: "Chicken Shawarma",
      image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=150&h=150&fit=crop&crop=center",
      price: "120.00",
      rating: 4.5,
      stockCount: 12,
      stockStatus: "In Stock"
    }
  ];
  
  // Unresolved chats data
 export const unresolvedChats = [
    {
      id: 1,
      name: "Alex Johnson",
      message: "Haven't received my order yet.",
      time: "10 mins ago",
      status: "Reply now"
    },
    {
      id: 2,
      name: "Alex Johnson",
      message: "Haven't received my order yet.",
      time: "12 mins ago",
      status: "Reply now"
    },
    {
      id: 3,
      name: "Alex Johnson",
      message: "Haven't received my order yet.",
      time: "15 mins ago",
      status: "Reply now"
    }
  ];