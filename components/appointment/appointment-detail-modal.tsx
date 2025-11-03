'use client';

import React from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Chip,
  Divider,
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { Appointment, statusColors, getStatusLabel } from '@/types/appointment';

interface AppointmentDetailModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AppointmentDetailModal({
  appointment,
  isOpen,
  onClose,
}: AppointmentDetailModalProps) {
  if (!appointment) return null;

  const patient =
    typeof appointment.patient_id === 'object' ? appointment.patient_id : null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? 'Ngày không hợp lệ'
      : date.toLocaleDateString('vi-VN');
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
                <Icon icon='lucide:calendar' className='w-6 h-6 text-primary' />
                <h2 className='text-xl font-bold'>Chi tiết lịch khám</h2>
              </div>
              <p className='text-default-500 font-normal'>
                Thông tin chi tiết về lịch khám
              </p>
            </ModalHeader>

            <ModalBody>
              <div className='space-y-6'>
                {/* Patient Information */}
                <div className='space-y-4'>
                  <div className='flex items-center gap-2'>
                    <Icon icon='lucide:user' className='w-5 h-5 text-primary' />
                    <h3 className='text-lg font-semibold'>
                      Thông tin bệnh nhân
                    </h3>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <p className='text-sm text-default-500'>Tên bệnh nhân</p>
                      <p className='font-medium'>
                        {patient?.name || 'Chưa có thông tin'}
                      </p>
                    </div>
                    <div className='space-y-2'>
                      <p className='text-sm text-default-500'>ID bệnh nhân</p>
                      <p className='font-medium'>
                        {patient?.patient_id || 'N/A'}
                      </p>
                    </div>
                    <div className='space-y-2'>
                      <p className='text-sm text-default-500'>Số điện thoại</p>
                      <p className='font-medium'>{patient?.phone || 'N/A'}</p>
                    </div>
                    <div className='space-y-2'>
                      <p className='text-sm text-default-500'>Địa chỉ</p>
                      <p className='font-medium'>{patient?.address || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <Divider />

                {/* Appointment Information */}
                <div className='space-y-4'>
                  <div className='flex items-center gap-2'>
                    <Icon
                      icon='lucide:calendar-days'
                      className='w-5 h-5 text-primary'
                    />
                    <h3 className='text-lg font-semibold'>
                      Thông tin lịch khám
                    </h3>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <p className='text-sm text-default-500'>Ngày khám</p>
                      <p className='font-medium'>
                        {formatDate(appointment.appointment_date)}
                      </p>
                    </div>
                    <div className='space-y-2'>
                      <p className='text-sm text-default-500'>Giờ khám</p>
                      <p className='font-medium'>
                        {appointment.appointment_time}
                      </p>
                    </div>
                    <div className='space-y-2'>
                      <p className='text-sm text-default-500'>Trạng thái</p>
                      <Chip
                        size='sm'
                        color={
                          appointment.status === 'completed'
                            ? 'success'
                            : appointment.status === 'cancelled'
                              ? 'danger'
                              : appointment.status === 'confirmed'
                                ? 'primary'
                                : 'warning'
                        }
                        variant='flat'
                      >
                        {getStatusLabel(appointment.status)}
                      </Chip>
                    </div>
                    <div className='space-y-2'>
                      <p className='text-sm text-default-500'>Ưu tiên</p>
                      {appointment.priority ? (
                        <Chip size='sm' color='warning' variant='flat'>
                          <Icon icon='lucide:star' className='w-3 h-3 mr-1' />
                          Có ưu tiên
                        </Chip>
                      ) : (
                        <Chip size='sm' color='default' variant='flat'>
                          Bình thường
                        </Chip>
                      )}
                    </div>
                  </div>
                </div>

                <Divider />

                {/* Medical Information */}
                <div className='space-y-4'>
                  <div className='flex items-center gap-2'>
                    <Icon
                      icon='lucide:stethoscope'
                      className='w-5 h-5 text-primary'
                    />
                    <h3 className='text-lg font-semibold'>Thông tin y tế</h3>
                  </div>

                  <div className='space-y-4'>
                    <div className='space-y-2'>
                      <p className='text-sm text-default-500'>Triệu chứng</p>
                      <div className='p-3 bg-default-100 rounded-lg'>
                        <p className='text-sm'>
                          {appointment.symptoms || 'Không có thông tin'}
                        </p>
                      </div>
                    </div>

                    {appointment.notes && (
                      <div className='space-y-2'>
                        <p className='text-sm text-default-500'>Ghi chú</p>
                        <div className='p-3 bg-default-100 rounded-lg'>
                          <p className='text-sm'>{appointment.notes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Divider />

                {/* Additional Information */}
                <div className='space-y-4'>
                  <div className='flex items-center gap-2'>
                    <Icon icon='lucide:info' className='w-5 h-5 text-primary' />
                    <h3 className='text-lg font-semibold'>Thông tin bổ sung</h3>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <p className='text-sm text-default-500'>
                        Bác sĩ phụ trách
                      </p>
                      <p className='font-medium'>
                        {typeof appointment.doctor_id === 'object'
                          ? appointment.doctor_id?.name || 'Chưa xác định'
                          : `Doctor ID: ${appointment.doctor_id}`}
                      </p>
                    </div>
                    <div className='space-y-2'>
                      <p className='text-sm text-default-500'>Người tạo</p>
                      <p className='font-medium'>
                        {appointment.created_by || 'N/A'}
                      </p>
                    </div>
                    <div className='space-y-2'>
                      <p className='text-sm text-default-500'>Ngày tạo</p>
                      <p className='font-medium'>
                        {new Date(appointment.createdAt).toLocaleDateString(
                          'vi-VN'
                        )}
                      </p>
                    </div>
                    <div className='space-y-2'>
                      <p className='text-sm text-default-500'>
                        Cập nhật lần cuối
                      </p>
                      <p className='font-medium'>
                        {new Date(appointment.updatedAt).toLocaleDateString(
                          'vi-VN'
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </ModalBody>

            <ModalFooter>
              <Button color='default' variant='light' onPress={onClose}>
                Đóng
              </Button>
              <Button color='primary' onPress={onClose}>
                Xác nhận
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
