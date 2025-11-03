'use client';

import React, { useEffect, useState, useRef } from 'react';
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

  // Pagination state
  const {
    currentPage,
    itemsPerPage,
    handlePageChange,
    handleItemsPerPageChange,
    resetPagination,
  } = usePagination(1, 10);

  const dateInputRef = useRef<HTMLInputElement>(null);

  // ✅ Ngày hiện tại dạng yyyy-mm-dd
  const today = new Date().toISOString().split('T')[0];

  // ✅ Fetch danh sách appointments
  useEffect(() => {
    if (!user) return;

    setLoading(true);
    // Tạm thời sử dụng doctor_id cố định, sau này có thể lấy từ user profile
    const doctorId = '1'; // Thay bằng doctor_id thực tế của user

    fetch(`/api/appointments/${doctorId}`)
      .then(res => res.json())
      .then(data => {
        setAppointments(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [user]);

  // Status colors are imported from shared types

  // ✅ Lọc danh sách theo chế độ
  const getFilteredAppointments = () => {
    if (filterMode === 'all') return appointments;
    if (filterMode === 'today') {
      return appointments.filter(a => {
        if (!a.appointment_date) return false;
        const date = new Date(a.appointment_date);
        if (isNaN(date.getTime())) return false;
        const appointmentDate = date.toISOString().split('T')[0];
        return appointmentDate === today;
      });
    }
    return appointments.filter(a => {
      if (!a.appointment_date) return false;
      const date = new Date(a.appointment_date);
      if (isNaN(date.getTime())) return false;
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
