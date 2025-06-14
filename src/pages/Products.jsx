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

import { toast } from "react-toastify";
import { mockCategories } from '../constants/data';
import { getActiveOutlet } from '../../../sephcocco-lounge-user/src/utils/getActiveOutlets';
import { useViewAllProduct } from '../hooks/useGetAllProduct';
import { useDeleteProduct } from '../hooks/useDeleteProduct';
import { useViewProductId } from '../hooks/useGetProductById';
import { ErrorState } from '../components/ErrorState';
import { EmptyState } from '../components/EmptyState';

const ProductsPage = () => {
  const activeOutlet = getActiveOutlet();
  const mainContentRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModal, setIsEditModal] = useState(false);
  const [isViewModal, setIsViewModal] = useState(false);
  const [isDeleteModal, setIsDeleteModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');

  console.log('product id', selectedProductId);

  const { data: products = [], isLoading, refetch } = useViewAllProduct(activeOutlet);
  console.log('products', products);
  
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
  console.log('selectedProduct', selectedProduct);

  // Helper function to validate product ID
  const isValidProductId = (productId) => {
    return productId && productId.trim() !== '' && productId !== null && productId !== undefined;
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

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

    deleteMutation.mutate(activeOutlet, selectedProductId, {
      onSuccess: () => {
        toast.success('Product deleted successfully');
        setIsDeleteModal(false);
        setSelectedProductId('');
        refetch();
      },
      onError: (error) => {
        console.error('Delete error:', error);
        toast.error('Failed to delete product');
      },
    });
  };

  // Reset selected product when modals are closed
  const handleCloseModals = () => {
    setSelectedProductId('');
  };

  // Sort products by created_at in descending order (newest first)
  const sortedProducts = [...products].sort((a, b) => {
    const dateA = new Date(a.created_at);
    const dateB = new Date(b.created_at);
    return dateB - dateA; // Descending order (newest first)
  });

  const filteredProducts = sortedProducts.filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          categories={mockCategories}
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
              <h2>{sortedProducts.length} Products in stock</h2>
            </div>
            
            {!isLoading && !sortedProducts && (
              <ErrorState message="Failed to load products. Please try again later." />
            )}

            {!isLoading && sortedProducts && filteredProducts.length === 0 && (
              <EmptyState 
                message="No matching products found." 
                btnText="Add New Product" 
                handleAddCategory={handleAddProduct}
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

              {!isLoading && filteredProducts.length > 0 && filteredProducts.map(product => (
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
          <div className="form-actions">
            <button 
              type="button" 
              className="confirm-button" 
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isLoading}
            >
              {deleteMutation.isLoading ? 'Deleting...' : 'Delete Product'}
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