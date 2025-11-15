'use client';

import { IPrescription } from '@/models/Prescription';
import {
  CRUDTemplate,
  useCRUD,
  crudUtils,
  CRUDModal,
  CRUDField,
} from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import MedicineSelector from '@/components/prescription/MedicineSelector';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

// Table configuration
const TABLE_CONFIG = {
  columns: [
    {
      key: 'prescriptionCode' as any,
      label: 'Mã đơn',
      render: (value: string, item: any) => (
        <a
          href={`/staff/prescriptions/${item._id}`}
          className='text-blue-600 hover:underline font-semibold'
        >
          #{value || item._id.slice(-6)}
        </a>
      ),
    },
    {
      key: 'patient' as any,
      label: 'Bệnh nhân',
      render: (value: any) => value?.fullName || value?.name || '',
    },
    {
      key: 'diagnosis' as any,
      label: 'Chẩn đoán',
    },
    {
      key: 'status' as any,
      label: 'Trạng thái',
      render: (value: 'active' | 'completed' | 'cancelled') => {
        const statusLabels = {
          active: 'Đang xử lý',
          completed: 'Đã hoàn thành',
          cancelled: 'Đã hủy',
        };
        return (
          <span className={crudUtils.getStatusColor(value)}>
            {statusLabels[value]}
          </span>
        );
      },
    },
  ],
  filterOptions: [
    { key: 'active', label: 'Đang xử lý' },
    { key: 'completed', label: 'Đã hoàn thành' },
    { key: 'cancelled', label: 'Đã hủy' },
  ],
};

// Types
type PrescriptionWithId = IPrescription & {
  _id: string;
  patient: {
    _id: string;
    fullName?: string;
    name?: string;
  };
};

type FormOptions = {
  patients: Array<{ id: string; fullName: string }>;
  medicines: Array<{ id: string; name: string }>;
};

// Page component
export default function PrescriptionsPage() {
  const router = useRouter();
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
    handleAdd,
    handleEdit,
    handleDelete,
  } = useCRUD<PrescriptionWithId>();

  // Dropdown options state
  const [formOptions, setFormOptions] = useState<FormOptions>({
    patients: [],
    medicines: [],
  });

  // Local loading state for modal save
  const [isLoading, setIsLoading] = useState(false);

  // Fetch prescriptions
  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const response = await fetch('/api/prescriptions');
        const result = await response.json();
        setFilteredData(result.prescriptions || []);
      } catch (error) {
        console.error('Error fetching prescriptions:', error);
        setFilteredData([]);
      }
    };

    fetchPrescriptions();
  }, [setFilteredData]);

  // Apply filter when filterValue changes
  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const response = await fetch('/api/prescriptions');
        const result = await response.json();
        const allPrescriptions = result.prescriptions || [];

        // Apply filter
        if (filterValue && filterValue !== 'all') {
          const filtered = allPrescriptions.filter(
            (p: PrescriptionWithId) => p.status === filterValue
          );
          setFilteredData(filtered);
        } else {
          setFilteredData(allPrescriptions);
        }
      } catch (error) {
        console.error('Error fetching prescriptions:', error);
        setFilteredData([]);
      }
    };

    fetchPrescriptions();
  }, [filterValue, setFilteredData]);

  // Fetch dropdown options
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [patientsRes, medicinesRes] = await Promise.all([
          fetch('/api/patients'),
          fetch('/api/medicines'),
        ]);

        const [patientsData, medicinesData] = await Promise.all([
          patientsRes.json(),
          medicinesRes.json(),
        ]);

        setFormOptions({
          patients: (patientsData.patients || []).map((p: any) => ({
            id: p._id,
            fullName: p.name || p.fullName,
          })),
          medicines: (medicinesData.medicines || []).map((m: any) => ({
            id: m._id,
            name: m.medicine_name,
          })),
        });
      } catch (error) {
        console.error('Error fetching options:', error);
      }
    };

    fetchOptions();
  }, []);

  // Form fields - Không có trường trạng thái vì mặc định là "Đang xử lý"
  const formFields: CRUDField<PrescriptionWithId>[] = [
    {
      key: 'patient',
      label: 'Bệnh nhân',
      type: 'select',
      required: true,
      options: formOptions.patients.map(p => ({
        key: p.id,
        label: p.fullName,
      })),
    },
    {
      key: 'diagnosis',
      label: 'Chẩn đoán',
      type: 'text',
      required: true,
    },
    {
      key: 'medicines',
      label: 'Danh sách thuốc',
      type: 'custom',
      required: true,
      render: (value: any, onChange: (value: any) => void) => (
        <MedicineSelector
          value={value || []}
          onChange={onChange}
          medicines={formOptions.medicines}
        />
      ),
    },
    {
      key: 'notes',
      label: 'Ghi chú',
      type: 'custom',
      required: false,
      render: (value: any, onChange: (value: any) => void) => (
        <Textarea
          value={value || ''}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            onChange(e.target.value)
          }
          placeholder='Nhập ghi chú thêm...'
        />
      ),
    },
  ];

  // Save handler
  const handleSave = async (formData: any) => {
    setIsLoading(true);
    try {
      const url = editingItem
        ? `/api/prescriptions/${editingItem._id}`
        : '/api/prescriptions';
      const method = editingItem ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save prescription');
      }

      // Refresh data
      const listResponse = await fetch('/api/prescriptions');
      const listData = await listResponse.json();
      setFilteredData(listData.prescriptions || []);

      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving prescription:', error);
      alert('Có lỗi xảy ra khi lưu đơn thuốc');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete handler
  const handleDeletePrescription = async (item: PrescriptionWithId) => {
    if (!confirm('Bạn có chắc muốn xóa đơn thuốc này?')) return;

    try {
      const response = await fetch(`/api/prescriptions/${item._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');

      // Refresh data
      const listResponse = await fetch('/api/prescriptions');
      const listData = await listResponse.json();
      setFilteredData(listData.prescriptions || []);
    } catch (error) {
      console.error('Error deleting prescription:', error);
      alert('Có lỗi xảy ra khi xóa đơn thuốc');
    }
  };

  // Edit handler - redirect to edit page
  const handleEditPrescription = (item: PrescriptionWithId) => {
    router.push(`/staff/prescriptions/${item._id}/edit`);
  };

  return (
    <div className='p-8'>
      <CRUDTemplate<PrescriptionWithId>
        title='Quản lý đơn thuốc'
        description='Quản lý tất cả đơn thuốc của bệnh nhân'
        data={filteredData || []}
        filteredData={filteredData || []}
        columns={TABLE_CONFIG.columns}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterValue={filterValue}
        setFilterValue={setFilterValue}
        filterOptions={TABLE_CONFIG.filterOptions}
        searchFields={['diagnosis', 'notes'] as any}
        onEdit={handleEditPrescription}
        onDelete={handleDeletePrescription}
        onView={item => router.push(`/staff/prescriptions/${item._id}`)}
      />

      <CRUDModal<PrescriptionWithId>
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Chỉnh sửa đơn thuốc' : 'Thêm đơn thuốc mới'}
        fields={formFields}
        data={editingItem || ({} as PrescriptionWithId)}
        onSave={handleSave}
        isLoading={isLoading}
      />
    </div>
  );
}
