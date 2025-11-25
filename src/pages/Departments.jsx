import React, { useState, useMemo } from "react";
import SearchBar from "../components/SearchBar.jsx";
import FlexibleTable from "../components/FlexibleTable.jsx";
import Pagination from "../components/Pagination.jsx";

import "../styles/ProductCategories.css"
import "../styles/OrderPage.css";

import ConfirmActionModal from "../components/ConfirmActionModal.jsx";
import { Plus } from 'lucide-react';

import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { useAddDepartment } from "../hooks/useAddDepartment.js";
import { useUpdateDepartment } from "../hooks/useUpdateDepartment.js";
import { useDeleteDepartment } from "../hooks/useDeleteDepartment.js";
import { useViewDepartment } from "../hooks/useGetDepartment.js";

import { getDepartmentColumns } from "../columns/departmentColumns.jsx";
import { categoryActions } from "../columns/categoryActions.jsx"; // if actions are same

import { ErrorState } from "../components/ErrorState.jsx";
import { EmptyState } from "../components/EmptyState.jsx";
import { getActiveOutlet } from "../utils/getActiveOutlets.js";
import DepartmentModal from "../components/DepartmentModal.jsx";

const DepartmentsPage = () => {
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
  const itemsPerPage = 10;

  const [isAddModal, setIsAddModal] = useState(false);
  const [isEditModal, setIsEditModal] = useState(false);
  const [isDeleteModal, setIsDeleteModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  const active_outlet = getActiveOutlet();
  const queryClient = useQueryClient();

  // Fetch departments
  const { 
    data: departments = [], 
    isLoading: isFetchingDepartments, 
    error: fetchError,
    refetch: refetchDepartments 
  } = useViewDepartment(active_outlet, filters, currentPage, itemsPerPage);
console.log('dept', departments);

  // Mutations
  const addMutation = useAddDepartment();
  const updateMutation = useUpdateDepartment();
  const deleteMutation = useDeleteDepartment();

  // Columns
  const columns = getDepartmentColumns(
    (dept) => { setSelectedDepartment(dept); setIsEditModal(true); },
    (dept) => { setSelectedDepartment(dept); setIsDeleteModal(true); }
  );

  // Filters
  const handleApplyFilters = ({ status, search_terms, start_date, end_date }) => {
    setFilters({ status, search_terms, start_date, end_date });
    setCurrentPage(1);
    setSearchBarState({
      search: search_terms || "",
      status: status ? status.charAt(0).toUpperCase() + status.slice(1) : "All Status",
      startDate: start_date || "",
      endDate: end_date || ""
    });
  };

  const handleManualSearch = (searchTerm) => {
    handleApplyFilters({ status: '', search_terms: searchTerm, start_date: '', end_date: '' });
  };

  // Pagination and filtering
  const { paginatedDepartments, totalCount, totalPages } = useMemo(() => {
    let filtered = departments?.departments?.filter(d => {
      const name = typeof d.name === 'string' ? d.name : JSON.stringify(d.name);
      const description = typeof d.description === 'string' ? d.description : JSON.stringify(d.description);
      const searchLower = filters.search_terms.toLowerCase();
      if (!searchLower) return true;
      return name.toLowerCase().includes(searchLower) || description.toLowerCase().includes(searchLower);
    });

    filtered?.sort((a,b) => new Date(b.created_at || b.updated_at).getTime() - new Date(a.created_at || a.updated_at).getTime());
    const totalCount = filtered?.length;
    const totalPages = Math.ceil(totalCount / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return { paginatedDepartments: filtered?.slice(startIndex, endIndex), totalCount, totalPages };
  }, [departments, filters.search_terms, currentPage]);

  const handlePageChange = (page) => setCurrentPage(page);

  // Add / Edit / Delete handlers
  const handleAdd = () => { setSelectedDepartment(null); setIsAddModal(true); };
  const handleRowClick = (dept) => { setSelectedDepartment(dept); setIsEditModal(true); };
  const handleActionClick = (action, dept) => { setSelectedDepartment(dept); if(action==='edit') setIsEditModal(true); else if(action==='delete') setIsDeleteModal(true); };

  const handleConfirmDelete = async () => {
    try {
      await deleteMutation.mutateAsync({ active_outlet, departmentId: selectedDepartment.id });
      refetchDepartments();
      toast.success("Department deleted successfully!");
      setIsDeleteModal(false);
      setSelectedDepartment(null);
    } catch (err) { toast.error("Failed to delete department."); }
  };

  const handleSubmit = async (data) => {
    const payload = { [`sephcocco_${active_outlet}_department`]: data };
    try {
      if(selectedDepartment) await updateMutation.mutateAsync({ active_outlet, departmentId: selectedDepartment.id, payload });
      else await addMutation.mutateAsync({ active_outlet, payload });
      refetchDepartments();
      toast.success(`Department ${selectedDepartment ? 'updated' : 'added'} successfully!`);
      setIsAddModal(false); setIsEditModal(false); setSelectedDepartment(null);
    } catch(err) { toast.error("Failed to save department."); }
  };

  const isLoading = addMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <div className="order-page">
      <div className="page-header">
        <h1>Departments</h1>
        <button className="add-category-btn" onClick={handleAdd} disabled={isLoading}><Plus size={16}/>Add Department</button>
      </div>

      <SearchBar onApply={handleApplyFilters} onManualSearch={handleManualSearch}            filterOptions={
     ["All Status", "Enabled", "Disabled"] 
   
  }
   filterLabel="Filter by" categoryOptions={[]} sortOptions={[]} placeholder="Search departments..." initialValues={searchBarState}  />

      <div className="order-table-container-cat">
        {fetchError ? <ErrorState title="Failed to load departments" message="Error loading departments." refetchCategories={refetchDepartments} isFetchingCategories={isFetchingDepartments} /> :
        <FlexibleTable
          data={paginatedDepartments}
          columns={columns}
          actions={categoryActions}

          keyField="id"
          onRowClick={handleRowClick}
          onActionClick={handleActionClick}
          isLoading={isFetchingDepartments}
          emptyState={<EmptyState title="No departments found" btnText="Add Department" handleAddCategory={handleAdd} />}
        />}
        {!isFetchingDepartments && paginatedDepartments.length>0 && totalPages>1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} totalItems={totalCount} itemsPerPage={itemsPerPage} />}
      </div>

      {isAddModal && <DepartmentModal isOpen={isAddModal} onClose={()=>setIsAddModal(false)} onSubmit={handleSubmit} department={null} title="Add Department" isLoading={addMutation.isPending} />}
      {isEditModal && <DepartmentModal isOpen={isEditModal} onClose={()=>setIsEditModal(false)} onSubmit={handleSubmit} department={selectedDepartment} title="Edit Department" isLoading={updateMutation.isPending} />}
      {isDeleteModal && <ConfirmActionModal isOpen={isDeleteModal} onClose={()=>setIsDeleteModal(false)} onConfirm={handleConfirmDelete} type="delete" title="Confirm Delete Department" isLoading={deleteMutation.isPending} message={<><strong>{selectedDepartment?.name}</strong> will be deleted.</>} />}
    </div>
  );
};

export default DepartmentsPage;
