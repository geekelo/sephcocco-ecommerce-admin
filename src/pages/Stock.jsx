import React, { useState, useMemo } from 'react';
import { Search, Plus, Package, History, ArrowLeft, X } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import FlexibleTable from '../components/FlexibleTable';
import Pagination from '../components/Pagination';
import { EmptyState } from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';
import StockSummary from '../components/StockSummary'; // Updated import
import ConfirmActionModal from '../components/ConfirmActionModal';
import '../styles/Stock.css'
import '../styles/OrderPage.css'
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
import UpdateStockStatusModal from '../components/UpdateStatusStockModal';

const createProductColumns = (onAddStock) => [
  {
    key: 'image',
    header: 'Product Image',
    render: (product) => (
      <div className="product-image-cell">
        <img 
          src={product.main_image_url || 'https://via.placeholder.com/50x50?text=P'} 
          alt={product.name || 'Product'} 
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
        <div className="product-name" >{String(product.name || 'N/A')}</div>
        <div className="product-barcode">Barcode: {String(product.barcode || 'N/A')}</div>
      </div>
    )
  },
  {
    key: 'category',
    header: 'Product Category',
    render: (product) => {
      // Safely handle categories array
      if (!product.categories || !Array.isArray(product.categories) || product.categories.length === 0) {
        return <span className="no-category">No Category</span>;
      }

      return (
        <div className="product-category-cell">
          <div className="category-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {product.categories.map((category, index) => (
              <span key={category.id || index} className="category-badge">
                {String(category.name || 'Category')}
              </span>
            ))}
          </div>
        </div>
      );
    }
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
        {String(product.amount_in_stock || 0)}
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

// Fixed Stock history table columns - handling object rendering properly
const createStockHistoryColumns = (onViewStock) => [
  {
    key: 'invoice_number',
    header: 'Invoice Number',
    render: (history) => (
      <div className="invoice-cell">{String(history.invoice_number || 'N/A')}</div>
    )
  },
  {
    key: 'vendor',
    header: 'Vendor Name',
    render: (history) => String(history.vendor || 'N/A')
  },
  {
    key: 'status',
    header: 'Status',
    render: (history) => (
      <span className={`status-badge status-${(history.status || 'pending').toLowerCase()}`}>
        {String(history.status || 'Pending')}
      </span>
    )
  },
  {
    key: 'product',
    header: 'Product',
    render: (history) => {
      // Safely handle product object
      const productName = history.product && typeof history.product === 'object' 
        ? history.product.name 
        : 'N/A';
      
      return (
        <div className="product-info-cell">
          <div>{String(productName)}</div>
        </div>
      );
    }
  },
  {
    key: 'stock_changes',
    header: 'Stock Changes',
    render: (history) => {
      // Safely handle stock object
      const oldStock = history.stock && typeof history.stock === 'object' 
        ? history.stock.old_stock || 0 
        : 0;
      const addStock = history.stock && typeof history.stock === 'object' 
        ? history.stock.add_stock || 0 
        : 0;
      const newStock = history.stock && typeof history.stock === 'object' 
        ? history.stock.new_stock || 0 
        : 0;
      
      return (
        <div className="stock-changes-cell">
          <span className="old-stock">{String(oldStock)}</span>
          <span className="add-stock">+{String(addStock)}</span>
          <span className="new-stock">{String(newStock)}</span>
        </div>
      );
    }
  },
  {
    key: 'price',
    header: 'Price',
    render: (history) => {
      // Safely handle price object
      const newPrice = history.price && typeof history.price === 'object' 
        ? history.price.new_price || 0 
        : history.price || 0;
      
      return (
        <div className="price-cell">
          ₦{parseFloat(newPrice).toLocaleString()}
        </div>
      );
    }
  },
  {
    key: 'date',
    header: 'Date',
    render: (history) => {
      try {
        const date = history.created_at || history.date;
        return date ? new Date(date).toLocaleDateString() : 'Invalid Date';
      } catch (e) {
        return 'Invalid Date';
      }
    }
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
  const [showUpdateStockStatusModal, setShowUpdateStockStatusModal] = useState(false);

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
        [`sephcocco_${activeOutlet}_stock_management`]: stockData
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
    <div className="order-page" style={{height: '100vh'}}>
      <SearchBar
        onApply={handleApplyFilters}
        onManualSearch={handleManualSearch}
        filterOptions={activeTab === 'products' 
          ? ["All Status", "Public", "Private"] 
          : ["All Status",  "Pending","Approved", "Declined"]
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
              actions={[]} // Empty actions array since we handle actions in columns
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

      {/* Add Stock Modal */}
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

      {/* Update Stock Modal */}
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

      {/* Stock Summary Modal - Updated */}
   {showStockDetailModal && selectedStockHistory && (
  <StockSummary
    stockData={selectedStockHistory}
    onBack={() => {
      setShowStockDetailModal(false);
      setSelectedStockHistory(null);
    }}
    onEdit={() => handleUpdateStock(selectedStockHistory)}
    onDelete={() => setShowDeleteModal(true)}
    isUpdating={updatingStock}
 
    onUpdateStatus={() => setShowUpdateStockStatusModal(true)}
  />
)}
<UpdateStockStatusModal
  isOpen={showUpdateStockStatusModal}
  onClose={() => setShowUpdateStockStatusModal(false)}
  selectedStockHistory={selectedStockHistory}
  product={selectedProduct} 
  formData={selectedStockHistory}
  refetchStock={refetchStock}
/>
      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <ConfirmActionModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteStock}
          type="delete"
          title={deletingStock? 'Deleting...' : "Confirm Delete"}
          message={
            <p>
              Are you sure you want to delete stock record{" "}
              <strong>{selectedStockHistory?.invoice_number}</strong>?
              This action cannot be undone.
            </p>
          }
        
        />
      )}
    </div>
  );
};

export default StockManagement;