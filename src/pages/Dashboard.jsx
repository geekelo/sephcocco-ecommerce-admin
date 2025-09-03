import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom'; // Add this import
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, ReferenceLine } from 'recharts';
import StatsCard from '../components/StatsCard';
import ChatItem from '../components/ChatItem';
import ProductCard from '../components/ProductCard';
import OutletSwitcher from '../components/OutletSwitcher';
import ChatModal from '../components/ChatModal'; // Add this import
import { mockCategories, paymentsData } from '../constants/data'; // Remove performanceData and unresolvedChats from here
import '../styles/Dashboard.css'
import '../styles/ProductCard.css';
import '../styles/ProductDetails.css'
import '../styles/ChatItem.css';
import ConfirmActionModal from '../components/ConfirmActionModal';
import UpdateOrderStatusModal from '../components/UpdateOrderStatusModal';
import EditProductModal from '../components/EditModal';
import ProductDetails from '../components/ProductDetails';
import ProgressPie from '../components/ProgressPie';
import { getActiveOutlet } from "../utils/getActiveOutlets";
import { useViewAllProduct } from "../hooks/useGetAllProduct";
import { useAnalytics } from '../hooks/useAnalytics';
import { useDeleteProduct } from '../hooks/useDeleteProduct';
import { useViewProductId } from '../hooks/useGetProductById';
import { toast } from "react-toastify";
import { EmptyState } from '../components/EmptyState';
import DashboardSkeleton from '../components/DashboardSkeleton';

const DashboardPage = () => {
  const navigate = useNavigate(); // Add navigation hook
  const activeOutlet = getActiveOutlet();
  
  // API hooks
const { 
  data: productsResponse, 
  isLoading: isLoadingProducts, 
  error: productsError 
} = useViewAllProduct(activeOutlet, {}, 1, 6);
  
  const {
    allAnalyticsData,
    overallPerformanceData,
    isLoadingOverallPerformance,
    isLoadingAllAnalytics,
    analyticsErrors,
    overallPerformanceError
  } = useAnalytics({ active_outlet: activeOutlet, year: new Date().getFullYear() });
  
  const deleteMutation = useDeleteProduct();

  
  // Extract products from API response
  const topSellingProducts = productsResponse?.products || [];
const topSellers = useMemo(() => {
  if (!Array.isArray(topSellingProducts) || topSellingProducts.length === 0) return [];

  return [...topSellingProducts]
    .sort((a, b) => (b.likes || 0) - (a.likes || 0))
    .slice(0, 6); 
}, [topSellingProducts]);
  
  // Modal states
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [isEditModal, setIsEditModal] = useState(false);
  const [isDeleteModal, setIsDeleteModal] = useState(false);
  const [isViewModal, setIsViewModal] = useState(false);
  const [isVerifyModal, setIsVerifyModal] = useState(false);
  const [isSuccessModal, setIsSuccessModal] = useState(false);
  const [isUpdateStatusModal, setIsUpdateStatusModal] = useState(false);
  const [isDiscardOrderModal, setIsDiscardOrderModal] = useState(false);
  const [isDiscardPaymentModal, setIsDiscardPaymentModal] = useState(false);
  
  // Add chat modal states
  const [selectedChat, setSelectedChat] = useState(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  // Fetch selected product details
  const { data: selectedProductDetails } = useViewProductId(
    activeOutlet,
    selectedProductId, 
    { 
      enabled: !!selectedProductId && selectedProductId.trim() !== ''
    }
  );

  // Transform performance data and get current month
  const transformedPerformanceData = useMemo(() => {
    if (!overallPerformanceData || !Array.isArray(overallPerformanceData)) {
      return [];
    }

    const monthsShort = {
      'January': 'Jan',
      'February': 'Feb', 
      'March': 'Mar',
      'April': 'Apr',
      'May': 'May',
      'June': 'Jun',
      'July': 'Jul',
      'August': 'Aug',
      'September': 'Sep',
      'October': 'Oct',
      'November': 'Nov',
      'December': 'Dec'
    };

    return overallPerformanceData.map(item => ({
      name: monthsShort[item.month] || item.month,
      value: item.orders_count,
      fullMonth: item.month
    }));
  }, [overallPerformanceData]);

  // Get current month name
  const getCurrentMonth = () => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return monthNames[new Date().getMonth()];
  };

  const currentMonth = getCurrentMonth();
  const currentMonthShort = {
    'January': 'Jan',
    'February': 'Feb', 
    'March': 'Mar',
    'April': 'Apr',
    'May': 'May',
    'June': 'Jun',
    'July': 'Jul',
    'August': 'Aug',
    'September': 'Sep',
    'October': 'Oct',
    'November': 'Nov',
    'December': 'Dec'
  }[currentMonth];

  // Helper function to validate product ID
  const isValidProductId = (productId) => {
    return productId && productId.trim() !== '' && productId !== null && productId !== undefined;
  };

  const handleProductEdit = (product) => {

    if (!isValidProductId(product.id)) {
      toast.error('Invalid product selected for editing');
      return;
    }
    setSelectedProductId(product.id);
    setIsEditModal(true);
  };

  const handleProductDelete = (product) => {

    if (!isValidProductId(product.id)) {
      toast.error('Invalid product selected for deletion');
      return;
    }
    setSelectedProductId(product.id);
    setIsDeleteModal(true);
  };

  const handleProductView = (product) => {

    if (!isValidProductId(product.id)) {
      toast.error('Invalid product selected for viewing');
      return;
    }
    setSelectedProductId(product.id);
    setIsViewModal(true);
  };

  // Updated chat reply handler to open chat modal
  const handleChatReply = (chat) => {

    setSelectedChat(chat);
    setIsChatModalOpen(true);
  };

  // Handler for "See all" link to navigate to messages page
  const handleSeeAllChats = () => {
    navigate('/messages');
  };

  // Handler to close chat modal
  const closeChatModal = () => {
    setIsChatModalOpen(false);
    setSelectedChat(null);
  };

  const handleConfirm = () => {
    if (!isValidProductId(selectedProductId)) {
      toast.error('No valid product selected for deletion');
      return;
    }

    deleteMutation.mutate(
      { 
        active_outlet: activeOutlet, 
        productId: selectedProductId 
      },
      {
        onSuccess: () => {
          toast.success('Product deleted successfully');
          setIsDeleteModal(false);
          setSelectedProductId('');
          refetchProducts();
        },
        onError: (error) => {
          console.error('Delete error:', error);
          toast.error('Failed to delete product');
        },
      }
    );
  };

  const handleVerifyConfirm = () => {

    setIsVerifyModal(false);
    setIsSuccessModal(true);
  };

  const handleConfirmStatusUpdate = async (newStatus) => {
    try {
      const payload = {
        [`sephcocco_${activeOutlet}_payment`]: {
          status: newStatus
        }
      };

      await updatePaymentStatus({
        active_outlet: activeOutlet,
        paymentId: selectedPayment?.id,
        payload
      });

      setIsUpdateStatusModal(false);
      
      // Refetch data to update the UI
      refetch();
    } catch (error) {

      // You might want to show an error toast here
    }
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
 
    setIsDiscardOrderModal(false);
  };

  const handleConfirmDiscardPayment = () => {

    setIsDiscardPaymentModal(false);
  };

  // Handle outlet change
  const handleOutletChange = (newOutlet) => {

    // Refetch data when outlet changes
    refetchProducts();
  };

  // Close all modals and reset state
  const handleCloseModals = () => {
    setSelectedProductId('');
    setSelectedProduct(null);
    setIsEditModal(false);
    setIsDeleteModal(false);
    setIsViewModal(false);
  };

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Get stats from analytics data
  const getAnalyticsStats = () => {
    if (!allAnalyticsData) {
      return {
        totalOrders: 0,
        totalPayments: 0,
        unresolvedChats: 0
      };
    }

    return {
      totalOrders: allAnalyticsData.total_orders || 0,
      totalPayments: parseFloat(allAnalyticsData.total_payment_received || '0'),
      unresolvedChats: allAnalyticsData.total_unresolved_chats || 0
    };
  };

  const analyticsStats = getAnalyticsStats();

  // Show loading state
  if (isLoadingProducts || isLoadingAllAnalytics || isLoadingOverallPerformance) {
    return <DashboardSkeleton />;
  }


  return (
    <div className="dashboard">
      {/* Dashboard Header with Outlet Switcher */}
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>Dashboard</h1>
          <p>Welcome back! Here's what's happening with your store.</p>
        </div>
        <div className="dashboard-controls">
          <OutletSwitcher 
            onOutletChange={handleOutletChange}
            className="dashboard-outlet-switcher"
          />
        </div>
      </div>

      {/* Top Stats Row */}
      <div className="stats-row">
        <StatsCard
          title="Total Orders"
          value={analyticsStats.totalOrders.toLocaleString()}
        />
        
        <StatsCard
          title="Total Payments"
          value={formatCurrency(analyticsStats.totalPayments)}
        />
        
        <StatsCard
          title="Unresolved Chats"
          value={analyticsStats.unresolvedChats.toString()}
          isOrange={analyticsStats.unresolvedChats > 0}
  
        />
      </div>

      {/* Main Content Row */}
      <div className="main-content">
        {/* Performance Chart */}
        <div className="chart-section">
          <div className="section-header">
            <h2>Overall Performance</h2>
          </div>
          <div className="chart-container performance-chart-container">
            {transformedPerformanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={transformedPerformanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                  
                  {/* Dashed line in orange - position it at current month's value */}
                  <ReferenceLine 
                    y={transformedPerformanceData.find(item => item.name === currentMonthShort)?.value || 0} 
                    stroke="#FF6B35" 
                    strokeDasharray="4 4"
                    strokeWidth={1}
                    label={{ 
                      value: "", 
                      position: "insideTopLeft", 
                      fill: "#FF6B35", 
                      fontSize: 12, 
                      fontWeight: 600 
                    }}
                  />
                  
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {transformedPerformanceData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.name === currentMonthShort ? '#FF6B35' : '#FFE5E0'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="chart-empty-state">
                <EmptyState message="No performance data available" />
              </div>
            )}
          </div>
        </div>

        {/* Unresolved Chats Sidebar */}
        <div className="chat-sidebar">
          <div className="section-header">
            <h3>Unresolved Chats</h3>
            {/* Updated "See all" link with click handler */}
            <span className="see-all" onClick={handleSeeAllChats} style={{ cursor: 'pointer' }}>
              See all
            </span>
          </div>
          <div className="chat-list">
            {allAnalyticsData?.unresolved_chats && allAnalyticsData.unresolved_chats.length > 0 ? (
              allAnalyticsData.unresolved_chats.slice(0, 5).map(chat => (
                <ChatItem key={chat.id} chat={chat} onReply={handleChatReply} />
              ))
            ) : (
                 <EmptyState message='No message available'/>
            )}
          </div>
        </div>
      </div>

      {/* Top Selling Products */}
      <div className="products-section">
        <div className="section-header product">
          <h2>Top selling Products</h2>
        </div>
        <div className="products-grid">
          {topSellers.length > 0 ? (
            topSellers.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={() => handleProductEdit(product)}
                onDelete={() => handleProductDelete(product)}
                onView={() => handleProductView(product)}
              />
            ))
          ) : (
          <EmptyState message='No product available'/>
          )}
        </div>
      </div>

      {/* Chat Modal for individual chat replies */}
      <ChatModal
      style={{ paddingLeft: '0px' }} 
        isOpen={isChatModalOpen}
        onClose={closeChatModal}
        selectedUser={selectedChat}
      />

      {/* Product View Modal */}
      {isViewModal && selectedProductDetails && isValidProductId(selectedProductId) && (
       
  <ProductDetails
          product={selectedProductDetails}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onClose={() => {
            setIsViewModal(false);
            handleCloseModals();
          }}
        />
      
      
      )}

      {/* Edit Product Modal */}
      {isEditModal && selectedProductDetails && isValidProductId(selectedProductId) && (
      
        <EditProductModal
          isOpen={isEditModal}
          onClose={() => {
            setIsEditModal(false);
            handleCloseModals();
            refetchProducts();
          }}
          product={selectedProductDetails}
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
      {isDeleteModal && selectedProductDetails && isValidProductId(selectedProductId) && (
        <ConfirmActionModal
          isOpen={isDeleteModal}
          onClose={() => {
            setIsDeleteModal(false);
            handleCloseModals();
          }}
          onConfirm={handleConfirm}
          type="delete"
          title="Confirm Delete"
          message={
            <>
              Are you sure you want to delete{" "}
              <strong>{selectedProductDetails.name}</strong>?
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
              Are you sure you want to discard this order? This action cannot be undone.
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
              Are you sure you want to verify this payment?
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
              You have successfully verified this payment.
            </>
          }
        />
      )}
    </div>
  );
};

export default DashboardPage;