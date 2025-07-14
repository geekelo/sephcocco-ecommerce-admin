import React, { useEffect, useState } from 'react';
import '../styles/FaqModal.css';

export const FaqModal = ({
  isOpen,
  onClose,
  onSave,
  editingFaq,
  isSubmitting = false,
}) => {

    
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  useEffect(() => {
    if (editingFaq) {
      setQuestion(editingFaq.title);
      setAnswer(editingFaq.answer);
    } else {
      setQuestion('');
      setAnswer('');
    }
  }, [editingFaq]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!question || !answer || isSubmitting) return;
    onSave({ question, answer });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay-faq">
      <form className="faq-modal" onSubmit={handleSubmit}>
        <h3>{editingFaq ? 'Edit FAQ' : 'Add FAQ'}</h3>
        <input
          type="text"
          placeholder="Question"
          value={question}
          className="faq-text"
          onChange={(e) => setQuestion(e.target.value)}
          disabled={isSubmitting}
        />
        <textarea
          placeholder="Answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={isSubmitting}
        />
        <div className="modal-actions-faq">
          <button className="add-faq" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : editingFaq ? 'Update' : 'Add'}
          </button>
          <button
            className="cancel-faq-btn"
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
