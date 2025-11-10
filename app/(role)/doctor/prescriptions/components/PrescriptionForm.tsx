import { useForm, useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Define validation schema
const prescriptionSchema = z.object({
  patient: z.string().min(1, 'Vui lòng chọn bệnh nhân'),
  diagnosis: z.string().min(1, 'Vui lòng nhập chẩn đoán'),
  medicines: z
    .array(
      z.object({
        medicine: z.string().min(1, 'Vui lòng chọn thuốc'),
        dosage: z.string().min(1, 'Vui lòng nhập liều lượng'),
        frequency: z.string().min(1, 'Vui lòng nhập tần suất'),
        duration: z.string().min(1, 'Vui lòng nhập thời gian dùng'),
        instructions: z.string().min(1, 'Vui lòng nhập hướng dẫn'),
      })
    )
    .min(1, 'Vui lòng thêm ít nhất một loại thuốc'),
  notes: z.string().optional(),
});

type PrescriptionFormData = z.infer<typeof prescriptionSchema>;

interface PrescriptionFormProps {
  patients: Array<{ id: string; fullName: string }>;
  onSubmit: (data: PrescriptionFormData) => void;
  initialData?: PrescriptionFormData;
}

export function PrescriptionForm({
  patients,
  onSubmit,
  initialData,
}: PrescriptionFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PrescriptionFormData>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: initialData,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      <div className='grid grid-cols-2 gap-6'>
        <div className='space-y-2'>
          <label htmlFor='patient-select' className='block text-sm font-medium'>
            Bệnh nhân
          </label>
          <Select id='patient-select' {...register('patient')}>
            <option value=''>Chọn bệnh nhân</option>
            {patients.map(patient => (
              <option key={patient.id} value={patient.id}>
                {patient.fullName}
              </option>
            ))}
          </Select>
          {errors.patient && (
            <p className='text-sm text-red-500'>{errors.patient.message}</p>
          )}
        </div>

        <div className='space-y-2'>
          <label
            htmlFor='diagnosis-input'
            className='block text-sm font-medium'
          >
            Chẩn đoán
          </label>
          <Input
            id='diagnosis-input'
            {...register('diagnosis')}
            placeholder='Nhập chẩn đoán'
          />
          {errors.diagnosis && (
            <p className='text-sm text-red-500'>{errors.diagnosis.message}</p>
          )}
        </div>
      </div>

      <div className='space-y-2'>
        <label htmlFor='notes-textarea' className='block text-sm font-medium'>
          Ghi chú
        </label>
        <Textarea
          id='notes-textarea'
          {...register('notes')}
          placeholder='Nhập ghi chú bổ sung (nếu có)'
          rows={4}
        />
        {errors.notes && (
          <p className='text-sm text-red-500'>{errors.notes.message}</p>
        )}
      </div>

      <div className='flex justify-end space-x-4'>
        <Button type='button' variant='outline'>
          Hủy
        </Button>
        <Button type='submit'>Lưu đơn thuốc</Button>
      </div>
    </form>
  );
}
