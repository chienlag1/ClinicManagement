'use client';

import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import axios from 'axios';
import { Clinic, CLINIC_STATUS } from '@/types/clinic';
import {
  CRUDTemplate,
  CRUDModal,
  useCRUD,
  crudUtils,
  CRUDColumn,
  CRUDField,
} from '@/components/crud-template';
import { NotificationModal } from '@/components/notification-popup';

export default function ClinicManager() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
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
  } = useCRUD<Clinic>(clinics);

  // Fetch clinics on component mount
  useEffect(() => {
    fetchClinics();
  }, []);

  // Update filtered data when clinics change
  useEffect(() => {
    setFilteredData(clinics);
  }, [clinics, setFilteredData]);

  // Filter clinics based on search and filter
  useEffect(() => {
    const filtered = crudUtils.filterData(
      clinics,
      searchTerm,
      filterValue,
      ['clinic_code', 'clinic_id', 'description'],
      'status'
    );
    setFilteredData(filtered);
  }, [searchTerm, filterValue, clinics, setFilteredData]);

  const fetchClinics = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get('/api/clinics');
      setClinics(res.data);
    } catch (error) {
      console.error('Failed to fetch clinics', error);
      showError('Lỗi', 'Không thể tải danh sách phòng khám. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveClinic = async (clinicData: Clinic) => {
    try {
      setIsLoading(true);

      if (editingItem) {
        // Update existing clinic
        const res = await axios.put(
          `/api/clinics/${editingItem._id}`,
          clinicData
        );
        setClinics(
          clinics.map(c => (c._id === editingItem._id ? res.data : c))
        );
        showSuccess('Thành công', 'Cập nhật phòng khám thành công!');
      } else {
        // Add new clinic
        const res = await axios.post('/api/clinics', clinicData);
        setClinics([...clinics, res.data]);
        showSuccess('Thành công', 'Thêm phòng khám mới thành công!');
      }

      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save clinic', error);
      showError('Lỗi', 'Không thể lưu phòng khám. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClinic = async () => {
    if (!deletingItem?._id) return;

    try {
      setIsLoading(true);
      await axios.delete(`/api/clinics/${deletingItem._id}`);
      setClinics(clinics.filter(c => c._id !== deletingItem._id));
      showSuccess('Thành công', 'Xóa phòng khám thành công!');
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Failed to delete clinic', error);
      showError('Lỗi', 'Không thể xóa phòng khám. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  // Define table columns
  const columns: CRUDColumn<Clinic>[] = [
    {
      key: 'clinic_id',
      label: 'ID Phòng',
      render: value => <span className='font-medium'>{value}</span>,
    },
    {
      key: 'clinic_code',
      label: 'Mã Phòng',
      render: value => <span className='font-medium'>{value}</span>,
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: value => {
        const statusInfo = CLINIC_STATUS.find(
          s => s.key === value.toLowerCase()
        );
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo?.color || 'bg-gray-100 text-gray-600'}`}
          >
            {statusInfo?.label || value}
          </span>
        );
      },
    },
    {
      key: 'capacity',
      label: 'Sức chứa',
      render: value => (value ? `${value} người` : 'Không xác định'),
    },
    {
      key: 'description',
      label: 'Mô tả',
      render: value => (
        <span className='text-sm text-gray-600 max-w-xs truncate' title={value}>
          {value || 'Không có mô tả'}
        </span>
      ),
    },
  ];

  // Define form fields
  const fields: CRUDField<Clinic>[] = [
    {
      key: 'clinic_id',
      label: 'ID Phòng',
      type: 'text',
      placeholder: 'Nhập ID phòng (VD: CL001)',
      required: true,
    },
    {
      key: 'clinic_code',
      label: 'Mã Phòng',
      type: 'text',
      placeholder: 'Nhập mã phòng (VD: PHONG_KHAM_001)',
      required: true,
    },
    {
      key: 'status',
      label: 'Trạng thái',
      type: 'select',
      placeholder: 'Chọn trạng thái',
      required: true,
      options: CLINIC_STATUS,
    },
    {
      key: 'capacity',
      label: 'Sức chứa',
      type: 'number',
      placeholder: 'Nhập sức chứa',
      required: false,
    },
    {
      key: 'description',
      label: 'Mô tả',
      type: 'textarea',
      placeholder: 'Nhập mô tả phòng',
      required: false,
    },
  ];

  return (
    <>
      <CRUDTemplate
        title='Quản lý Phòng Khám'
        description='Quản lý thông tin phòng khám trong hệ thống'
        data={data}
        filteredData={filteredData}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterValue={filterValue}
        setFilterValue={setFilterValue}
        filterOptions={CLINIC_STATUS}
        searchFields={['clinic_code', 'clinic_id', 'description']}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyStateIcon='lucide:building'
        emptyStateMessage='Không tìm thấy phòng khám nào'
        addButtonText='Thêm phòng khám'
        searchPlaceholder='Tìm kiếm phòng khám...'
        filterPlaceholder='Lọc theo trạng thái'
      />

      {/* Add/Edit Modal */}
      <CRUDModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Chỉnh sửa Phòng Khám' : 'Thêm Phòng Khám Mới'}
        data={editingItem || ({} as Clinic)}
        onSave={handleSaveClinic}
        fields={fields}
        isLoading={isLoading}
      />

      {/* Delete Confirmation Modal */}
      <NotificationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        type='error'
        title='Xác nhận xóa phòng khám'
        message={`Bạn có chắc chắn muốn xóa phòng khám "${deletingItem?.clinic_code}" không? Hành động này không thể hoàn tác.`}
        confirmText='Xóa'
        cancelText='Hủy'
        showCancel={true}
        onConfirm={handleDeleteClinic}
        onCancel={() => setShowDeleteModal(false)}
      />
    </>
  );
}
