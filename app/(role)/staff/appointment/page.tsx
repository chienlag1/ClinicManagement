'use client';

import React from 'react';
import { Card, CardBody, CardHeader } from '@heroui/card';
import AppointmentForm from './components/AppointmentForm';

export default function AppointmentPage() {
  const handleSubmit = (
    isNewPatient: boolean,
    patientData: {
      patient_id: string;
      id_card: string;
      name: string;
      gender: 'male' | 'female';
      birth_date: string;
      phone: string;
      address: string;
    } | null,
    selectedPatientId: string | null,
    clinic_id: string,
    doctor_id: string,
    appointment_date: string,
    appointment_time: string,
    priority: boolean,
    symptoms: string,
    note: string
  ) => {
    console.log({
      isNewPatient,
      patientData,
      selectedPatientId,
      clinic_id,
      doctor_id,
      appointment_date,
      appointment_time,
      priority,
      symptoms,
      note,
    });
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
