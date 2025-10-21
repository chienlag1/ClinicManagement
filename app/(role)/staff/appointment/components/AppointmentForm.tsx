'use client';

import React, { useState, useEffect } from 'react';
import { PatientData, Patient, Clinic, Doctor, AppointmentFormData } from '@/types/appointment';

interface AppointmentFormProps {
  onSubmit: (
    isNewPatient: boolean,
    patientData: PatientData | null,
    selectedPatientId: string | null,
    clinic_id: string,
    doctor_id: string,
    appointment_date: string,
    appointment_time: string,
    priority: boolean,
    symptoms: string,
    note: string
  ) => void;
}

export default function AppointmentForm({ onSubmit }: AppointmentFormProps) {
  const [isNewPatient, setIsNewPatient] = useState(false);
  const [patientData, setPatientData] = useState<PatientData>({
    patient_id: '',
    id_card: '',
    name: '',
    gender: 'male',
    birth_date: '',
    phone: '',
    address: '',
  });
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [clinicId, setClinicId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [priority, setPriority] = useState(false);
  const [symptoms, setSymptoms] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clinicResponse, doctorResponse, patientResponse] = await Promise.all([
          fetch('http://localhost:3000/api/clinics'),
          fetch('http://localhost:3000/api/doctors'),
          fetch('http://localhost:3000/api/patients'),
        ]);
        
        if (!clinicResponse.ok) throw new Error('Không thể lấy danh sách phòng khám.');
        const clinicData = await clinicResponse.json();
        setClinics(clinicData);

        if (!doctorResponse.ok) throw new Error('Không thể lấy danh sách bác sĩ.');
        const doctorData = await doctorResponse.json();
        setDoctors(doctorData);

        if (!patientResponse.ok) throw new Error('Không thể lấy danh sách bệnh nhân.');
        const patientData = await patientResponse.json();
        if (Array.isArray(patientData.items)) {
          setPatients(patientData.items);
        } else {
          setPatients([]);
          console.warn('API /api/patients returned non-array data:', patientData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi lấy dữ liệu.');
        setPatients([]);
        console.error('Fetch error:', err);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!clinicId || !doctorId || !appointmentDate || !appointmentTime) {
      setError('Vui lòng điền đầy đủ thông tin: phòng khám, bác sĩ, ngày và giờ hẹn.');
      return;
    }

    if (isNewPatient && (!patientData.patient_id || !patientData.id_card || !patientData.name || !patientData.birth_date || !patientData.phone || !patientData.address)) {
      setError('Vui lòng điền đầy đủ thông tin bệnh nhân.');
      return;
    }

    if (!isNewPatient && !selectedPatientId) {
      setError('Vui lòng chọn ID bệnh nhân.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isNewPatient,
          patientData: isNewPatient ? patientData : null,
          selectedPatientId: isNewPatient ? null : selectedPatientId,
          clinic_id: clinicId,
          doctor_id: doctorId,
          appointment_date: appointmentDate,
          appointment_time: appointmentTime,
          priority,
          symptoms,
          note,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Đặt lịch thất bại.');
      }

      await response.json();
      setSuccess('Đặt lịch thành công!');
      onSubmit(isNewPatient, patientData, selectedPatientId, clinicId, doctorId, appointmentDate, appointmentTime, priority, symptoms, note);

      // Reset form
      setPatientData({
        patient_id: '',
        id_card: '',
        name: '',
        gender: 'male',
        birth_date: '',
        phone: '',
        address: '',
      });
      setSelectedPatientId(null);
      setClinicId('');
      setDoctorId('');
      setAppointmentDate('');
      setAppointmentTime('');
      setPriority(false);
      setSymptoms('');
      setNote('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra.');
    }
  };

  return (
    <form className='space-y-4' onSubmit={handleSubmit}>
      {error && (
        <div className='p-3 bg-red-50 border border-red-200 rounded-md'>
          <p className='text-red-600 text-sm'>{error}</p>
        </div>
      )}
      {success && (
        <div className='p-3 bg-green-50 border border-green-200 rounded-md'>
          <p className='text-green-600 text-sm'>{success}</p>
        </div>
      )}

      <div className='flex items-center gap-2'>
        <label htmlFor='isNewPatient' className='text-sm font-medium'>
          Bệnh nhân mới
          <input
            id='isNewPatient'
            type='checkbox'
            checked={isNewPatient}
            onChange={e => setIsNewPatient(e.target.checked)}
            className='h-4 w-4 ml-2'
          />
        </label>
      </div>

      {isNewPatient ? (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label htmlFor='patientId' className='block text-sm font-medium text-gray-700 mb-1'>
              ID bệnh nhân
            </label>
            <input
              id='patientId'
              type='text'
              value={patientData.patient_id}
              onChange={e => setPatientData({ ...patientData, patient_id: e.target.value })}
              className='w-full p-2 border rounded border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm'
              required
            />
          </div>
          <div>
            <label htmlFor='idCard' className='block text-sm font-medium text-gray-700 mb-1'>
              Số CMND/CCCD
            </label>
            <input
              id='idCard'
              type='text'
              value={patientData.id_card}
              onChange={e => setPatientData({ ...patientData, id_card: e.target.value })}
              className='w-full p-2 border rounded border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm'
              required
            />
          </div>
          <div>
            <label htmlFor='patientName' className='block text-sm font-medium text-gray-700 mb-1'>
              Tên bệnh nhân
            </label>
            <input
              id='patientName'
              type='text'
              value={patientData.name}
              onChange={e => setPatientData({ ...patientData, name: e.target.value })}
              className='w-full p-2 border rounded border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm'
              required
            />
          </div>
          <div>
            <label htmlFor='gender' className='block text-sm font-medium text-gray-700 mb-1'>
              Giới tính
            </label>
            <select
              id='gender'
              value={patientData.gender}
              onChange={e => setPatientData({ ...patientData, gender: e.target.value as 'male' | 'female' })}
              className='w-full p-2 border rounded border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm'
              required
            >
              <option value='male'>Nam</option>
              <option value='female'>Nữ</option>
            </select>
          </div>
          <div>
            <label htmlFor='birthDate' className='block text-sm font-medium text-gray-700 mb-1'>
              Ngày sinh
            </label>
            <input
              id='birthDate'
              type='date'
              value={patientData.birth_date}
              onChange={e => setPatientData({ ...patientData, birth_date: e.target.value })}
              className='w-full p-2 border rounded border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm'
              required
            />
          </div>
          <div>
            <label htmlFor='phone' className='block text-sm font-medium text-gray-700 mb-1'>
              Số điện thoại
            </label>
            <input
              id='phone'
              type='text'
              value={patientData.phone}
              onChange={e => setPatientData({ ...patientData, phone: e.target.value })}
              className='w-full p-2 border rounded border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm'
              required
            />
          </div>
          <div className='md:col-span-2'>
            <label htmlFor='address' className='block text-sm font-medium text-gray-700 mb-1'>
              Địa chỉ
            </label>
            <input
              id='address'
              type='text'
              value={patientData.address}
              onChange={e => setPatientData({ ...patientData, address: e.target.value })}
              className='w-full p-2 border rounded border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm'
              required
            />
          </div>
        </div>
      ) : (
        <div>
          <label htmlFor='patientId' className='block text-sm font-medium text-gray-700 mb-1'>
            Chọn bệnh nhân
          </label>
          <select
            id='patientId'
            value={selectedPatientId || ''}
            onChange={e => setSelectedPatientId(e.target.value)}
            className='w-full p-2 border rounded border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm'
            required
          >
            <option value=''>Chọn bệnh nhân</option>
            {Array.isArray(patients) && patients.map((patient) => (
              <option key={patient._id} value={patient._id}>
                {patient.name} (ID: {patient.patient_id})
              </option>
            ))}
          </select>
        </div>
      )}

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div>
          <label htmlFor='clinicId' className='block text-sm font-medium text-gray-700 mb-1'>
            Phòng khám
          </label>
          <select
            id='clinicId'
            value={clinicId}
            onChange={e => setClinicId(e.target.value)}
            className='w-full p-2 border rounded border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm'
            required
          >
            <option value=''>Chọn phòng khám</option>
            {clinics.map((clinic) => (
              <option key={clinic._id} value={clinic._id}>
                {clinic.name} - {clinic.address}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor='doctorId' className='block text-sm font-medium text-gray-700 mb-1'>
            Bác sĩ
          </label>
          <select
            id='doctorId'
            value={doctorId}
            onChange={e => setDoctorId(e.target.value)}
            className='w-full p-2 border rounded border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm'
            required
          >
            <option value=''>Chọn bác sĩ</option>
            {doctors.map((doctor) => (
              <option key={doctor._id} value={doctor._id}>
                {doctor.name} ({doctor.specialty})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div>
          <label htmlFor='appointmentDate' className='block text-sm font-medium text-gray-700 mb-1'>
            Ngày hẹn
          </label>
          <input
            id='appointmentDate'
            type='date'
            value={appointmentDate}
            onChange={e => setAppointmentDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className='w-full p-2 border rounded border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm'
            required
          />
        </div>
        <div>
          <label htmlFor='appointmentTime' className='block text-sm font-medium text-gray-700 mb-1'>
            Giờ hẹn
          </label>
          <select
            id='appointmentTime'
            value={appointmentTime}
            onChange={e => setAppointmentTime(e.target.value)}
            className='w-full p-2 border rounded border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm'
            required
          >
            <option value=''>Chọn giờ</option>
            <option value='08:00'>08:00</option>
            <option value='08:30'>08:30</option>
            <option value='09:00'>09:00</option>
            <option value='09:30'>09:30</option>
            <option value='10:00'>10:00</option>
            <option value='10:30'>10:30</option>
            <option value='11:00'>11:00</option>
            <option value='11:30'>11:30</option>
            <option value='14:00'>14:00</option>
            <option value='14:30'>14:30</option>
            <option value='15:00'>15:00</option>
            <option value='15:30'>15:30</option>
            <option value='16:00'>16:00</option>
            <option value='16:30'>16:30</option>
            <option value='17:00'>17:00</option>
            <option value='17:30'>17:30</option>
          </select>
        </div>
      </div>

      <div className='flex items-center gap-2'>
        <label htmlFor='priority' className='text-sm font-medium'>
          Ưu tiên (Xếp số 1)
          <input
            id='priority'
            type='checkbox'
            checked={priority}
            onChange={e => setPriority(e.target.checked)}
            className='h-4 w-4 ml-2'
          />
        </label>
      </div>

      <div>
        <label htmlFor='symptoms' className='block text-sm font-medium text-gray-700 mb-1'>
          Triệu chứng
        </label>
        <textarea
          id='symptoms'
          value={symptoms}
          onChange={e => setSymptoms(e.target.value)}
          className='w-full p-2 border rounded border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm'
          rows={3}
          placeholder='Mô tả triệu chứng của bệnh nhân...'
        />
      </div>

      <div>
        <label htmlFor='note' className='block text-sm font-medium text-gray-700 mb-1'>
          Ghi chú
        </label>
        <textarea
          id='note'
          value={note}
          onChange={e => setNote(e.target.value)}
          className='w-full p-2 border rounded border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm'
          rows={2}
          placeholder='Ghi chú thêm (nếu có)...'
        />
      </div>

      <button
        type='submit'
        className='w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium'
      >
        Đặt lịch khám
      </button>
    </form>
  );
}
