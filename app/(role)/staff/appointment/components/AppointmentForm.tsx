'use client';

import { Alert } from '@heroui/alert';
import { Button } from '@heroui/button';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Divider } from '@heroui/divider';
import { Input } from '@heroui/input';
import { Select, SelectItem } from '@heroui/select';
import { Spinner } from '@heroui/spinner';
import { Switch } from '@heroui/switch';
import React, { useEffect, useState } from 'react';

import {
  APPOINTMENT_TIME_SLOTS,
  AppointmentFormProps,
  Doctor,
  FORM_CONFIG,
  Patient,
  PatientData,
} from '@/types';
import { Clinic } from '@/types/clinic';

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
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    null
  );
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
        const [clinicResponse, doctorResponse, patientResponse] =
          await Promise.all([
            fetch('/api/clinics'),
            fetch('/api/doctors'),
            fetch('/api/patients'),
          ]);

        if (!clinicResponse.ok)
          throw new Error('Không thể lấy danh sách phòng khám.');
        const clinicData = await clinicResponse.json();

        setClinics(clinicData);

        if (!doctorResponse.ok)
          throw new Error('Không thể lấy danh sách bác sĩ.');
        const doctorData = await doctorResponse.json();

        setDoctors(doctorData);

        if (!patientResponse.ok)
          throw new Error('Không thể lấy danh sách bệnh nhân.');
        const patientData = await patientResponse.json();

        if (patientData.items && Array.isArray(patientData.items)) {
          setPatients(patientData.items);
        } else if (Array.isArray(patientData)) {
          setPatients(patientData);
        } else {
          setPatients([]);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Có lỗi xảy ra khi lấy dữ liệu.'
        );
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
      setError(
        'Vui lòng điền đầy đủ thông tin: phòng khám, bác sĩ, ngày và giờ hẹn.'
      );
      setIsLoading(false);

      return;
    }

    if (
      isNewPatient &&
      (!patientData.patient_id ||
        !patientData.id_card ||
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
        <form className='space-y-6' onSubmit={handleSubmit}>
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
              color='primary'
              isSelected={isNewPatient}
              onValueChange={setIsNewPatient}
            />
            <label
              className='text-medium font-medium'
              htmlFor='new-patient-switch'
            >
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
                    isRequired
                    label='ID bệnh nhân'
                    placeholder='Nhập ID bệnh nhân'
                    value={patientData.patient_id}
                    variant='bordered'
                    onChange={e =>
                      setPatientData({
                        ...patientData,
                        patient_id: e.target.value,
                      })
                    }
                  />
                  <Input
                    isRequired
                    label='Số CMND/CCCD'
                    placeholder='Nhập số CMND/CCCD'
                    value={patientData.id_card}
                    variant='bordered'
                    onChange={e =>
                      setPatientData({
                        ...patientData,
                        id_card: e.target.value,
                      })
                    }
                  />
                  <Input
                    isRequired
                    label='Tên bệnh nhân'
                    placeholder='Nhập tên bệnh nhân'
                    value={patientData.name}
                    variant='bordered'
                    onChange={e =>
                      setPatientData({ ...patientData, name: e.target.value })
                    }
                  />
                  <Select
                    isRequired
                    label='Giới tính'
                    placeholder='Chọn giới tính'
                    selectedKeys={[patientData.gender]}
                    variant='bordered'
                    onSelectionChange={keys => {
                      const selected = Array.from(keys)[0] as string;

                      setPatientData({
                        ...patientData,
                        gender: selected as 'male' | 'female',
                      });
                    }}
                  >
                    <SelectItem key='male'>Nam</SelectItem>
                    <SelectItem key='female'>Nữ</SelectItem>
                  </Select>
                  <Input
                    isRequired
                    label='Ngày sinh'
                    type='date'
                    value={patientData.birth_date}
                    variant='bordered'
                    onChange={e =>
                      setPatientData({
                        ...patientData,
                        birth_date: e.target.value,
                      })
                    }
                  />
                  <Input
                    isRequired
                    label='Số điện thoại'
                    placeholder='Nhập số điện thoại'
                    value={patientData.phone}
                    variant='bordered'
                    onChange={e =>
                      setPatientData({ ...patientData, phone: e.target.value })
                    }
                  />
                  <div className='md:col-span-2'>
                    <Input
                      isRequired
                      label='Địa chỉ'
                      placeholder='Nhập địa chỉ'
                      value={patientData.address}
                      variant='bordered'
                      onChange={e =>
                        setPatientData({
                          ...patientData,
                          address: e.target.value,
                        })
                      }
                    />
                  </div>
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
                    className='text-small font-medium text-foreground'
                    htmlFor='patient-select'
                  >
                    Chọn bệnh nhân
                  </label>
                  <div className='relative'>
                    <Input
                      readOnly
                      className='max-w-xs'
                      placeholder='Chọn bệnh nhân từ danh sách'
                      value={
                        selectedPatientId
                          ? patients.find(p => p._id === selectedPatientId)
                              ?.name || ''
                          : ''
                      }
                      variant='bordered'
                    />
                    <select
                      className='absolute inset-0 opacity-0 cursor-pointer'
                      id='patient-select'
                      value={selectedPatientId || ''}
                      onChange={e => {
                        setSelectedPatientId(e.target.value || null);
                      }}
                    >
                      <option value=''>Chọn bệnh nhân</option>
                      {Array.isArray(patients) &&
                        patients.map(patient => (
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
                className='text-small font-medium text-foreground'
                htmlFor='clinic-select'
              >
                Phòng khám
              </label>
              <div className='relative'>
                <Input
                  readOnly
                  placeholder='Chọn phòng khám'
                  value={
                    clinicId
                      ? clinics.find(c => c._id === clinicId)?.clinic_code || ''
                      : ''
                  }
                  variant='bordered'
                />
                <select
                  className='absolute inset-0 opacity-0 cursor-pointer'
                  id='clinic-select'
                  value={clinicId || ''}
                  onChange={e => {
                    setClinicId(e.target.value || '');
                  }}
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
                className='text-small font-medium text-foreground'
                htmlFor='doctor-select'
              >
                Bác sĩ
              </label>
              <div className='relative'>
                <Input
                  readOnly
                  placeholder='Chọn bác sĩ'
                  value={
                    doctorId
                      ? doctors.find(d => d._id === doctorId)?.name || ''
                      : ''
                  }
                  variant='bordered'
                />
                <select
                  className='absolute inset-0 opacity-0 cursor-pointer'
                  id='doctor-select'
                  value={doctorId || ''}
                  onChange={e => {
                    setDoctorId(e.target.value || '');
                  }}
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
              isRequired
              label='Ngày hẹn'
              min={FORM_CONFIG.minDate}
              type='date'
              value={appointmentDate}
              variant='bordered'
              onChange={e => setAppointmentDate(e.target.value)}
            />
            <Select
              isRequired
              label='Giờ hẹn'
              placeholder='Chọn giờ hẹn'
              selectedKeys={
                appointmentTime ? new Set([appointmentTime]) : new Set()
              }
              variant='bordered'
              onSelectionChange={keys => {
                const selected = Array.from(keys)[0] as string;

                setAppointmentTime(selected || '');
              }}
            >
              {APPOINTMENT_TIME_SLOTS.all.map(slot => (
                <SelectItem key={slot.value}>{slot.label}</SelectItem>
              ))}
            </Select>
          </div>

          <div className='flex items-center gap-3'>
            <Switch
              color='warning'
              isSelected={priority}
              onValueChange={setPriority}
            />
            <label
              className='text-medium font-medium'
              htmlFor='priority-switch'
            >
              Ưu tiên (Xếp số 1)
            </label>
          </div>

          <div className='space-y-2'>
            <label
              className='text-small font-medium text-foreground'
              htmlFor='symptoms-textarea'
            >
              Triệu chứng
            </label>
            <textarea
              className='w-full px-3 py-2 border border-default-200 rounded-medium bg-background text-foreground text-small focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
              id='symptoms-textarea'
              placeholder='Mô tả triệu chứng của bệnh nhân...'
              rows={3}
              value={symptoms}
              onChange={e => setSymptoms(e.target.value)}
            />
          </div>

          <div className='space-y-2'>
            <label
              className='text-small font-medium text-foreground'
              htmlFor='note-textarea'
            >
              Ghi chú
            </label>
            <textarea
              className='w-full px-3 py-2 border border-default-200 rounded-medium bg-background text-foreground text-small focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
              id='note-textarea'
              placeholder='Ghi chú thêm (nếu có)...'
              rows={2}
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </div>

          <Button
            className='w-full font-semibold'
            color='primary'
            isLoading={isLoading}
            size='lg'
            spinner={<Spinner size='sm' />}
            type='submit'
          >
            {isLoading ? 'Đang xử lý...' : 'Đặt lịch khám'}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
