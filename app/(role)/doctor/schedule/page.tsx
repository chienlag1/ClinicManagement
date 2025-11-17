'use client';

import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Button } from '@heroui/button';
import { Calendar } from 'lucide-react';
import { Pagination, usePagination } from '@/components/pagination';

import { AppointmentList } from '@/components/appointment/appointment-list';
import { AppointmentDetailModal } from '@/components/appointment/appointment-detail-modal';
import { Appointment, FilterMode } from '@/types/appointment';

export default function SchedulePage() {
  const { user } = useUser();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [filterMode, setFilterMode] = useState<FilterMode>('today');

  // Helper to ensure appointments is always an array
  const getAppointmentsArray = (): Appointment[] => {
    if (!Array.isArray(appointments)) {
      console.warn(
        'appointments state is not an array, returning empty array',
        appointments
      );
      return [];
    }
    return appointments;
  };

  // Wrapper to ensure setAppointments always receives an array
  const setAppointmentsSafe = useCallback((value: Appointment[] | unknown) => {
    if (Array.isArray(value)) {
      setAppointments(value);
    } else {
      console.error(
        'Attempted to set appointments to non-array value. Type:',
        typeof value,
        'Value:',
        value
      );
      setAppointments([]);
    }
  }, []);

  // Pagination state
  const {
    currentPage,
    itemsPerPage,
    handlePageChange,
    handleItemsPerPageChange,
    resetPagination,
  } = usePagination(1, 10);

  const dateInputRef = useRef<HTMLInputElement>(null);

  // Helper function to format date to YYYY-MM-DD in local timezone
  const formatDateLocal = useCallback((date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  // ✅ Ngày hiện tại dạng yyyy-mm-dd (local timezone) - tính trong useMemo để tránh thay đổi
  const today = useMemo(() => formatDateLocal(new Date()), [formatDateLocal]);

  // ✅ Fetch danh sách appointments
  useEffect(() => {
    if (!user) return;

    setLoading(true);
    // Sử dụng clerkUserId của user hiện tại làm doctor_id
    const doctorId = user.id; // clerkUserId

    fetch(`/api/appointments/${doctorId}`)
      .then(async res => {
        // Check if response is ok
        if (!res.ok) {
          const errorData = await res
            .json()
            .catch(() => ({ error: 'Unknown error' }));
          console.error('API Response not OK:', res.status, errorData);
          setAppointmentsSafe([]);
          setLoading(false);
          return;
        }

        // Parse JSON response
        const data = await res.json();

        // Debug: Log appointments để kiểm tra
        console.log('Fetched appointments:', data.length, 'appointments');
        if (data.length > 0) {
          console.log('Sample appointment:', {
            appointment_id: data[0].appointment_id,
            appointment_date: data[0].appointment_date,
            formatted_date: formatDateLocal(data[0].appointment_date),
          });
        }
        console.log('Today (local):', today);

        // Ensure data is always an array using safe setter
        setAppointmentsSafe(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Fetch error:', err);
        setAppointmentsSafe([]);
        setLoading(false);
      });
  }, [user, setAppointmentsSafe, today, formatDateLocal]);

  // Status colors are imported from shared types

  // ✅ Lọc danh sách theo chế độ - sử dụng useMemo để đảm bảo tính toán đúng
  const filteredAppointments = useMemo((): Appointment[] => {
    // Safety check: ensure appointments is always an array
    const appointmentsArray = Array.isArray(appointments) ? appointments : [];

    if (!Array.isArray(appointmentsArray)) {
      console.error('appointments is not an array:', appointments);
      return [];
    }

    if (filterMode === 'all') return appointmentsArray;
    if (filterMode === 'today') {
      const todayLocal = formatDateLocal(new Date());
      const filtered = appointmentsArray.filter(a => {
        if (!a.appointment_date) {
          return false;
        }
        const date = new Date(a.appointment_date);
        if (isNaN(date.getTime())) {
          return false;
        }
        const appointmentDate = formatDateLocal(date);
        return appointmentDate === todayLocal;
      });
      return filtered;
    }
    return appointmentsArray.filter(a => {
      if (!a.appointment_date) return false;
      const date = new Date(a.appointment_date);
      if (isNaN(date.getTime())) return false;
      const appointmentDate = formatDateLocal(date);
      return appointmentDate === selectedDate;
    });
  }, [appointments, filterMode, selectedDate, formatDateLocal]);

  // Áp dụng pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAppointments = filteredAppointments.slice(
    startIndex,
    endIndex
  );

  // ✅ Khi chọn "Today" hoặc "All", cập nhật selectedDate về hôm nay
  const handleModeChange = (mode: FilterMode) => {
    setFilterMode(mode);
    if (mode === 'today' || mode === 'all') {
      setSelectedDate(today);
    }
    resetPagination(); // Reset về trang 1 khi thay đổi filter
  };

  return (
    <div className='p-6 space-y-6'>
      <h1 className='text-3xl font-bold text-gray-900 mb-4'>
        Danh sách lịch khám
      </h1>

      {/* Bộ lọc ngày */}
      <div className='bg-white rounded-lg shadow p-4 border border-gray-200'>
        <div className='flex flex-wrap gap-3 items-center justify-between'>
          {/* Nút chọn nhanh */}
          <div className='flex flex-wrap gap-2'>
            {(['today', 'all'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => handleModeChange(mode)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filterMode === mode
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {mode === 'today' ? 'Today' : 'All'}
              </button>
            ))}
          </div>

          {/* Bộ chọn ngày thủ công */}
          <div className='flex items-center gap-2'>
            <label htmlFor='selectedDate' className='font-medium text-gray-700'>
              or pick date:
            </label>

            <div className='relative flex items-center'>
              {/* Input chọn ngày */}
              <input
                ref={dateInputRef}
                id='selectedDate'
                type='date'
                className='border border-gray-300 rounded-md pl-3 pr-8 py-1 text-gray-900 focus:ring-2 focus:ring-blue-400 cursor-pointer'
                value={selectedDate}
                onChange={e => {
                  setSelectedDate(e.target.value);
                  setFilterMode('custom');
                }}
              />

              {/* Icon lịch — nằm bên phải */}
              <Calendar
                className='absolute right-2 text-gray-500 w-4 h-4 cursor-pointer hover:text-blue-500 transition'
                onClick={() => dateInputRef.current?.showPicker()} // 👈 mở date picker
              />
            </div>
          </div>
        </div>
      </div>

      {/* Danh sách lịch hẹn */}
      {loading && <p>Loading...</p>}
      {!loading && filteredAppointments.length === 0 && (
        <p>No appointments found for this selection.</p>
      )}

      {/* Danh sách lịch khám */}
      <AppointmentList
        appointments={paginatedAppointments}
        loading={loading}
        error={null}
        onAppointmentClick={setSelected}
        emptyMessage='No appointments found for this selection.'
      />

      {/* Pagination */}
      {filteredAppointments.length > 0 && (
        <div className='mt-6'>
          <Pagination
            totalItems={filteredAppointments.length}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
            itemsPerPageOptions={[5, 10, 20, 50]}
            showTotal={true}
            showItemsPerPage={true}
            showFirstLast={true}
            size='md'
            color='primary'
            className='bg-white p-4 rounded-lg shadow border border-gray-200'
          />
        </div>
      )}

      {/* Modal chi tiết */}
      <AppointmentDetailModal
        appointment={selected}
        isOpen={!!selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
