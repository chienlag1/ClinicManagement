'use client';

import { useState, useEffect } from 'react';
import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Chip,
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { MEDICINE_TYPES } from '@/types/medicine';

interface MedicineTypeFilterProps {
  selectedType: string;
  onTypeChange: (type: string) => void;
  filteredCount?: number;
}

export default function MedicineTypeFilter({
  selectedType,
  onTypeChange,
  filteredCount,
}: MedicineTypeFilterProps) {
  const [medicineTypes, setMedicineTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTypes = async () => {
      setLoading(true);
      try {
        const typesResponse = await fetch('/api/medicines?getTypes=true');
        if (typesResponse.ok) {
          const types = await typesResponse.json();
          setMedicineTypes(types);
        }
      } catch (error) {
        console.error('Error fetching medicine types:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTypes();
  }, []);

  return (
    <div className='flex items-center justify-between gap-4'>
      <div className='flex items-center gap-3'>
        <Icon icon='lucide:filter' className='w-5 h-5 text-primary' />
        <span className='text-sm font-medium text-gray-700'>
          Chọn loại thuốc:
        </span>
      </div>
      <div className='flex items-center gap-3'>
        <Dropdown>
          <DropdownTrigger>
            <Button
              variant='bordered'
              className='min-w-[200px] justify-between'
              isLoading={loading}
            >
              {selectedType
                ? MEDICINE_TYPES.find(t => t.key === selectedType.toLowerCase())
                    ?.label || selectedType
                : 'Tất cả loại thuốc'}
              <Icon icon='lucide:chevron-down' className='w-4 h-4' />
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label='Chọn loại thuốc'
            selectedKeys={selectedType ? [selectedType] : []}
            onSelectionChange={keys => {
              const selected = Array.from(keys)[0] as string;
              onTypeChange(selected || '');
            }}
            selectionMode='single'
            items={[
              { key: '', label: 'Tất cả loại thuốc' },
              ...medicineTypes.map(type => {
                const typeInfo = MEDICINE_TYPES.find(
                  t => t.key === type.toLowerCase()
                );
                return {
                  key: type,
                  label: typeInfo?.label || type,
                };
              }),
            ]}
          >
            {item => <DropdownItem key={item.key}>{item.label}</DropdownItem>}
          </DropdownMenu>
        </Dropdown>
        {selectedType && filteredCount !== undefined && (
          <Chip size='sm' variant='flat' color='primary'>
            {filteredCount} thuốc
          </Chip>
        )}
      </div>
    </div>
  );
}
