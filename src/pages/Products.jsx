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
  const [selectedProductId, setSelectedProductId] = useState(null);

  const { data: products = [], isLoading, refetch } = useViewAllProduct(activeOutlet?.id);
  const deleteMutation = useDeleteProduct();
  const { data: selectedProduct } = useViewProductId(selectedProductId, { enabled: !!selectedProductId });

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const handleAddProduct = () => {
    setIsAddModalOpen(true);
    mainContentRef.current?.scrollTo({ top: 0 });
  };

  const handleEdit = (productId) => {
    setSelectedProductId(productId);
    setIsEditModal(true);
  };

  const handleView = (productId) => {
    setSelectedProductId(productId);
    setIsViewModal(true);
  };

  const handleDelete = (productId) => {
    setSelectedProductId(productId);
    setIsDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    deleteMutation.mutate(activeOutlet, selectedProductId, {
      onSuccess: () => {
        toast.success('Product deleted successfully');
        setIsDeleteModal(false);
        setSelectedProductId(null);
        refetch();
      },
      onError: () => toast.error('Failed to delete product'),
    });
  };

  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="products-page" ref={mainContentRef}>
      {isAddModalOpen && (
        <AddProductModal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
          
          }}
        />
      )}

      {isViewModal && selectedProduct && (
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
          onClose={() => setIsViewModal(false)}
        />
      )}

      {isEditModal && selectedProduct && (
        <EditProductModal
          isOpen={isEditModal}
          onClose={() => {
            setIsEditModal(false);
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
              <h2>{products.length} Products in stock</h2>
            </div>
              {!isLoading && !products && (
    <ErrorState message="Failed to load products. Please try again later." />
  )}

  {!isLoading && products && filteredProducts.length === 0 && (
    <EmptyState message="No matching products found." btnText="Add New Product" handleAddCategory={handleAddProduct}/>
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

      {isDeleteModal && selectedProduct && (
        <ConfirmActionModal
          isOpen={isDeleteModal}
          onClose={() => setIsDeleteModal(false)}
          title="Confirm Delete"
          message={
            <>Are you sure you want to delete <strong>{selectedProduct.name}</strong>?</>
          }
        >
          <div className="form-actions">
            <button type="button" className="confirm-button" onClick={handleConfirmDelete}>
              Delete Product
            </button>
            <button type="button" className="cancel-button" onClick={() => setIsDeleteModal(false)}>
              Cancel
            </button>
          </div>
        </ConfirmActionModal>
      )}
    </div>
  );
};

export default ProductsPage;
