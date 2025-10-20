import { Trash2 } from "lucide-react";

export const getCategoryColumns = (onEditCategory, onDeleteCategory) => [
  {
    key: 'name',
    header: 'Category Name',
    render: (category) => <div className="category-name">{category.name}</div>
  },
  {
    key: 'description',
    header: 'Description',
    render: (category) => (
      <div className="category-description-cell">
        {category.description || 'No description'}
      </div>
    )
  },
  {
    key: 'total_products',
    header: 'Total Products',
    render: (category) => (
      <div className="product-count-cell">{category.total_products || 0}</div>
    )
  },
  {
    key: 'created_at',
    header: 'Created Date',
    render: (category) => (
      <div className="date-cell">
        {new Date(category.created_at).toLocaleDateString()}
      </div>
    )
  },
  {
    key: 'actions',
    header: 'Actions',
    render: (category) => (
      <div className="action-buttons">
        <button
          className="edit-category-btn"
          onClick={(e) => {
            e.stopPropagation();
            onEditCategory(category);
          }}
        >
          Edit
        </button>
        <button
          className="delete-category-btn"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteCategory(category);
          }}
        >
          <Trash2 size={14} />
        </button>
      </div>
    ),
    width: '140px'
  }
];
