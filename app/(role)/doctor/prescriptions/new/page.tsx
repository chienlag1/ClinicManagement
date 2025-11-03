'use client';

import { PrescriptionForm } from '../components/PrescriptionForm';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewPrescriptionPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      const response = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Có lỗi xảy ra khi lưu đơn thuốc');

      router.push('/doctor/prescriptions');
      router.refresh();
    } catch (error) {
      console.error('Error creating prescription:', error);
      alert(
        error instanceof Error
          ? error.message
          : 'Có lỗi xảy ra khi lưu đơn thuốc'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Giả lập dữ liệu cho demo
  const patients = [
    { id: '1', fullName: 'Nguyễn Văn A' },
    { id: '2', fullName: 'Trần Thị B' },
  ];

  return (
    <div className='container mx-auto p-6'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold'>Kê đơn thuốc mới</h1>
        <p className='text-gray-600'>Điền thông tin đơn thuốc bên dưới</p>
      </div>

      <div className='bg-white rounded-lg shadow-sm p-6'>
        <PrescriptionForm patients={patients} onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
