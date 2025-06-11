 // Table column configuration for product categories using flexible format
 export const categoryColumns = [
  
    { 
      key: "name", 
      label: "Category Name", 
      className: "category-name-cell",
      type: "custom",
      render: (value, data) => (
        <span className="category-name-text" title={value}>
          {value}
        </span>
      )
    },
    { 
      key: "description", 
      label: "Description", 
      className: "description",
      type: "custom",
      render: (value, data) => (
        <span className="description-text" title={value}>
          {value?.length > 50 ? `${value.substring(0, 50)}...` : value || 'No description'}
        </span>
      )
    },
      { 
      key: "total_products", 
      label: "Total Products", 
      className: "description",
      type: "custom",
        render: (value) => (
        <span className="total_products-text">
          {value || 0}
        </span>
      )
    },
    { 
      key: "created_at", 
      label: "Date Created", 
      className: "date",
      type: "date",
      dateConfig: {
        formatter: (date) => new Date(date).toLocaleDateString(),
       
      }
    },
    { 
      key: "actions", 
      label: "Actions", 
      className: "actions",
      type: "actions",
      width: "100px"
    }
  ];
