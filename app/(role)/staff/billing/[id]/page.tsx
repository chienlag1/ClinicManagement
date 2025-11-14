'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Icon } from '@iconify/react';

interface Bill {
  _id: string;
  billCode: string;
  patient: {
    _id: string;
    patient_id?: string;
    name: string;
    phone?: string;
    gender?: string;
    birth_date?: string;
    address?: string;
  };
  prescription?: {
    _id: string;
    prescriptionCode: string;
    diagnosis?: string;
  };
  appointment?: {
    _id: string;
    appointment_id: string;
    appointment_date?: string;
    appointment_time?: string;
  };
  description: string;
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'cancelled';
  paymentDate?: string;
  paymentOrderCode?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function BillDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [bill, setBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBill = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/bills/${params.id}`);
        if (!response.ok) {
          throw new Error('Không thể tải thông tin hóa đơn');
        }
        const data = await response.json();
        setBill(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Đã có lỗi xảy ra');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchBill();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className='container mx-auto py-10'>
        <div className='flex items-center justify-center min-h-[400px]'>
          <Icon icon='lucide:loader-2' className='w-6 h-6 animate-spin mr-2' />
          <div className='text-lg'>Đang tải...</div>
        </div>
      </div>
    );
  }

  if (error || !bill) {
    return (
      <div className='container mx-auto py-10'>
        <div className='flex flex-col items-center justify-center min-h-[400px]'>
          <div className='text-lg text-red-600 mb-4'>
            {error || 'Không tìm thấy hóa đơn'}
          </div>
          <Button onClick={() => router.push('/staff/billing')}>
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  const statusLabels = {
    pending: {
      text: 'Chưa thanh toán',
      color: 'bg-yellow-100 text-yellow-800',
    },
    paid: { text: 'Đã thanh toán', color: 'bg-green-100 text-green-800' },
    cancelled: { text: 'Đã hủy', color: 'bg-red-100 text-red-800' },
  };

  const currentStatus = bill.paymentStatus || 'pending';
  const statusLabel = statusLabels[currentStatus] || statusLabels.pending;

  return (
    <div className='container mx-auto py-10'>
      <div className='mb-6'>
        <Button
          variant='ghost'
          onClick={() => router.push('/staff/billing')}
          className='mb-4'
        >
          <ArrowLeftIcon className='w-4 h-4 mr-2' />
          Quay lại
        </Button>

        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>Chi tiết hóa đơn</h1>
            {bill.billCode && (
              <p className='text-lg text-gray-600 mt-1'>
                Mã hóa đơn:{' '}
                <span className='font-semibold text-blue-600'>
                  #{bill.billCode}
                </span>
              </p>
            )}
          </div>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${statusLabel.color}`}
          >
            {statusLabel.text}
          </span>
        </div>
      </div>

      <div className='bg-white rounded-lg shadow-md p-6 space-y-6'>
        {/* Patient Information */}
        <div className='border-b pb-6'>
          <h2 className='text-xl font-semibold mb-4'>Thông tin bệnh nhân</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {bill.patient.patient_id && (
              <div>
                <div className='text-sm text-gray-600'>Mã bệnh nhân</div>
                <p className='text-lg font-medium'>{bill.patient.patient_id}</p>
              </div>
            )}
            <div>
              <div className='text-sm text-gray-600'>Tên bệnh nhân</div>
              <p className='text-lg font-medium'>{bill.patient.name}</p>
            </div>
            {bill.patient.phone && (
              <div>
                <div className='text-sm text-gray-600'>Số điện thoại</div>
                <p className='text-lg font-medium'>{bill.patient.phone}</p>
              </div>
            )}
            {bill.patient.gender && (
              <div>
                <div className='text-sm text-gray-600'>Giới tính</div>
                <p className='text-lg font-medium'>
                  {bill.patient.gender === 'male' ? 'Nam' : 'Nữ'}
                </p>
              </div>
            )}
            {bill.patient.birth_date && (
              <div>
                <div className='text-sm text-gray-600'>Ngày sinh</div>
                <p className='text-lg font-medium'>
                  {new Date(bill.patient.birth_date).toLocaleDateString(
                    'vi-VN'
                  )}
                </p>
              </div>
            )}
            {bill.patient.address && (
              <div>
                <div className='text-sm text-gray-600'>Địa chỉ</div>
                <p className='text-lg font-medium'>{bill.patient.address}</p>
              </div>
            )}
          </div>
        </div>

        {/* Bill Information */}
        <div className='border-b pb-6'>
          <h2 className='text-xl font-semibold mb-4'>Thông tin hóa đơn</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <div className='text-sm text-gray-600'>Mô tả</div>
              <p className='text-lg font-medium'>{bill.description}</p>
            </div>
            <div>
              <div className='text-sm text-gray-600'>Tổng tiền</div>
              <p className='text-2xl font-bold text-green-600'>
                {bill.totalAmount.toLocaleString('vi-VN')} đ
              </p>
            </div>
            {bill.paymentDate && (
              <div>
                <div className='text-sm text-gray-600'>Ngày thanh toán</div>
                <p className='text-lg font-medium'>
                  {new Date(bill.paymentDate).toLocaleString('vi-VN')}
                </p>
              </div>
            )}
            {bill.paymentOrderCode && (
              <div>
                <div className='text-sm text-gray-600'>Mã đơn hàng</div>
                <p className='text-lg font-medium'>{bill.paymentOrderCode}</p>
              </div>
            )}
            <div>
              <div className='text-sm text-gray-600'>Ngày tạo</div>
              <p className='text-lg font-medium'>
                {new Date(bill.createdAt).toLocaleString('vi-VN')}
              </p>
            </div>
            <div>
              <div className='text-sm text-gray-600'>Cập nhật lần cuối</div>
              <p className='text-lg font-medium'>
                {new Date(bill.updatedAt).toLocaleString('vi-VN')}
              </p>
            </div>
          </div>
        </div>

        {/* Related Information */}
        {(bill.prescription || bill.appointment) && (
          <div className='border-b pb-6'>
            <h2 className='text-xl font-semibold mb-4'>Thông tin liên quan</h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {bill.prescription && (
                <div>
                  <div className='text-sm text-gray-600'>Đơn thuốc</div>
                  <a
                    href={`/staff/prescriptions/${bill.prescription._id}`}
                    className='text-lg font-medium text-blue-600 hover:underline'
                  >
                    #
                    {bill.prescription.prescriptionCode ||
                      bill.prescription._id.slice(-6)}
                  </a>
                  {bill.prescription.diagnosis && (
                    <p className='text-sm text-gray-500 mt-1'>
                      Chẩn đoán: {bill.prescription.diagnosis}
                    </p>
                  )}
                </div>
              )}
              {bill.appointment && (
                <div>
                  <div className='text-sm text-gray-600'>Lịch khám</div>
                  <p className='text-lg font-medium'>
                    #{bill.appointment.appointment_id}
                  </p>
                  {bill.appointment.appointment_date && (
                    <p className='text-sm text-gray-500 mt-1'>
                      {new Date(
                        bill.appointment.appointment_date
                      ).toLocaleDateString('vi-VN')}{' '}
                      {bill.appointment.appointment_time &&
                        `- ${bill.appointment.appointment_time}`}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {bill.notes && (
          <div className='border-b pb-6'>
            <h2 className='text-xl font-semibold mb-4'>Ghi chú</h2>
            <p className='text-lg whitespace-pre-wrap'>{bill.notes}</p>
          </div>
        )}

        {/* Actions */}
        <div className='flex justify-end space-x-4 pt-4'>
          <Button
            variant='outline'
            onClick={() => router.push('/staff/billing')}
          >
            Đóng
          </Button>
          {bill.prescription && (
            <Button
              onClick={() =>
                router.push(`/staff/prescriptions/${bill.prescription!._id}`)
              }
            >
              Xem đơn thuốc
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
