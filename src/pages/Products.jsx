import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, Plus } from 'lucide-react';
import '../styles/ProductsPage.css';
import '../styles/ProductCategories.css'
import ProductCard from '../components/ProductCard';
import ProductSkeleton from '../components/ProductSkeleton';
import AddProductModal from '../components/AddProductModal';
import ProductDetails from '../components/ProductDetails';
import EditProductModal from '../components/EditModal';
import SearchBar from '../components/SearchBar';
import ConfirmActionModal from '../components/ConfirmActionModal';
import Pagination from '../components/Pagination';

import { getActiveOutlet } from "../utils/getActiveOutlets";
import { useViewAllProduct } from "../hooks/useGetAllProduct";
import { useViewProductCategories } from "../hooks/useGetProductCategories";
import { mockCategories } from '../constants/data';
import { useDeleteProduct } from '../hooks/useDeleteProduct';
import { useViewProductId } from '../hooks/useGetProductById';
import { ErrorState } from '../components/ErrorState';
import { EmptyState } from '../components/EmptyState';
import { toast } from 'react-toastify';
import { getActiveUser } from '../utils/getActiveUser';
import { useActiveDepartment } from '../hooks/useGetActiveDepartment';


const ProductsPage = () => {
  const activeOutlet = getActiveOutlet();
  const mainContentRef = useRef(null);

  // State for filters and pagination
  const [searchBarState, setSearchBarState] = useState({
    search: "",
    status: "All Status", 
    department_id: "",
    category: "", // This will store category name for UI display
    categoryId: "", // Add categoryId for internal tracking
    sort_by_likes: '',
    sort_by_stock: '',
    startDate: "",
    endDate: ""
  });

  const [filters, setFilters] = useState({
    search_terms: "",
    status: "",
    department_id: "",
    category_id: "", // Change from category to category_id
    sort_by_likes: "",
    sort_by_stock: "",
    start_date: "",
    end_date: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModal, setIsEditModal] = useState(false);
  const [isViewModal, setIsViewModal] = useState(false);
  const [isDeleteModal, setIsDeleteModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');

  // Fetch categories for the filter dropdown
  const { data: categories = [] } = useViewProductCategories(activeOutlet);
  const {data: department = []} = useActiveDepartment(activeOutlet)
  // Create category options with both name and id for SearchBar
  const categoryOptions = useMemo(() => {
    return categories
      .filter(category => category.name && category.id)
      .map(category => ({
        label: category.name,    // Display name in dropdown
        value: category.id,      // ID to send to backend  
        name: category.name      // Name for internal reference
      }));
  }, [categories]);

  // Helper function to get category name by ID
  const getCategoryNameById = (categoryId) => {
    if (!categoryId) return "";
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : "";
  };

  // Helper function to get category ID by name
  const getCategoryIdByName = (categoryName) => {
    if (!categoryName) return "";
    const category = categories.find(cat => cat.name === categoryName);
    return category ? category.id : "";
  };
const user_id = getActiveUser()


  // API call with filters (now using category_id)
  const { data: responseData = { products: [], meta: {} }, isLoading, error, refetch } = useViewAllProduct(
    activeOutlet, 
    user_id.id,
    filters, // Pass filters with category_id to the API call
    currentPage, 
    itemsPerPage
  );
  
  // Sort products by most recent first (descending order)
  const products = useMemo(() => {
    const productsData = Array.isArray(responseData.products) ? responseData.products : [];
    return productsData
    // return productsData.sort((a, b) => {
    //   const dateA = new Date(a.created_at || a.updated_at).getTime();
    //   const dateB = new Date(b.created_at || b.updated_at).getTime();
    //   return dateB - dateA; // Most recent first
    // });
  }, [responseData.products]);

  const { 
    total_count = 0, 
    current_page = 1, 
    per_page = itemsPerPage, 
    total_pages = 1 
  } = responseData.meta || {};
  
  const deleteMutation = useDeleteProduct();
  
  const { data: selectedProduct } = useViewProductId(
    activeOutlet,
    selectedProductId, 
    { 
      enabled: !isLoading && !!selectedProductId && selectedProductId.trim() !== ''
    }
  );

  // Helper function to validate product ID
  const isValidProductId = (productId) => {
    return productId && productId.trim() !== '' && productId !== null && productId !== undefined;
  };


const handleApplyFilters = ({ status,department_id, category, categoryId, sort_by_likes, sort_by_stock,search_terms, start_date, end_date }) => {
  // Use categoryId directly from SearchBar, fallback to converting category name if needed
  const finalCategoryId = categoryId || (category ? getCategoryIdByName(category) : "");
  
  // Convert "Highest Likes" string to boolean, everything else to empty string
  const sortByLikesBoolean = sort_by_likes === "Highest Likes" ? true : "";
    const sortByStocksBoolean = sort_by_stock === "Highest Stocks" ? true : "";

  
  setFilters({ 
    status, 
    department_id,
    category_id: finalCategoryId, // Send category_id to backend
    search_terms, 
    sort_by_likes: sortByLikesBoolean, // Now sends boolean true or empty string
    sort_by_stock: sortByStocksBoolean,
    start_date, 
    end_date 
  });
  setCurrentPage(1); // Reset to first page when filtering
  
  // Update search bar state to maintain UI state
  setSearchBarState({
    search: search_terms || "",
    status: status ? (status.charAt(0).toUpperCase() + status.slice(1)) : "All Status",
    department_id: department_id ? (department_id.charAt(0).toUpperCase() + department_id.slice(1)) : "All Department",
    category: category || "", // Keep category name for UI display
    categoryId: finalCategoryId, // Track category ID internally
    sort_by_likes: sort_by_likes, // Keep original string for UI display
    sort_by_stock: sort_by_stock,
    startDate: start_date || "",
    endDate: end_date || ""
  });
};

  // Manual search handler - triggered when user types and presses Enter
  const handleManualSearch = (searchTerm) => {
    // Clear all filters and only keep the search term
    handleApplyFilters({
      status: "", // Clear status filter
      category: "", // Clear category filter
      department_id: "",
      categoryId: "", // Clear category ID filter
      sort_by_likes: "",
      sort_by_stock: '',
      search_terms: searchTerm,
      start_date: "", // Clear start date filter
      end_date: "" // Clear end date filter
    });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top when changing pages
    mainContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddProduct = () => {
    setIsAddModalOpen(true);
    mainContentRef.current?.scrollTo({ top: 0 });
  };

  const handleEdit = (productId) => {
    console.log('Edit requested for product ID:', productId);
    
    if (!isValidProductId(productId)) {
      console.error('Invalid product ID for edit:', productId);
      toast.error('Invalid product selected for editing');
      return;
    }

    setSelectedProductId(productId);
    setIsEditModal(true);
  };

  const handleView = (productId) => {
    console.log('View requested for product ID:', productId);
    
    if (!isValidProductId(productId)) {
      console.error('Invalid product ID for view:', productId);
      toast.error('Invalid product selected for viewing');
      return;
    }

    setSelectedProductId(productId);
    setIsViewModal(true);
  };

  const handleDelete = (productId) => {
    console.log('Delete requested for product ID:', productId);
    
    if (!isValidProductId(productId)) {
      console.error('Invalid product ID for delete:', productId);
      toast.error('Invalid product selected for deletion');
      return;
    }

    setSelectedProductId(productId);
    setIsDeleteModal(true);
  };

  const handleConfirmDelete = () => {
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
          
          // If we're on a page with no items after deletion, go to previous page
          if (products.length === 1 && currentPage > 1) {
            setCurrentPage(currentPage - 1);
          } else {
            refetch();
          }
        },
        onError: (error) => {
          console.error('Delete error:', error);
          toast.error('Failed to delete product');
        },
      }
    );
  };

  // Reset selected product when modals are closed
  const handleCloseModals = () => {
    setSelectedProductId('');
  };

  if (error) {
    return <ErrorState message="Failed to load products. Please try again later." />;
  }

  return (
    <div className="products-page" ref={mainContentRef}>
      {isAddModalOpen && (
        <AddProductModal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            refetch();
          }}
        />
      )}

      {isViewModal && selectedProduct && isValidProductId(selectedProductId) && (
        <ProductDetails
          product={selectedProduct}
          onEdit={() => {
            setIsViewModal(false);
            handleEdit(selectedProduct.id);
          }}
          onDelete={() => {
            setIsViewModal(false);
            handleDelete(selectedProduct.id);
          }}
          onClose={() => {
            setIsViewModal(false);
            handleCloseModals();
          }}
        />
      )}

      {isEditModal && selectedProduct && isValidProductId(selectedProductId) && (
        <EditProductModal
          isOpen={isEditModal}
          onClose={() => {
            setIsEditModal(false);
            handleCloseModals();
            refetch();
          }}
          product={selectedProduct}
        />
      )}

      {!isAddModalOpen && !isViewModal && !isEditModal && (
        <>
          <div className="search-filter-section">
            <SearchBar
              filterOptions={["All Status", "Public", "Private"]}
                sortOptions={["Highest Likes", "Highest Stocks"]}
              categoryOptions={categoryOptions} // Contains {label, value, name} objects
              onApply={handleApplyFilters} // Now receives both category and categoryId
              onManualSearch={handleManualSearch} 
                extraFilterOptions={department?.map(v => ({ label: v.name, value: v.id })) || []}
  extraFilterLabel="Filter by Department"
  extraFilterKey="department_id"
  showExtraFilter = {true}
              placeholder="Search products..."
              filterLabel="Filter by"
              categoryLabel="Category"
              sortLabel="Sort by"
              initialValues={searchBarState}
            />
            <button className="add-product-button" onClick={handleAddProduct}>
              <Plus size={16} color="white" />
              <span>Add New Product</span>
            </button>
          </div>

          <div className="products-container">
            <div className="page-title-section">
              <h2>
                {total_count} Product{total_count !== 1 ? 's' : ''} in stock
              </h2>
              {filters.search_terms && (
                <p className="search-results-info">
                  Showing results for "{filters.search_terms}"
                </p>
              )}
              {searchBarState.category && (
                <p className="search-results-info">
                  Filtered by category: "{searchBarState.category}"
                </p>
              )}
            </div>
            
            {!isLoading && products.length === 0 && !filters.search_terms && (
              <EmptyState 
                message="No products found." 
                btnText="Add New Product" 
                handleAddCategory={handleAddProduct}
              />
            )}

            {!isLoading && products.length === 0 && filters.search_terms && (
              <EmptyState 
                message={`No products found matching "${filters.search_terms}"`} 
                btnText="Clear Search" 
                handleAddCategory={() => handleApplyFilters({ status: '', category: '', categoryId: '', search_terms: '', start_date: '', end_date: '' })}
              />
            )}
            
            <div className="products-grid">
              {isLoading &&
                Array.from({ length: itemsPerPage }).map((_, idx) => (
                  <div className="product-grid-item" key={`skeleton-${idx}`}>
                    <ProductSkeleton />
                  </div>
                ))
              }

              {!isLoading && products.length > 0 && products.map(product => (
                <div className="product-grid-item" key={product.id}>
                  <ProductCard
                    product={product}
                    onDelete={() => handleDelete(product.id)}
                    onEdit={() => handleEdit(product.id)}
                    onView={() => handleView(product.id)}
                  />
                </div>
              ))}
            </div>

            {/* Pagination Component - Show when there are products and pagination is needed */}
            {!isLoading && products.length > 0 && total_pages > 1 && (
              <Pagination
                name="Products"
                currentPage={current_page}
                totalPages={total_pages}
                onPageChange={handlePageChange}
                totalItems={total_count}
                itemsPerPage={itemsPerPage}
                showInfo={true}
              />
            )}
          </div>
        </>
      )}

      {isDeleteModal && selectedProduct && isValidProductId(selectedProductId) && (
        <ConfirmActionModal
          isOpen={isDeleteModal}
          onClose={() => {
            setIsDeleteModal(false);
            handleCloseModals();
          }}
          title="Confirm Delete"
          message={
            <>Are you sure you want to delete <strong>{selectedProduct.name}</strong>?</>
          }
        >
          <div className="form-actions-confirm">
            <button 
              type="button" 
              className="confirm-button" 
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Product'}
            </button>
            <button 
              type="button" 
              className="cancel-button" 
              onClick={() => {
                setIsDeleteModal(false);
                handleCloseModals();
              }}
            >
              Cancel
            </button>
          </div>
        </ConfirmActionModal>
      )}
    </div>
  );
};

export default ProductsPage;