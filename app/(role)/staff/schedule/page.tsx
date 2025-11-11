'use client';

import React, { useEffect, useState } from 'react';

import { Pagination, usePagination } from '@/components/pagination';
import { AppointmentList } from '@/components/appointment/appointment-list';
import { AppointmentDetailModal } from '@/components/appointment/appointment-detail-modal';
import { Appointment, FilterMode } from '@/types/appointment';

export default function StaffSchedulePage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [filterMode, setFilterMode] = useState<FilterMode>('today');

  // Pagination state
  const {
    currentPage,
    itemsPerPage,
    handlePageChange,
    handleItemsPerPageChange,
    resetPagination,
  } = usePagination(1, 10);

  // Ngày hiện tại dạng yyyy-mm-dd
  const today = new Date().toISOString().split('T')[0];

  // Fetch danh sách appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/appointments');

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        setAppointments(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Có lỗi xảy ra khi lấy danh sách lịch khám.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // Lọc danh sách theo chế độ
  const getFilteredAppointments = () => {
    if (filterMode === 'all') {
      return appointments;
    }

    if (filterMode === 'today') {
      return appointments.filter(a => {
        if (!a.appointment_date) {
          return false;
        }

        const date = new Date(a.appointment_date);

        if (isNaN(date.getTime())) {
          return false;
        }

        const appointmentDate = date.toISOString().split('T')[0];

        return appointmentDate === today;
      });
    }

    return appointments.filter(a => {
      if (!a.appointment_date) {
        return false;
      }

      const date = new Date(a.appointment_date);

      if (isNaN(date.getTime())) {
        return false;
      }

      const appointmentDate = date.toISOString().split('T')[0];

      return appointmentDate === selectedDate;
    });
  };

  const filteredAppointments = getFilteredAppointments();

  // Áp dụng pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAppointments = filteredAppointments.slice(
    startIndex,
    endIndex
  );

  // Khi chọn "Today" hoặc "All", cập nhật selectedDate về hôm nay
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
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filterMode === mode
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
                onClick={() => handleModeChange(mode)}
              >
                {mode === 'today' ? 'Hôm nay' : 'Tất cả'}
              </button>
            ))}
          </div>

          {/* Bộ chọn ngày thủ công */}
          <div className='flex items-center gap-2'>
            <label className='font-medium text-gray-700' htmlFor='selectedDate'>
              hoặc chọn ngày:
            </label>
            <input
              className='border border-gray-300 rounded-md px-3 py-1 text-gray-900 focus:ring-2 focus:ring-blue-400'
              id='selectedDate'
              type='date'
              value={selectedDate}
              onChange={e => {
                setSelectedDate(e.target.value);
                setFilterMode('custom');
                resetPagination(); // Reset về trang 1 khi thay đổi ngày
              }}
            />
          </div>
        </div>
      </div>

      {/* Danh sách lịch khám */}
      <AppointmentList
        appointments={paginatedAppointments}
        emptyMessage='Không có lịch khám nào.'
        error={error}
        loading={loading}
        onAppointmentClick={setSelectedAppointment}
      />

      {/* Pagination */}
      {filteredAppointments.length > 0 && (
        <div className='mt-6'>
          <Pagination
            className='bg-white p-4 rounded-lg shadow border border-gray-200'
            color='primary'
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            itemsPerPageOptions={[5, 10, 20, 50]}
            showFirstLast={true}
            showItemsPerPage={true}
            showTotal={true}
            size='md'
            totalItems={filteredAppointments.length}
            onItemsPerPageChange={handleItemsPerPageChange}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Modal chi tiết */}
      <AppointmentDetailModal
        appointment={selectedAppointment}
        isOpen={!!selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
      />
    </div>
  );
}
