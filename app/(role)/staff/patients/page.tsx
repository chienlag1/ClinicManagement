'use client';

import { useState, useEffect } from 'react';
import { useNotification } from '@/components/notification-popup';
import { CRUDTemplate, CRUDColumn } from '@/components/DataTable';
import { useUser } from '@clerk/nextjs';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@heroui/modal';
import { Input } from '@heroui/input';
import { Button } from '@heroui/button';
import { Select, SelectItem } from '@heroui/select';

interface Patient {
  _id: string;
  patient_id: string;
  id_card: string;
  name: string;
  gender: 'male' | 'female';
  birth_date: Date;
  phone: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

const PatientManager = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValue, setFilterValue] = useState('');
  const { showNotification } = useNotification();

  const columns: CRUDColumn<Patient>[] = [
    { key: 'patient_id', label: 'Patient ID' },
    { key: 'id_card', label: 'ID Card' },
    { key: 'name', label: 'Name' },
    { key: 'gender', label: 'Gender' },
    {
      key: 'birth_date',
      label: 'Birth Date',
      render: (value) => new Date(value).toLocaleDateString(),
    },
    { key: 'phone', label: 'Phone' },
    { key: 'address', label: 'Address' },
    {
      key: 'createdAt',
      label: 'Created At',
      render: (value) => new Date(value).toLocaleString(),
    },
  ];

  const filterOptions = [
    { key: '', label: 'All' },
    { key: 'male', label: 'Male' },
    { key: 'female', label: 'Female' },
  ];

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await fetch('/api/patients');
      const data = await res.json();
      if (data.items) {
        setPatients(data.items);
      }
    } catch (error) {
      showNotification({
        title: 'Error',
        message: 'Failed to fetch patients',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    // TODO: Implement add patient modal
  };

  const handleEdit = (patient: Patient) => {
    // TODO: Implement edit patient modal
  };

  const handleDelete = async (patient: Patient) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        const res = await fetch(`/api/patients/${patient._id}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          showNotification({
            title: 'Success',
            message: 'Patient deleted successfully',
            type: 'success'
          });
          fetchPatients();
        } else {
          showNotification({
            title: 'Error',
            message: 'Failed to delete patient',
            type: 'error'
          });
        }
      } catch (error) {
        showNotification({
          title: 'Error',
          message: 'Failed to delete patient',
          type: 'error'
        });
      }
    }
  };

  const filteredData = patients.filter((patient) => {
    const matchesSearch =
      !searchTerm ||
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.id_card.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = !filterValue || patient.gender === filterValue;

    return matchesSearch && matchesFilter;
  });

  return (
    <CRUDTemplate
      title="Patient Management"
      description="Manage patient information"
      data={patients}
      filteredData={filteredData}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      filterValue={filterValue}
      setFilterValue={setFilterValue}
      filterOptions={filterOptions}
      searchFields={['name', 'phone', 'id_card']}
      columns={columns}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
      addButtonText="Add Patient"
      searchPlaceholder="Search by name, phone or ID card..."
      filterPlaceholder="Filter by gender"
      emptyStateIcon="mdi:account-group"
      emptyStateMessage="No patients found"
    />
  );
};

export default PatientManager;