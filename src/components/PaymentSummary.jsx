import React, { useState } from 'react';
import { ArrowLeft, Mail, Printer } from 'lucide-react';
import ProductCard from './ProductCard';
import '../styles/OrderSummary.css';
import InfoCard from './InfoCard';
import { formatDate } from '../utils/formatDate';
import Receipt from './Receipt';

const PaymentSummary = ({
  order,
  onBack,
  onViewOrder,
  onVerify,
  onDiscard,
  isVerifying = false,
  onView,
  style,
  onSendEmail
}) => {
  const [showReceipt, setShowReceipt] = useState(false);

  // Detect new payment format
  const isNewFormat = order?.paid_orders && order?.transaction_id;

  let paymentData;

  if (isNewFormat) {
    const paymentInfo = order;
    const orderInfo = paymentInfo?.paid_orders?.[0];
    const customer = orderInfo?.customer;
    const product = orderInfo?.product;

    const formatAmount = (amount) => {
      const num = parseFloat(amount);
      return isNaN(num) ? '0.00' : num.toLocaleString();
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
      deliveryAmount: paymentInfo?.deliveryAmount || 0,
      deliveryLocation: paymentInfo?.deliveryLocation,
      orderAmount: paymentInfo?.amount - paymentInfo?.deliveryAmount,
      orderNumber: orderInfo?.order_number,
      orderStatus: orderInfo?.status,
      products: product
    };
  } else {
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
      deliveryAmount: order?.deliveryAmount || 0,
      deliveryLocation: order?.deliveryLocation,
      orderAmount: order?.amount - order?.deliveryAmount,
      orderNumber: order.orderNumber,
      orderStatus: order.orderStatus,
      products: order.products
    };
  }

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
    orderNumber,
    orderStatus,
    products,
    orderAmount,
    deliveryAmount,
    deliveryLocation
  } = paymentData;

  const isPaymentConfirmed =
    paymentStatus?.toLowerCase() === 'payment confirmed' ||
    paymentStatus?.toLowerCase() === 'confirmed';

  const formattedProducts = products
    ? [{
        id: products.id,
        name: products.name,
        image: products.main_image_url,
        price: products.price,
        rating: 5,
        stockCount: products.amount_in_stock,
        stockStatus: products.out_of_stock_status ? "Out of stock" : "In stock",
        description: products.short_description || products.long_description,
        categories: products.categories?.map(cat => cat.name).join(', ')
      }]
    : [];

  const leftCardItems = [
    { label: "Payment ID:", value: paymentId, isCopyable: true },
    { label: "Transaction ID:", value: transactionId, isCopyable: true },
    { label: "Payment Method:", value: paymentMethod },
    { label: "Payment Date:", value: formatDate(paymentDate) },
    { label: "Delivery Location:", value: deliveryLocation || 'N/A' },
    { label: "Delivery Amount:", value: `₦${deliveryAmount || '0'}` },
    { label: "Order Amount:", value: `₦${orderAmount || '0'}` },
    { label: "Total Amount:", value: `₦${amount || '0'}` }
  ];

  const rightCardItems = [
    { label: "Customer Name:", value: customerName },
    { label: "Customer Email:", value: customerEmail, isEmail: true },
    { label: "Phone Number:", value: phoneNumber, isPhone: true },
    { label: "Order Number:", value: orderNumber, isCopyable: true },
    { label: "Payment Status:", value: paymentStatus, badge: true },
    { label: "Order Status:", value: orderStatus, badge: true }
  ];

  return (
    <>
      <div className="modal-overlay-order-summary" style={style}>
        <div className="add-product-modal">
          <div className="modal-header">
            <h2>Payment Summary</h2>

            <div className="header-actions">
              <button
                className="email-button"
                onClick={onSendEmail}
                disabled={!customerEmail}
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

          {/* 🔥 VERIFY / PRINT SECTION */}
          <div className="verify">
            {!isPaymentConfirmed ? (
              <button
                className="update-button add-button"
                onClick={onVerify}
                disabled={isVerifying}
              >
                {isVerifying ? 'Verifying...' : 'Verify Payment'}
              </button>
            ) : (
              <button
                className="update-button add-button"
                onClick={() => setShowReceipt(true)}
              >
                <Printer size={16} style={{ marginRight: 6 }} />
                Print Receipt
              </button>
            )}
          </div>

          <div className="order-details">
            <div className="order-info-row">
              <InfoCard items={leftCardItems} />
              <InfoCard items={rightCardItems} />
            </div>

            {formattedProducts.length > 0 && (
              <div className="ordered-products-section">
                <h3>Ordered Product</h3>
                <div className="ordered-products-grid">
                  {formattedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
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
              >
                Discard Payment
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 🧾 RECEIPT MODAL */}
      {showReceipt && (
        <Receipt
          order={{
            ...paymentData,
            products: formattedProducts
          }}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </>
  );
};

export default PaymentSummary;
