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


 export const initialOrders = [
    { 
      id: '#12345', 
      customer: 'Mark Lee', 
      status: 'Failed', 
      amount: 'N35,000', 
      date: '12/06/2025',
      // Additional properties needed for OrderSummary
      customerName: 'Mark Lee',
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