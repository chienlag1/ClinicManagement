'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface Medicine {
  medicine: {
    _id: string;
    medicine_code: string;
    medicine_name: string;
    type: string;
    price: number;
    unit: string;
  };
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface Prescription {
  _id: string;
  prescriptionCode?: string;
  patient: {
    _id: string;
    patient_id: string;
    patient_code: string;
    name: string;
    phone?: string;
    birth_date: string;
    gender: string;
    address: string;
  };
  doctor: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  diagnosis: string;
  medicines: Medicine[];
  notes?: string;
  status: 'active' | 'completed' | 'cancelled';
  prescriptionDate?: string;
  createdAt: string;
  updatedAt: string;
}

export default function PrescriptionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrescription = async () => {
      try {
        const response = await fetch(`/api/prescriptions/${params.id}`);
        if (!response.ok) throw new Error('Không thể tải thông tin đơn thuốc');
        const data = await response.json();
        setPrescription(data.prescription || data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Đã có lỗi xảy ra');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchPrescription();
    }
  }, [params.id]);

  // Xử lý kết quả thanh toán từ URL query
  useEffect(() => {
    const handlePaymentResult = async () => {
      if (typeof window === 'undefined') return;

      const urlParams = new URLSearchParams(window.location.search);
      const paymentStatus = urlParams.get('payment');

      if (paymentStatus && prescription) {
        let updateData: {
          status?: 'completed' | 'cancelled';
          paymentStatus?: 'paid' | 'cancelled';
        } | null = null;
        let message = '';

        if (paymentStatus === 'success') {
          updateData = {
            status: 'completed',
            paymentStatus: 'paid',
          };
          message = 'Thanh toán thành công! Đơn thuốc đã được hoàn thành.';
        } else if (paymentStatus === 'cancel') {
          updateData = {
            status: 'cancelled',
            paymentStatus: 'cancelled',
          };
          message =
            'Thanh toán đã bị hủy. Đơn thuốc đã được đánh dấu là đã hủy.';
        }

        if (updateData) {
          try {
            // Cập nhật trạng thái đơn thuốc và payment status
            const response = await fetch(
              `/api/prescriptions/${prescription._id}`,
              {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData),
              }
            );

            if (response.ok) {
              const responseData = await response.json();
              // Cập nhật state local với dữ liệu từ server
              const updatedPrescription = responseData.prescription || {
                ...prescription,
                ...updateData,
              };
              setPrescription(updatedPrescription);

              // Hiển thị thông báo thành công
              alert(message);

              // Xóa query parameter khỏi URL để tránh xử lý lại
              window.history.replaceState({}, '', window.location.pathname);
            }
          } catch (error) {
            console.error('Error updating prescription status:', error);
          }
        }
      }
    };

    handlePaymentResult();
  }, [prescription]);

  if (loading) {
    return (
      <div className='container mx-auto py-10'>
        <div className='flex items-center justify-center min-h-[400px]'>
          <div className='text-lg'>Đang tải...</div>
        </div>
      </div>
    );
  }

  if (error || !prescription) {
    return (
      <div className='container mx-auto py-10'>
        <div className='flex flex-col items-center justify-center min-h-[400px]'>
          <div className='text-lg text-red-600 mb-4'>
            {error || 'Không tìm thấy đơn thuốc'}
          </div>
          <Button onClick={() => router.push('/staff/prescriptions')}>
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  const statusLabels = {
    active: { text: 'Đang xử lý', color: 'bg-blue-100 text-blue-800' },
    completed: { text: 'Đã hoàn thành', color: 'bg-green-100 text-green-800' },
    cancelled: { text: 'Đã hủy', color: 'bg-red-100 text-red-800' },
  };

  const currentStatus = prescription.status || 'active';
  const statusLabel = statusLabels[currentStatus] || statusLabels.active;

  // Tính tổng tiền từ giá thuốc thực tế
  const totalAmount = prescription.medicines.reduce((sum, item) => {
    return sum + (item.medicine?.price || 0);
  }, 0);

  return (
    <div className='container mx-auto py-10'>
      <div className='mb-6'>
        <Button
          variant='ghost'
          onClick={() => router.push('/staff/prescriptions')}
          className='mb-4'
        >
          <ArrowLeftIcon className='w-4 h-4 mr-2' />
          Quay lại
        </Button>

        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>Chi tiết đơn thuốc</h1>
            {prescription.prescriptionCode && (
              <p className='text-lg text-gray-600 mt-1'>
                Mã đơn:{' '}
                <span className='font-semibold text-blue-600'>
                  #{prescription.prescriptionCode}
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
            <div>
              <div className='text-sm text-gray-600'>Mã bệnh nhân</div>
              <p className='text-lg font-medium'>
                {prescription.patient.patient_id ||
                  prescription.patient.patient_code}
              </p>
            </div>
            <div>
              <div className='text-sm text-gray-600'>Tên bệnh nhân</div>
              <p className='text-lg font-medium'>{prescription.patient.name}</p>
            </div>
            <div>
              <div className='text-sm text-gray-600'>Ngày sinh</div>
              <p className='text-lg font-medium'>
                {new Date(prescription.patient.birth_date).toLocaleDateString(
                  'vi-VN'
                )}
              </p>
            </div>
            <div>
              <div className='text-sm text-gray-600'>Giới tính</div>
              <p className='text-lg font-medium'>
                {prescription.patient.gender === 'male' ? 'Nam' : 'Nữ'}
              </p>
            </div>
            {prescription.patient.phone && (
              <div>
                <div className='text-sm text-gray-600'>Số điện thoại</div>
                <p className='text-lg font-medium'>
                  {prescription.patient.phone}
                </p>
              </div>
            )}
            {prescription.patient.address && (
              <div>
                <div className='text-sm text-gray-600'>Địa chỉ</div>
                <p className='text-lg font-medium'>
                  {prescription.patient.address}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Prescription Information */}
        <div className='border-b pb-6'>
          <h2 className='text-xl font-semibold mb-4'>Thông tin đơn thuốc</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <div className='text-sm text-gray-600'>Bác sĩ kê đơn</div>
              <p className='text-lg font-medium'>
                BS. {prescription.doctor.firstName}{' '}
                {prescription.doctor.lastName}
              </p>
            </div>
            {prescription.prescriptionDate && (
              <div>
                <div className='text-sm text-gray-600'>Ngày kê đơn</div>
                <p className='text-lg font-medium'>
                  {new Date(prescription.prescriptionDate).toLocaleDateString(
                    'vi-VN'
                  )}
                </p>
              </div>
            )}
          </div>

          <div className='mt-4'>
            <div className='text-sm text-gray-600'>Chẩn đoán</div>
            <p className='text-lg mt-1 whitespace-pre-wrap'>
              {prescription.diagnosis}
            </p>
          </div>

          {prescription.notes && (
            <div className='mt-4'>
              <div className='text-sm text-gray-600'>Ghi chú</div>
              <p className='text-lg mt-1 whitespace-pre-wrap'>
                {prescription.notes}
              </p>
            </div>
          )}
        </div>

        {/* Medicines */}
        <div>
          <h2 className='text-xl font-semibold mb-4'>Danh sách thuốc</h2>
          <div className='space-y-4'>
            {prescription.medicines.map((item, index) => (
              <div key={index} className='border rounded-lg p-4 bg-gray-50'>
                <div className='flex items-start justify-between mb-3'>
                  <div className='flex-1'>
                    <h3 className='text-lg font-semibold text-blue-600'>
                      {index + 1}. {item.medicine.medicine_name}
                    </h3>
                    <p className='text-sm text-gray-600 mt-1'>
                      Mã: {item.medicine.medicine_code} | Loại:{' '}
                      {item.medicine.type}
                    </p>
                  </div>
                  <div className='text-right ml-4'>
                    <p className='text-xl font-bold text-green-600'>
                      {item.medicine.price.toLocaleString('vi-VN')} đ
                    </p>
                    <p className='text-sm text-gray-600'>
                      /{item.medicine.unit}
                    </p>
                  </div>
                </div>

                <div className='border-t pt-3 mt-3 grid grid-cols-1 md:grid-cols-2 gap-3'>
                  <div>
                    <div className='text-xs text-gray-600 uppercase font-medium'>
                      Liều lượng
                    </div>
                    <p className='text-sm font-medium mt-1'>{item.dosage}</p>
                  </div>
                  <div>
                    <div className='text-xs text-gray-600 uppercase font-medium'>
                      Tần suất
                    </div>
                    <p className='text-sm font-medium mt-1'>{item.frequency}</p>
                  </div>
                  <div>
                    <div className='text-xs text-gray-600 uppercase font-medium'>
                      Thời gian dùng
                    </div>
                    <p className='text-sm font-medium mt-1'>{item.duration}</p>
                  </div>
                  <div>
                    <div className='text-xs text-gray-600 uppercase font-medium'>
                      Hướng dẫn
                    </div>
                    <p className='text-sm font-medium mt-1'>
                      {item.instructions}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tổng tiền */}
          <div className='mt-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-200'>
            <div className='flex justify-between items-center'>
              <span className='text-lg font-semibold text-gray-700'>
                Tổng tiền:
              </span>
              <span className='text-2xl font-bold text-blue-600'>
                {totalAmount.toLocaleString('vi-VN')} đ
              </span>
            </div>
          </div>
        </div>

        {/* Metadata */}
        <div className='border-t pt-6 text-sm text-gray-500'>
          <div className='flex justify-between'>
            <span>
              Ngày tạo:{' '}
              {new Date(prescription.createdAt).toLocaleString('vi-VN')}
            </span>
            <span>
              Cập nhật:{' '}
              {new Date(prescription.updatedAt).toLocaleString('vi-VN')}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className='flex justify-end space-x-4 pt-4'>
          <Button
            variant='outline'
            onClick={() => router.push(`/staff/prescriptions`)}
          >
            Đóng
          </Button>
          {prescription.status === 'active' && (
            <>
              <Button
                variant='outline'
                onClick={() =>
                  router.push(`/staff/prescriptions/${prescription._id}/edit`)
                }
                className='bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-300'
              >
                ✏️ Chỉnh sửa
              </Button>
              <Button
                onClick={async () => {
                  try {
                    const response = await fetch('/api/payment/create', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        prescriptionId: prescription._id,
                        amount: totalAmount,
                        description: `Don thuoc ${prescription._id.slice(-6)}`,
                      }),
                    });

                    if (!response.ok) {
                      const text = await response.text();
                      console.error('Payment Error Response:', {
                        status: response.status,
                        text,
                      });
                      let errorData;
                      try {
                        errorData = JSON.parse(text);
                      } catch {
                        errorData = {
                          error: text || 'Không thể tạo thanh toán',
                        };
                      }
                      throw new Error(
                        errorData.error || 'Không thể tạo thanh toán'
                      );
                    }

                    const data = await response.json();
                    if (data.checkoutUrl) {
                      window.location.href = data.checkoutUrl;
                    } else {
                      throw new Error('Không nhận được link thanh toán');
                    }
                  } catch (error: any) {
                    console.error('Error:', error);
                    alert(error.message || 'Có lỗi xảy ra khi tạo thanh toán');
                  }
                }}
                className='bg-blue-600 hover:bg-blue-700 text-white'
              >
                💳 Thanh toán ({totalAmount.toLocaleString('vi-VN')} đ)
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
