'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';

import {
  CRUDTemplate,
  CRUDModal,
  useCRUD,
  crudUtils,
  CRUDColumn,
  CRUDField,
} from '@/components/crud-template';
import { NotificationModal } from '@/components/notification-popup';

// Kiểu dữ liệu patient (khớp với model Patient)
export interface Patient {
  _id?: string;
  patient_id: string;
  id_card: string;
  name: string;
  gender: 'male' | 'female';
  birth_date: string; // dùng string để binding form
  phone: string;
  address: string;
  createdAt?: string;
  updatedAt?: string;
}

const GENDER_OPTIONS = [
  { key: 'male', label: 'Nam', color: 'bg-blue-100 text-blue-800' },
  { key: 'female', label: 'Nữ', color: 'bg-pink-100 text-pink-800' },
];

export default function PatientManagerNew() {
  const [patients, setPatients] = useState<Patient[]>([]);
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
  } = useCRUD<Patient>(patients);

  // Fetch patients
  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    setFilteredData(patients);
  }, [patients, setFilteredData]);

  useEffect(() => {
    const filtered = crudUtils.filterData(
      patients,
      searchTerm,
      filterValue,
      ['name', 'phone', 'patient_id', 'id_card'],
      'gender'
    );
    setFilteredData(filtered);
  }, [searchTerm, filterValue, patients, setFilteredData]);

  const fetchPatients = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get('/api/patients');
      setPatients(res.data.items || res.data); // API patients trả về {items, total} → lấy items
    } catch {
      showError('Lỗi', 'Không thể tải danh sách bệnh nhân.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePatient = async (patientData: Patient) => {
    try {
      setIsLoading(true);

      const payload = {
        ...patientData,
        birth_date: new Date(patientData.birth_date).toISOString(),
      };

      if (editingItem) {
        // Update
        const res = await axios.put(
          `/api/patients/${editingItem._id}`,
          payload
        );
        setPatients(
          patients.map(p => (p._id === editingItem._id ? res.data : p))
        );
        showSuccess('Thành công', 'Cập nhật bệnh nhân thành công!');
      } else {
        // Create
        const res = await axios.post('/api/patients', payload);
        setPatients([...patients, res.data]);
        showSuccess('Thành công', 'Thêm bệnh nhân mới thành công!');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      if (err?.response?.status === 409) {
        showError('Lỗi', 'Số điện thoại đã tồn tại!');
      } else {
        showError('Lỗi', 'Không thể lưu bệnh nhân.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePatient = async () => {
    if (!deletingItem?._id) return;
    try {
      setIsLoading(true);
      await axios.delete(`/api/patients/${deletingItem._id}`);
      setPatients(patients.filter(p => p._id !== deletingItem._id));
      showSuccess('Thành công', 'Xóa bệnh nhân thành công!');
      setShowDeleteModal(false);
    } catch {
      showError('Lỗi', 'Không thể xóa bệnh nhân.');
    } finally {
      setIsLoading(false);
    }
  };

  // Cột hiển thị
  const columns: CRUDColumn<Patient>[] = [
    {
      key: 'patient_id',
      label: 'Mã bệnh nhân',
      render: value => <span className='font-medium'>{value}</span>,
    },
    {
      key: 'id_card',
      label: 'Số CMND/CCCD',
      render: value => <span className='font-medium'>{value}</span>,
    },
    { key: 'name', label: 'Họ tên' },
    {
      key: 'gender',
      label: 'Giới tính',
      render: value => {
        const genderInfo = GENDER_OPTIONS.find(g => g.key === value);
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${genderInfo?.color || 'bg-gray-100 text-gray-600'}`}
          >
            {genderInfo?.label || value}
          </span>
        );
      },
    },
    {
      key: 'birth_date',
      label: 'Ngày sinh',
      render: value => dayjs(value).format('DD/MM/YYYY'),
    },
    { key: 'phone', label: 'Số điện thoại' },
    { key: 'address', label: 'Địa chỉ' },
  ];

  // Trường form
  const fields: CRUDField<Patient>[] = [
    {
      key: 'patient_id',
      label: 'Mã bệnh nhân',
      type: 'text',
      placeholder: 'Nhập mã bệnh nhân',
      required: true,
    },
    {
      key: 'id_card',
      label: 'Số CMND/CCCD',
      type: 'text',
      placeholder: 'Nhập số CMND/CCCD',
      required: true,
    },
    {
      key: 'name',
      label: 'Họ tên',
      type: 'text',
      placeholder: 'Nhập họ tên',
      required: true,
    },
    {
      key: 'gender',
      label: 'Giới tính',
      type: 'select',
      required: true,
      options: GENDER_OPTIONS,
      placeholder: 'Chọn giới tính',
    },
    {
      key: 'birth_date',
      label: 'Ngày sinh',
      type: 'date',
      required: true,
    },
    {
      key: 'phone',
      label: 'Số điện thoại',
      type: 'text',
      placeholder: 'Nhập số điện thoại',
      required: true,
    },
    {
      key: 'address',
      label: 'Địa chỉ',
      type: 'text',
      placeholder: 'Nhập địa chỉ',
      required: true,
    },
  ];

  return (
    <>
      <CRUDTemplate
        addButtonText='Thêm bệnh nhân'
        columns={columns}
        data={data}
        description='Quản lý thông tin bệnh nhân'
        emptyStateIcon='lucide:user'
        emptyStateMessage='Không tìm thấy bệnh nhân nào'
        filterOptions={GENDER_OPTIONS}
        filterPlaceholder='Lọc theo giới tính'
        filterValue={filterValue}
        filteredData={filteredData}
        searchFields={['name', 'phone', 'patient_id', 'id_card']}
        searchPlaceholder='Tìm kiếm bệnh nhân...'
        searchTerm={searchTerm}
        setFilterValue={setFilterValue}
        setSearchTerm={setSearchTerm}
        title='Quản lý Bệnh nhân'
        onAdd={handleAdd}
        onDelete={handleDelete}
        onEdit={handleEdit}
      />

      {/* Modal thêm/sửa */}
      <CRUDModal
        data={editingItem || ({} as Patient)}
        fields={fields}
        isLoading={isLoading}
        isOpen={isModalOpen}
        title={editingItem ? 'Chỉnh sửa Bệnh nhân' : 'Thêm Bệnh nhân Mới'}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePatient}
      />

      {/* Modal xóa */}
      <NotificationModal
        cancelText='Hủy'
        confirmText='Xóa'
        isOpen={showDeleteModal}
        message={`Bạn có chắc muốn xóa bệnh nhân "${deletingItem?.name}" không?`}
        showCancel={true}
        title='Xác nhận xóa bệnh nhân'
        type='error'
        onCancel={() => setShowDeleteModal(false)}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeletePatient}
      />
    </>
  );
}
