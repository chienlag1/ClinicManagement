'use client';

import React, { useState, useEffect } from 'react';

import axios from 'axios';

import { Medicine, MEDICINE_TYPES, MEDICINE_UNITS } from '@/types/medicine';
import {
  CRUDTemplate,
  CRUDModal,
  useCRUD,
  crudUtils,
  CRUDColumn,
  CRUDField,
} from '@/components/crud-template';
import { NotificationModal } from '@/components/notification-popup';

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
      ['medicine_name', 'medicine_code'],
      'type'
    );

    setFilteredData(filtered);
  }, [searchTerm, filterValue, medicines, setFilteredData]);

  const fetchMedicines = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get('/api/medicines');

      setMedicines(res.data);
    } catch {
      // Error fetching medicines
      showError('Lỗi', 'Không thể tải danh sách thuốc. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveMedicine = async (medicineData: Medicine) => {
    try {
      setIsLoading(true);

      if (editingItem) {
        // Update existing medicine
        const res = await axios.put(
          `/api/medicines/${editingItem._id}`,
          medicineData
        );

        setMedicines(
          medicines.map(m => (m._id === editingItem._id ? res.data : m))
        );

        showSuccess('Thành công', 'Cập nhật thuốc thành công!');
      } else {
        // Add new medicine
        const res = await axios.post('/api/medicines', medicineData);

        setMedicines([...medicines, res.data]);

        showSuccess('Thành công', 'Thêm thuốc mới thành công!');
      }

      setIsModalOpen(false);
    } catch {
      // Error saving medicine
      showError('Lỗi', 'Không thể lưu thuốc. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMedicine = async () => {
    if (!deletingItem?._id) return;

    try {
      setIsLoading(true);
      await axios.delete(`/api/medicines/${deletingItem._id}`);

      setMedicines(medicines.filter(m => m._id !== deletingItem._id));

      showSuccess('Thành công', 'Xóa thuốc thành công!');
      setShowDeleteModal(false);
    } catch {
      // Error deleting medicine
      showError('Lỗi', 'Không thể xóa thuốc. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  // Define table columns
  const columns: CRUDColumn<Medicine>[] = [
    {
      key: 'medicine_code',
      label: 'Mã thuốc',
      render: value => <span className='font-medium'>{value}</span>,
    },
    {
      key: 'medicine_name',
      label: 'Tên thuốc',
    },
    {
      key: 'type',
      label: 'Loại',
      render: value => {
        const typeInfo = MEDICINE_TYPES.find(
          t => t.key === value.toLowerCase()
        );

        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${typeInfo?.color || 'bg-gray-100 text-gray-600'}`}
          >
            {typeInfo?.label || value}
          </span>
        );
      },
    },
    {
      key: 'price',
      label: 'Giá',
      render: value => crudUtils.formatCurrency(value),
    },
    {
      key: 'unit',
      label: 'Đơn vị',
    },
  ];

  // Define form fields
  const fields: CRUDField<Medicine>[] = [
    {
      key: 'medicine_code',
      label: 'Mã thuốc',
      type: 'text',
      placeholder: 'Nhập mã thuốc',
      required: true,
    },
    {
      key: 'medicine_name',
      label: 'Tên thuốc',
      type: 'text',
      placeholder: 'Nhập tên thuốc',
      required: true,
    },
    {
      key: 'type',
      label: 'Loại thuốc',
      type: 'select',
      placeholder: 'Chọn loại thuốc',
      required: true,
      options: MEDICINE_TYPES,
    },
    {
      key: 'price',
      label: 'Giá (VND)',
      type: 'number',
      placeholder: 'Nhập giá thuốc',
      required: true,
    },
    {
      key: 'unit',
      label: 'Đơn vị',
      type: 'select',
      placeholder: 'Chọn đơn vị',
      required: true,
      options: MEDICINE_UNITS,
    },
  ];

  return (
    <>
      <CRUDTemplate
        addButtonText='Thêm thuốc'
        columns={columns}
        data={data}
        description='Quản lý thông tin thuốc trong hệ thống'
        emptyStateIcon='lucide:pill'
        emptyStateMessage='Không tìm thấy thuốc nào'
        filterOptions={MEDICINE_TYPES}
        filterPlaceholder='Lọc theo loại thuốc'
        filterValue={filterValue}
        filteredData={filteredData}
        searchFields={['medicine_name', 'medicine_code']}
        searchPlaceholder='Tìm kiếm thuốc...'
        searchTerm={searchTerm}
        setFilterValue={setFilterValue}
        setSearchTerm={setSearchTerm}
        title='Quản lý Thuốc'
        onAdd={handleAdd}
        onDelete={handleDelete}
        onEdit={handleEdit}
      />

      {/* Add/Edit Modal */}
      <CRUDModal
        data={editingItem || ({} as Medicine)}
        fields={fields}
        isLoading={isLoading}
        isOpen={isModalOpen}
        title={editingItem ? 'Chỉnh sửa Thuốc' : 'Thêm Thuốc Mới'}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveMedicine}
      />

      {/* Delete Confirmation Modal */}
      <NotificationModal
        cancelText='Hủy'
        confirmText='Xóa'
        isOpen={showDeleteModal}
        message={`Bạn có chắc chắn muốn xóa thuốc "${deletingItem?.medicine_name}" không? Hành động này không thể hoàn tác.`}
        showCancel={true}
        title='Xác nhận xóa thuốc'
        type='error'
        onCancel={() => setShowDeleteModal(false)}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteMedicine}
      />
    </>
  );
}
