"use client";

import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import {
  CRUDTemplate,
  CRUDModal,
  useCRUD,
  crudUtils,
  CRUDColumn,
  CRUDField,
} from "@/components/crud-template";
import { NotificationModal } from "@/components/notification-popup";

// Mock data type
interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  gender: string;
  status: "active" | "inactive" | "pending" | "blocked";
  createdAt: string;
}

// Mock data
const mockPatients: Patient[] = Array.from({ length: 50 }, (_, i) => ({
  id: String(i + 1),
  name: `Bệnh nhân ${i + 1}`,
  email: `patient${i + 1}@example.com`,
  phone: `0${Math.floor(Math.random() * 900000000) + 100000000}`,
  age: Math.floor(Math.random() * 60) + 18,
  gender: i % 2 === 0 ? "Nam" : "Nữ",
  status:
    i % 4 === 0
      ? "active"
      : i % 4 === 1
        ? "inactive"
        : i % 4 === 2
          ? "pending"
          : "blocked",
  createdAt: new Date(
    Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000,
  ).toISOString(),
}));

const statusOptions = [
  { key: "active", label: "Hoạt động" },
  { key: "inactive", label: "Không hoạt động" },
  { key: "pending", label: "Chờ duyệt" },
  { key: "blocked", label: "Bị khóa" },
];

const genderOptions = [
  { key: "Nam", label: "Nam" },
  { key: "Nữ", label: "Nữ" },
];

export default function PatientsPageNew() {
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [isLoading, setIsLoading] = useState(false);

  const {
    data,
    filteredData,
    setFilteredData,
    searchTerm,
    setSearchTerm,
    filterValue,
    setFilterValue,
    isModalOpen,
    setIsModalOpen,
    editingItem,
    showDeleteModal,
    setShowDeleteModal,
    deletingItem,
    handleAdd,
    handleEdit,
    handleDelete,
    handleSave,
    confirmDelete,
    showSuccess,
    showError,
  } = useCRUD<Patient>(patients);

  // Update filtered data when patients change
  useEffect(() => {
    setFilteredData(patients);
  }, [patients, setFilteredData]);

  // Filter patients based on search and filter
  useEffect(() => {
    const filtered = crudUtils.filterData(
      patients,
      searchTerm,
      filterValue,
      ["name", "email", "phone"],
      "status"
    );
    setFilteredData(filtered);
  }, [searchTerm, filterValue, patients, setFilteredData]);

  const handleSavePatient = async (patientData: Patient) => {
    try {
      setIsLoading(true);
      
      if (editingItem) {
        // Update existing patient
        setPatients(patients.map((p) => (p.id === editingItem.id ? patientData : p)));
        showSuccess("Thành công", "Cập nhật bệnh nhân thành công!");
      } else {
        // Add new patient
        const newPatient = {
          ...patientData,
          id: String(Math.max(...patients.map(p => parseInt(p.id))) + 1),
          createdAt: new Date().toISOString(),
        };
        setPatients([...patients, newPatient]);
        showSuccess("Thành công", "Thêm bệnh nhân mới thành công!");
      }
      
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to save patient", error);
      showError("Lỗi", "Không thể lưu bệnh nhân. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePatient = async () => {
    if (!deletingItem?.id) return;

    try {
      setIsLoading(true);
      setPatients(patients.filter((p) => p.id !== deletingItem.id));
      showSuccess("Thành công", "Xóa bệnh nhân thành công!");
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Failed to delete patient", error);
      showError("Lỗi", "Không thể xóa bệnh nhân. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  // Define table columns
  const columns: CRUDColumn<Patient>[] = [
    {
      key: "id",
      label: "ID",
      width: "80px",
    },
    {
      key: "name",
      label: "Tên",
      render: (value) => <span className="font-medium">{value}</span>,
    },
    {
      key: "email",
      label: "Email",
    },
    {
      key: "phone",
      label: "Số điện thoại",
    },
    {
      key: "age",
      label: "Tuổi",
      width: "80px",
    },
    {
      key: "gender",
      label: "Giới tính",
      width: "100px",
    },
    {
      key: "status",
      label: "Trạng thái",
      render: (value) => {
        const statusInfo = statusOptions.find((s) => s.key === value);
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${crudUtils.getStatusColor(value)}`}
          >
            {statusInfo?.label || value}
          </span>
        );
      },
    },
    {
      key: "createdAt",
      label: "Ngày tạo",
      render: (value) => crudUtils.formatDate(value),
    },
  ];

  // Define form fields
  const fields: CRUDField<Patient>[] = [
    {
      key: "name",
      label: "Tên bệnh nhân",
      type: "text",
      placeholder: "Nhập tên bệnh nhân",
      required: true,
    },
    {
      key: "email",
      label: "Email",
      type: "email",
      placeholder: "Nhập email",
      required: true,
    },
    {
      key: "phone",
      label: "Số điện thoại",
      type: "text",
      placeholder: "Nhập số điện thoại",
      required: true,
    },
    {
      key: "age",
      label: "Tuổi",
      type: "number",
      placeholder: "Nhập tuổi",
      required: true,
    },
    {
      key: "gender",
      label: "Giới tính",
      type: "select",
      placeholder: "Chọn giới tính",
      required: true,
      options: genderOptions,
    },
    {
      key: "status",
      label: "Trạng thái",
      type: "select",
      placeholder: "Chọn trạng thái",
      required: true,
      options: statusOptions,
    },
  ];

  return (
    <>
      <CRUDTemplate
        title="Quản lý Bệnh nhân"
        description="Quản lý thông tin bệnh nhân trong hệ thống"
        data={data}
        filteredData={filteredData}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterValue={filterValue}
        setFilterValue={setFilterValue}
        filterOptions={statusOptions}
        searchFields={["name", "email", "phone"]}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyStateIcon="lucide:users"
        emptyStateMessage="Không tìm thấy bệnh nhân nào"
        addButtonText="Thêm bệnh nhân"
        searchPlaceholder="Tìm kiếm bệnh nhân..."
        filterPlaceholder="Lọc theo trạng thái"
      />

      {/* Add/Edit Modal */}
      <CRUDModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? "Chỉnh sửa Bệnh nhân" : "Thêm Bệnh nhân Mới"}
        data={editingItem || ({} as Patient)}
        onSave={handleSavePatient}
        fields={fields}
        isLoading={isLoading}
      />

      {/* Delete Confirmation Modal */}
      <NotificationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        type="error"
        title="Xác nhận xóa bệnh nhân"
        message={`Bạn có chắc chắn muốn xóa bệnh nhân "${deletingItem?.name}" không? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        showCancel={true}
        onConfirm={handleDeletePatient}
        onCancel={() => setShowDeleteModal(false)}
      />
    </>
  );
}
