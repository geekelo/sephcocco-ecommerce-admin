import React, { useState, useMemo } from "react";
import SearchBar from "../components/SearchBar";
import FlexibleTable from "../components/FlexibleTable";
import Pagination from "../components/Pagination";

import "../styles/ProductCategories.css"
import "../styles/OrderPage.css";
import CategoryModal from "../components/CategoryModal";
import ConfirmActionModal from "../components/ConfirmActionModal";
import { Plus } from 'lucide-react';

import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { useAddProductCategores } from "../hooks/useAddProductCategories";
import { useUpdateProductCategores } from "../hooks/useUpdateProductCategories";
import { useDeleteProductCategores } from "../hooks/useDeleteProductCategories";
import { useViewProductCategories } from "../hooks/useGetProductCategories";

import {  getCategoryColumns } from "../columns/categoryColumns.jsx";
import { categoryActions } from "../columns/categoryActions.jsx";

import { ErrorState } from "../components/ErrorState.jsx";
import { EmptyState } from "../components/EmptyState.jsx";
import { getActiveOutlet } from "../utils/getActiveOutlets.js";

const ProductCategoriesPage = () => {
  // State for categories data and pagination
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

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Categories per page

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
  } = useViewProductCategories(active_outlet, filters,  currentPage,
    itemsPerPage);

  // Mutations
  const addCategoryMutation = useAddProductCategores();
  const updateCategoryMutation = useUpdateProductCategores();
  const deleteCategoryMutation = useDeleteProductCategores();

  // Handle filter application - Updated to accept sort parameters
  const handleApplyFilters = ({ 
    status, 
    search_terms, 
    start_date, 
    end_date, 
    sort_by_likes, // Accept but ignore sort parameters for categories
    sort_by_stock  // Accept but ignore sort parameters for categories
  }) => {
    // Only use the parameters that categories need
    setFilters({ status, search_terms, start_date, end_date });
    setCurrentPage(1); // Reset to first page when filtering
    
    // Update search bar state to maintain UI state
    setSearchBarState({
      search: search_terms || "",
      status: status ? status.charAt(0).toUpperCase() + status.slice(1) : "All Status",
      startDate: start_date || "",
      endDate: end_date || ""
    });
  };
const columns = getCategoryColumns(
  (category) => {
    setSelectedCategory(category);
    setIsEditCategoryModal(true);
  },
  (category) => {
    setSelectedCategory(category);
    setIsDeleteCategoryModal(true);
  }
);
  // Manual search handler - Updated to include sort parameters
  const handleManualSearch = (searchTerm) => {
    handleApplyFilters({
      status: "", 
      search_terms: searchTerm,
      start_date: "", 
      end_date: "",
      sort_by_likes: "", // Clear sort filters
      sort_by_stock: ""  // Clear sort filters
    });
  };

  // Sort and filter categories
  const { paginatedCategories, totalCount, totalPages } = useMemo(() => {
    // First, filter categories based on search terms
    let filtered = categories.filter(category => {
      const name = category.name || "";
      const description = category.description || "";
      const searchLower = filters.search_terms.toLowerCase();
      
      if (!searchLower) return true;
      
      return name.toLowerCase().includes(searchLower) ||
             description.toLowerCase().includes(searchLower);
    });

    // Sort categories by most recent first (descending order)
    filtered = filtered.sort((a, b) => {
      const dateA = new Date(a.created_at || a.updated_at).getTime();
      const dateB = new Date(b.created_at || b.updated_at).getTime();
      return dateB - dateA; // Most recent first
    });

    const totalCount = filtered.length;
    const totalPages = Math.ceil(totalCount / itemsPerPage);

    // Apply pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedCategories = filtered.slice(startIndex, endIndex);

    return { paginatedCategories, totalCount, totalPages };
  }, [categories, filters.search_terms, currentPage, itemsPerPage]);

  // Handle page changes
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Optional: scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

      // If we're on a page with no items after deletion, go to previous page
      if (paginatedCategories.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
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

      {/* Enhanced SearchBar with manual search support */}
      <SearchBar
        onApply={handleApplyFilters}
        onManualSearch={handleManualSearch}
        filterOptions={[]} // No status filter for categories
        categoryOptions={[]} // No category filter for categories page
        sortOptions={[]} // No sort options for categories
        placeholder="Search categories..."
        filterLabel="Filter by"
        showDate={true} // Categories don't need date filtering
        initialValues={searchBarState}
      />

      <div className="order-table-container-cat">
        {/* Show total count */}
        <div className="page-title-section" style={{ marginBottom: '16px' }}>
          <h2>
            {totalCount} Categor{totalCount !== 1 ? 'ies' : 'y'} found
          </h2>
          {filters.search_terms && (
            <p className="search-results-info">
              Showing results for "{filters.search_terms}"
            </p>
          )}
        </div>

        {fetchError ? (
          <ErrorState  
            title="Failed to load categories" 
            message=" There was an error loading the categories. Please try again." 
            refetchCategories={refetchCategories} 
            isFetchingCategories={isFetchingCategories}
          />
        ) : (
          <FlexibleTable
            data={paginatedCategories}
            columns={columns}
            actions={categoryActions}
            keyField="id"
            onRowClick={handleRowClick}
            onActionClick={handleActionClick}
            className="categories-table"
            isLoading={isFetchingCategories}
            emptyState={
              <EmptyState 
                title={filters.search_terms ? `No categories found matching "${filters.search_terms}"` : "No categories found"} 
                btnText={filters.search_terms ? "Clear Search" : "Add Your First Category"} 
                handleAddCategory={filters.search_terms ? 
                  () => handleApplyFilters({ status: '', search_terms: '', start_date: '', end_date: '', sort_by_likes: '', sort_by_stock: '' }) : 
                  handleAddCategory
                } 
                isLoading={isLoading} 
                searchTerm={filters.search_terms}
              />
            }
          />
        )}

        {/* Pagination - Show when there are categories and pagination is needed */}
        {!isFetchingCategories && paginatedCategories.length > 0 && totalPages > 1 && (
          <Pagination
            name="Categories"
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={totalCount}
            itemsPerPage={itemsPerPage}
            showInfo={true}
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