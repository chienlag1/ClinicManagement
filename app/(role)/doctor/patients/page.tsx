'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Select, SelectItem } from '@heroui/select';
import { Chip } from '@heroui/chip';
import { Icon } from '@iconify/react';
import { PatientDetailModal } from '@/components/patient/patient-detail-modal';
import { PatientHistoryModal } from '@/components/patient/patient-history-modal';

interface Patient {
  _id: string;
  id_card: string;
  name: string;
  gender: 'male' | 'female';
  birth_date: string;
  phone: string;
  address: string;
  createdAt: string;
}

export default function DoctorPatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal states
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    null
  );
  const [selectedPatientName, setSelectedPatientName] = useState<string>('');
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(genderFilter && { gender: genderFilter }),
      });

      const response = await fetch(`/api/doctor/patients?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch patients');
      }

      const data = await response.json();
      setPatients(data.items || []);
      setTotalPages(data.pages || 1);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [page, searchTerm, genderFilter]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  const handleGenderFilter = (value: string) => {
    setGenderFilter(value);
    setPage(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age;
  };

  const handleViewDetails = (patient: Patient) => {
    setSelectedPatientId(patient._id);
    setIsDetailModalOpen(true);
  };

  const handleViewHistory = (patient: Patient) => {
    setSelectedPatientId(patient._id);
    setSelectedPatientName(patient.name);
    setIsHistoryModalOpen(true);
  };

  return (
    <div className='p-6 space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-foreground'>My Patients</h1>
          <p className='text-default-500'>
            Manage and view your patient records
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Icon icon='lucide:users' className='w-6 h-6 text-primary' />
          <span className='text-sm text-default-500'>
            {patients.length} patients
          </span>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardBody>
          <div className='flex flex-col sm:flex-row gap-4'>
            <Input
              placeholder='Search by name or phone...'
              value={searchTerm}
              onValueChange={handleSearch}
              startContent={<Icon icon='lucide:search' className='w-4 h-4' />}
              className='flex-1'
            />
            <Select
              placeholder='Filter by gender'
              selectedKeys={genderFilter ? [genderFilter] : []}
              onSelectionChange={keys => {
                const selected = Array.from(keys)[0] as string;
                handleGenderFilter(selected || '');
              }}
              className='w-full sm:w-48'
            >
              <SelectItem key='male'>Male</SelectItem>
              <SelectItem key='female'>Female</SelectItem>
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* Patients List */}
      <div className='grid gap-4'>
        {loading ? (
          <div className='flex justify-center items-center py-8'>
            <Icon icon='lucide:loader-2' className='w-6 h-6 animate-spin' />
            <span className='ml-2'>Loading patients...</span>
          </div>
        ) : patients.length === 0 ? (
          <Card>
            <CardBody className='text-center py-8'>
              <Icon
                icon='lucide:users-x'
                className='w-12 h-12 text-default-300 mx-auto mb-4'
              />
              <h3 className='text-lg font-medium text-default-600 mb-2'>
                No patients found
              </h3>
              <p className='text-default-400'>
                {searchTerm || genderFilter
                  ? 'Try adjusting your search criteria'
                  : "You don't have any patients yet"}
              </p>
            </CardBody>
          </Card>
        ) : (
          patients.map(patient => (
            <Card
              key={patient._id}
              className='hover:shadow-md transition-shadow'
            >
              <CardBody>
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-3 mb-2'>
                      <h3 className='text-lg font-semibold text-foreground'>
                        {patient.name}
                      </h3>
                      <Chip
                        size='sm'
                        color={
                          patient.gender === 'male' ? 'primary' : 'secondary'
                        }
                        variant='flat'
                      >
                        {patient.gender === 'male' ? 'Male' : 'Female'}
                      </Chip>
                      <Chip size='sm' variant='flat' color='default'>
                        {calculateAge(patient.birth_date)} years old
                      </Chip>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-default-600'>
                      <div className='flex items-center gap-2'>
                        <Icon icon='lucide:id-card' className='w-4 h-4' />
                        <span>ID: {patient.id_card}</span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Icon icon='lucide:phone' className='w-4 h-4' />
                        <span>{patient.phone}</span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Icon icon='lucide:calendar' className='w-4 h-4' />
                        <span>Born: {formatDate(patient.birth_date)}</span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Icon icon='lucide:map-pin' className='w-4 h-4' />
                        <span className='truncate'>{patient.address}</span>
                      </div>
                    </div>
                  </div>

                  <div className='flex gap-2 ml-4'>
                    <Button
                      size='sm'
                      color='primary'
                      variant='flat'
                      startContent={
                        <Icon icon='lucide:eye' className='w-4 h-4' />
                      }
                      onPress={() => handleViewDetails(patient)}
                    >
                      View Details
                    </Button>
                    <Button
                      size='sm'
                      color='secondary'
                      variant='flat'
                      startContent={
                        <Icon icon='lucide:history' className='w-4 h-4' />
                      }
                      onPress={() => handleViewHistory(patient)}
                    >
                      Xem lịch sử
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='flex justify-center items-center gap-2'>
          <Button
            size='sm'
            variant='flat'
            isDisabled={page === 1}
            onPress={() => setPage(page - 1)}
            startContent={
              <Icon icon='lucide:chevron-left' className='w-4 h-4' />
            }
          >
            Previous
          </Button>

          <div className='flex gap-1'>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum =
                Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
              return (
                <Button
                  key={pageNum}
                  size='sm'
                  variant={pageNum === page ? 'solid' : 'flat'}
                  color={pageNum === page ? 'primary' : 'default'}
                  onPress={() => setPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button
            size='sm'
            variant='flat'
            isDisabled={page === totalPages}
            onPress={() => setPage(page + 1)}
            endContent={
              <Icon icon='lucide:chevron-right' className='w-4 h-4' />
            }
          >
            Next
          </Button>
        </div>
      )}

      {/* Patient Detail Modal */}
      <PatientDetailModal
        patientId={selectedPatientId}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedPatientId(null);
        }}
      />

      {/* Patient History Modal */}
      <PatientHistoryModal
        patientId={selectedPatientId}
        patientName={selectedPatientName}
        isOpen={isHistoryModalOpen}
        onClose={() => {
          setIsHistoryModalOpen(false);
          setSelectedPatientId(null);
          setSelectedPatientName('');
        }}
      />
    </div>
  );
}
