
import { Trash2 } from "lucide-react";

export const getDepartmentColumns = (onEditDepartment, onDeleteDepartment) => [
  {
    key: "name",
    header: "Department Name",
    render: (department) => (
      <div className="category-name">{department.name}</div>
    ),
  },
  {
    key: "description",
    header: "Description",
    render: (department) => (
      <div className="category-description-cell">
        {department.description || "No description"}
      </div>
    ),
  },
  {
    key: "active",
    header: "Status",
    render: (department) => (
      <div className="product-count-cell">
        {department.active ? (
          <span className="status-active">Enabled</span>
        ) : (
          <span className="status-inactive">Disabled</span>
        )}
      </div>
    ),
  },
  {
    key: "created_at",
    header: "Created Date",
    render: (department) => (
      <div className="date-cell">
        {new Date(department.created_at).toLocaleDateString()}
      </div>
    ),
  },
  {
    key: "actions",
    header: "Actions",
    render: (department) => (
      <div className="action-buttons">
        <button
          className="edit-category-btn"
          onClick={(e) => {
            e.stopPropagation();
            onEditDepartment(department);
          }}
        >
          Edit
        </button>
        <button
          className="delete-category-btn"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteDepartment(department);
          }}
        >
          <Trash2 size={14} />
        </button>
      </div>
    ),
    width: "140px",
  },
];
