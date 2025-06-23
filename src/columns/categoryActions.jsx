import { Edit3, Eye, Trash2 } from "lucide-react";

  // Actions configuration for the dropdown
 export const categoryActions = [

    {
      key: 'edit',
      label: 'Edit Category',
      icon: <Edit3 size={14} />,
      className: 'edit'
    },
    {
      key: 'delete',
      label: 'Delete Category',
      icon: <Trash2 size={14} />,
      className: 'delete',

    }
  ];