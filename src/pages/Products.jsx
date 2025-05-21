
import React, { useState, useRef } from 'react';
import { Search, SlidersHorizontal, Plus } from 'lucide-react';
import '../styles/ProductsPage.css';
import { mockCategories, mockProduct, sampleProducts } from '../constants/data';
import ProductCard from '../components/ProductCard';
import AddProductModal from '../components/AddProductModal';
import ProductDetails from '../components/ProductDetails';

import DeleteProductModal from '../components/DeleteProductModal';

import EditProductModal from '../components/EditModal';


const ProductsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState(sampleProducts);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const mainContentRef = useRef(null);
const [isEditModal, setIsEditModal] = useState(false)
const [isDeleteModal, setIsDeleteModal] = useState(false)
const [isViewModal, setIsViewModal] = useState(false)
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleAddProduct = () => {
    setIsAddModalOpen(true);
    
    // Scroll to top of main content when opening modal
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = 0;
    }
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
  };

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  // Filter products based on search term
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
const handleView = () => {
  setIsViewModal(true)
}

const handleEdit = () => {
  setIsEditModal(true)
}
const handleDelete = () => {
  setIsDeleteModal(true)
}
const handleConfirm = () => {
 console.log('click me');
 
}


  return (
<div className="products-page" ref={mainContentRef}>
  {isAddModalOpen && (
    <AddProductModal 
      isOpen={isAddModalOpen} 
      onClose={handleCloseModal} 
    />
  )}

  {isViewModal && (
    <ProductDetails 
      product={mockProduct} 
      onEdit={handleEdit} 
      onDelete={handleDelete} 
      onClose={() => setIsViewModal(false)}
    />
  )}
{isEditModal && (
    <EditProductModal
      isOpen={isEditModal} 
      onClose={() => setIsEditModal(false)} 
      product={mockProduct} 
      categories={mockCategories} 
    />)}
  {!isAddModalOpen && !isViewModal && !isEditModal && (
    <>
      <div className="search-filter-section">
        <div className="filter-container">
          <div className="search-box">
            <Search size={16} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search for anything" 
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>

          <button 
            className="filter-button"
            onClick={toggleFilter}
          >
            <SlidersHorizontal size={16} />
            <span>Filter by</span>
          </button>
        </div>

        <button 
          className="add-product-button" 
          onClick={handleAddProduct}
        >
          <Plus size={16} color="white" />
          <span>Add New Product</span>
        </button>
      </div>

      <div className="products-container">
        <div className="page-title-section">
          <h2>100 Products in stock</h2>
        </div>

        <div className="products-grid">
          {filteredProducts.map(product => (
            <div className="product-grid-item" key={product.id}>
              <ProductCard 
                product={product} 
                onDelete={handleDelete} 
                onEdit={handleEdit} 
                onView={handleView} 
              />
            </div>
          ))}
        </div>
      </div>
    </>
  )}


  {isDeleteModal && (
    <DeleteProductModal 
      onConfirm={handleConfirm} 
      isOpen={isDeleteModal} 
      onClose={() => setIsDeleteModal(false)} 
      product={mockProduct} 
    />
  )}
</div>


  );
};

export default ProductsPage;