'use client';

import React from 'react';
import { Icon } from '@iconify/react';
import { Appointment, statusColors, getStatusLabel } from '@/types/appointment';

interface AppointmentListProps {
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
  onAppointmentClick: (appointment: Appointment) => void;
  emptyMessage?: string;
}

export function AppointmentList({
  appointments,
  loading,
  error,
  onAppointmentClick,
  emptyMessage = 'Không có lịch khám nào.',
}: AppointmentListProps) {
  if (loading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <Icon icon='lucide:loader-2' className='w-6 h-6 animate-spin mr-2' />
        <p className='text-gray-500'>Đang tải...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='text-center py-8'>
        <Icon
          icon='lucide:alert-circle'
          className='w-8 h-8 text-red-500 mx-auto mb-2'
        />
        <p className='text-red-500'>{error}</p>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className='text-center py-8'>
        <Icon
          icon='lucide:calendar-x'
          className='w-12 h-12 text-gray-400 mx-auto mb-4'
        />
        <p className='text-gray-500'>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className='space-y-3'>
      {appointments.map((appointment, index) => (
        <div
          key={appointment._id || index}
          className='flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors'
        >
          <div className='flex items-center gap-4'>
            <div className='text-sm font-medium text-gray-900 w-20'>
              {appointment.appointment_time ||
                new Date(appointment.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
            </div>
            <div className='flex-1'>
              <div className='flex items-center gap-2 mb-1'>
                <p className='font-medium text-gray-900'>
                  {typeof appointment.patient_id === 'object'
                    ? appointment.patient_id?.name
                    : `Patient ${index + 1}`}
                </p>
                {appointment.priority && (
                  <span className='px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium'>
                    Ưu tiên
                  </span>
                )}
              </div>
              <p className='text-sm text-gray-600'>
                Bác sĩ ID:{' '}
                {typeof appointment.doctor_id === 'object'
                  ? appointment.doctor_id?.doctor_id
                  : appointment.doctor_id}
              </p>
              <p className='text-xs text-gray-500'>
                {appointment.symptoms
                  ? appointment.symptoms.substring(0, 60) +
                    (appointment.symptoms.length > 60 ? '...' : '')
                  : 'Không có triệu chứng'}
              </p>
              <p className='text-xs text-gray-400 mt-1'>
                {appointment.appointment_date
                  ? (() => {
                      const date = new Date(appointment.appointment_date);
                      return isNaN(date.getTime())
                        ? 'Ngày không hợp lệ'
                        : date.toLocaleDateString('vi-VN');
                    })()
                  : 'Chưa xác định ngày'}
              </p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[appointment.status] || 'bg-gray-200'}`}
            >
              {getStatusLabel(appointment.status)}
            </span>
            <button
              onClick={() => onAppointmentClick(appointment)}
              className='px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs transition-colors'
            >
              Chi tiết
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
