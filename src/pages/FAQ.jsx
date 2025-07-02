'use client';

import React, { useState, useEffect } from 'react';
import { FaqAccordion } from '../components/FaqAccordion';
import { FaqModal } from '../components/FaqModal';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
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

  const activeOutlet = getActiveOutlet();

  // Fetch FAQs
  const {
    data: faqData,
    refetch,
    isLoading,
    isError: isFetchError,
    error: fetchError,
  } = useGetFaq(activeOutlet);

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

          {!faqData || faqData.length === 0 ? (
            <EmptyState
              message="No FAQs have been added yet."
              btnText="Add your first FAQ"
              handleAddCategory={handleAdd}
            />
          ) : (
            <FaqAccordion
              faqs={faqData}
              onEdit={handleEdit}
              onDelete={handleDelete} 
           
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
