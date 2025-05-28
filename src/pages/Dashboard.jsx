import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import StatsCard from '../components/StatsCard';
import ChatItem from '../components/ChatItem';
import ProductCard from '../components/ProductCard';
import { mockCategories, mockProduct, paymentsData, performanceData, topSellingProducts, unresolvedChats } from '../constants/data';
import '../styles/Dashboard.css'
import ConfirmActionModal from '../components/ConfirmActionModal';
import UpdateOrderStatusModal from '../components/UpdateOrderStatusModal';
import EditProductModal from '../components/EditModal';
import ProductDetails from '../components/ProductDetails';
import ProgressPie from '../components/ProgressPie';

const DashboardPage = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isEditModal, setIsEditModal] = useState(false);
  const [isDeleteModal, setIsDeleteModal] = useState(false);
  const [isViewModal, setIsViewModal] = useState(false);

  const [isVerifyModal, setIsVerifyModal] = useState(false);
  const [isSuccessModal, setIsSuccessModal] = useState(false);
  const [isUpdateStatusModal, setIsUpdateStatusModal] = useState(false);
  const [isDiscardOrderModal, setIsDiscardOrderModal] = useState(false);
  const [isDiscardPaymentModal, setIsDiscardPaymentModal] = useState(false)
  const handleProductEdit = (product) => {
    setIsEditModal(true)
    console.log('Edit product:', product);
  };

  const handleProductDelete = (product) => {
    console.log('Delete product:', product);
    setIsDeleteModal(true)
  };

  const handleProductView = (product) => {
    setIsViewModal(true)
  };

  const handleChatReply = (chat) => {
    console.log('Reply to chat:', chat);
  };
  const handleConfirm = () => {
    console.log("Deleting product:", mockProduct.name);
    setIsDeleteModal(false);
  };

  const handleVerifyConfirm = () => {
    console.log("Payment verified successfully");
    setIsVerifyModal(false);
    setIsSuccessModal(true);
  };




 
  const handleConfirmStatusUpdate = (newStatus) => {
    console.log("Updating order status to:", newStatus, "for order:", selectedOrder.id);
    // Update the order status in your state/backend here
    // You might want to update the selectedOrder state or refetch data
  };

  const handleEdit = () => {
    setIsViewModal(false);
    setIsDeleteModal(false);
    setIsEditModal(true);
  };
  const handleDelete = () => {
    setIsViewModal(false);
    setIsEditModal(false);
    setIsDeleteModal(true);
  };

  const handleConfirmDiscardOrder = () => {
    console.log("Discarding order:", selectedOrder.id);
    setShowOrderSummary(false);
    setIsDiscardOrderModal(false);
    setSelectedOrder(null);
  };
  // Custom bar shape for the chart
  const CustomBar = (props) => {
    const { fill, ...rest } = props;
    return <Bar {...rest} fill={rest.payload?.name === 'Aug' ? '#FF6B35' : '#FFE5E0'} />;
  };

  return (
    <div className="dashboard">
      {/* Top Stats Row */}
      <div className="stats-row">
        <StatsCard
          title="Total Orders"
          value="22000"
          trend={
            <div className="trend-chart">
              <ResponsiveContainer width={100} height={50}>
                <BarChart data={[
                  { value: 25, name: 'bar1' }, 
                  { value: 45, name: 'bar2' }, 
                  { value: 15, name: 'bar3' }, 
                  { value: 35, name: 'bar4' }, 
                  { value: 20, name: 'bar5' }
                ]}>
                  <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                    <Cell fill="#FFE5E0" />
                    <Cell fill="#FF6B35" />
                    <Cell fill="#FFE5E0" />
                    <Cell fill="#FFE5E0" />
                    <Cell fill="#FFE5E0" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          }
        />
        
        <StatsCard
          title="Total Payments"
          value="$6000"
          trend={
            <div className="payment-trend">
              <ResponsiveContainer width={100} height={50}>
                <LineChart data={paymentsData}>
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#FF6B35" 
                    strokeWidth={2}
                    dot={false}
                    strokeDasharray="none"
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="big-circle-container">
                <div className="large-circle">
                  <div className="dash-line"></div>
                  <div className="center-dot"></div>
                </div>
              </div>
            </div>
          }
        />
        
      <StatsCard
  title="Unresolved Chats"
  value="15"
  isOrange={true}
  icon={<ProgressPie percentage={25} />} 
/>
      </div>

      {/* Main Content Row */}
      <div className="main-content">
        {/* Performance Chart */}
        <div className="chart-section">
          <div className="section-header">
            <h2>Overall Performance</h2>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#888' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#888' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {performanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.name === 'Aug' ? '#FF6B35' : '#FFE5E0'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Unresolved Chats Sidebar */}
        <div className="chat-sidebar">
          <div className="section-header">
            <h3>Unresolved Chats</h3>
            <span className="see-all">See all</span>
          </div>
          <div className="chat-list">
            {unresolvedChats.map(chat => (
              <ChatItem key={chat.id} chat={chat} onReply={handleChatReply} />
            ))}
          </div>
        </div>
      </div>

      {/* Top Selling Products */}
      <div className="products-section">
        <div className="section-header product">
          <h2>Top selling Products</h2>
        </div>
        <div className="products-grid">
          {topSellingProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={handleProductEdit}
              onDelete={handleProductDelete}
              onView={handleProductView}
            />
          ))}
        </div>
      </div>
       {isViewModal && (
        <ProductDetails
          product={mockProduct}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onClose={() => setIsViewModal(false)}
        />
      )}

      {/* Edit Product Modal */}
      {isEditModal && (
        <EditProductModal
          isOpen={isEditModal}
          onClose={() => setIsEditModal(false)}
          product={mockProduct}
          categories={mockCategories}
        />
      )}

      {/* Update Order Status Modal */}
      {isUpdateStatusModal && (
        <UpdateOrderStatusModal
          isOpen={isUpdateStatusModal}
          onClose={() => setIsUpdateStatusModal(false)}
          onConfirm={handleConfirmStatusUpdate}
          currentStatus={selectedOrder?.status}
        />
      )}

      {/* Delete Product Confirmation Modal */}
      {isDeleteModal && (
        <ConfirmActionModal
          isOpen={isDeleteModal}
          onClose={() => setIsDeleteModal(false)}
          onConfirm={handleConfirm}
          type="delete"
          title="Confirm Delete"
          message={
            <>
              Are you sure you want to delete{" "}
              <strong>{mockProduct.name}</strong>?
            </>
          }
        />
      )}

      {/* Discard Order Confirmation Modal */}
      {isDiscardOrderModal && (
        <ConfirmActionModal
          isOpen={isDiscardOrderModal}
          onClose={() => setIsDiscardOrderModal(false)}
          onConfirm={handleConfirmDiscardOrder}
          type="discard"
          title="Confirm Discard Order"
          message={
            <>
              Are you sure you want to discard order{" "}
              <strong>#{selectedOrder?.id}</strong>? This action cannot be undone.
            </>
          }
        />
      )}

      {/* Discard Payment Confirmation Modal */}
      {isDiscardPaymentModal && (
        <ConfirmActionModal
          isOpen={isDiscardPaymentModal}
          onClose={() => setIsDiscardPaymentModal(false)}
          onConfirm={handleConfirmDiscardPayment}
          type="discardPayment"
          title="Confirm Discard Payment"
          message={
            <>
              Are you sure you want to discard this payment? This action cannot be undone.
            </>
          }
        />
      )}

      {/* Verify Payment Confirmation Modal */}
      {isVerifyModal && (
        <ConfirmActionModal
          isOpen={isVerifyModal}
          onClose={() => setIsVerifyModal(false)}
          onConfirm={handleVerifyConfirm}
          type="verify"
          title="Confirm Verification"
          message={
            <>
              Are you sure you want to verify this payment made by{" "}
              <strong>{selectedOrder?.customerName}</strong> with Payment ID{" "}
              <strong>"{selectedOrder?.payments?.[0]?.id}"</strong>?
            </>
          }
        />
      )}

      {/* Success Modal */}
      {isSuccessModal && (
        <ConfirmActionModal
          isOpen={isSuccessModal}
          onClose={() => setIsSuccessModal(false)}
          type="success"
          title="Verification Successful"
          message={
            <>
              You have successfully verified this payment made by{" "}
              <strong>{selectedOrder?.customerName}</strong> with Payment ID{" "}
              <strong>"{selectedOrder?.payments?.[0]?.id}"</strong>
            </>
          }
        />
      )}
    </div>
  );
};
export default DashboardPage;