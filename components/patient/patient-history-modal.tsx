'use client';

import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Chip,
  Divider,
  Spinner,
  Tabs,
  Tab,
} from '@heroui/react';
import { Icon } from '@iconify/react';

interface Appointment {
  _id: string;
  appointment_id: string;
  appointment_date: string;
  appointment_time: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  symptoms?: string;
  notes?: string;
  priority?: boolean;
}

interface Prescription {
  _id: string;
  prescriptionCode: string;
  prescriptionDate: string;
  diagnosis: string;
  status: 'active' | 'completed' | 'cancelled';
  medicines?: Array<{
    medicine?: { name?: string };
    dosage?: string;
    frequency?: string;
  }>;
  notes?: string;
}

interface PatientHistoryModalProps {
  patientId: string | null;
  patientName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function PatientHistoryModal({
  patientId,
  patientName,
  isOpen,
  onClose,
}: PatientHistoryModalProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [loadingPrescriptions, setLoadingPrescriptions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<string>('appointments');

  useEffect(() => {
    if (isOpen && patientId) {
      fetchAppointments();
      fetchPrescriptions();
    } else {
      // Reset when modal closes
      setAppointments([]);
      setPrescriptions([]);
      setError(null);
      setSelectedTab('appointments');
    }
  }, [isOpen, patientId]);

  const fetchAppointments = async () => {
    if (!patientId) return;

    setLoadingAppointments(true);
    setError(null);

    try {
      const response = await fetch(`/api/patients/${patientId}/appointments`);
      if (!response.ok) {
        throw new Error('Không thể tải lịch sử khám');
      }

      const data = await response.json();
      setAppointments(data.appointments || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải dữ liệu'
      );
    } finally {
      setLoadingAppointments(false);
    }
  };

  const fetchPrescriptions = async () => {
    if (!patientId) return;

    setLoadingPrescriptions(true);
    setError(null);

    try {
      const response = await fetch(`/api/patients/${patientId}/prescriptions`);
      if (!response.ok) {
        throw new Error('Không thể tải lịch sử đơn thuốc');
      }

      const data = await response.json();
      setPrescriptions(data.prescriptions || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải dữ liệu'
      );
    } finally {
      setLoadingPrescriptions(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? 'Ngày không hợp lệ'
      : date.toLocaleDateString('vi-VN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });
  };

  const formatDateTime = (dateString: string, time: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Ngày không hợp lệ';
    return `${formatDate(dateString)} ${time}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'danger';
      case 'confirmed':
        return 'primary';
      case 'active':
        return 'primary';
      default:
        return 'warning';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      scheduled: 'Đã đặt',
      confirmed: 'Đã xác nhận',
      completed: 'Hoàn thành',
      cancelled: 'Đã hủy',
      active: 'Đang dùng',
    };
    return labels[status] || status;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size='3xl'
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
                <Icon icon='lucide:history' className='w-6 h-6 text-primary' />
                <h2 className='text-xl font-bold'>Lịch sử bệnh nhân</h2>
              </div>
              <p className='text-default-500 font-normal'>{patientName}</p>
            </ModalHeader>

            <ModalBody>
              <Tabs
                selectedKey={selectedTab}
                onSelectionChange={key => setSelectedTab(key as string)}
                aria-label='History tabs'
              >
                <Tab
                  key='appointments'
                  title={
                    <div className='flex items-center gap-2'>
                      <Icon icon='lucide:calendar' className='w-4 h-4' />
                      <span>Lịch khám</span>
                      {appointments.length > 0 && (
                        <Chip size='sm' variant='flat' color='default'>
                          {appointments.length}
                        </Chip>
                      )}
                    </div>
                  }
                >
                  <div className='mt-4 space-y-4'>
                    {loadingAppointments ? (
                      <div className='flex justify-center py-8'>
                        <Spinner size='lg' color='primary' />
                      </div>
                    ) : error ? (
                      <div className='flex flex-col items-center justify-center py-8'>
                        <Icon
                          icon='lucide:alert-circle'
                          className='w-12 h-12 text-danger mb-4'
                        />
                        <p className='text-danger'>{error}</p>
                      </div>
                    ) : appointments.length === 0 ? (
                      <div className='text-center py-8'>
                        <Icon
                          icon='lucide:calendar-x'
                          className='w-12 h-12 text-default-300 mx-auto mb-4'
                        />
                        <p className='text-default-500'>
                          Chưa có lịch khám nào
                        </p>
                      </div>
                    ) : (
                      appointments.map(appointment => (
                        <div
                          key={appointment._id}
                          className='p-4 border border-default-200 rounded-lg hover:border-primary-300 transition-colors'
                        >
                          <div className='flex items-start justify-between mb-2'>
                            <div className='flex-1'>
                              <div className='flex items-center gap-2 mb-1'>
                                <Icon
                                  icon='lucide:calendar-clock'
                                  className='w-4 h-4 text-primary'
                                />
                                <span className='font-semibold'>
                                  {formatDateTime(
                                    appointment.appointment_date,
                                    appointment.appointment_time
                                  )}
                                </span>
                              </div>
                              {appointment.symptoms && (
                                <p className='text-sm text-default-600 mb-1'>
                                  <span className='font-medium'>
                                    Triệu chứng:
                                  </span>{' '}
                                  {appointment.symptoms}
                                </p>
                              )}
                              {appointment.notes && (
                                <p className='text-sm text-default-500'>
                                  <span className='font-medium'>Ghi chú:</span>{' '}
                                  {appointment.notes}
                                </p>
                              )}
                            </div>
                            <Chip
                              size='sm'
                              color={getStatusColor(appointment.status)}
                              variant='flat'
                            >
                              {getStatusLabel(appointment.status)}
                            </Chip>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </Tab>

                <Tab
                  key='prescriptions'
                  title={
                    <div className='flex items-center gap-2'>
                      <Icon icon='lucide:file-text' className='w-4 h-4' />
                      <span>Đơn thuốc</span>
                      {prescriptions.length > 0 && (
                        <Chip size='sm' variant='flat' color='default'>
                          {prescriptions.length}
                        </Chip>
                      )}
                    </div>
                  }
                >
                  <div className='mt-4 space-y-4'>
                    {loadingPrescriptions ? (
                      <div className='flex justify-center py-8'>
                        <Spinner size='lg' color='primary' />
                      </div>
                    ) : error ? (
                      <div className='flex flex-col items-center justify-center py-8'>
                        <Icon
                          icon='lucide:alert-circle'
                          className='w-12 h-12 text-danger mb-4'
                        />
                        <p className='text-danger'>{error}</p>
                      </div>
                    ) : prescriptions.length === 0 ? (
                      <div className='text-center py-8'>
                        <Icon
                          icon='lucide:file-x'
                          className='w-12 h-12 text-default-300 mx-auto mb-4'
                        />
                        <p className='text-default-500'>
                          Chưa có đơn thuốc nào
                        </p>
                      </div>
                    ) : (
                      prescriptions.map(prescription => (
                        <div
                          key={prescription._id}
                          className='p-4 border border-default-200 rounded-lg hover:border-primary-300 transition-colors'
                        >
                          <div className='flex items-start justify-between mb-2'>
                            <div className='flex-1'>
                              <div className='flex items-center gap-2 mb-1'>
                                <Icon
                                  icon='lucide:file-text'
                                  className='w-4 h-4 text-primary'
                                />
                                <span className='font-semibold'>
                                  {formatDate(prescription.prescriptionDate)}
                                </span>
                                {prescription.prescriptionCode && (
                                  <span className='text-sm text-default-500'>
                                    ({prescription.prescriptionCode})
                                  </span>
                                )}
                              </div>
                              {prescription.diagnosis && (
                                <p className='text-sm text-default-600 mb-1'>
                                  <span className='font-medium'>
                                    Chẩn đoán:
                                  </span>{' '}
                                  {prescription.diagnosis}
                                </p>
                              )}
                              {prescription.medicines &&
                                prescription.medicines.length > 0 && (
                                  <p className='text-sm text-default-500'>
                                    <span className='font-medium'>
                                      Số lượng thuốc:
                                    </span>{' '}
                                    {prescription.medicines.length}
                                  </p>
                                )}
                              {prescription.notes && (
                                <p className='text-sm text-default-500 mt-1'>
                                  <span className='font-medium'>Ghi chú:</span>{' '}
                                  {prescription.notes}
                                </p>
                              )}
                            </div>
                            <Chip
                              size='sm'
                              color={getStatusColor(prescription.status)}
                              variant='flat'
                            >
                              {getStatusLabel(prescription.status)}
                            </Chip>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </Tab>
              </Tabs>
            </ModalBody>

            <ModalFooter>
              <Button color='default' variant='light' onPress={onClose}>
                Đóng
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
