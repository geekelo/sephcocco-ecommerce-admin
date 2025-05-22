import React from 'react';
import { ArrowLeft } from 'lucide-react';
import ProductCard from './ProductCard'; 
import OrderTable from './OrderTable'; 
import '../styles/OrderSummary.css';
import InfoCard from './InfoCard';

const OrderSummary = ({ order, onBack,onViewPayment, onUpdateStatus, onDiscard, onEdit,onDelete,onView }) => {
  const { 
    id, 
    customerName, 
    phoneNumber, 
    orderDate, 
    status, 
    paymentMethod, 
    paymentStatus, 
    notes,
    products,
    payments
  } = order;

  // Convert products to the format expected by ProductCard
  const formattedProducts = products.map(product => ({
    name: product.name,
    image: product.image,
    price: product.price,
    rating: product.quantity, // Using quantity in place of rating
    stockCount: product.stockCount,
    stockStatus: "In stock"
  }));

  // Prepare info card data
  const leftCardItems = [
    { label: "Order ID:", value: id },
    { label: "Customer Name:", value: customerName },
    { label: "Phone Number:", value: phoneNumber },
    { label: "Order Date:", value: orderDate }
  ];

  const rightCardItems = [
    { label: "Order Status:", value: status },
    { label: "Payment Method:", value: paymentMethod },
    { label: "Payment Status:", value: paymentStatus },
    { label: "Order Notes:", value: notes || "None" }
  ];

  // Format payments for the order table
  const formattedPayments = payments.map(payment => ({
    id: payment.id,
    customer: '', // Not showing customer in payment table
    amount: payment.amount,
    status: payment.status,
    date: payment.date,
    method: payment.method,
    action: 'View'
  }));

  // Define custom columns for the payment table
  const paymentColumns = [
    { id: 'id', label: 'Payment ID', className: 'payment-id' },
    { id: 'amount', label: 'Amount', className: 'amount' },
    { id: 'method', label: 'Method', className: 'method' },
    { id: 'status', label: 'Status', className: 'status' },
    { id: 'date', label: 'Date', className: 'date' },
    { id: 'action', label: 'Action', className: 'action' }
  ];

  return (
    <div className="modal-overlay">
      <div className="add-product-modal">
        <div className="modal-header">
          <h2>Order Summary(#{id})</h2>
          <button className="back-button" onClick={onBack}>
            <ArrowLeft size={16} />
            Go Back
          </button>
        </div>

        <div className="order-details">
          <div className="order-info-row">
            <InfoCard items={leftCardItems} />
            <InfoCard items={rightCardItems} />
          </div>

          <div className="ordered-products-section">
            <h3>Ordered Products</h3>
            <div className="products-grid">
              {formattedProducts.map((product, index) => (
                <ProductCard
                  key={index}
                  product={product}
                  onView={onView}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </div>

          <div className="linked-payment-section">
            <h3>Linked Payment</h3>
            <OrderTable 
              orders={formattedPayments} 
              columns={paymentColumns}
              keyField="id"
              onViewOrder={onViewPayment}
            />
          </div>

          <div className="form-actions">
            <button className="update-button add-button" onClick={onUpdateStatus}>
              Update Order Status
            </button>
            <button className="discard-button cancel-button" onClick={onDiscard}>
              Discard Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;