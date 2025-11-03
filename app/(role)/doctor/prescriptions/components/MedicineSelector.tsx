'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Chip,
  Divider,
} from '@heroui/react';
import { Icon } from '@iconify/react';

interface MedicineSelectorProps {
  medicines: Array<{ id: string; name: string; type?: string }>;
  value: Array<{
    medicine: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }>;
  onChange: (value: any) => void;
  selectedType?: string;
  filteredMedicines?: Array<{ id: string; name: string; type?: string }>;
}

export default function MedicineSelector({
  medicines,
  value = [],
  onChange,
  selectedType = '',
  filteredMedicines = [],
}: MedicineSelectorProps) {
  const [allMedicines, setAllMedicines] = useState<
    Array<{ id: string; name: string; type?: string }>
  >(medicines.map(m => ({ id: m.id, name: m.name })));
  const [loadingMedicines, setLoadingMedicines] = useState(false);

  // Fetch all medicines with type info on mount (only once)
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setLoadingMedicines(true);
      try {
        // Fetch all medicines to get type information
        const medicinesResponse = await fetch('/api/medicines');
        if (medicinesResponse.ok && isMounted) {
          const medicinesData = await medicinesResponse.json();
          const formattedMedicines = medicinesData.map((m: any) => ({
            id: m._id,
            name: m.medicine_name || m.name,
            type: m.type,
          }));
          setAllMedicines(formattedMedicines);
        } else if (isMounted) {
          // Fallback to props if API fails
          setAllMedicines(medicines.map(m => ({ id: m.id, name: m.name })));
        }
      } catch (error) {
        console.error('Error fetching medicines:', error);
        if (isMounted) {
          // Fallback to props if API fails
          setAllMedicines(medicines.map(m => ({ id: m.id, name: m.name })));
        }
      } finally {
        if (isMounted) {
          setLoadingMedicines(false);
        }
      }
    };

    // Only fetch if we don't have medicines data yet
    const hasInitialData =
      allMedicines.length > 0 && allMedicines.some(m => m.type !== undefined);
    if (!hasInitialData) {
      fetchData();
    }

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Use filteredMedicines from props if provided, otherwise use allMedicines
  const medicinesToShow =
    filteredMedicines.length > 0 ? filteredMedicines : allMedicines;

  // Auto-add medicine item when type is selected (only once)
  useEffect(() => {
    if (selectedType && value.length === 0 && medicinesToShow.length > 0) {
      // Only add if there are no items yet
      onChange([
        {
          medicine: '',
          dosage: '',
          frequency: '',
          duration: '',
          instructions: '',
        },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedType]); // Only depend on selectedType

  const handleRemove = (index: number) => {
    const newValue = [...value];
    newValue.splice(index, 1);
    onChange(newValue);
  };

  const handleChange = (index: number, field: string, fieldValue: string) => {
    const newValue = [...value];
    newValue[index] = { ...newValue[index], [field]: fieldValue };

    // If medicine is selected and there's no next empty item, add one
    if (field === 'medicine' && fieldValue && index === value.length - 1) {
      const hasNextEmpty =
        value.length > index + 1 && !value[index + 1]?.medicine;
      if (!hasNextEmpty) {
        newValue.push({
          medicine: '',
          dosage: '',
          frequency: '',
          duration: '',
          instructions: '',
        });
      }
    }

    onChange(newValue);
  };

  return (
    <div className='space-y-6'>
      {loadingMedicines ? (
        <div className='flex items-center justify-center py-8'>
          <div className='text-center'>
            <Icon
              icon='lucide:loader-2'
              className='w-6 h-6 animate-spin mx-auto mb-2 text-primary'
            />
            <p className='text-sm text-gray-500'>Đang tải danh sách thuốc...</p>
          </div>
        </div>
      ) : value.length === 0 ? (
        <Card>
          <CardBody>
            <div className='text-center py-8'>
              <Icon
                icon='lucide:pills'
                className='w-12 h-12 mx-auto mb-4 text-gray-400'
              />
              <p className='text-gray-500'>
                {selectedType
                  ? 'Vui lòng chọn thuốc từ danh sách'
                  : 'Vui lòng chọn loại thuốc để bắt đầu thêm thuốc'}
              </p>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className='space-y-4'>
          {value.map((item, index) => {
            const selectedMedicine = medicinesToShow.find(
              m => m.id === item.medicine
            );
            return (
              <Card key={index} className='bg-gray-50'>
                <CardHeader className='flex items-center justify-between pb-3'>
                  <div className='flex items-center gap-3'>
                    <Icon icon='lucide:pill' className='w-5 h-5 text-primary' />
                    <h4 className='text-base font-semibold text-gray-900'>
                      Thuốc #{index + 1}
                    </h4>
                    {selectedMedicine?.type && (
                      <Chip size='sm' variant='flat'>
                        {selectedMedicine.type}
                      </Chip>
                    )}
                  </div>
                  <Button
                    isIconOnly
                    variant='light'
                    color='danger'
                    size='sm'
                    onPress={() => handleRemove(index)}
                  >
                    <Icon icon='lucide:trash-2' className='w-4 h-4' />
                  </Button>
                </CardHeader>
                <CardBody className='space-y-4'>
                  {/* Medicine Name */}
                  <div>
                    <label htmlFor={`medicine-${index}`} className='block text-sm font-medium text-gray-700 mb-2'>
                      Tên thuốc <span className='text-red-500'>*</span>
                    </label>
                    <Dropdown id={`medicine-${index}`}>
                      <DropdownTrigger>
                        <Button
                          variant='bordered'
                          className='w-full justify-start'
                        >
                          {selectedMedicine
                            ? `${selectedMedicine.name}${selectedMedicine.type ? ` (${selectedMedicine.type})` : ''}`
                            : 'Chọn thuốc'}
                          <Icon
                            icon='lucide:chevron-down'
                            className='w-4 h-4 ml-auto'
                          />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu
                        aria-label='Chọn thuốc'
                        selectedKeys={item.medicine ? [item.medicine] : []}
                        onSelectionChange={keys => {
                          const selected = Array.from(keys)[0] as string;
                          handleChange(index, 'medicine', selected || '');
                        }}
                        selectionMode='single'
                        className='max-h-[300px] overflow-y-auto'
                      >
                        {medicinesToShow.map(m => (
                          <DropdownItem key={m.id}>
                            {m.name} {m.type ? `(${m.type})` : ''}
                          </DropdownItem>
                        ))}
                      </DropdownMenu>
                    </Dropdown>
                    {selectedType && (
                      <p className='text-xs text-gray-500 mt-1'>
                        Đang hiển thị {medicinesToShow.length} thuốc loại &quot;
                        {selectedType}&quot;
                      </p>
                    )}
                  </div>

                  <Divider />

                  {/* Dosage and Frequency */}
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <label htmlFor={`dosage-${index}`} className='block text-sm font-medium text-gray-700 mb-2'>
                        Liều lượng <span className='text-red-500'>*</span>
                      </label>
                      <Input
                        id={`dosage-${index}`}
                        value={item.dosage}
                        onValueChange={val =>
                          handleChange(index, 'dosage', val)
                        }
                        placeholder='VD: 1 viên'
                        isRequired
                      />
                    </div>

                    <div>
                      <label htmlFor={`frequency-${index}`} className='block text-sm font-medium text-gray-700 mb-2'>
                        Tần suất <span className='text-red-500'>*</span>
                      </label>
                      <Input
                        id={`frequency-${index}`}
                        value={item.frequency}
                        onValueChange={val =>
                          handleChange(index, 'frequency', val)
                        }
                        placeholder='VD: 3 lần/ngày'
                        isRequired
                      />
                    </div>
                  </div>

                  {/* Duration */}
                  <div>
                    <label htmlFor={`duration-${index}`} className='block text-sm font-medium text-gray-700 mb-2'>
                      Thời gian dùng <span className='text-red-500'>*</span>
                    </label>
                    <Input
                      id={`duration-${index}`}
                      value={item.duration}
                      onValueChange={val =>
                        handleChange(index, 'duration', val)
                      }
                      placeholder='VD: 7 ngày'
                      isRequired
                    />
                  </div>

                  {/* Instructions */}
                  <div>
                    <label htmlFor={`instructions-${index}`} className='block text-sm font-medium text-gray-700 mb-2'>
                      Hướng dẫn sử dụng
                    </label>
                    <Input
                      id={`instructions-${index}`}
                      value={item.instructions}
                      onValueChange={val =>
                        handleChange(index, 'instructions', val)
                      }
                      placeholder='VD: Uống sau khi ăn'
                    />
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
