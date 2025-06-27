import React, { useState } from "react";
import SearchBar from "../components/SearchBar";
import FlexibleTable from "../components/FlexibleTable";

import "../styles/ProductCategories.css"
import "../styles/OrderPage.css";
import CategoryModal from "../components/CategoryModal";
import ConfirmActionModal from "../components/ConfirmActionModal";
import { Plus, AlertTriangle, Eye, Edit3, Trash2, Calendar } from 'lucide-react';

import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { useAddProductCategores } from "../hooks/useAddProductCategories";
import { useUpdateProductCategores } from "../hooks/useUpdateProductCategories";
import { useDeleteProductCategores } from "../hooks/useDeleteProductCategories";
import { useViewProductCategories } from "../hooks/useGetProductCategories";
import Cookies from 'js-cookie'; 
import { categoryColumns } from "../columns/categoryColumns.jsx";
import { categoryActions } from "../columns/categoryActions.jsx";

import { ErrorState } from "../components/ErrorState.jsx";
import { EmptyState } from "../components/EmptyState.jsx";
import { getActiveOutlet } from "../utils/getActiveOutlets.js";

const ProductCategoriesPage = () => {
 


  // State for categories data
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddCategoryModal, setIsAddCategoryModal] = useState(false);
  const [isEditCategoryModal, setIsEditCategoryModal] = useState(false);
  const [isDeleteCategoryModal, setIsDeleteCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);




  // Get active outlet ID
  const active_outlet = getActiveOutlet();

  // Query client for invalidating queries
  const queryClient = useQueryClient();

  // Query for fetching categories - only run if active_outlet exists
  const { 
    data: categories = [], 
    isLoading: isFetchingCategories, 
    error: fetchError,
    refetch: refetchCategories 
  } = useViewProductCategories(active_outlet);

  // Mutations
  const addCategoryMutation = useAddProductCategores();
  const updateCategoryMutation = useUpdateProductCategores();
  const deleteCategoryMutation = useDeleteProductCategores();

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilter = () => {
    console.log("Filter functionality to be implemented");
  };

  // Filter categories based on search term
  const filteredCategories = categories.filter(category => {
    const name = category.name || "";
    const description = category.description || "";
    const searchLower = searchTerm.toLowerCase();
    
    return name.toLowerCase().includes(searchLower) ||
           description.toLowerCase().includes(searchLower);
  });

  // Invalidate and refetch categories
  const invalidateCategories = () => {
    if (active_outlet) {
      queryClient.invalidateQueries(['productCategories', active_outlet]);
    }
  };

  // Handler for adding new category
  const handleAddCategory = () => {
    if (!active_outlet) {
      toast.error("Please select an outlet first.");
      return;
    }
    setSelectedCategory(null);
    setIsAddCategoryModal(true);
  };

  // Handler for row clicks (view category details)
  const handleRowClick = (category) => {
    setSelectedCategory(category);
    setIsEditCategoryModal(true);
  };

  // Handler for category actions from dropdown
  const handleActionClick = (action, category) => {
    if (!active_outlet) {
      toast.error("Please select an outlet first.");
      return;
    }

    setSelectedCategory(category);
    
    switch (action) {
      case 'view':
      case 'edit':
        setIsEditCategoryModal(true);
        break;
      case 'delete':
        setIsDeleteCategoryModal(true);
        break;
      default:
        break;
    }
  };

  // Confirm delete category
  const handleConfirmDeleteCategory = async () => {
    if (!active_outlet) {
      toast.error("Please select an outlet first.");
      return;
    }

    try {
      await deleteCategoryMutation.mutateAsync({ 
        active_outlet, 
        productId: selectedCategory.id 
      });
      
      // Invalidate queries to refetch fresh data
      invalidateCategories();
      
      toast.success("Category deleted successfully!");
      setIsDeleteCategoryModal(false);
      setSelectedCategory(null);
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category. Please try again.");
    }
  };

  // Handle category form submission (for both add and edit)
  const handleCategorySubmit = async (categoryData) => {
    if (!active_outlet) {
      toast.error("Please select an outlet first.");
      return;
    }


    try {
      if (selectedCategory) {
        const payload = {
          product_category: {
            name: categoryData.name,
            description: categoryData.description
          }
        };
        
        const response = await updateCategoryMutation.mutateAsync({
          active_outlet,
          productId: selectedCategory.id,
          payload
        });
        console.log(selectedCategory.id, 'Update category payload:', payload);
        
        console.log(response);
        
        // Invalidate queries to refetch fresh data
        invalidateCategories();
        
        toast.success("Category updated successfully!");
        setIsEditCategoryModal(false);
      } else {
        const payload = {
          product_category: {
            name: categoryData.name,
            description: categoryData.description
          }
        };
        
        console.log('Add category payload:', payload);
        
        const response = await addCategoryMutation.mutateAsync({
          active_outlet,
          payload
        });
   
        
        // Invalidate queries to refetch fresh data
        invalidateCategories();
        
        toast.success("Category added successfully!");
        setIsAddCategoryModal(false);
      }
      
      setSelectedCategory(null);
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error(`Failed to ${selectedCategory ? 'update' : 'add'} category. Please try again.`);
    }
  };

  // Loading states
  const isLoading = addCategoryMutation.isPending || 
                   updateCategoryMutation.isPending || 
                   deleteCategoryMutation.isPending;

 



  return (
    <div className="order-page">
      <div className="page-header">
        <h1>Product Categories</h1>
        <div className="header-actions">
          <button 
            className="add-category-btn"
            onClick={handleAddCategory}
            disabled={isLoading}
          >
            <Plus size={16} />
            Add Category
          </button>
        </div>
      </div>

      <SearchBar
        onSearch={handleSearchChange}
        onFilter={handleFilter}
        searchTerm={searchTerm}
        placeholder="Search categories..."
      />

      <div className="order-table-container">
        {fetchError ? (
          <ErrorState  title="Failed to load categories" message=" There was an error loading the categories. Please try again." refetchCategories={refetchCategories} isFetchingCategories={isFetchingCategories}/>
        ) : (
          <FlexibleTable
            data={filteredCategories}
            columns={categoryColumns}
            actions={categoryActions}
            keyField="id"
            onRowClick={handleRowClick}
            onActionClick={handleActionClick}
            className="categories-table"
            isLoading={isFetchingCategories}
            emptyState={<EmptyState title="No categories found" btnText=" Add Your First Category" handleAddCategory={handleAddCategory} isLoading={isLoading} searchTerm={searchTerm}/>}
          />
        )}
      </div>

      {/* Add Category Modal */}
      {isAddCategoryModal && (
        <CategoryModal
          isOpen={isAddCategoryModal}
          onClose={() => {
            setIsAddCategoryModal(false);
            setSelectedCategory(null);
          }}
          onSubmit={handleCategorySubmit}
          category={null}
          title="Add New Category"
          isLoading={addCategoryMutation.isPending}
        />
      )}

      {/* Edit Category Modal */}
      {isEditCategoryModal && (
        <CategoryModal
          isOpen={isEditCategoryModal}
          onClose={() => {
            setIsEditCategoryModal(false);
            setSelectedCategory(null);
          }}
          onSubmit={handleCategorySubmit}
          category={selectedCategory}
          title="Edit Category"
          isLoading={updateCategoryMutation.isPending}
        />
      )}

      {/* Delete Category Confirmation Modal */}
      {isDeleteCategoryModal && (
        <ConfirmActionModal
          isOpen={isDeleteCategoryModal}
          onClose={() => {
            setIsDeleteCategoryModal(false);
            setSelectedCategory(null);
          }}
          onConfirm={handleConfirmDeleteCategory}
          type="delete"
          title="Confirm Delete Category"
          isLoading={deleteCategoryMutation.isPending}
          message={
            <>
              Are you sure you want to delete the category{" "}
              <strong>{selectedCategory?.name}</strong>?
              {selectedCategory?.productCount > 0 && (
                <div style={{ marginTop: '8px', color: '#d32f2f', fontSize: '14px' }}>
                  Warning: This category contains {selectedCategory.productCount} products. 
                  Deleting it may affect those products.
                </div>
              )}
            </>
          }
        />
      )}
    </div>
  );
};

export default ProductCategoriesPage;