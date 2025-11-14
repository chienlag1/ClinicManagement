'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

interface Bill {
  _id: string;
  billCode: string;
  patient: {
    _id: string;
    patient_id?: string;
    name: string;
    phone?: string;
  };
  prescription?: {
    _id: string;
    prescriptionCode: string;
  };
  appointment?: {
    _id: string;
    appointment_id: string;
  };
  description: string;
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'cancelled';
  paymentDate?: string;
  paymentOrderCode?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const TABLE_CONFIG = {
  columns: [
    {
      key: 'billCode' as any,
      label: 'Mã hóa đơn',
      render: (value: string, item: Bill) => (
        <a
          href={`/staff/billing/${item._id}`}
          className='text-blue-600 hover:underline font-semibold'
        >
          #{value || item._id.slice(-6)}
        </a>
      ),
    },
    {
      key: 'patient' as any,
      label: 'Bệnh nhân',
      render: (value: any) => value?.name || '',
    },
    {
      key: 'description' as any,
      label: 'Mô tả',
    },
    {
      key: 'totalAmount' as any,
      label: 'Tổng tiền',
      render: (value: number) => (
        <span className='font-semibold text-green-600'>
          {value?.toLocaleString('vi-VN')} đ
        </span>
      ),
    },
    {
      key: 'paymentStatus' as any,
      label: 'Trạng thái',
      render: (value: 'pending' | 'paid' | 'cancelled') => {
        const statusLabels = {
          pending: 'Chưa thanh toán',
          paid: 'Đã thanh toán',
          cancelled: 'Đã hủy',
        };
        const statusColors = {
          pending: 'bg-yellow-100 text-yellow-800',
          paid: 'bg-green-100 text-green-800',
          cancelled: 'bg-red-100 text-red-800',
        };
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[value] || statusColors.pending}`}
          >
            {statusLabels[value]}
          </span>
        );
      },
    },
    {
      key: 'paymentDate' as any,
      label: 'Ngày thanh toán',
      render: (value: string) => {
        if (!value) return <span className='text-gray-400'>-</span>;
        return new Date(value).toLocaleDateString('vi-VN');
      },
    },
    {
      key: 'createdAt' as any,
      label: 'Ngày tạo',
      render: (value: string) => new Date(value).toLocaleDateString('vi-VN'),
    },
  ],
  filterOptions: [
    { key: 'all', label: 'Tất cả' },
    { key: 'pending', label: 'Chưa thanh toán' },
    { key: 'paid', label: 'Đã thanh toán' },
    { key: 'cancelled', label: 'Đã hủy' },
  ],
};

export default function BillingPage() {
  const router = useRouter();
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [patientSearch, setPatientSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [patients, setPatients] = useState<
    Array<{ _id: string; name: string; patient_id?: string }>
  >([]);

  const [filteredData, setFilteredData] = useState<Bill[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValue, setFilterValue] = useState('all');

  // Fetch bills
  useEffect(() => {
    fetchBills();
  }, [filterValue, selectedPatientId, dateFrom, dateTo]);

  const fetchBills = async () => {
    try {
      setIsLoading(true);
      const params: any = {
        page: 1,
        limit: 100,
      };

      if (filterValue && filterValue !== 'all') {
        params.status = filterValue;
      }

      if (selectedPatientId) {
        params.patientId = selectedPatientId;
      }

      if (dateFrom) {
        params.from = dateFrom;
      }

      if (dateTo) {
        params.to = dateTo;
      }

      console.log('Billing - Fetching bills with params:', params);
      const response = await axios.get('/api/bills', { params });
      console.log('Billing - API response:', {
        status: response.status,
        data: response.data,
        items: response.data?.items,
        total: response.data?.total,
      });

      const items = response.data?.items || response.data || [];
      console.log('Billing - Setting bills:', items.length, 'items');
      setBills(items);
      // filteredData will be updated by useEffect that filters by searchTerm
    } catch (error) {
      console.error('Billing - Error fetching bills:', error);
      if (axios.isAxiosError(error)) {
        console.error('Billing - Error response:', error.response?.data);
        console.error('Billing - Error status:', error.response?.status);
      }
      setBills([]);
      setFilteredData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Sync bills from prescriptions on mount (only once)
  useEffect(() => {
    const syncBills = async () => {
      try {
        // Kiểm tra xem có bills không
        const checkResponse = await axios.get('/api/bills', {
          params: { page: 1, limit: 1 },
        });
        const hasBills =
          (checkResponse.data?.items || checkResponse.data || []).length > 0;

        if (!hasBills) {
          console.log(
            'Billing - No bills found, syncing from prescriptions...'
          );
          const syncResponse = await axios.post('/api/bills/sync');
          console.log('Billing - Sync result:', syncResponse.data);
          // Fetch lại sau khi sync
          fetchBills();
        }
      } catch (error) {
        console.error('Billing - Error syncing bills:', error);
        // Không block UI nếu sync fail
      }
    };

    syncBills();
  }, []); // Chỉ chạy 1 lần khi component mount

  // Fetch patients for search
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await axios.get('/api/patients', {
          params: { page: 1, limit: 100 },
        });
        const items = response.data?.items || response.data || [];
        setPatients(items);
      } catch (error) {
        console.error('Error fetching patients:', error);
      }
    };
    fetchPatients();
  }, []);

  // Filter bills based on search term (client-side)
  useEffect(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      setFilteredData(bills);
      return;
    }

    const filtered = bills.filter(bill => {
      return [
        bill.billCode,
        bill.patient?.name,
        bill.patient?.patient_id,
        bill.description,
      ]
        .filter(Boolean)
        .some(v => String(v).toLowerCase().includes(term));
    });
    setFilteredData(filtered);
  }, [searchTerm, bills]);

  const handleBillClick = (bill: Bill) => {
    router.push(`/staff/billing/${bill._id}`);
  };

  const handleClearFilters = () => {
    setSelectedPatientId('');
    setDateFrom('');
    setDateTo('');
    setFilterValue('all');
    setSearchTerm('');
  };

  // Calculate statistics
  const totalBills = bills.length;
  const paidBills = bills.filter(b => b.paymentStatus === 'paid').length;
  const pendingBills = bills.filter(b => b.paymentStatus === 'pending').length;
  const totalRevenue = bills
    .filter(b => b.paymentStatus === 'paid')
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  return (
    <div className='container mx-auto py-6 space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>Quản lý Hóa đơn</h1>
          <p className='text-gray-600 mt-1'>
            Xem và quản lý các hóa đơn thanh toán
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <div className='bg-white rounded-lg shadow p-4'>
          <div className='text-sm text-gray-600'>Tổng hóa đơn</div>
          <div className='text-2xl font-bold mt-1'>{totalBills}</div>
        </div>
        <div className='bg-white rounded-lg shadow p-4'>
          <div className='text-sm text-gray-600'>Đã thanh toán</div>
          <div className='text-2xl font-bold text-green-600 mt-1'>
            {paidBills}
          </div>
        </div>
        <div className='bg-white rounded-lg shadow p-4'>
          <div className='text-sm text-gray-600'>Chưa thanh toán</div>
          <div className='text-2xl font-bold text-yellow-600 mt-1'>
            {pendingBills}
          </div>
        </div>
        <div className='bg-white rounded-lg shadow p-4'>
          <div className='text-sm text-gray-600'>Tổng doanh thu</div>
          <div className='text-2xl font-bold text-blue-600 mt-1'>
            {totalRevenue.toLocaleString('vi-VN')} đ
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className='bg-white rounded-lg shadow p-4 space-y-4'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <div>
            <label htmlFor='search' className='block text-sm font-medium mb-2'>Tìm kiếm</label>
            <Input
              id='search'
              placeholder='Mã hóa đơn, tên bệnh nhân...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor='patient' className='block text-sm font-medium mb-2'>Bệnh nhân</label>
            <Select
              id='patient'
              value={selectedPatientId}
              onChange={e => setSelectedPatientId(e.target.value)}
            >
              <option value=''>Tất cả</option>
              {patients.map(patient => (
                <option key={patient._id} value={patient._id}>
                  {patient.name} ({patient.patient_id || patient._id.slice(-6)})
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label htmlFor='status' className='block text-sm font-medium mb-2'>Trạng thái</label>
            <Select
              id='status'
              value={filterValue}
              onChange={e => setFilterValue(e.target.value)}
            >
              {TABLE_CONFIG.filterOptions.map(option => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label htmlFor='dateFrom' className='block text-sm font-medium mb-2'>Từ ngày</label>
            <Input
              id='dateFrom'
              type='date'
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
            />
          </div>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <div>
            <label htmlFor='dateTo' className='block text-sm font-medium mb-2'>Đến ngày</label>
            <Input
              id='dateTo'
              type='date'
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
            />
          </div>
          <div className='flex items-end'>
            <Button
              variant='outline'
              onClick={handleClearFilters}
              className='w-full'
            >
              Xóa bộ lọc
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className='bg-white rounded-lg shadow'>
        {isLoading ? (
          <div className='flex items-center justify-center py-8'>
            <Icon
              className='w-6 h-6 animate-spin mr-2'
              icon='lucide:loader-2'
            />
            <p className='text-gray-500'>Đang tải...</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className='text-center py-8'>
            <Icon
              className='w-12 h-12 text-gray-400 mx-auto mb-4'
              icon='lucide:credit-card'
            />
            <p className='text-gray-500'>Không có hóa đơn nào</p>
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className='bg-gray-50 border-b'>
                <tr>
                  {TABLE_CONFIG.columns.map(col => (
                    <th
                      key={String(col.key)}
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {filteredData.map(bill => (
                  <tr
                    key={bill._id}
                    className='hover:bg-gray-50 cursor-pointer'
                    onClick={() => handleBillClick(bill)}
                  >
                    {TABLE_CONFIG.columns.map(col => (
                      <td
                        key={String(col.key)}
                        className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'
                      >
                        {col.render
                          ? col.render(
                              (bill as Record<string, any>)[col.key],
                              bill
                            )
                          : String(
                              (bill as Record<string, any>)[col.key] || ''
                            )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
