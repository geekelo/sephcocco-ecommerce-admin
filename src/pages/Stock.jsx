import React, { useState, useMemo } from 'react';
import { Search, Plus, Package, History, ArrowLeft, X } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import FlexibleTable from '../components/FlexibleTable';
import Pagination from '../components/Pagination';
import { EmptyState } from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';
import PaymentSummary from '../components/PaymentSummary';
import ConfirmActionModal from '../components/ConfirmActionModal';
import '../styles/Stock.css'

// Import the stock management hooks
import { useViewAllProduct } from '../hooks/useGetAllProduct';
import { useGetStock } from '../hooks/useGetStock';
import { useViewStockId } from '../hooks/useViewStockId';
import { useAddStock } from '../hooks/useAddStock';
import { useUpdateStock } from '../hooks/useUpdateStock';
import { useDeleteStock } from '../hooks/useDeleteStock';
import { getActiveOutlet } from '../utils/getActiveOutlets';
import { toast } from 'react-toastify';
import { StockModal } from '../components/StockModal';

// Product table columns
const createProductColumns = (onAddStock) => [
  {
    key: 'image',
    header: 'Product Image',
    render: (product) => (
      <div className="product-image-cell">
        <img 
          src={product.main_image_url || 'https://via.placeholder.com/50x50?text=P'} 
          alt={product.name} 
          style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
        />
      </div>
    ),
    width: '60px'
  },
  {
    key: 'name',
    header: 'Product Name',
    render: (product) => (
      <div className="product-name-cell">
        <div className="product-name">{product.name}</div>
        <div className="product-barcode">Barcode: {product.barcode || 'N/A'}</div>
      </div>
    )
  },
{
  key: 'category',
  header: 'Product Category',
  render: (product) => (
    <div className="product-category-cell">
      {product.categories && product.categories.length > 0 ? (
        <div className="category-list">
          {product.categories.map((category, index) => (
            <span key={category.id} className="category-badge">
              {category.name}
              {index < product.categories.length - 1 && ', '}
            </span>
          ))}
        </div>
      ) : (
        <span className="no-category">No Category</span>
      )}
    </div>
  )
},
{
  key: 'price',
  header: 'Price',
  render: (product) => (
    <div className="price-cell">
      ₦{parseFloat(product.price || 0).toLocaleString()}
    </div>
  )
},
  {
    key: 'current_stock',
    header: 'Current Stock',
    render: (product) => (
      <div className={`stock-cell ${(product.amount_in_stock || 0) < 20 ? 'low-stock' : ''}`}>
        {product.amount_in_stock || 0}
      </div>
    )
  },
  {
    key: 'actions',
    header: 'Actions',
    type: 'button',
    buttonConfig: {
      text: 'Add Stock',      
      className: 'view-stock-action-btn',
      onClick: (product) => onAddStock(product)
    },
    width: '100px'
  }
];

// Stock history table columns
const createStockHistoryColumns = (onViewStock) => [
  {
    key: 'invoice_number',
    header: 'Invoice Number',
    render: (history) => (
      <div className="invoice-cell">{history.invoice_number}</div>
    )
  },
  {
    key: 'vendor',
    header: 'Vendor',
    render: (history) => history.vendor || 'N/A'
  },
  {
    key: 'status',
    header: 'Status',
    render: (history) => (
      <span className={`status-badge status-${history.status?.toLowerCase() || 'pending'}`}>
        {history.status || 'Pending'}
      </span>
    )
  },
  {
    key: 'product',
    header: 'Product',
    render: (history) => (
      <div className="product-info-cell">
        <div>{history.product?.name || 'N/A'}</div>
      </div>
    )
  },
  {
    key: 'stock_changes',
    header: 'Stock Changes',
    render: (history) => (
      <div className="stock-changes-cell">
        <span className="old-stock">{history.stock?.old_stock || 0}</span>
        <span className="add-stock">+{history.stock?.add_stock || 0}</span>
        <span className="new-stock">{history.stock?.new_stock || 0}</span>
      </div>
    )
  },
  {
    key: 'price',
    header: 'Price',
    render: (history) => (
      <div className="price-cell">₦{history.price?.new_price?.toLocaleString() || '0'}</div>
    )
  },
  {
    key: 'date',
    header: 'Date',
    render: (history) => new Date(history.created_at || history.date).toLocaleDateString()
  },
  {
    key: 'actions',
    header: 'Actions',
    type: 'button',
    buttonConfig: {
      text: 'View Stock',  
      className: 'view-stock-action-btn',
      onClick: (history) => onViewStock(history)
    },
    width: '100px'
  }
];

// Main Stock Management Component
const StockManagement = () => {
  const activeOutlet = getActiveOutlet();
  const [activeTab, setActiveTab] = useState('products');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedStockHistory, setSelectedStockHistory] = useState(null);
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [showUpdateStockModal, setShowUpdateStockModal] = useState(false);
  const [showStockDetailModal, setShowStockDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Pagination and filters
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [searchBarState, setSearchBarState] = useState({
    search: "",
    status: "All Status", 
    startDate: "",
    endDate: ""
  });

  const [filters, setFilters] = useState({
    search_terms: "",
    status: "",
    start_date: "",
    end_date: "",
  });

  // API hooks
  const { data: productsData = { products: [], meta: {} }, isLoading: productsLoading, refetch: refetchProducts } = useViewAllProduct(
    activeOutlet, 
    filters, 
    currentPage, 
    itemsPerPage
  );

  const { data: stockData = { stocks: [], meta: {} }, isLoading: stockLoading, refetch: refetchStock } = useGetStock(
    activeOutlet,
    filters,
    currentPage,
    itemsPerPage
  );

  const { data: selectedStockDetail } = useViewStockId(
    activeOutlet,
    selectedStockHistory?.id,
    { enabled: !!selectedStockHistory?.id }
  );

  const { mutateAsync: addStock, isPending: addingStock } = useAddStock();
  const { mutateAsync: updateStock, isPending: updatingStock } = useUpdateStock();
  const { mutateAsync: deleteStock, isPending: deletingStock } = useDeleteStock();

  // Get current data based on active tab
  const getCurrentData = () => {
    if (activeTab === 'products') {
      return {
        data: productsData.products || [],
        meta: productsData.meta || {},
        isLoading: productsLoading
      };
    } else {
      return {
        data: stockData.stock_managements || [],
        meta: stockData.meta || {},
        isLoading: stockLoading
      };
    }
  };

  const { data: currentData, meta, isLoading } = getCurrentData();

  // Event handlers
  const handleApplyFilters = ({ status, search_terms, start_date, end_date }) => {
    setFilters({ status: status?.toLowerCase() || "", search_terms, start_date, end_date });
    setCurrentPage(1);
    
    setSearchBarState({
      search: search_terms || "",
      status: status ? status.charAt(0).toUpperCase() + status.slice(1) : "All Status",
      startDate: start_date || "",
      endDate: end_date || ""
    });
  };

  const handleManualSearch = (searchTerm) => {
    handleApplyFilters({
      status: "",
      search_terms: searchTerm,
      start_date: "",
      end_date: ""
    });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleAddStock = (product) => {
    setSelectedProduct(product);
    setShowAddStockModal(true);
  };

  const handleViewStock = (stockHistory) => {
    setSelectedStockHistory(stockHistory);
    setShowStockDetailModal(true);
  };

  const handleConfirmAddStock = async (stockData) => {
    try {
      const payload = {
        stock_management_param_key: stockData
      };

      await addStock({
        active_outlet: activeOutlet,
        payload
      });

      toast.success('Stock added successfully');
      setShowAddStockModal(false);
      setSelectedProduct(null);
      refetchProducts();
      refetchStock();
    } catch (error) {
      console.error('Error adding stock:', error);
      toast.error('Failed to add stock');
    }
  };

  const handleUpdateStock = async (stockHistory) => {
    setSelectedStockHistory(stockHistory);
    setShowUpdateStockModal(true);
    setShowStockDetailModal(false);
  };

  const handleConfirmUpdateStock = async (payload) => {
    try {
      const updatePayload = {
        stock_management_param_key: payload
      };

      await updateStock({
        active_outlet: activeOutlet,
        stockId: selectedStockHistory.id,
        payload: updatePayload
      });

      toast.success('Stock updated successfully');
      setShowUpdateStockModal(false);
      setSelectedStockHistory(null);
      refetchStock();
    } catch (error) {
      console.error('Error updating stock:', error);
      toast.error('Failed to update stock');
    }
  };

  const handleDeleteStock = async () => {
    try {
      await deleteStock({
        active_outlet: activeOutlet,
        stockId: selectedStockHistory.id
      });

      toast.success('Stock deleted successfully');
      setShowDeleteModal(false);
      setShowStockDetailModal(false);
      setSelectedStockHistory(null);
      refetchStock();
    } catch (error) {
      console.error('Error deleting stock:', error);
      toast.error('Failed to delete stock');
    }
  };

  const productColumns = useMemo(() => createProductColumns(handleAddStock), []);
  const stockHistoryColumns = useMemo(() => createStockHistoryColumns(handleViewStock), []);

  const currentColumns = activeTab === 'products' ? productColumns : stockHistoryColumns;
  const totalPages = Math.ceil((meta.total_count || 0) / itemsPerPage);

  return (
    <div className="order-page">
      <SearchBar
        onApply={handleApplyFilters}
        onManualSearch={handleManualSearch}
        filterOptions={activeTab === 'products' 
          ? ["All Status", "Public", "Private"] 
          : ["All Status", "Completed", "Pending", "Cancelled"]
        }
        categoryOptions={[]}
        sortOptions={[]}
        placeholder={`Search ${activeTab}...`}
        filterLabel="Filter by"
        showDate={activeTab === 'history'}
        initialValues={searchBarState}
      />

      <div className="stock-tabs">
        <button 
          className={`tab-button ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => handleTabChange('products')}
        >
          <Package size={16} />
          Products
        </button>
        <button 
          className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => handleTabChange('history')}
        >
          <History size={16} />
          Stock History
        </button>
      </div>

      <div className="order-table-container">
        {isLoading ? (
          <LoadingSkeleton itemsPerPage={itemsPerPage} />
        ) : currentData.length > 0 ? (
          <>
            <FlexibleTable
              data={currentData}
              columns={currentColumns}
              actions={[]}
              keyField="id"
              onRowClick={activeTab === 'history' ? handleViewStock : undefined}
              className="stock-table"
              emptyState={
                <EmptyState 
                  title={`No ${activeTab} found`} 
                  searchTerm={filters.search_terms} 
                />
              }
            />

            <Pagination
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={meta.total_count || 0}
              showInfo={true}
              name={activeTab === 'products' ? 'Products' : 'Stock Records'}
            />
          </>
        ) : (
          <EmptyState 
            title={`No ${activeTab} found`} 
            searchTerm={filters.search_terms} 
          />
        )}
      </div>

      <StockModal
        isOpen={showAddStockModal}
        onClose={() => {
          setShowAddStockModal(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        onConfirm={handleConfirmAddStock}
        isLoading={addingStock}
        isEdit={false}
      />

      <StockModal
        isOpen={showUpdateStockModal}
        onClose={() => {
          setShowUpdateStockModal(false);
          setSelectedStockHistory(null);
        }}
        stockData={selectedStockHistory}
        onConfirm={handleConfirmUpdateStock}
        isLoading={updatingStock}
        isEdit={true}
      />

      {/* Use PaymentSummary component for stock details */}
      {showStockDetailModal && selectedStockHistory && (
        <PaymentSummary
          order={{
            ...selectedStockHistory,
            customerName: selectedStockHistory.vendor,
            customerEmail: '', // Stock doesn't have email
            products: selectedStockHistory.product,
            amount: selectedStockHistory.price?.new_price,
            paymentMethod: 'Stock Purchase',
            status: selectedStockHistory.status,
            paymentDate: selectedStockHistory.created_at,
            transactionId: selectedStockHistory.invoice_number,
            totalPrice: selectedStockHistory.price?.new_price
          }}
          onBack={() => {
            setShowStockDetailModal(false);
            setSelectedStockHistory(null);
          }}
          onViewOrder={() => console.log('View order')}
          onVerify={() => handleUpdateStock(selectedStockHistory)}
          onDiscard={() => setShowDeleteModal(true)}
          onEdit={() => console.log('Edit stock')}
          onDelete={() => setShowDeleteModal(true)}
          onView={() => console.log('View stock')}
          isVerifying={updatingStock}
          // Hide email button for stock
          hideEmailButton={true}
        />
      )}

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <ConfirmActionModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteStock}
          type="delete"
          title="Confirm Delete"
          message={
            <p>
              Are you sure you want to delete stock record{" "}
              <strong>{selectedStockHistory?.invoice_number}</strong>?
              This action cannot be undone.
            </p>
          }
          isLoading={deletingStock}
        />
      )}
    </div>
  );
};

export default StockManagement;