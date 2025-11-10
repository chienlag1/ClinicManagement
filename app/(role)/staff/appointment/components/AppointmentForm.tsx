'use client';

import React, { useState, useEffect } from 'react';
import { PatientData } from '@/types/appointment';
import { Patient, Doctor, AppointmentFormProps, APPOINTMENT_TIME_SLOTS, FORM_CONFIG } from '@/types';
import { Clinic } from '@/types/clinic';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Select, SelectItem } from '@heroui/select';
import { Switch } from '@heroui/switch';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Divider } from '@heroui/divider';
import { Alert } from '@heroui/alert';
import { Spinner } from '@heroui/spinner';

export default function AppointmentForm({ onSubmit }: AppointmentFormProps) {
  const [isNewPatient, setIsNewPatient] = useState(false);
  const [patientData, setPatientData] = useState<PatientData>({
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
  const [isLoading, setIsLoading] = useState(false);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);

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

        if (!doctorResponse.ok) throw new Error('Không thể lấy danh sách bác sĩ.');
        const doctorData = await doctorResponse.json();
        setDoctors(doctorData);

        if (!patientResponse.ok) throw new Error('Không thể lấy danh sách bệnh nhân.');
        const patientData = await patientResponse.json();
        if (patientData.items && Array.isArray(patientData.items)) {
          setPatients(patientData.items);
        } else if (Array.isArray(patientData)) {
          setPatients(patientData);
        } else {
          setPatients([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi lấy dữ liệu.');
        setPatients([]);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (!clinicId || !doctorId || !appointmentDate || !appointmentTime) {
      setError('Vui lòng điền đầy đủ thông tin: phòng khám, bác sĩ, ngày và giờ hẹn.');
      setIsLoading(false);
      return;
    }

    if (
      isNewPatient &&
      (!patientData.id_card ||
        !patientData.name ||
        !patientData.birth_date ||
        !patientData.phone ||
        !patientData.address)
    ) {
      setError('Vui lòng điền đầy đủ thông tin bệnh nhân.');
      setIsLoading(false);
      return;
    }

    if (!isNewPatient && !selectedPatientId) {
      setError('Vui lòng chọn ID bệnh nhân.');
      setIsLoading(false);
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
      onSubmit(
        isNewPatient,
        patientData,
        selectedPatientId,
        clinicId,
        doctorId,
        appointmentDate,
        appointmentTime,
        priority,
        symptoms,
        note
      );

      setPatientData({
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className='w-full max-w-4xl mx-auto'>
      <CardHeader className='flex flex-col gap-1'>
        <h2 className='text-2xl font-bold text-center'>Đặt lịch khám bệnh</h2>
        <p className='text-small text-default-500 text-center'>
          Điền thông tin để đặt lịch khám cho bệnh nhân
        </p>
      </CardHeader>
      <CardBody className='gap-4'>
        <form onSubmit={handleSubmit} className='space-y-6'>
          {error && (
            <Alert color='danger' variant='flat'>
              {error}
            </Alert>
          )}
          {success && (
            <Alert color='success' variant='flat'>
              {success}
            </Alert>
          )}

          <div className='flex items-center gap-3'>
            <Switch
              id='isNewPatient'
              isSelected={isNewPatient}
              onValueChange={setIsNewPatient}
              color='primary'
            />
            <label htmlFor='isNewPatient' className='text-medium font-medium'>
              Bệnh nhân mới
            </label>
          </div>

          {isNewPatient ? (
            <Card className='bg-blue-50/50'>
              <CardHeader>
                <h3 className='text-lg font-semibold text-blue-800'>
                  Thông tin bệnh nhân mới
                </h3>
              </CardHeader>
              <CardBody>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <Input
                    label='Số CMND/CCCD'
                    placeholder='Nhập số CMND/CCCD'
                    value={patientData.id_card}
                    onChange={e =>
                      setPatientData({ ...patientData, id_card: e.target.value })
                    }
                    isRequired
                    variant='bordered'
                  />
                  <Input
                    label='Tên bệnh nhân'
                    placeholder='Nhập tên bệnh nhân'
                    value={patientData.name}
                    onChange={e =>
                      setPatientData({ ...patientData, name: e.target.value })
                    }
                    isRequired
                    variant='bordered'
                  />
                  <Select
                    label='Giới tính'
                    placeholder='Chọn giới tính'
                    selectedKeys={[patientData.gender]}
                    onSelectionChange={keys => {
                      const selected = Array.from(keys)[0] as string;
                      setPatientData({
                        ...patientData,
                        gender: selected as 'male' | 'female',
                      });
                    }}
                    isRequired
                    variant='bordered'
                  >
                    <SelectItem key='male'>Nam</SelectItem>
                    <SelectItem key='female'>Nữ</SelectItem>
                  </Select>
                  <Input
                    label='Ngày sinh'
                    type='date'
                    value={patientData.birth_date}
                    onChange={e =>
                      setPatientData({
                        ...patientData,
                        birth_date: e.target.value,
                      })
                    }
                    isRequired
                    variant='bordered'
                  />
                  {/* ✅ SỐ ĐIỆN THOẠI & ĐỊA CHỈ CÙNG HÀNG */}
                  <Input
                    label='Số điện thoại'
                    placeholder='Nhập số điện thoại'
                    value={patientData.phone}
                    onChange={e =>
                      setPatientData({ ...patientData, phone: e.target.value })
                    }
                    isRequired
                    variant='bordered'
                  />
                  <Input
                    label='Địa chỉ'
                    placeholder='Nhập địa chỉ'
                    value={patientData.address}
                    onChange={e =>
                      setPatientData({
                        ...patientData,
                        address: e.target.value,
                      })
                    }
                    isRequired
                    variant='bordered'
                  />
                </div>
              </CardBody>
            </Card>
          ) : (
            <Card className='bg-green-50/50'>
              <CardHeader>
                <h3 className='text-lg font-semibold text-green-800'>
                  Chọn bệnh nhân hiện có
                </h3>
              </CardHeader>
              <CardBody>
                <div className='space-y-2'>
                  <label
                    htmlFor='patientSelect'
                    className='text-small font-medium text-foreground'
                  >
                    Chọn bệnh nhân
                  </label>
                  <div className='relative'>
                    <Input
                      id='patientSelect'
                      placeholder='Chọn bệnh nhân từ danh sách'
                      value={
                        selectedPatientId
                          ? patients.find(p => p._id === selectedPatientId)?.name || ''
                          : ''
                      }
                      readOnly
                      variant='bordered'
                      className='max-w-xs'
                    />
                    <select
                      className='absolute inset-0 opacity-0 cursor-pointer'
                      value={selectedPatientId || ''}
                      onChange={e => setSelectedPatientId(e.target.value || null)}
                    >
                      <option value=''>Chọn bệnh nhân</option>
                      {patients.map(patient => (
                        <option key={patient._id} value={patient._id}>
                          {patient.name} (ID: {patient.patient_id})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          <Divider />

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <label
                htmlFor='clinicSelect'
                className='text-small font-medium text-foreground'
              >
                Phòng khám
              </label>
              <div className='relative'>
                <Input
                  id='clinicSelect'
                  placeholder='Chọn phòng khám'
                  value={
                    clinicId
                      ? clinics.find(c => c._id === clinicId)?.clinic_code || ''
                      : ''
                  }
                  readOnly
                  variant='bordered'
                />
                <select
                  className='absolute inset-0 opacity-0 cursor-pointer'
                  value={clinicId || ''}
                  onChange={e => setClinicId(e.target.value || '')}
                >
                  <option value=''>Chọn phòng khám</option>
                  {clinics.map(clinic => (
                    <option key={clinic._id} value={clinic._id}>
                      {clinic.clinic_code} -{' '}
                      {clinic.description || clinic.status || 'Không có mô tả'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className='space-y-2'>
              <label
                htmlFor='doctorSelect'
                className='text-small font-medium text-foreground'
              >
                Bác sĩ
              </label>
              <div className='relative'>
                <Input
                  id='doctorSelect'
                  placeholder='Chọn bác sĩ'
                  value={
                    doctorId
                      ? doctors.find(d => d._id === doctorId)?.name || ''
                      : ''
                  }
                  readOnly
                  variant='bordered'
                />
                <select
                  className='absolute inset-0 opacity-0 cursor-pointer'
                  value={doctorId || ''}
                  onChange={e => setDoctorId(e.target.value || '')}
                >
                  <option value=''>Chọn bác sĩ</option>
                  {doctors.map(doctor => (
                    <option key={doctor._id} value={doctor._id}>
                      {doctor.name} ({doctor.specialty})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <Input
              label='Ngày hẹn'
              type='date'
              value={appointmentDate}
              onChange={e => setAppointmentDate(e.target.value)}
              min={FORM_CONFIG.minDate}
              isRequired
              variant='bordered'
            />
            <Select
              label='Giờ hẹn'
              placeholder='Chọn giờ hẹn'
              selectedKeys={
                appointmentTime ? new Set([appointmentTime]) : new Set()
              }
              onSelectionChange={keys => {
                const selected = Array.from(keys)[0] as string;
                setAppointmentTime(selected || '');
              }}
              isRequired
              variant='bordered'
            >
              {APPOINTMENT_TIME_SLOTS.all.map(slot => (
                <SelectItem key={slot.value}>{slot.label}</SelectItem>
              ))}
            </Select>
          </div>

          <div className='flex items-center gap-3'>
            <Switch
              id='prioritySwitch'
              isSelected={priority}
              onValueChange={setPriority}
              color='warning'
            />
            <label htmlFor='prioritySwitch' className='text-medium font-medium'>
              Ưu tiên (Xếp số 1)
            </label>
          </div>

          <div className='space-y-2'>
            <label
              htmlFor='symptomsInput'
              className='text-small font-medium text-foreground'
            >
              Triệu chứng
            </label>
            <textarea
              id='symptomsInput'
              placeholder='Mô tả triệu chứng của bệnh nhân...'
              value={symptoms}
              onChange={e => setSymptoms(e.target.value)}
              className='w-full px-3 py-2 border border-default-200 rounded-medium bg-background text-foreground text-small focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
              rows={3}
            />
          </div>

          <div className='space-y-2'>
            <label
              htmlFor='noteInput'
              className='text-small font-medium text-foreground'
            >
              Ghi chú
            </label>
            <textarea
              id='noteInput'
              placeholder='Ghi chú thêm (nếu có)...'
              value={note}
              onChange={e => setNote(e.target.value)}
              className='w-full px-3 py-2 border border-default-200 rounded-medium bg-background text-foreground text-small focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
              rows={2}
            />
          </div>

          <Button
            type='submit'
            color='primary'
            size='lg'
            className='w-full font-semibold'
            isLoading={isLoading}
            spinner={<Spinner size='sm' />}
          >
            {isLoading ? 'Đang xử lý...' : 'Đặt lịch khám'}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
