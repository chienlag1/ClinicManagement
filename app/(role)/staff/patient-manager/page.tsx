'use client';

import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Icon } from '@iconify/react';
import { Card, CardHeader, CardBody } from '@heroui/card';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Select, SelectItem } from '@heroui/select';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@heroui/modal';
import { Spinner } from '@heroui/spinner';
import { Pagination, usePagination } from '@/components/pagination';
import { useNotification } from '@/components/notification-popup';

type Gender = 'male' | 'female';

type Patient = {
  _id?: string;
  name: string;
  gender: Gender;
  birth_date: string; // ISO string for client form handling
  phone: string;
  address: string;
};

type ListResponse = {
  items: Patient[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

export default function PatientManagerPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // query states
  const [search, setSearch] = useState('');
  const [gender, setGender] = useState<'all' | Gender>('all');
  const {
    currentPage,
    itemsPerPage,
    handlePageChange,
    handleItemsPerPageChange,
  } = usePagination();

  // pagination info
  const [total, setTotal] = useState(0);
  const pages = useMemo(
    () => Math.max(1, Math.ceil(total / itemsPerPage)),
    [total, itemsPerPage]
  );

  const { showSuccess, showError, showConfirm } = useNotification();

  // add modal
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Patient>({
    name: '',
    gender: 'male',
    birth_date: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    fetchPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, itemsPerPage, gender]);

  const fetchPatients = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (gender !== 'all') params.set('gender', gender);
      params.set('page', String(currentPage));
      params.set('limit', String(itemsPerPage));

      const res = await axios.get<ListResponse>(
        `/api/patients?${params.toString()}`
      );
      setPatients(res.data.items);
      setTotal(res.data.total);
    } catch (e) {
      setError('Không thể tải danh sách bệnh nhân. Vui lòng thử lại.');
      showError('Lỗi!', 'Không thể tải danh sách bệnh nhân');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    handlePageChange(1);
    await fetchPatients();
  };

  const clearSearch = async () => {
    setSearch('');
    handlePageChange(1);
    await fetchPatients();
  };

  const handleAdd = () => {
    setForm({
      name: '',
      gender: 'male',
      birth_date: '',
      phone: '',
      address: '',
    });
    setEditingId(null);
    setIsOpen(true);
  };

  const handleSave = async () => {
    if (
      !form.name ||
      !form.gender ||
      !form.birth_date ||
      !form.phone ||
      !form.address
    ) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const payload = {
        ...form,
        birth_date: new Date(form.birth_date).toISOString(),
      };
      if (editingId) {
        const res = await axios.put<Patient>(
          `/api/patients/${editingId}`,
          payload
        );
        setPatients(prev =>
          prev.map(p => (p._id === editingId ? res.data : p))
        );
        await fetchPatients();
        showSuccess('Thành công!', 'Cập nhật bệnh nhân thành công');
      } else {
        const res = await axios.post<Patient>('/api/patients', payload);
        if (currentPage === 1)
          setPatients(prev => [
            res.data,
            ...prev.slice(0, Math.max(0, itemsPerPage - 1)),
          ]);
        await fetchPatients();
        showSuccess('Thành công!', 'Thêm bệnh nhân thành công');
      }
      setIsOpen(false);
    } catch (e: any) {
      if (e?.response?.status === 409) {
        setError('Số điện thoại đã tồn tại.');
        showError('Lỗi!', 'Số điện thoại đã tồn tại');
      } else {
        setError('Không thể lưu bệnh nhân. Vui lòng thử lại.');
        showError('Lỗi!', 'Không thể lưu bệnh nhân');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (p: Patient) => {
    setForm({
      _id: p._id,
      name: p.name,
      gender: p.gender,
      birth_date: p.birth_date
        ? new Date(p.birth_date).toISOString().slice(0, 10)
        : '',
      phone: p.phone,
      address: p.address,
    });
    setEditingId(p._id || null);
    setIsOpen(true);
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    showConfirm(
      'Xác nhận',
      'Bạn có chắc chắn muốn xóa bệnh nhân này?',
      async () => {
        try {
          setIsLoading(true);
          await axios.delete(`/api/patients/${id}`);
          setPatients(prev => prev.filter(p => p._id !== id));
          await fetchPatients();
          showSuccess('Thành công!', 'Xóa bệnh nhân thành công');
        } catch {
          showError('Lỗi!', 'Không thể xóa bệnh nhân');
        } finally {
          setIsLoading(false);
        }
      },
      () => {}
    );
  };

  const genderLabel = (g: string) =>
    g === 'male' ? 'Nam' : g === 'female' ? 'Nữ' : g;

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h2 className='text-3xl font-bold mb-6 text-gray-800'>
          Quản lý bệnh nhân
        </h2>
        <Button
          color='primary'
          onClick={handleAdd}
          startContent={<Icon className='w-5 h-5' icon='lucide:user-plus' />}
        >
          Thêm bệnh nhân
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className='flex flex-col md:flex-row md:items-center gap-3 w-full'>
            <div className='flex-1 flex gap-2 items-center'>
              <Input
                size='md'
                placeholder='Tìm theo tên hoặc số điện thoại'
                value={search}
                onChange={e => setSearch(e.target.value)}
                startContent={
                  <Icon
                    className='w-4 h-4 text-default-400'
                    icon='lucide:search'
                  />
                }
              />
              <Button variant='flat' size='md' onClick={handleSearch}>
                Tìm
              </Button>
              {search && (
                <Button variant='flat' size='md' onClick={clearSearch}>
                  Xóa
                </Button>
              )}
            </div>

            <div className='flex items-center gap-2'>
              <Select
                size='md'
                className='w-40'
                label='Giới tính'
                selectedKeys={[gender]}
                onChange={e => {
                  const v = e.target.value as any;
                  setGender(v === 'male' || v === 'female' ? v : 'all');
                }}
              >
                <SelectItem key='all'>Tất cả</SelectItem>
                <SelectItem key='male'>Nam</SelectItem>
                <SelectItem key='female'>Nữ</SelectItem>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardBody>
          {isLoading ? (
            <div className='py-10 flex justify-center'>
              <Spinner />
            </div>
          ) : error ? (
            <div className='text-red-500 text-sm'>{error}</div>
          ) : (
            <div className='overflow-x-auto'>
              <table className='w-full border border-gray-200 text-sm'>
                <thead className='bg-gray-50 text-gray-700'>
                  <tr>
                    <th className='p-3 text-left'>Tên</th>
                    <th className='p-3 text-left'>Giới tính</th>
                    <th className='p-3 text-left'>Ngày sinh</th>
                    <th className='p-3 text-left'>SĐT</th>
                    <th className='p-3 text-left'>Địa chỉ</th>
                    <th className='p-3 text-center'>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map(p => (
                    <tr key={p._id} className='border-t hover:bg-gray-50'>
                      <td className='p-3'>{p.name}</td>
                      <td className='p-3'>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${p.gender === 'male' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'}`}
                        >
                          {genderLabel(p.gender)}
                        </span>
                      </td>
                      <td className='p-3'>
                        {p.birth_date
                          ? new Date(p.birth_date).toLocaleDateString()
                          : ''}
                      </td>
                      <td className='p-3'>{p.phone}</td>
                      <td className='p-3'>{p.address}</td>
                      <td className='p-3'>
                        <div className='flex items-center gap-2 justify-center'>
                          <Button
                            size='sm'
                            variant='flat'
                            onClick={() => handleEdit(p)}
                          >
                            <Icon className='w-4 h-4' icon='lucide:edit' />
                          </Button>
                          <Button
                            size='sm'
                            color='danger'
                            variant='flat'
                            onClick={() => handleDelete(p._id)}
                          >
                            <Icon className='w-4 h-4' icon='lucide:trash-2' />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {patients.length === 0 && (
                    <tr>
                      <td
                        className='p-6 text-center text-default-500'
                        colSpan={6}
                      >
                        Không có dữ liệu
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className='flex items-center justify-between mt-4'>
            <div className='text-sm text-default-500'>
              Tổng: {total} • Trang {currentPage}/{pages}
            </div>
            <Pagination
              totalItems={total}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </div>
        </CardBody>
      </Card>

      {/* Add Modal */}
      <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
        <ModalContent>
          <ModalHeader>
            {editingId ? 'Chỉnh sửa Bệnh Nhân' : 'Thêm Bệnh Nhân'}
          </ModalHeader>
          <ModalBody>
            <Input
              label='Tên'
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
            <Select
              label='Giới tính'
              selectedKeys={[form.gender]}
              onChange={e =>
                setForm({
                  ...form,
                  gender: (e.target.value as Gender) || 'male',
                })
              }
            >
              <SelectItem key='male'>Nam</SelectItem>
              <SelectItem key='female'>Nữ</SelectItem>
            </Select>
            <Input
              label='Ngày sinh'
              type='date'
              value={form.birth_date}
              onChange={e => setForm({ ...form, birth_date: e.target.value })}
            />
            <Input
              label='Số điện thoại'
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
            />
            <Input
              label='Địa chỉ'
              value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
            />
            {error && <div className='text-red-500 text-sm'>{error}</div>}
          </ModalBody>
          <ModalFooter>
            <Button variant='flat' onClick={() => setIsOpen(false)}>
              Hủy
            </Button>
            <Button color='primary' isDisabled={isLoading} onClick={handleSave}>
              {editingId ? 'Cập nhật' : 'Lưu'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
