import React, { useState, useRef } from 'react';
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
import Pagination from '../components/Pagination'; // Import the new pagination component

import { toast } from "react-toastify";
import { mockCategories } from "../constants/data";
import { getActiveOutlet } from "../utils/getActiveOutlets";
import { useViewAllProduct } from "../hooks/useGetAllProduct";
import { mockCategories } from '../constants/data';


import { useDeleteProduct } from '../hooks/useDeleteProduct';
import { useViewProductId } from '../hooks/useGetProductById';
import { ErrorState } from '../components/ErrorState';
import { EmptyState } from '../components/EmptyState';
import { getActiveOutlet } from '../utils/getActiveOutlets';

const ProductsPage = () => {
  const activeOutlet = getActiveOutlet();
  const mainContentRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20); // You can make this configurable if needed
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModal, setIsEditModal] = useState(false);
  const [isViewModal, setIsViewModal] = useState(false);
  const [isDeleteModal, setIsDeleteModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');

  // Pass currentPage and itemsPerPage to the API hook
  const { data: responseData = { products: [], meta: {} }, isLoading, error, refetch } = useViewAllProduct(
    activeOutlet, 
    currentPage, 
    itemsPerPage
  );
  
  // Extract products array and pagination info from the response
  const products = Array.isArray(responseData.products) ? responseData.products : [];
  const { 
    total_count = 0, 
    current_page = 1, 
    per_page = itemsPerPage, 
    total_pages = 1 
  } = responseData.meta || {};
  
  console.log('API Response:', responseData);
  console.log('Products:', products);
  console.log('Pagination Info:', { total_count, current_page, per_page, total_pages });
  
  const deleteMutation = useDeleteProduct();
  
  // Only fetch product by ID when:
  // 1. Products are already loaded (!isLoading)
  // 2. We have a valid selected product ID
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

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    // Reset to first page when searching
    setCurrentPage(1);
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

  // Fix: Pass parameters as an object, and use the second parameter for options
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

  // Filter products based on search term (client-side filtering)
  // Note: For better performance with large datasets, consider moving search to server-side
  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Adjust pagination info for filtered results
  const isSearching = searchTerm.trim() !== '';
  const displayProducts = isSearching ? filteredProducts : products;
  const displayTotalCount = isSearching ? filteredProducts.length : total_count;
  const displayTotalPages = isSearching ? 1 : total_pages; // For client-side search, show all results on one page

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
            <SearchBar onSearch={handleSearchChange} searchTerm={searchTerm} />
            <button className="add-product-button" onClick={handleAddProduct}>
              <Plus size={16} color="white" />
              <span>Add New Product</span>
            </button>
          </div>

          <div className="products-container">
            <div className="page-title-section">
              <h2>
                {displayTotalCount} Product{displayTotalCount !== 1 ? 's' : ''} 
                {isSearching ? ' found' : ' in stock'}
              </h2>
              {isSearching && searchTerm && (
                <p className="search-results-info">
                  Showing results for "{searchTerm}"
                </p>
              )}
            </div>
            
            {!isLoading && displayProducts.length === 0 && !isSearching && (
              <EmptyState 
                message="No products found." 
                btnText="Add New Product" 
                handleAddCategory={handleAddProduct}
              />
            )}

            {!isLoading && displayProducts.length === 0 && isSearching && (
              <EmptyState 
                message={`No products found matching "${searchTerm}"`} 
                btnText="Clear Search" 
                handleAddCategory={() => setSearchTerm('')}
              />
            )}
            
            <div className="products-grid">
              {isLoading &&
                Array.from({ length: 6 }).map((_, idx) => (
                  <div className="product-grid-item" key={`skeleton-${idx}`}>
                    <ProductSkeleton />
                  </div>
                ))
              }

              {!isLoading && displayProducts.length > 0 && displayProducts.map(product => (
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

            {/* Pagination Component */}
            {!isLoading && !isSearching && displayProducts.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={displayTotalPages}
                onPageChange={handlePageChange}
                totalItems={displayTotalCount}
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