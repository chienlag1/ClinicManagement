'use client';

import React from 'react';
import { Button } from '@heroui/button';
import { Appointment, statusColors, getStatusLabel } from '@/types/appointment';

interface AppointmentDetailModalProps {
  appointment: Appointment | null;
  onClose: () => void;
}

export function AppointmentDetailModal({ appointment, onClose }: AppointmentDetailModalProps) {
  if (!appointment) return null;

  const patient = typeof appointment.patient_id === 'object' ? appointment.patient_id : null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 relative shadow-lg">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {patient?.name || 'Unknown Patient'}
        </h2>
        <div className="space-y-3">
          <p className="text-gray-900">
            <strong>ID bệnh nhân:</strong> {patient?.patient_id || 'N/A'}
          </p>
          <p className="text-gray-900">
            <strong>Số điện thoại:</strong> {patient?.phone || 'N/A'}
          </p>
          <p className="text-gray-900">
            <strong>Thời gian:</strong> {appointment.appointment_time}
          </p>
          <p className="text-gray-900">
            <strong>Ngày:</strong> {(() => {
              const date = new Date(appointment.appointment_date);
              return isNaN(date.getTime()) ? 'Ngày không hợp lệ' : date.toLocaleDateString('vi-VN');
            })()}
          </p>
          <p className="text-gray-900">
            <strong>Trạng thái:</strong>{' '}
            <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[appointment.status] || 'bg-gray-200'}`}>
              {getStatusLabel(appointment.status)}
            </span>
          </p>
          {appointment.priority && (
            <p className="text-orange-600 font-medium">
              <strong>Ưu tiên:</strong> Có
            </p>
          )}
          <p className="text-gray-900">
            <strong>Triệu chứng:</strong> {appointment.symptoms}
          </p>
          {appointment.notes && (
            <p className="text-gray-900">
              <strong>Ghi chú:</strong> {appointment.notes}
            </p>
          )}
        </div>

        <Button
          className="mt-4 w-full"
          color="secondary"
          size="sm"
          onClick={onClose}
        >
          Đóng
        </Button>
      </div>
    </div>
  );
}
