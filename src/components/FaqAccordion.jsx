import { ChevronDown, ChevronUp, Pencil, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import '../styles/FaqAccordion.css';

export const FaqAccordion = ({ faqs, onEdit, onDelete }) => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="accordion-container">
      {faqs.map((faq, index) => (
        <div key={index} className="faq-card">
          <div className="faq-header" onClick={() => toggle(index)}>
            <h4 className="faq-question">{faq.question}</h4>
            <div className="faq-icons">
              <button
                className="icon-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(faq, index);
                }}
              >
                <Pencil size={18} color='#000' />
              </button>
              <button
                className="icon-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(index);
                }}
              >
                <Trash2 size={18} color='#000' />
              </button>
              {openIndex === index ? <ChevronUp /> : <ChevronDown />}
            </div>
          </div>

          {openIndex === index && <p className="faq-answer">{faq.answer}</p>}
        </div>
      ))}
    </div>
  );
};
