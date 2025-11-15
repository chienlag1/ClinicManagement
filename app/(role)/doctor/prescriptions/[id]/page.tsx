'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Chip,
  Divider,
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { useNotification } from '@/components/notification-popup';

interface PrescriptionDetail {
  _id: string;
  patient: {
    _id: string;
    patient_id?: string;
    fullName?: string;
    name?: string;
    phone?: string;
    birth_date?: string;
    gender?: string;
  };
  doctor: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  diagnosis: string;
  medicines: Array<{
    medicine: {
      _id: string;
      medicine_name?: string;
      name?: string;
      type?: string;
      price?: number;
      unit?: string;
    };
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }>;
  notes: string;
  prescriptionDate: string;
  status: 'active' | 'completed' | 'cancelled';
  createdAt?: string;
  updatedAt?: string;
}

export default function PrescriptionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { showError } = useNotification();
  const prescriptionId = params?.id as string;

  const [prescription, setPrescription] = useState<PrescriptionDetail | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrescription = async () => {
      if (!prescriptionId) return;

      setLoading(true);
      try {
        const response = await fetch(`/api/prescriptions/${prescriptionId}`);
        if (response.ok) {
          const result = await response.json();
          setPrescription(result.prescription);
        } else {
          const error = await response.json();
          showError('Lỗi', error.error || 'Không thể tải thông tin đơn thuốc');
          router.push('/doctor/prescriptions');
        }
      } catch (error: any) {
        console.error('Error fetching prescription:', error);
        showError('Lỗi', 'Có lỗi xảy ra khi tải thông tin đơn thuốc');
        router.push('/doctor/prescriptions');
      } finally {
        setLoading(false);
      }
    };

    fetchPrescription();
  }, [prescriptionId, router, showError]);

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='text-center'>
          <Icon
            icon='lucide:loader-2'
            className='w-8 h-8 animate-spin mx-auto mb-4 text-primary'
          />
          <p className='text-gray-500'>Đang tải thông tin đơn thuốc...</p>
        </div>
      </div>
    );
  }

  if (!prescription) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='text-center'>
          <Icon
            icon='lucide:file-x'
            className='w-12 h-12 mx-auto mb-4 text-gray-400'
          />
          <p className='text-gray-500'>Không tìm thấy đơn thuốc</p>
          <Button
            className='mt-4'
            color='primary'
            variant='flat'
            onPress={() => router.push('/doctor/prescriptions')}
          >
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  const statusLabels = {
    active: 'Đang xử lý',
    completed: 'Đã hoàn thành',
    cancelled: 'Đã hủy',
  };

  const statusColors = {
    active: 'warning',
    completed: 'success',
    cancelled: 'danger',
  } as const;

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>
            Chi tiết đơn thuốc
          </h1>
          <p className='text-gray-600 mt-2'>Mã đơn: {prescription._id}</p>
        </div>
        <div className='flex gap-2'>
          <Button
            variant='flat'
            onPress={() =>
              router.push(`/doctor/prescriptions/form?id=${prescription._id}`)
            }
          >
            <Icon icon='lucide:edit' className='w-4 h-4' />
            Chỉnh sửa
          </Button>
          <Button
            variant='flat'
            color='default'
            onPress={() => router.push('/doctor/prescriptions')}
          >
            <Icon icon='lucide:arrow-left' className='w-4 h-4' />
            Quay lại
          </Button>
        </div>
      </div>

      {/* Status Chip */}
      <div>
        <Chip
          color={statusColors[prescription.status]}
          variant='flat'
          size='lg'
        >
          {statusLabels[prescription.status]}
        </Chip>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Patient Information */}
        <Card>
          <CardHeader className='flex gap-3'>
            <Icon icon='lucide:user' className='w-5 h-5 text-primary' />
            <h2 className='text-xl font-semibold'>Thông tin bệnh nhân</h2>
          </CardHeader>
          <CardBody className='space-y-3'>
            {prescription.patient?.patient_id && (
              <div>
                <p className='text-sm text-gray-500'>Mã bệnh nhân</p>
                <p className='text-base font-medium'>
                  {prescription.patient.patient_id}
                </p>
              </div>
            )}
            <div>
              <p className='text-sm text-gray-500'>Họ tên</p>
              <p className='text-base font-medium'>
                {prescription.patient?.fullName ||
                  prescription.patient?.name ||
                  'N/A'}
              </p>
            </div>
            {prescription.patient?.birth_date && (
              <div>
                <p className='text-sm text-gray-500'>Ngày sinh</p>
                <p className='text-base font-medium'>
                  {new Date(prescription.patient.birth_date).toLocaleDateString(
                    'vi-VN'
                  )}
                </p>
              </div>
            )}
            {prescription.patient?.gender && (
              <div>
                <p className='text-sm text-gray-500'>Giới tính</p>
                <p className='text-base font-medium'>
                  {prescription.patient.gender === 'male' ? 'Nam' : 'Nữ'}
                </p>
              </div>
            )}
            {prescription.patient?.phone && (
              <div>
                <p className='text-sm text-gray-500'>Số điện thoại</p>
                <p className='text-base font-medium'>
                  {prescription.patient.phone}
                </p>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Doctor Information */}
        <Card>
          <CardHeader className='flex gap-3'>
            <Icon icon='lucide:user-check' className='w-5 h-5 text-primary' />
            <h2 className='text-xl font-semibold'>Thông tin bác sĩ</h2>
          </CardHeader>
          <CardBody className='space-y-3'>
            <div>
              <p className='text-sm text-gray-500'>Bác sĩ</p>
              <p className='text-base font-medium'>
                {prescription.doctor?.firstName && prescription.doctor?.lastName
                  ? `${prescription.doctor.firstName} ${prescription.doctor.lastName}`
                  : prescription.doctor?.email || 'N/A'}
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Diagnosis */}
      <Card>
        <CardHeader className='flex gap-3'>
          <Icon icon='lucide:stethoscope' className='w-5 h-5 text-primary' />
          <h2 className='text-xl font-semibold'>Chẩn đoán</h2>
        </CardHeader>
        <CardBody>
          <p className='text-base'>{prescription.diagnosis || 'Không có'}</p>
        </CardBody>
      </Card>

      {/* Medicines */}
      <Card>
        <CardHeader className='flex gap-3'>
          <Icon icon='lucide:pills' className='w-5 h-5 text-primary' />
          <h2 className='text-xl font-semibold'>Danh sách thuốc</h2>
        </CardHeader>
        <CardBody>
          {prescription.medicines && prescription.medicines.length > 0 ? (
            <div className='space-y-4'>
              {prescription.medicines.map((item, index) => (
                <div key={index}>
                  <div className='bg-gray-50 p-4 rounded-lg space-y-2'>
                    <div className='flex items-start justify-between'>
                      <div className='flex-1'>
                        <h3 className='font-semibold text-lg'>
                          {item.medicine?.medicine_name ||
                            item.medicine?.name ||
                            'Thuốc không xác định'}
                        </h3>
                        {item.medicine?.type && (
                          <Chip size='sm' variant='flat' className='mt-1'>
                            {item.medicine.type}
                          </Chip>
                        )}
                      </div>
                      {item.medicine?.price && (
                        <p className='text-primary font-semibold'>
                          {item.medicine.price.toLocaleString('vi-VN')} VNĐ
                          {item.medicine.unit && ` / ${item.medicine.unit}`}
                        </p>
                      )}
                    </div>
                    <Divider className='my-2' />
                    <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
                      <div>
                        <p className='text-gray-500'>Liều lượng</p>
                        <p className='font-medium'>{item.dosage}</p>
                      </div>
                      <div>
                        <p className='text-gray-500'>Tần suất</p>
                        <p className='font-medium'>{item.frequency}</p>
                      </div>
                      <div>
                        <p className='text-gray-500'>Thời gian dùng</p>
                        <p className='font-medium'>{item.duration}</p>
                      </div>
                      <div>
                        <p className='text-gray-500'>Cách dùng</p>
                        <p className='font-medium'>
                          {item.instructions || 'Không có'}
                        </p>
                      </div>
                    </div>
                  </div>
                  {index < prescription.medicines.length - 1 && (
                    <Divider className='my-4' />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className='text-gray-500'>Không có thuốc trong đơn</p>
          )}
        </CardBody>
      </Card>

      {/* Notes */}
      {prescription.notes && (
        <Card>
          <CardHeader className='flex gap-3'>
            <Icon icon='lucide:file-text' className='w-5 h-5 text-primary' />
            <h2 className='text-xl font-semibold'>Ghi chú</h2>
          </CardHeader>
          <CardBody>
            <p className='text-base whitespace-pre-wrap'>
              {prescription.notes}
            </p>
          </CardBody>
        </Card>
      )}

      {/* Date Information */}
      <Card>
        <CardHeader className='flex gap-3'>
          <Icon icon='lucide:calendar' className='w-5 h-5 text-primary' />
          <h2 className='text-xl font-semibold'>Thông tin ngày tháng</h2>
        </CardHeader>
        <CardBody>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div>
              <p className='text-sm text-gray-500'>Ngày kê đơn</p>
              <p className='text-base font-medium'>
                {prescription.prescriptionDate
                  ? new Date(prescription.prescriptionDate).toLocaleDateString(
                      'vi-VN',
                      {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      }
                    )
                  : 'N/A'}
              </p>
            </div>
            {prescription.createdAt && (
              <div>
                <p className='text-sm text-gray-500'>Ngày tạo</p>
                <p className='text-base font-medium'>
                  {new Date(prescription.createdAt).toLocaleDateString(
                    'vi-VN',
                    {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    }
                  )}
                </p>
              </div>
            )}
            {prescription.updatedAt && (
              <div>
                <p className='text-sm text-gray-500'>Cập nhật lần cuối</p>
                <p className='text-base font-medium'>
                  {new Date(prescription.updatedAt).toLocaleDateString(
                    'vi-VN',
                    {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    }
                  )}
                </p>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
