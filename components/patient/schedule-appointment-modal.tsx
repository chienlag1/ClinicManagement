'use client';

import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
  Switch,
  Textarea,
  Divider,
  Alert,
  Spinner,
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { APPOINTMENT_TIME_SLOTS, FORM_CONFIG } from '@/types';
import { Clinic } from '@/types/clinic';

interface Doctor {
  _id: string;
  doctor_id: string;
  name: string;
  specialty?: string;
}

interface ScheduleAppointmentModalProps {
  patientId: string | null;
  patientName: string;
  doctorId: string; // Current doctor's ID
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ScheduleAppointmentModal({
  patientId,
  patientName,
  doctorId,
  isOpen,
  onClose,
  onSuccess,
}: ScheduleAppointmentModalProps) {
  const [clinicId, setClinicId] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [priority, setPriority] = useState(false);
  const [symptoms, setSymptoms] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loadingClinics, setLoadingClinics] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchClinics();
      // Set default date to today
      setAppointmentDate(FORM_CONFIG.minDate);
    } else {
      // Reset form when modal closes
      setClinicId('');
      setAppointmentDate(FORM_CONFIG.minDate);
      setAppointmentTime('');
      setPriority(false);
      setSymptoms('');
      setNote('');
      setError('');
      setSuccess('');
    }
  }, [isOpen]);

  const fetchClinics = async () => {
    setLoadingClinics(true);
    try {
      const response = await fetch('/api/clinics');
      if (!response.ok) {
        throw new Error('Không thể lấy danh sách phòng khám');
      }
      const data = await response.json();
      setClinics(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Có lỗi xảy ra khi lấy dữ liệu'
      );
    } finally {
      setLoadingClinics(false);
    }
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    // Validation
    if (!clinicId) {
      setError('Vui lòng chọn phòng khám');
      return;
    }

    if (!appointmentDate) {
      setError('Vui lòng chọn ngày hẹn');
      return;
    }

    if (!appointmentTime) {
      setError('Vui lòng chọn giờ hẹn');
      return;
    }

    if (!symptoms || symptoms.trim().length === 0) {
      setError('Vui lòng mô tả triệu chứng');
      return;
    }

    if (!patientId) {
      setError('Thông tin bệnh nhân không hợp lệ');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isNewPatient: false,
          patientData: null,
          selectedPatientId: patientId,
          clinic_id: clinicId,
          doctor_id: doctorId,
          appointment_date: appointmentDate,
          appointment_time: appointmentTime,
          priority,
          symptoms: symptoms.trim(),
          note: note.trim(),
          created_by: 'doctor',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Đặt lịch thất bại');
      }

      const data = await response.json();
      setSuccess('Đặt lịch thành công!');

      // Reset form
      setClinicId('');
      setAppointmentDate(FORM_CONFIG.minDate);
      setAppointmentTime('');
      setPriority(false);
      setSymptoms('');
      setNote('');

      // Call onSuccess callback after a short delay
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size='2xl'
      scrollBehavior='inside'
      classNames={{
        base: 'bg-background',
        header: 'border-b border-divider',
        body: 'py-6',
        footer: 'border-t border-divider',
      }}
    >
      <ModalContent>
        {onClose => (
          <>
            <ModalHeader className='flex flex-col gap-1'>
              <div className='flex items-center gap-3'>
                <Icon
                  icon='lucide:calendar-plus'
                  className='w-6 h-6 text-primary'
                />
                <h2 className='text-xl font-bold'>Đặt lịch khám</h2>
              </div>
              <p className='text-default-500 font-normal'>
                Đặt lịch khám cho bệnh nhân: <strong>{patientName}</strong>
              </p>
            </ModalHeader>

            <ModalBody>
              <div className='space-y-4'>
                {error && (
                  <Alert
                    color='danger'
                    variant='flat'
                    startContent={<Icon icon='lucide:alert-circle' />}
                  >
                    {error}
                  </Alert>
                )}

                {success && (
                  <Alert
                    color='success'
                    variant='flat'
                    startContent={<Icon icon='lucide:check-circle' />}
                  >
                    {success}
                  </Alert>
                )}

                {loadingClinics ? (
                  <div className='flex justify-center py-4'>
                    <Spinner size='sm' />
                  </div>
                ) : (
                  <>
                    <Select
                      label='Phòng khám'
                      placeholder='Chọn phòng khám'
                      selectedKeys={clinicId ? [clinicId] : []}
                      onSelectionChange={keys => {
                        const selected = Array.from(keys)[0] as string;
                        setClinicId(selected || '');
                      }}
                      isRequired
                      variant='bordered'
                      startContent={
                        <Icon icon='lucide:building' className='w-4 h-4' />
                      }
                    >
                      {clinics.map(clinic => (
                        <SelectItem
                          key={clinic._id}
                          textValue={`${clinic.clinic_code || clinic.clinic_id} - ${clinic.description || clinic.status || 'Không có mô tả'}`}
                        >
                          {clinic.clinic_code || clinic.clinic_id} -{' '}
                          {clinic.description ||
                            clinic.status ||
                            'Không có mô tả'}
                        </SelectItem>
                      ))}
                    </Select>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <Input
                        label='Ngày hẹn'
                        type='date'
                        value={appointmentDate}
                        onValueChange={setAppointmentDate}
                        min={FORM_CONFIG.minDate}
                        isRequired
                        variant='bordered'
                        startContent={
                          <Icon icon='lucide:calendar' className='w-4 h-4' />
                        }
                      />
                      <Select
                        label='Giờ hẹn'
                        placeholder='Chọn giờ hẹn'
                        selectedKeys={appointmentTime ? [appointmentTime] : []}
                        onSelectionChange={keys => {
                          const selected = Array.from(keys)[0] as string;
                          setAppointmentTime(selected || '');
                        }}
                        isRequired
                        variant='bordered'
                        startContent={
                          <Icon icon='lucide:clock' className='w-4 h-4' />
                        }
                      >
                        {APPOINTMENT_TIME_SLOTS.all.map(slot => (
                          <SelectItem key={slot.value}>{slot.label}</SelectItem>
                        ))}
                      </Select>
                    </div>

                    <div className='flex items-center gap-3'>
                      <Switch
                        isSelected={priority}
                        onValueChange={setPriority}
                        color='warning'
                      />
                      <label className='text-medium font-medium'>
                        Ưu tiên (Xếp số 1)
                      </label>
                    </div>

                    <Divider />

                    <Textarea
                      label='Triệu chứng'
                      placeholder='Mô tả triệu chứng của bệnh nhân...'
                      value={symptoms}
                      onValueChange={setSymptoms}
                      isRequired
                      variant='bordered'
                      minRows={3}
                      startContent={
                        <Icon icon='lucide:stethoscope' className='w-4 h-4' />
                      }
                    />

                    <Textarea
                      label='Ghi chú'
                      placeholder='Ghi chú thêm (tùy chọn)...'
                      value={note}
                      onValueChange={setNote}
                      variant='bordered'
                      minRows={2}
                      startContent={
                        <Icon icon='lucide:file-text' className='w-4 h-4' />
                      }
                    />
                  </>
                )}
              </div>
            </ModalBody>

            <ModalFooter>
              <Button color='default' variant='light' onPress={onClose}>
                Hủy
              </Button>
              <Button
                color='primary'
                onPress={handleSubmit}
                isLoading={isLoading}
                startContent={
                  !isLoading && (
                    <Icon icon='lucide:calendar-check' className='w-4 h-4' />
                  )
                }
              >
                Đặt lịch
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
