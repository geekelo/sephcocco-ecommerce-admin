import React from 'react';
import { ArrowLeft, Mail } from 'lucide-react';
import ProductCard from './ProductCard';
import '../styles/OrderSummary.css';
import InfoCard from './InfoCard';
import { formatDate } from '../utils/formatDate';

const PaymentSummary = ({
  order,
  onBack,
  onViewOrder,
  onVerify,
  onDiscard,
  isVerifying = false,
  onEdit,
  onDelete,
  onView,
  onSendEmail
}) => {
  console.log('payment order', order);
  
  // Check if this is the new sephcocco_pharmacy_payment format or the old format
  const isNewFormat = order.paid_orders && order.transaction_id;
  
  let paymentData;
  
  if (isNewFormat) {
    // Handle sephcocco_pharmacy_payment format
    const paymentInfo = order; // This is the payment object
    const orderInfo = paymentInfo?.paid_orders?.[0]; // Get the first order
    const customer = orderInfo?.customer;
    const product = orderInfo?.product;
    
    // Format amount properly
    const formatAmount = (amount) => {
      if (!amount) return '0.00';
      const numericAmount = parseFloat(amount);
      return isNaN(numericAmount) ? '0.00' : numericAmount.toLocaleString();
    };
    
    paymentData = {
      transactionId: paymentInfo.transaction_id,
      paymentId: paymentInfo.id,
      amount: formatAmount(paymentInfo.amount),
      paymentMethod: paymentInfo.payment_method,
      paymentStatus: paymentInfo.status,
      paymentDate: paymentInfo.created_at,
      customerName: customer?.name,
      customerEmail: customer?.email,
      phoneNumber: customer?.phone_number,
      orderId: orderInfo?.id,
      orderNumber: orderInfo?.order_number,
      orderStatus: orderInfo?.status,
      orderDate: orderInfo?.created_at,
      products: product,
      notes: null
    };
  } else {
    // Handle original format
    paymentData = {
      transactionId: order.transactionId,
      paymentId: order.id,
      amount: order.amount,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.status || order.paymentStatus,
      paymentDate: order.paymentDate,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      phoneNumber: order.phoneNumber,
      orderNumber: order.orderNumber,
      orderStatus: order.orderStatus,
      orderDate: order.orderDate,
      products: order.products,
      notes: order.notes
    };
  }

  // Destructure the standardized data
  const {
    transactionId,
    paymentId,
    amount,
    paymentMethod,
    paymentStatus,
    paymentDate,
    customerName,
    customerEmail,
    phoneNumber,
    orderId,
    orderNumber,
    orderStatus,
    orderDate,
    products,
    notes
  } = paymentData;
console.log('proddd',products);
console.log('proddpaymed',paymentData);
  // Convert single product object to array format expected by ProductCard
  const formattedProducts = products ? [{
    id: products.id,
    name: products.name,
    image: products.main_image_url,
    price: products.price,
    rating: 5,
    stockCount: products.amount_in_stock,
    stockStatus: products.out_of_stock_status ? "Out of stock" : "In stock",
    description: products.short_description || products.long_description,
    categories: products.categories?.map(cat => cat.name).join(', ') || 'No category'
  }] : [];

  const leftCardItems = [
    { label: "Payment ID:", value: paymentId || 'N/A', isCopyable: true },
    { label: "Transaction ID:", value: transactionId || 'N/A', isCopyable: true },
    { label: "Payment Method:", value: paymentMethod || "Not specified" },
    { label: "Payment Date:", value: paymentDate ? formatDate(paymentDate) : new Date(paymentDate).toLocaleDateString() },
    { label: "Total Amount:", value: `₦${amount}` }
  ];

  const rightCardItems = [
    { label: "Customer Name:", value: customerName || 'N/A' },
    {
      label: "Customer Email:",
      value: customerEmail || "Not provided",
      isEmail: true
    },
    {
      label: "Phone Number:",
      value: phoneNumber || "Not provided",
      isPhone: true
    },
    // { label: "Order ID:", value: orderId || 'N/A', isCopyable: true },
    ...(orderNumber ? [{ label: "Order Number:", value: orderNumber, isCopyable: true }] : []),
    { label: "Payment Status:", value: paymentStatus || 'N/A', badge: true },
    { label: "Order Status:", value: orderStatus || 'N/A', badge: true }
  ];

  return (
    <div className="modal-overlay-order-summary">
      <div className="add-product-modal">
        <div className="modal-header">
          <h2>Payment Summary</h2>
          <div className="header-actions">
            {/* Email button */}
            <button
              className="email-button"
              onClick={onSendEmail}
              disabled={!customerEmail}
              title={!customerEmail ? "Customer email not available" : "Send email to customer"}
            >
              <Mail size={16} />
              Send Email
            </button>
            <button className="back-button" onClick={onBack}>
              <ArrowLeft size={16} />
              Go Back
            </button>
          </div>
        </div>
                        
        <div className='verify'>
          <button 
            className="update-button add-button" 
            onClick={onVerify}
            disabled={isVerifying}
            style={{ 
              opacity: isVerifying ? 0.6 : 1,
              cursor: isVerifying ? 'not-allowed' : 'pointer'
            }}
          >
            {isVerifying ? 'Verifying...' : 'Verify Payment'}  
          </button>
        </div>
                        
        <div className="order-details">
          <div className="order-info-row">
            <InfoCard items={leftCardItems} />
            <InfoCard items={rightCardItems} />
          </div>

          {formattedProducts.length > 0 && (
            <div className="ordered-products-section">
              <h3>Ordered Product</h3>
              <div className="products-grid">
                {formattedProducts.map((product, index) => (
                  <ProductCard
                    key={product.id || index}
                    product={product}
                    onView={onView}
                 
                  />
                ))}
              </div>
            </div>
          )}

          <div className="form-actions">
            <button className="update-button add-button" onClick={onViewOrder}>
             View Order
            </button>
          
            <button 
              className="discard-button cancel-button" 
              onClick={onDiscard}
              disabled={isVerifying}
            >
              Discard Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSummary;