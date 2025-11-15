'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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

interface MedicineOption {
  _id: string;
  medicine_name: string;
  medicine_code: string;
  type: string;
  price: number;
  unit: string;
}

export default function EditPrescriptionPage() {
  const params = useParams();
  const router = useRouter();
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableMedicines, setAvailableMedicines] = useState<
    MedicineOption[]
  >([]);

  // Form state
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [medicines, setMedicines] = useState<Medicine[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch prescription
        const prescriptionRes = await fetch(`/api/prescriptions/${params.id}`);
        if (!prescriptionRes.ok)
          throw new Error('Không thể tải thông tin đơn thuốc');
        const prescriptionData = await prescriptionRes.json();
        const pres = prescriptionData.prescription || prescriptionData;
        setPrescription(pres);

        // Set form state
        setDiagnosis(pres.diagnosis || '');
        setNotes(pres.notes || '');
        setMedicines(pres.medicines || []);

        // Fetch available medicines
        const medicinesRes = await fetch('/api/medicines');
        if (medicinesRes.ok) {
          const medicinesData = await medicinesRes.json();
          setAvailableMedicines(medicinesData.items || medicinesData || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Đã có lỗi xảy ra');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  const handleAddMedicine = () => {
    setMedicines([
      ...medicines,
      {
        medicine: {
          _id: '',
          medicine_code: '',
          medicine_name: '',
          type: '',
          price: 0,
          unit: '',
        },
        dosage: '',
        frequency: '',
        duration: '',
        instructions: '',
      },
    ]);
  };

  const handleRemoveMedicine = (index: number) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const handleMedicineChange = (index: number, field: string, value: any) => {
    const updated = [...medicines];
    if (field === 'medicineId') {
      const selectedMed = availableMedicines.find(m => m._id === value);
      if (selectedMed) {
        updated[index].medicine = {
          _id: selectedMed._id,
          medicine_code: selectedMed.medicine_code,
          medicine_name: selectedMed.medicine_name,
          type: selectedMed.type,
          price: selectedMed.price,
          unit: selectedMed.unit,
        };
      }
    } else {
      (updated[index] as any)[field] = value;
    }
    setMedicines(updated);
  };

  const handleSave = async () => {
    if (!diagnosis.trim()) {
      setError('Vui lòng nhập chẩn đoán');
      return;
    }

    if (medicines.length === 0) {
      setError('Vui lòng thêm ít nhất một loại thuốc');
      return;
    }

    // Validate medicines
    for (const med of medicines) {
      if (
        !med.medicine._id ||
        !med.dosage ||
        !med.frequency ||
        !med.duration ||
        !med.instructions
      ) {
        setError('Vui lòng điền đầy đủ thông tin cho tất cả các thuốc');
        return;
      }
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/prescriptions/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          diagnosis,
          notes,
          medicines: medicines.map(m => ({
            medicine: m.medicine._id,
            dosage: m.dosage,
            frequency: m.frequency,
            duration: m.duration,
            instructions: m.instructions,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Không thể cập nhật đơn thuốc');
      }

      alert('Cập nhật đơn thuốc thành công!');
      router.push(`/staff/prescriptions/${params.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className='container mx-auto py-10'>
        <div className='flex items-center justify-center min-h-[400px]'>
          <div className='text-lg'>Đang tải...</div>
        </div>
      </div>
    );
  }

  if (error && !prescription) {
    return (
      <div className='container mx-auto py-10'>
        <div className='flex flex-col items-center justify-center min-h-[400px]'>
          <div className='text-lg text-red-600 mb-4'>{error}</div>
          <Button onClick={() => router.push('/staff/prescriptions')}>
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto py-10'>
      <div className='mb-6'>
        <Button
          variant='ghost'
          onClick={() => router.push(`/staff/prescriptions/${params.id}`)}
          className='mb-4'
        >
          <ArrowLeftIcon className='w-4 h-4 mr-2' />
          Quay lại
        </Button>

        <h1 className='text-3xl font-bold'>Chỉnh sửa đơn thuốc</h1>
        {prescription?.prescriptionCode && (
          <p className='text-lg text-gray-600 mt-1'>
            Mã đơn:{' '}
            <span className='font-semibold text-blue-600'>
              #{prescription.prescriptionCode}
            </span>
          </p>
        )}
      </div>

      {error && (
        <div className='bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-6'>
          {error}
        </div>
      )}

      <div className='bg-white rounded-lg shadow-md p-6 space-y-6'>
        {/* Patient Information (Read-only) */}
        <div className='border-b pb-6'>
          <h2 className='text-xl font-semibold mb-4'>Thông tin bệnh nhân</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700'>
            <div>
              <span className='font-medium'>Mã bệnh nhân:</span>{' '}
              {prescription?.patient.patient_id}
            </div>
            <div>
              <span className='font-medium'>Tên:</span>{' '}
              {prescription?.patient.name}
            </div>
            <div>
              <span className='font-medium'>Ngày sinh:</span>{' '}
              {prescription?.patient.birth_date
                ? new Date(prescription.patient.birth_date).toLocaleDateString(
                    'vi-VN'
                  )
                : ''}
            </div>
            <div>
              <span className='font-medium'>Giới tính:</span>{' '}
              {prescription?.patient.gender === 'male' ? 'Nam' : 'Nữ'}
            </div>
          </div>
        </div>

        {/* Diagnosis */}
        <div>
          <label
            htmlFor='diagnosis'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            Chẩn đoán <span className='text-red-500'>*</span>
          </label>
          <Textarea
            id='diagnosis'
            value={diagnosis}
            onChange={e => setDiagnosis(e.target.value)}
            placeholder='Nhập chẩn đoán...'
            rows={3}
            className='w-full'
          />
        </div>

        {/* Medicines */}
        <div>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-xl font-semibold'>Danh sách thuốc</h2>
            <Button type='button' onClick={handleAddMedicine}>
              + Thêm thuốc
            </Button>
          </div>

          {medicines.length === 0 ? (
            <div className='text-center py-8 text-gray-500'>
              Chưa có thuốc nào. Click &quot;Thêm thuốc&quot; để bắt đầu.
            </div>
          ) : (
            <div className='space-y-4'>
              {medicines.map((med, index) => (
                <div key={index} className='border rounded-lg p-4 bg-gray-50'>
                  <div className='flex items-start justify-between mb-3'>
                    <h3 className='text-lg font-semibold text-blue-600'>
                      Thuốc #{index + 1}
                    </h3>
                    <Button
                      type='button'
                      variant='destructive'
                      size='sm'
                      onClick={() => handleRemoveMedicine(index)}
                    >
                      Xóa
                    </Button>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='md:col-span-2'>
                      <label
                        htmlFor={`medicine-select-${index}`}
                        className='block text-sm font-medium text-gray-700 mb-2'
                      >
                        Chọn thuốc <span className='text-red-500'>*</span>
                      </label>
                      <select
                        id={`medicine-select-${index}`}
                        value={med.medicine._id}
                        onChange={e =>
                          handleMedicineChange(
                            index,
                            'medicineId',
                            e.target.value
                          )
                        }
                        className='w-full px-3 py-2 border border-gray-300 rounded-md'
                      >
                        <option value=''>-- Chọn thuốc --</option>
                        {availableMedicines.map(m => (
                          <option key={m._id} value={m._id}>
                            {m.medicine_name} ({m.medicine_code}) -{' '}
                            {m.price.toLocaleString('vi-VN')}đ/{m.unit}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor={`dosage-${index}`}
                        className='block text-sm font-medium text-gray-700 mb-2'
                      >
                        Liều lượng <span className='text-red-500'>*</span>
                      </label>
                      <Input
                        id={`dosage-${index}`}
                        value={med.dosage}
                        onChange={e =>
                          handleMedicineChange(index, 'dosage', e.target.value)
                        }
                        placeholder='Ví dụ: 1 viên'
                      />
                    </div>

                    <div>
                      <label
                        htmlFor={`frequency-${index}`}
                        className='block text-sm font-medium text-gray-700 mb-2'
                      >
                        Tần suất <span className='text-red-500'>*</span>
                      </label>
                      <Input
                        id={`frequency-${index}`}
                        value={med.frequency}
                        onChange={e =>
                          handleMedicineChange(
                            index,
                            'frequency',
                            e.target.value
                          )
                        }
                        placeholder='Ví dụ: 2 lần/ngày'
                      />
                    </div>

                    <div>
                      <label
                        htmlFor={`duration-${index}`}
                        className='block text-sm font-medium text-gray-700 mb-2'
                      >
                        Thời gian dùng <span className='text-red-500'>*</span>
                      </label>
                      <Input
                        id={`duration-${index}`}
                        value={med.duration}
                        onChange={e =>
                          handleMedicineChange(
                            index,
                            'duration',
                            e.target.value
                          )
                        }
                        placeholder='Ví dụ: 7 ngày'
                      />
                    </div>

                    <div>
                      <label
                        htmlFor={`instructions-${index}`}
                        className='block text-sm font-medium text-gray-700 mb-2'
                      >
                        Hướng dẫn <span className='text-red-500'>*</span>
                      </label>
                      <Input
                        id={`instructions-${index}`}
                        value={med.instructions}
                        onChange={e =>
                          handleMedicineChange(
                            index,
                            'instructions',
                            e.target.value
                          )
                        }
                        placeholder='Ví dụ: Uống sau ăn'
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <label
            htmlFor='notes'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            Ghi chú
          </label>
          <Textarea
            id='notes'
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder='Ghi chú thêm (tùy chọn)...'
            rows={3}
            className='w-full'
          />
        </div>

        {/* Actions */}
        <div className='flex justify-end space-x-4 pt-4 border-t'>
          <Button
            variant='outline'
            onClick={() => router.push(`/staff/prescriptions/${params.id}`)}
            disabled={saving}
          >
            Hủy
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </div>
      </div>
    </div>
  );
}
