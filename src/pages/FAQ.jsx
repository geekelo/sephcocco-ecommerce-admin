import React, { useState } from 'react';
import { FaqAccordion } from '../components/FaqAccordion';
import { FaqModal } from '../components/FaqModal';
import '../styles/AdminFaqPage.css';
import { EmptyState } from '../components/EmptyState';
import { useGetFaq } from '../hooks/useGetFaq';
import { getActiveOutlet } from '../utils/getActiveOutlets';

const AdminFaqPage = () => {
    const [faqs, setFaqs] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingFaq, setEditingFaq] = useState(null);
    const [editingIndex, setEditingIndex] = useState(null);
    const activeoutlet = getActiveOutlet()
  const {data: faqData} = useGetFaq(activeoutlet)
  console.log(faqData);
  
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
      if (editingIndex !== null) {
        const updated = [...faqs];
        updated[editingIndex] = faq;
        setFaqs(updated);
      } else {
        setFaqs([...faqs, faq]);
      }
      setModalOpen(false);
    };
  
    const handleDelete = (index) => {
      const updated = faqs.filter((_, i) => i !== index);
      setFaqs(updated);
    };
  
    return (
      <div className="admin-faq-page">
        <div className='page-header-faq'>
        <h2>FAQ Management</h2>
        <button className="add-faq-btn" onClick={handleAdd}>Add FAQ</button>
        </div>
  
  
        {faqs.length === 0 ? (
          <EmptyState
            message="No FAQs have been added yet."
            btnText="Add your first FAQ"
            handleAddCategory={handleAdd}
          />
        ) : (
          <FaqAccordion faqs={faqs} onEdit={handleEdit} onDelete={handleDelete} />
        )}
  
        <FaqModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
          editingFaq={editingFaq}
        />
      </div>
    );
  };

export default AdminFaqPage;
