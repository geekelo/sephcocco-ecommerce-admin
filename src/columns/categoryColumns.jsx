export const categoryColumns = [
  {
    key: 'name',
    header: 'Category Name',
    render: (category) => (
    
        <div className="category-name">{category.name}</div>
 
    )
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
      <div className="product-count-cell">
        {category.total_products || 0}
      </div>
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
  }
];