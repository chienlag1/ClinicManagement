'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '@heroui/card';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Select, SelectItem } from '@heroui/select';
import { Icon } from '@iconify/react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@heroui/modal';

import { Pagination, usePagination } from '@/components/pagination';
import { useNotification } from '@/components/notification-popup';

// Generic CRUD Template Props
export interface CRUDTemplateProps<T> {
  title: string;
  description: string;
  data: T[];
  filteredData: T[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterValue: string;
  setFilterValue: (value: string) => void;
  filterOptions: { key: string; label: string }[];
  searchFields: (keyof T)[];
  columns: CRUDColumn<T>[];
  onAdd: () => void;
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
  onView?: (item: T) => void;
  emptyStateIcon?: string;
  emptyStateMessage?: string;
  addButtonText?: string;
  searchPlaceholder?: string;
  filterPlaceholder?: string;
}

export interface CRUDColumn<T> {
  key: keyof T;
  label: string;
  render?: (value: any, item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

export interface CRUDModalProps<T> {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  data: T;
  onSave: (data: T) => void;
  fields: CRUDField<T>[];
  isLoading?: boolean;
  // Optional class applied to the form container inside the modal (allows grid layouts)
  formClassName?: string;
}

export interface CRUDField<T> {
  key: keyof T;
  label: string;
  type:
    | 'text'
    | 'number'
    | 'email'
    | 'password'
    | 'select'
    | 'textarea'
    | 'date'
    | 'custom';
  placeholder?: string;
  required?: boolean;
  options?: { key: string; label: string }[];
  render?: (value: any, onChange: (value: any) => void) => React.ReactNode;
  // Optional class applied to the field wrapper to control layout (e.g. col-span)
  containerClassName?: string;
}

// Main CRUD Template Component
export function CRUDTemplate<T extends { _id?: string; id?: string }>({
  title,
  description,
  data: _data,
  filteredData,
  searchTerm,
  setSearchTerm,
  filterValue,
  setFilterValue,
  filterOptions,
  searchFields: _searchFields,
  columns,
  onAdd,
  onEdit,
  onDelete,
  onView,
  emptyStateIcon = 'lucide:inbox',
  emptyStateMessage = 'Không có dữ liệu',
  addButtonText = 'Thêm mới',
  searchPlaceholder = 'Tìm kiếm...',
  filterPlaceholder = 'Lọc theo...',
}: CRUDTemplateProps<T>) {
  const {
    currentPage,
    itemsPerPage,
    handlePageChange,
    handleItemsPerPageChange,
  } = usePagination(1, 10);

  // Pagination logic
  const totalItems = filteredData.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const getItemId = (item: T) => {
    return item._id || item.id || '';
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div>
        <h1 className='text-3xl font-bold text-gray-900'>{title}</h1>
        <p className='text-gray-600 mt-2'>{description}</p>
      </div>

      {/* Filters */}
      <Card>
        <CardBody>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <Input
              placeholder={searchPlaceholder}
              startContent={
                <Icon className='w-4 h-4 text-gray-400' icon='lucide:search' />
              }
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <Select
              placeholder={filterPlaceholder}
              selectedKeys={[filterValue]}
              onSelectionChange={keys => {
                const value = Array.from(keys)[0] as string;

                setFilterValue(value);
              }}
            >
              <SelectItem key='all'>Tất cả</SelectItem>
              {
                filterOptions.map(option => (
                  <SelectItem key={option.key}>{option.label}</SelectItem>
                )) as any
              }
            </Select>
            <Button
              color='primary'
              startContent={<Icon className='w-4 h-4' icon='lucide:plus' />}
              onPress={onAdd}
            >
              {addButtonText}
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <h2 className='text-xl font-semibold'>Danh sách</h2>
        </CardHeader>
        <CardBody>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead>
                <tr className='border-b'>
                  {columns.map(column => (
                    <th
                      key={String(column.key)}
                      className='text-left py-3 px-4'
                      style={{ width: column.width }}
                    >
                      {column.label}
                    </th>
                  ))}
                  <th className='text-left py-3 px-4'>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {currentData.map(item => (
                  <tr
                    key={getItemId(item)}
                    className='border-b hover:bg-gray-50'
                  >
                    {columns.map(column => (
                      <td key={String(column.key)} className='py-3 px-4'>
                        {column.render
                          ? column.render(item[column.key], item)
                          : String(item[column.key] || '')}
                      </td>
                    ))}
                    <td className='py-3 px-4'>
                      <div className='flex gap-2'>
                        {onView && (
                          <Button
                            isIconOnly
                            size='sm'
                            variant='light'
                            onPress={() => onView(item)}
                          >
                            <Icon className='w-4 h-4' icon='lucide:eye' />
                          </Button>
                        )}
                        <Button
                          isIconOnly
                          size='sm'
                          color='primary'
                          variant='light'
                          onPress={() => onEdit(item)}
                        >
                          <Icon className='w-4 h-4' icon='lucide:edit' />
                        </Button>
                        <Button
                          isIconOnly
                          size='sm'
                          color='danger'
                          variant='light'
                          onPress={() => onDelete(item)}
                        >
                          <Icon className='w-4 h-4' icon='lucide:trash-2' />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {currentData.length === 0 && (
            <div className='text-center py-8 text-gray-500'>
              <Icon
                className='w-12 h-12 mx-auto mb-4 text-gray-300'
                icon={emptyStateIcon}
              />
              <p>{emptyStateMessage}</p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Pagination */}
      <Pagination
        color='primary'
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        itemsPerPageOptions={[5, 10, 20, 50]}
        showFirstLast={true}
        showItemsPerPage={true}
        showQuickJump={true}
        showTotal={true}
        size='md'
        totalItems={totalItems}
        onItemsPerPageChange={handleItemsPerPageChange}
        onPageChange={handlePageChange}
      />
    </div>
  );
}

// Generic CRUD Modal Component
export function CRUDModal<T>({
  isOpen,
  onClose,
  title,
  data,
  onSave,
  fields,
  isLoading = false,
  formClassName,
}: CRUDModalProps<T>) {
  const [formData, setFormData] = useState<T>(data);

  useEffect(() => {
    setFormData(data);
  }, [data]);

  const handleSave = () => {
    onSave(formData);
  };

  const handleFieldChange = (key: keyof T, value: any) => {
    setFormData(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const renderField = (field: CRUDField<T>) => {
    if (field.render) {
      return field.render(formData[field.key], value =>
        handleFieldChange(field.key, value)
      );
    }

    switch (field.type) {
      case 'select':
        return (
          <Select
            label={field.label}
            placeholder={field.placeholder}
            selectedKeys={[String(formData[field.key] || '')]}
            onSelectionChange={keys => {
              const value = Array.from(keys)[0] as string;

              handleFieldChange(field.key, value);
            }}
          >
            {
              field.options?.map(option => (
                <SelectItem key={option.key}>{option.label}</SelectItem>
              )) as any
            }
          </Select>
        );

      case 'textarea':
        return (
          <textarea
            className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent'
            placeholder={field.placeholder}
            rows={4}
            value={String(formData[field.key] || '')}
            onChange={e => handleFieldChange(field.key, e.target.value)}
          />
        );
      case 'date':
        return (
          <Input
            isRequired={field.required}
            label={field.label}
            placeholder={field.placeholder}
            type='date'
            value={
              formData[field.key]
                ? String(formData[field.key]).split('T')[0] // để đảm bảo format YYYY-MM-DD
                : ''
            }
            onValueChange={value => handleFieldChange(field.key, value)}
          />
        );

      default:
        return (
          <Input
            isRequired={field.required}
            label={field.label}
            placeholder={field.placeholder}
            type={field.type}
            value={String(formData[field.key] || '')}
            onValueChange={value => handleFieldChange(field.key, value)}
          />
        );
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose}>
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalBody>
          <div className={formClassName ?? 'space-y-4'}>
            {fields.map(field => (
              <div
                key={String(field.key)}
                className={field.containerClassName ?? ''}
              >
                {renderField(field)}
              </div>
            ))}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant='flat' onPress={onClose}>
            Hủy
          </Button>
          <Button color='primary' isLoading={isLoading} onPress={handleSave}>
            Lưu
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

// Hook for CRUD operations
export function useCRUD<T extends { _id?: string; id?: string }>(
  initialData: T[] = []
) {
  const [data, setData] = useState<T[]>(initialData);
  const [filteredData, setFilteredData] = useState<T[]>(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValue, setFilterValue] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingItem, setDeletingItem] = useState<T | null>(null);

  const { showSuccess, showError } = useNotification();

  const handleAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: T) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = (item: T) => {
    setDeletingItem(item);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (deletingItem) {
      const itemId = deletingItem._id || deletingItem.id;

      if (itemId) {
        setData(
          data.filter(item => {
            const id = item._id || item.id;

            return id !== itemId;
          })
        );

        showSuccess('Thành công', 'Xóa thành công!');
      }

      setShowDeleteModal(false);

      setDeletingItem(null);
    }
  };

  const handleSave = (item: T) => {
    if (editingItem) {
      // Update existing item
      const itemId = editingItem._id || editingItem.id;
      setData(
        data.map(d => {
          const id = d._id || d.id;
          return id === itemId ? item : d;
        })
      );
      showSuccess('Thành công', 'Cập nhật thành công!');
    } else {
      // Add new item
      setData([...data, item]);
      showSuccess('Thành công', 'Thêm mới thành công!');
    }
    setIsModalOpen(false);
    setEditingItem(null);
  };

  return {
    data,
    filteredData,
    setFilteredData,
    searchTerm,
    setSearchTerm,
    filterValue,
    setFilterValue,
    isModalOpen,
    setIsModalOpen,
    editingItem,
    showDeleteModal,
    setShowDeleteModal,
    deletingItem,
    handleAdd,
    handleEdit,
    handleDelete,
    handleSave,
    confirmDelete,
    showSuccess,
    showError,
  };
}

// Utility functions
export const crudUtils = {
  /**
   * Filter data based on search term and filter value
   */
  filterData: <T,>(
    data: T[],
    searchTerm: string,
    filterValue: string,
    searchFields: (keyof T)[],
    filterField?: keyof T
  ): T[] => {
    let filtered = data;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        searchFields.some(field =>
          String(item[field] || '')
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply filter value
    if (filterValue !== 'all' && filterField) {
      filtered = filtered.filter(item => item[filterField] === filterValue);
    }

    return filtered;
  },

  /**
   * Get status color class
   */
  getStatusColor: (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'hoạt động':
        return 'bg-green-100 text-green-800';
      case 'inactive':
      case 'không hoạt động':
        return 'bg-red-100 text-red-800';
      case 'pending':
      case 'chờ duyệt':
        return 'bg-yellow-100 text-yellow-800';
      case 'blocked':
      case 'bị khóa':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  },

  /**
   * Format currency
   */
  formatCurrency: (amount: number, currency = 'VND') => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  },

  /**
   * Format date
   */
  formatDate: (date: string | Date) => {
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date(date));
  },
};
