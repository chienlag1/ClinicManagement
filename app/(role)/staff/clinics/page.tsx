'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';

import {
  CRUDColumn,
  CRUDField,
  CRUDModal,
  CRUDTemplate,
  crudUtils,
  useCRUD,
} from '@/components/DataTable';
import { NotificationModal } from '@/components/notification-popup';
import { Clinic, CLINIC_STATUS } from '@/types/clinic';

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
    // handleSave,
    // confirmDelete,
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
    } catch {
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
    } catch {
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
    } catch {
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
          s => s.key === value?.toLowerCase()
        );

        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo?.color || 'bg-gray-100 text-gray-600'}`}
          >
            {statusInfo?.label || value || 'Không xác định'}
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
        addButtonText='Thêm phòng khám'
        columns={columns}
        data={data}
        description='Quản lý thông tin phòng khám trong hệ thống'
        emptyStateIcon='lucide:building'
        emptyStateMessage='Không tìm thấy phòng khám nào'
        filterOptions={CLINIC_STATUS}
        filterPlaceholder='Lọc theo trạng thái'
        filterValue={filterValue}
        filteredData={filteredData}
        searchFields={['clinic_code', 'clinic_id', 'description']}
        searchPlaceholder='Tìm kiếm phòng khám...'
        searchTerm={searchTerm}
        setFilterValue={setFilterValue}
        setSearchTerm={setSearchTerm}
        title='Quản lý Phòng Khám'
        onAdd={handleAdd}
        onDelete={handleDelete}
        onEdit={handleEdit}
      />

      {/* Add/Edit Modal */}
      <CRUDModal
        data={editingItem || ({} as Clinic)}
        fields={fields}
        isLoading={isLoading}
        isOpen={isModalOpen}
        title={editingItem ? 'Chỉnh sửa Phòng Khám' : 'Thêm Phòng Khám Mới'}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveClinic}
      />

      {/* Delete Confirmation Modal */}
      <NotificationModal
        cancelText='Hủy'
        confirmText='Xóa'
        isOpen={showDeleteModal}
        message={`Bạn có chắc chắn muốn xóa phòng khám "${deletingItem?.clinic_code}" không? Hành động này không thể hoàn tác.`}
        showCancel={true}
        title='Xác nhận xóa phòng khám'
        type='error'
        onCancel={() => setShowDeleteModal(false)}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteClinic}
      />
    </>
  );
}
