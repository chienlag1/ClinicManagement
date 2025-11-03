import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Medicine {
  id: string;
  name: string;
}

interface MedicineItem {
  medicine: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface MedicineSelectorProps {
  medicines: Medicine[];
  value: MedicineItem[];
  onChange: (value: MedicineItem[]) => void;
}

export default function MedicineSelector({
  medicines,
  value = [],
  onChange,
}: MedicineSelectorProps) {
  const handleAdd = () => {
    onChange([
      ...value,
      {
        medicine: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: '',
      },
    ]);
  };

  const handleRemove = (index: number) => {
    const newValue = [...value];
    newValue.splice(index, 1);
    onChange(newValue);
  };

  const handleChange = (index: number, field: string, fieldValue: string) => {
    const newValue = [...value];
    newValue[index] = { ...newValue[index], [field]: fieldValue };
    onChange(newValue);
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-semibold'>Danh sách thuốc</h3>
        <Button
          type='button'
          onClick={handleAdd}
          variant='outline'
          className='hover:bg-blue-50'
        >
          <PlusIcon className='w-4 h-4 mr-2 text-blue-600' />
          <span className='text-blue-600'>Thêm thuốc</span>
        </Button>
      </div>

      {value.map((item, index) => (
        <div key={index} className='p-4 border rounded-lg space-y-4'>
          <div className='flex justify-between items-center mb-4'>
            <h4 className='text-base font-semibold text-gray-900'>
              Thuốc #{index + 1}
            </h4>
            {value.length > 1 && (
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={() => handleRemove(index)}
                className='text-red-600 hover:text-red-700 hover:bg-red-50'
              >
                <TrashIcon className='w-4 h-4' />
              </Button>
            )}
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
            <div className='lg:col-span-2'>
              <label htmlFor={`medicine-${index}`} className='block text-sm font-medium text-gray-900 mb-2'>
                Tên thuốc
              </label>
              <Select
                id={`medicine-${index}`}
                value={item.medicine}
                onChange={e => handleChange(index, 'medicine', e.target.value)}
              >
                <option value=''>Chọn thuốc</option>
                {medicines.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label htmlFor={`dosage-${index}`} className='block text-sm font-medium text-gray-900 mb-2'>
                Liều lượng
              </label>
              <Input
                id={`dosage-${index}`}
                value={item.dosage}
                onChange={e => handleChange(index, 'dosage', e.target.value)}
                placeholder='VD: 1 viên'
              />
            </div>

            <div>
              <label htmlFor={`frequency-${index}`} className='block text-sm font-medium text-gray-900 mb-2'>
                Tần suất
              </label>
              <Input
                id={`frequency-${index}`}
                value={item.frequency}
                onChange={e => handleChange(index, 'frequency', e.target.value)}
                placeholder='VD: 3 lần/ngày'
              />
            </div>

            <div>
              <label htmlFor={`duration-${index}`} className='block text-sm font-medium text-gray-900 mb-2'>
                Thời gian dùng
              </label>
              <Input
                id={`duration-${index}`}
                value={item.duration}
                onChange={e => handleChange(index, 'duration', e.target.value)}
                placeholder='VD: 7 ngày'
              />
            </div>

            <div className='lg:col-span-2'>
              <label htmlFor={`instructions-${index}`} className='block text-sm font-medium text-gray-900 mb-2'>
                Hướng dẫn sử dụng
              </label>
              <Input
                id={`instructions-${index}`}
                value={item.instructions}
                onChange={e =>
                  handleChange(index, 'instructions', e.target.value)
                }
                placeholder='VD: Uống sau khi ăn'
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
