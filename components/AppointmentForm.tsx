'use client';

import React, { useState, useEffect } from 'react';

interface PatientData {
  patient_id: string;
  id_card: string;
  name: string;
  gender: 'male' | 'female';
  birth_date: string;
  phone: string;
  address: string;
}

interface Clinic {
  _id: string;
  clinic_id: string;
  name: string;
  address: string;
}

interface Doctor {
  _id: string;
  doctor_id: string;
  name: string;
  specialty: string;
}

interface Patient {
  _id: string;
  patient_id: string;
  name: string;
}

interface AppointmentFormProps {
  onSubmit: (
    isNewPatient: boolean,
    patientData: PatientData | null,
    selectedPatientId: string | null,
    clinic_id: string,
    doctor_id: string,
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
  const [priority, setPriority] = useState(false);
  const [symptoms, setSymptoms] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]); // Khởi tạo là mảng rỗng

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clinicResponse, doctorResponse, patientResponse] = await Promise.all([
          fetch('/api/clinics'),
          fetch('/api/doctors'),
          fetch('/api/patients'),
        ]);
        if (!clinicResponse.ok) throw new Error('Không thể lấy danh sách phòng khám.');
        const clinicData = await clinicResponse.json();
        setClinics(clinicData);
        console.log('Fetched clinics:', clinicData);

        if (!doctorResponse.ok) throw new Error('Không thể lấy danh sách bác sĩ.');
        const doctorData = await doctorResponse.json();
        setDoctors(doctorData);
        console.log('Fetched doctors:', doctorData);

        if (!patientResponse.ok) throw new Error('Không thể lấy danh sách bệnh nhân.');
        const patientData = await patientResponse.json();
        if (Array.isArray(patientData)) {
          setPatients(patientData); // Chỉ set nếu là mảng
        } else {
          setPatients([]); // Đặt rỗng nếu không phải mảng
          console.warn('API /api/patients returned non-array data:', patientData);
        }
        console.log('Fetched patients:', patientData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi lấy dữ liệu.');
        setPatients([]); // Đặt rỗng nếu có lỗi
        console.error('Fetch error:', err);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!clinicId || !doctorId) {
      setError('Vui lòng chọn phòng khám và bác sĩ.');
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
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isNewPatient,
          patientData: isNewPatient ? patientData : null,
          selectedPatientId: isNewPatient ? null : selectedPatientId,
          clinic_id: clinicId,
          doctor_id: doctorId,
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
      onSubmit(isNewPatient, patientData, selectedPatientId, clinicId, doctorId, priority, symptoms, note);

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
      setPriority(false);
      setSymptoms('');
      setNote('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra.');
    }
  };

  return (
    <form className='p-6 bg-white rounded-lg shadow space-y-4' onSubmit={handleSubmit}>
      <h2 className='text-lg font-semibold'>Đặt lịch khám</h2>

      {error && <p className='text-red-500 text-sm'>{error}</p>}
      {success && <p className='text-green-500 text-sm'>{success}</p>}

      <div className='flex items-center gap-2'>
        <label htmlFor='isNewPatient' className='text-sm'>
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
        <div className='space-y-4'>
          <div>
            <label htmlFor='patientId' className='block text-sm font-medium text-gray-700'>
              ID bệnh nhân
              <input
                id='patientId'
                type='text'
                value={patientData.patient_id}
                onChange={e => setPatientData({ ...patientData, patient_id: e.target.value })}
                className='w-full p-2 border rounded border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm'
                required
              />
            </label>
          </div>
          <div>
            <label htmlFor='idCard' className='block text-sm font-medium text-gray-700'>
              Số CMND/CCCD
              <input
                id='idCard'
                type='text'
                value={patientData.id_card}
                onChange={e => setPatientData({ ...patientData, id_card: e.target.value })}
                className='w-full p-2 border rounded border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm'
                required
              />
            </label>
          </div>
          <div>
            <label htmlFor='patientName' className='block text-sm font-medium text-gray-700'>
              Tên bệnh nhân
              <input
                id='patientName'
                type='text'
                value={patientData.name}
                onChange={e => setPatientData({ ...patientData, name: e.target.value })}
                className='w-full p-2 border rounded border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm'
                required
              />
            </label>
          </div>
          <div>
            <label htmlFor='gender' className='block text-sm font-medium text-gray-700'>
              Giới tính
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
            </label>
          </div>
          <div>
            <label htmlFor='birthDate' className='block text-sm font-medium text-gray-700'>
              Ngày sinh
              <input
                id='birthDate'
                type='date'
                value={patientData.birth_date}
                onChange={e => setPatientData({ ...patientData, birth_date: e.target.value })}
                className='w-full p-2 border rounded border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm'
                required
              />
            </label>
          </div>
          <div>
            <label htmlFor='phone' className='block text-sm font-medium text-gray-700'>
              Số điện thoại
              <input
                id='phone'
                type='text'
                value={patientData.phone}
                onChange={e => setPatientData({ ...patientData, phone: e.target.value })}
                className='w-full p-2 border rounded border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm'
                required
              />
            </label>
          </div>
          <div>
            <label htmlFor='address' className='block text-sm font-medium text-gray-700'>
              Địa chỉ
              <input
                id='address'
                type='text'
                value={patientData.address}
                onChange={e => setPatientData({ ...patientData, address: e.target.value })}
                className='w-full p-2 border rounded border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm'
                required
              />
            </label>
          </div>
        </div>
      ) : (
        <div>
          <label htmlFor='patientId' className='block text-sm font-medium text-gray-700'>
            Chọn bệnh nhân
            <select
              id='patientId'
              value={selectedPatientId || ''}
              onChange={e => setSelectedPatientId(e.target.value)}
              className='w-full p-2 border rounded border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm'
              required
            >
              <option value=''>Chọn bệnh nhân</option>
              {Array.isArray(patients) && patients.map((patient) => ( // Thêm kiểm tra Array.isArray
                <option key={patient._id} value={patient.patient_id}>
                  {patient.name} (ID: {patient.patient_id})
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      <div>
        <label htmlFor='clinicId' className='block text-sm font-medium text-gray-700'>
          Phòng khám
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
        </label>
      </div>

      <div>
        <label htmlFor='doctorId' className='block text-sm font-medium text-gray-700'>
          Bác sĩ
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
        </label>
      </div>

      <div className='flex items-center gap-2'>
        <label htmlFor='priority' className='text-sm'>
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
        <label htmlFor='symptoms' className='block text-sm font-medium text-gray-700'>
          Triệu chứng
          <textarea
            id='symptoms'
            value={symptoms}
            onChange={e => setSymptoms(e.target.value)}
            className='w-full p-2 border rounded border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm'
          />
        </label>
      </div>

      <div>
        <label htmlFor='note' className='block text-sm font-medium text-gray-700'>
          Ghi chú
          <textarea
            id='note'
            value={note}
            onChange={e => setNote(e.target.value)}
            className='w-full p-2 border rounded border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm'
          />
        </label>
      </div>

      <button
        type='submit'
        className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm'
      >
        Đặt lịch
      </button>
    </form>
  );
}