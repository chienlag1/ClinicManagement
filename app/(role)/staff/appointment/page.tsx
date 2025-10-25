'use client';

import { Card, CardBody, CardHeader } from '@heroui/card';

import AppointmentForm from './components/AppointmentForm';

export default function AppointmentPage() {
  const handleSubmit = (
    _isNewPatient: boolean,
    _patientData: {
      patient_id: string;
      id_card: string;
      name: string;
      gender: 'male' | 'female';
      birth_date: string;
      phone: string;
      address: string;
    } | null,
    _selectedPatientId: string | null,
    _clinic_id: string,
    _doctor_id: string,
    _appointment_date: string,
    _appointment_time: string,
    _priority: boolean,
    _symptoms: string,
    _note: string
  ) => {
    // Handle appointment submission
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white'>
        <h1 className='text-2xl font-bold mb-2'>Quản lý lịch khám</h1>
        <p className='text-blue-100'>
          Đặt lịch khám mới và quản lý các lịch hẹn hiện có.
        </p>
      </div>

      {/* Appointment Form */}
      <Card>
        <CardHeader>
          <h3 className='text-lg font-semibold'>Đặt lịch khám mới</h3>
        </CardHeader>
        <CardBody>
          <AppointmentForm onSubmit={handleSubmit} />
        </CardBody>
      </Card>
    </div>
  );
}
