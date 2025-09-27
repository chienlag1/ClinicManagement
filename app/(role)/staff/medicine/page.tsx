"use client";

import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import axios from "axios";
import { Medicine, MEDICINE_TYPES, MEDICINE_UNITS } from "@/types/medicine";
import {
  CRUDTemplate,
  CRUDModal,
  useCRUD,
  crudUtils,
  CRUDColumn,
  CRUDField,
} from "@/components/crud-template";
import { NotificationModal } from "@/components/notification-popup";

export default function MedicineManagerNew() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
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
  } = useCRUD<Medicine>(medicines);

  // Fetch medicines on component mount
  useEffect(() => {
    fetchMedicines();
  }, []);

  // Update filtered data when medicines change
  useEffect(() => {
    setFilteredData(medicines);
  }, [medicines, setFilteredData]);

  // Filter medicines based on search and filter
  useEffect(() => {
    const filtered = crudUtils.filterData(
      medicines,
      searchTerm,
      filterValue,
      ["medicine_name", "medicine_code"],
      "type"
    );
    setFilteredData(filtered);
  }, [searchTerm, filterValue, medicines, setFilteredData]);

  const fetchMedicines = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get("/api/medicines");
      setMedicines(res.data);
    } catch (error) {
      console.error("Failed to fetch medicines", error);
      showError("Lỗi", "Không thể tải danh sách thuốc. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveMedicine = async (medicineData: Medicine) => {
    try {
      setIsLoading(true);
      
      if (editingItem) {
        // Update existing medicine
        const res = await axios.put(`/api/medicines/${editingItem._id}`, medicineData);
        setMedicines(medicines.map((m) => (m._id === editingItem._id ? res.data : m)));
        showSuccess("Thành công", "Cập nhật thuốc thành công!");
      } else {
        // Add new medicine
        const res = await axios.post("/api/medicines", medicineData);
        setMedicines([...medicines, res.data]);
        showSuccess("Thành công", "Thêm thuốc mới thành công!");
      }
      
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to save medicine", error);
      showError("Lỗi", "Không thể lưu thuốc. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMedicine = async () => {
    if (!deletingItem?._id) return;

    try {
      setIsLoading(true);
      await axios.delete(`/api/medicines/${deletingItem._id}`);
      setMedicines(medicines.filter((m) => m._id !== deletingItem._id));
      showSuccess("Thành công", "Xóa thuốc thành công!");
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Failed to delete medicine", error);
      showError("Lỗi", "Không thể xóa thuốc. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  // Define table columns
  const columns: CRUDColumn<Medicine>[] = [
    {
      key: "medicine_code",
      label: "Mã thuốc",
      render: (value) => <span className="font-medium">{value}</span>,
    },
    {
      key: "medicine_name",
      label: "Tên thuốc",
    },
    {
      key: "type",
      label: "Loại",
      render: (value) => {
        const typeInfo = MEDICINE_TYPES.find((t) => t.key === value.toLowerCase());
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${typeInfo?.color || "bg-gray-100 text-gray-600"}`}
          >
            {typeInfo?.label || value}
          </span>
        );
      },
    },
    {
      key: "price",
      label: "Giá",
      render: (value) => crudUtils.formatCurrency(value),
    },
    {
      key: "unit",
      label: "Đơn vị",
    },
  ];

  // Define form fields
  const fields: CRUDField<Medicine>[] = [
    {
      key: "medicine_code",
      label: "Mã thuốc",
      type: "text",
      placeholder: "Nhập mã thuốc",
      required: true,
    },
    {
      key: "medicine_name",
      label: "Tên thuốc",
      type: "text",
      placeholder: "Nhập tên thuốc",
      required: true,
    },
    {
      key: "type",
      label: "Loại thuốc",
      type: "select",
      placeholder: "Chọn loại thuốc",
      required: true,
      options: MEDICINE_TYPES,
    },
    {
      key: "price",
      label: "Giá (VND)",
      type: "number",
      placeholder: "Nhập giá thuốc",
      required: true,
    },
    {
      key: "unit",
      label: "Đơn vị",
      type: "select",
      placeholder: "Chọn đơn vị",
      required: true,
      options: MEDICINE_UNITS,
    },
  ];

  return (
    <>
      <CRUDTemplate
        title="Quản lý Thuốc"
        description="Quản lý thông tin thuốc trong hệ thống"
        data={data}
        filteredData={filteredData}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterValue={filterValue}
        setFilterValue={setFilterValue}
        filterOptions={MEDICINE_TYPES}
        searchFields={["medicine_name", "medicine_code"]}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyStateIcon="lucide:pill"
        emptyStateMessage="Không tìm thấy thuốc nào"
        addButtonText="Thêm thuốc"
        searchPlaceholder="Tìm kiếm thuốc..."
        filterPlaceholder="Lọc theo loại thuốc"
      />

      {/* Add/Edit Modal */}
      <CRUDModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? "Chỉnh sửa Thuốc" : "Thêm Thuốc Mới"}
        data={editingItem || ({} as Medicine)}
        onSave={handleSaveMedicine}
        fields={fields}
        isLoading={isLoading}
      />

      {/* Delete Confirmation Modal */}
      <NotificationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        type="error"
        title="Xác nhận xóa thuốc"
        message={`Bạn có chắc chắn muốn xóa thuốc "${deletingItem?.medicine_name}" không? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        showCancel={true}
        onConfirm={handleDeleteMedicine}
        onCancel={() => setShowDeleteModal(false)}
      />
    </>
  );
}
