'use client';

// Note: cleaned up modal/form state and removed duplicate/malformed fragments
// to resolve earlier TypeScript "Expression expected" / "Declaration expected" errors.

import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';

import { CRUDTemplate, useCRUD, crudUtils } from '@/components/DataTable';
import { IPrescription } from '@/models/Prescription';

// Table configuration
const TABLE_CONFIG = {
  columns: [
    {
      key: '_id',
      label: 'Mã đơn',
      render: (value: string) => (
        <a
          className='text-blue-600 hover:underline'
          href={`/doctor/prescriptions/${value}`}
        >
          {value}
        </a>
      ),
    },
    {
      key: 'patient',
      label: 'Bệnh nhân',
      render: (value: any) => value?.fullName || '',
    },
    {
      key: 'diagnosis',
      label: 'Chẩn đoán',
    },
    {
      key: 'status',
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
    fullName: string;
  };
};

type FormOptions = {
  patients: Array<{ id: string; fullName: string }>;
  medicines: Array<{ id: string; name: string }>;
};

type ModalState = {
  isOpen: boolean;
  editingItem: PrescriptionWithId | null;
  isLoading: boolean;
};

// Page component
export default function PrescriptionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const [prescriptions, setPrescriptions] = useState<PrescriptionWithId[]>([]);
  const {
    data: crudData,
    filteredData,
    setFilteredData,
    searchTerm,
    setSearchTerm,
    filterValue,
    setFilterValue,
    handleDelete,
  } = useCRUD<PrescriptionWithId>(prescriptions);

  const [loading, setLoading] = useState(true);

  // Fetch prescriptions data
  useEffect(() => {
    const fetchPrescriptions = async () => {
      setLoading(true);
      try {
        const url = user?.id
          ? `/api/prescriptions?doctorId=${user.id}`
          : '/api/prescriptions';
        const response = await fetch(url);

        if (response.ok) {
          const result = await response.json();
          const prescriptionsData = result.prescriptions || [];

          // Transform data to match PrescriptionWithId type
          const transformedData: PrescriptionWithId[] = prescriptionsData.map(
            (p: any) => ({
              ...p,
              _id: p._id || p.id,
              patient:
                typeof p.patient === 'object' && p.patient
                  ? {
                      _id: p.patient._id || p.patient.id || '',
                      fullName: p.patient.name || p.patient.fullName || 'N/A',
                    }
                  : { _id: '', fullName: 'N/A' },
            })
          );

          setPrescriptions(transformedData);
        }
      } catch (error) {
        console.error('Error fetching prescriptions:', error);
      } finally {
        setLoading(false);
        // Remove refresh param after fetch
        if (searchParams.get('refresh')) {
          router.replace('/doctor/prescriptions');
        }
      }
    };

    fetchPrescriptions();
  }, [user?.id, searchParams.get('refresh'), router]);

  // Filter and search logic
  useEffect(() => {
    let filtered = [...prescriptions];

    // Apply status filter
    if (filterValue && filterValue !== 'all') {
      filtered = filtered.filter(item => item.status === filterValue);
    }

    // Apply search
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();

      filtered = filtered.filter(item => {
        // Search in _id and diagnosis
        const matchesId = item._id?.toLowerCase().includes(searchLower);
        const matchesDiagnosis = item.diagnosis
          ?.toLowerCase()
          .includes(searchLower);
        const matchesPatient =
          typeof item.patient === 'object'
            ? item.patient.fullName?.toLowerCase().includes(searchLower)
            : false;

        return matchesId || matchesDiagnosis || matchesPatient;
      });
    }

    setFilteredData(filtered);
  }, [prescriptions, filterValue, searchTerm, setFilteredData]);

  // Navigate to form page for add
  const handleAdd = () => {
    router.push('/doctor/prescriptions/form');
  };

  // Navigate to form page for edit
  const handleEdit = (item: PrescriptionWithId) => {
    router.push(`/doctor/prescriptions/form?id=${item._id}`);
  };

  // Delete prescription with API call
  const handleDeleteWithApi = async (item: PrescriptionWithId) => {
    const id = item._id;

    if (!id) return;
    const confirmed = window.confirm('Bạn có chắc muốn xóa đơn thuốc này?');

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/prescriptions/${id}`, { method: 'DELETE' });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));

        throw new Error(err?.error || 'Xóa thất bại');
      }
      // Remove from local list
      setPrescriptions(prev => prev.filter(p => p._id !== id));
      // Also update filtered view immediately
      setFilteredData(prev => prev.filter(p => (p as any)._id !== id));
    } catch (e) {
      console.error('Delete prescription failed:', e);
      alert('Xóa đơn thuốc thất bại');
    }
  };

  // Render
  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='text-center'>
          <Icon
            className='w-8 h-8 animate-spin mx-auto mb-4 text-primary'
            icon='lucide:loader-2'
          />
          <p className='text-gray-500'>Đang tải danh sách đơn thuốc...</p>
        </div>
      </div>
    );
  }

  return (
    <CRUDTemplate
      addButtonText='Kê đơn mới'
      columns={TABLE_CONFIG.columns as any}
      data={prescriptions as any[]}
      description='Quản lý danh sách đơn thuốc của bệnh nhân'
      filterOptions={TABLE_CONFIG.filterOptions}
      filterPlaceholder='Lọc theo trạng thái'
      filterValue={filterValue}
      filteredData={filteredData as any[]}
      searchFields={['_id', 'diagnosis'] as Array<keyof PrescriptionWithId>}
      searchPlaceholder='Tìm kiếm theo mã đơn hoặc chẩn đoán...'
      searchTerm={searchTerm}
      setFilterValue={setFilterValue}
      setSearchTerm={setSearchTerm}
      title='Quản lý đơn thuốc'
      onAdd={handleAdd}
      onDelete={handleDeleteWithApi}
      onEdit={handleEdit}
      onView={item => router.push(`/doctor/prescriptions/${item._id}`)}
    />
  );
}