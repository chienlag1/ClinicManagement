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
} from '@heroui/react';
import { Icon } from '@iconify/react';

interface Patient {
  _id: string;
  id_card: string;
  name: string;
  gender: 'male' | 'female';
  birth_date: string;
  phone: string;
  address: string;
  createdAt: string;
  patient_id?: string;
}

interface PatientDetailModalProps {
  patientId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PatientDetailModal({
  patientId,
  isOpen,
  onClose,
}: PatientDetailModalProps) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && patientId) {
      fetchPatientDetails();
    } else {
      setPatient(null);
      setError(null);
    }
  }, [isOpen, patientId]);

  const fetchPatientDetails = async () => {
    if (!patientId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/patients/${patientId}`);
      if (!response.ok) {
        throw new Error('Không thể tải thông tin bệnh nhân');
      }

      const data = await response.json();
      setPatient(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải dữ liệu'
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? 'Ngày không hợp lệ'
      : date.toLocaleDateString('vi-VN');
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age;
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
                <Icon icon='lucide:user' className='w-6 h-6 text-primary' />
                <h2 className='text-xl font-bold'>Thông tin bệnh nhân</h2>
              </div>
              <p className='text-default-500 font-normal'>
                Chi tiết thông tin bệnh nhân
              </p>
            </ModalHeader>

            <ModalBody>
              {loading ? (
                <div className='flex justify-center items-center py-8'>
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
              ) : patient ? (
                <div className='space-y-6'>
                  {/* Basic Information */}
                  <div className='space-y-4'>
                    <div className='flex items-center gap-2'>
                      <Icon
                        icon='lucide:user-circle'
                        className='w-5 h-5 text-primary'
                      />
                      <h3 className='text-lg font-semibold'>
                        Thông tin cơ bản
                      </h3>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <div className='space-y-2'>
                        <p className='text-sm text-default-500'>Họ và tên</p>
                        <p className='font-medium text-lg'>{patient.name}</p>
                      </div>
                      <div className='space-y-2'>
                        <p className='text-sm text-default-500'>Giới tính</p>
                        <Chip
                          size='sm'
                          color={
                            patient.gender === 'male' ? 'primary' : 'secondary'
                          }
                          variant='flat'
                        >
                          {patient.gender === 'male' ? 'Nam' : 'Nữ'}
                        </Chip>
                      </div>
                      <div className='space-y-2'>
                        <p className='text-sm text-default-500'>Tuổi</p>
                        <p className='font-medium'>
                          {calculateAge(patient.birth_date)} tuổi
                        </p>
                      </div>
                      <div className='space-y-2'>
                        <p className='text-sm text-default-500'>Ngày sinh</p>
                        <p className='font-medium'>
                          {formatDate(patient.birth_date)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Divider />

                  {/* Contact Information */}
                  <div className='space-y-4'>
                    <div className='flex items-center gap-2'>
                      <Icon
                        icon='lucide:phone'
                        className='w-5 h-5 text-primary'
                      />
                      <h3 className='text-lg font-semibold'>
                        Thông tin liên hệ
                      </h3>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <div className='space-y-2'>
                        <p className='text-sm text-default-500'>Số CMND/CCCD</p>
                        <p className='font-medium'>{patient.id_card}</p>
                      </div>
                      <div className='space-y-2'>
                        <p className='text-sm text-default-500'>
                          Số điện thoại
                        </p>
                        <p className='font-medium'>{patient.phone}</p>
                      </div>
                      <div className='space-y-2 md:col-span-2'>
                        <p className='text-sm text-default-500'>Địa chỉ</p>
                        <p className='font-medium'>{patient.address}</p>
                      </div>
                    </div>
                  </div>

                  <Divider />

                  {/* Additional Information */}
                  <div className='space-y-4'>
                    <div className='flex items-center gap-2'>
                      <Icon
                        icon='lucide:info'
                        className='w-5 h-5 text-primary'
                      />
                      <h3 className='text-lg font-semibold'>
                        Thông tin bổ sung
                      </h3>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      {patient.patient_id && (
                        <div className='space-y-2'>
                          <p className='text-sm text-default-500'>
                            Mã bệnh nhân
                          </p>
                          <p className='font-medium'>{patient.patient_id}</p>
                        </div>
                      )}
                      <div className='space-y-2'>
                        <p className='text-sm text-default-500'>Ngày tạo</p>
                        <p className='font-medium'>
                          {formatDate(patient.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
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
