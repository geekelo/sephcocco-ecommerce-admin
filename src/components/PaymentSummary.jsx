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

  const isNewFormat = order?.paid_orders && order?.transaction_id;

  let paymentData;

  if (isNewFormat) {
    const paymentInfo = order;
    const firstOrder = paymentInfo?.paid_orders?.[0];
    const customer = firstOrder?.customer;

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
      deliveryAmount: paymentInfo?.delivery_location?.logistics_price || 0,
      deliveryLocation: paymentInfo?.delivery_location?.location || 'N/A',
      orderAmount:
        Number(paymentInfo.amount || 0) -
        Number(paymentInfo?.delivery_location?.logistics_price || 0),
      orderNumber:
        paymentInfo?.paid_orders?.map((item) => item.order_number).join(', '),
      orderStatus:
        paymentInfo?.paid_orders?.[0]?.status || '',
      paidOrders: paymentInfo?.paid_orders || [],
      products:
        paymentInfo?.paid_orders?.map((item) => item.product).filter(Boolean) || []
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
      orderAmount:
        Number(order?.amount || 0) - Number(order?.deliveryAmount || 0),
      orderNumber: Array.isArray(order.orderNumbers)
        ? order.orderNumbers.join(', ')
        : order.orderNumber,
      orderStatus: order.orderStatus || '',
      paidOrders: order.orders || [],
      products: Array.isArray(order.products)
        ? order.products
        : order.products
        ? [order.products]
        : []
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
    products
  } = paymentData;

  const isPaymentConfirmed =
    paymentStatus?.toLowerCase() === 'payment confirmed' ||
    paymentStatus?.toLowerCase() === 'confirmed';

  const formattedProducts = isNewFormat
    ? (order?.paid_orders || []).map((item) => ({
        id: item.product?.id,
        orderId: item.id,
        orderNumber: item.order_number,
        orderStatus: item.status,
        name: item.product?.name,
        image: item.product?.main_image_url,
        price: item.product?.price,
        rating: 5,
        stockCount: item.product?.amount_in_stock,
        stockStatus: item.product?.out_of_stock_status ? 'Out of stock' : 'In stock',
        description:
          item.product?.short_description || item.product?.long_description,
        categories: item.product?.categories?.map((cat) => cat.name).join(', ')
      }))
    : Array.isArray(products)
    ? products.map((product, index) => ({
        id: product.id,
        orderId: paymentData?.paidOrders?.[index]?.id || '',
        orderNumber: paymentData?.paidOrders?.[index]?.order_number || '',
        orderStatus: paymentData?.paidOrders?.[index]?.status || orderStatus || '',
        name: product.name,
        image: product.main_image_url || product.image,
        price: product.price,
        rating: 5,
        stockCount: product.amount_in_stock,
        stockStatus: product.out_of_stock_status ? 'Out of stock' : 'In stock',
        description: product.short_description || product.long_description,
        categories: product.categories?.map((cat) => cat.name).join(', ')
      }))
    : [];

  const leftCardItems = [
    { label: 'Payment ID:', value: paymentId, isCopyable: true },
    { label: 'Transaction ID:', value: transactionId, isCopyable: true },
    { label: 'Payment Method:', value: paymentMethod },
    { label: 'Payment Date:', value: formatDate(paymentDate) },
    { label: 'Total Amount:', value: `₦${amount || '0'}` }
  ];

  const rightCardItems = [
    { label: 'Customer Name:', value: customerName },
    { label: 'Customer Email:', value: customerEmail, isEmail: true },
    { label: 'Phone Number:', value: phoneNumber, isPhone: true },
    { label: 'Order Number(s):', value: orderNumber },
    { label: 'Payment Status:', value: paymentStatus, badge: true },
    { label: 'Order Status:', value: orderStatus, badge: true }
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
                <h3>Ordered Products</h3>
                <div className="ordered-products-grid">
                  {formattedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onView={() => onView?.(product)}
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