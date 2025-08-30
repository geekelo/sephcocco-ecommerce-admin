'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { FaqAccordion } from '../components/FaqAccordion';
import { FaqModal } from '../components/FaqModal';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import { useGetFaq } from '../hooks/useGetFaq';
import { useAddFaq } from '../hooks/useAddFaq';
import { useUpdateFaq } from '../hooks/useUpdateFaq';
import { useDeleteFaq } from '../hooks/useDeleteFaq'; 
import { getActiveOutlet } from '../utils/getActiveOutlets';
import '../styles/AdminFaqPage.css';

// Simple skeleton loader component
const SkeletonFaqList = () => {
  return (
    <div className="faq-skeleton-list" style={{ padding: '1rem' }}>
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="faq-skeleton-item"
          style={{
            height: 80,
            marginBottom: 16,
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 37%, #f0f0f0 63%)',
            backgroundSize: '400% 100%',
            animation: 'shine 1.4s ease infinite',
            borderRadius: 8,
          }}
        />
      ))}

      <style>{`
        @keyframes shine {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </div>
  );
};

const AdminFaqPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [error, setError] = useState(null);

  // Search and pagination states
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
  const itemsPerPage = 10; // FAQs per page

  const activeOutlet = getActiveOutlet();

  // Fetch FAQs
  const {
    data: faqData,
    refetch,
    isLoading,
    isError: isFetchError,
    error: fetchError,
  } = useGetFaq(activeOutlet, filters,  currentPage,
    itemsPerPage);

  // Add FAQ mutation
  const {
    mutate: addFaq,
    isPending: isAdding,
    error: addError,
  } = useAddFaq();

  // Update FAQ mutation
  const {
    mutate: editFaq,
    isPending: isEditing,
    error: editError,
  } = useUpdateFaq();

  // Delete FAQ mutation
  const {
    mutate: deleteFaq,
    isPending: isDeleting,
    error: deleteError,
  } = useDeleteFaq();

  // Handle filter application - Updated to accept sort parameters
  const handleApplyFilters = ({ 
    status, 
    search_terms, 
    start_date, 
    end_date, 
    sort_by_likes, // Accept but ignore sort parameters for FAQs
    sort_by_stock  // Accept but ignore sort parameters for FAQs
  }) => {
    // Only use the parameters that FAQs need
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

  // Sort, filter, and paginate FAQs
  const { paginatedFaqs, totalCount, totalPages } = useMemo(() => {
    if (!faqData || faqData.length === 0) {
      return { paginatedFaqs: [], totalCount: 0, totalPages: 0 };
    }

    // First, filter FAQs based on search terms
    let filtered = faqData.filter(faq => {
      const title = faq.title || "";
      const answer = faq.answer || "";
      const searchLower = filters.search_terms.toLowerCase();
      
      if (!searchLower) return true;
      
      return title.toLowerCase().includes(searchLower) ||
             answer.toLowerCase().includes(searchLower);
    });

    // Sort FAQs by most recent first (descending order)
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
    const paginatedFaqs = filtered.slice(startIndex, endIndex);

    return { paginatedFaqs, totalCount, totalPages };
  }, [faqData, filters.search_terms, currentPage, itemsPerPage]);

  // Handle page changes
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Optional: scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (isFetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.response?.data || fetchError.message
          : 'Failed to fetch FAQs. Please try again.'
      );
    } else if (addError) {
      setError(
        addError instanceof Error
          ? addError.response?.data?.error || addError.message
          : 'Failed to add FAQ. Please try again.'
      );
    } else if (editError) {
      setError(
        editError instanceof Error
          ? editError.response?.data?.error || editError.message
          : 'Failed to update FAQ. Please try again.'
      );
    } else if (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.response?.data?.error || deleteError.message
          : 'Failed to delete FAQ. Please try again.'
      );
    } else {
      setError(null);
    }
  }, [isFetchError, fetchError, addError, editError, deleteError]);

  const handleAdd = () => {
    setEditingFaq(null);
    setEditingIndex(null);
    setModalOpen(true);
  };

  const handleEdit = (faq, index) => {
    setEditingFaq(faq);
    setEditingIndex(index);
    setModalOpen(true);
  };

  const handleSave = (faq) => {
    setError(null);
    if (editingIndex !== null && editingFaq) {
      editFaq(
        {
          active_outlet: activeOutlet,
          faqId: editingFaq.id,
          payload: {
            faq: {
              title: faq.question,
              answer: faq.answer,
            },
          },
        },
        {
          onSuccess: () => {
            refetch();
            setModalOpen(false);
            setEditingFaq(null);
            setEditingIndex(null);
          },
          onError: (err) => {
            setError(err instanceof Error ? err.message : 'Update failed.');
          },
        }
      );
    } else {
      addFaq(
        {
          active_outlet: activeOutlet,
          payload: {
            faq: {
              title: faq.question,
              answer: faq.answer,
            },
          },
        },
        {
          onSuccess: () => {
            refetch();
            setModalOpen(false);
          },
          onError: (err) => {
            setError(err instanceof Error ? err.message : 'Add failed.');
          },
        }
      );
    }
  };

  const handleDelete = (faqId) => {
    setError(null);
    deleteFaq(
      { active_outlet: activeOutlet, faqId },
      {
        onSuccess: () => {
          refetch();
          // If we're on a page with no items after deletion, go to previous page
          if (paginatedFaqs.length === 1 && currentPage > 1) {
            setCurrentPage(currentPage - 1);
          }
        },
        onError: (err) => {
          setError(err instanceof Error ? err.message : 'Delete failed.');
        },
      }
    );
  };

  const handleRetry = () => {
    setError(null);
    refetch();
  };

  return (
    <div className="admin-faq-page">
      {error ? (
        <ErrorState message={error} onRetry={handleRetry} />
      ) : isLoading ? (
        <SkeletonFaqList />
      ) : (
        <>
          <div className="page-header-faq">
            <h2>FAQ Management</h2>
            <button className="add-faq-btn" onClick={handleAdd} disabled={isAdding || isEditing || isDeleting}>
              Add FAQ
            </button>
          </div>

          {/* Search Bar */}
          <SearchBar
            onApply={handleApplyFilters}
            onManualSearch={handleManualSearch}
            filterOptions={[]} // No status filter for FAQs
            categoryOptions={[]} // No category filter for FAQs
            sortOptions={[]} // No sort options for FAQs
            placeholder="Search FAQs..."
            filterLabel="Filter by"
            showDate={false} // FAQs don't need date filters
            initialValues={searchBarState}
          />

          {/* Show total count */}
          <div className="page-title-section" style={{ marginBottom: '16px', padding: '0 1rem' }}>
            <h3>
              {totalCount} FAQ{totalCount !== 1 ? 's' : ''} found
            </h3>
            {filters.search_terms && (
              <p className="search-results-info">
                Showing results for "{filters.search_terms}"
              </p>
            )}
          </div>

          {!faqData || faqData.length === 0 ? (
            <EmptyState
              message="No FAQs have been added yet."
              btnText="Add your first FAQ"
              handleAddCategory={handleAdd}
            />
          ) : paginatedFaqs.length === 0 && filters.search_terms ? (
            <EmptyState
              message={`No FAQs found matching "${filters.search_terms}"`}
              btnText="Clear Search"
              handleAddCategory={() => handleApplyFilters({ status: '', search_terms: '', start_date: '', end_date: '', sort_by_likes: '', sort_by_stock: '' })}
            />
          ) : (
            <FaqAccordion
              faqs={paginatedFaqs}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}

          {/* Pagination - Show when there are FAQs and pagination is needed */}
          {!isLoading && paginatedFaqs.length > 0 && totalPages > 1 && (
            <Pagination
              name="FAQs"
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={totalCount}
              itemsPerPage={itemsPerPage}
              showInfo={true}
            />
          )}

          <FaqModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            onSave={handleSave}
            editingFaq={editingFaq}
            isSubmitting={isAdding || isEditing || isDeleting}
          />
        </>
      )}
    </div>
  );
};

export default AdminFaqPage;