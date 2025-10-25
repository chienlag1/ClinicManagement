'use client';

import { useEffect, useState } from 'react';

import { CRUDColumn, CRUDTemplate } from '@/components/DataTable';
import { useNotification } from '@/components/notification-popup';

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
  const [, setLoading] = useState(true);
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
      render: value => new Date(value).toLocaleDateString(),
    },
    { key: 'phone', label: 'Phone' },
    { key: 'address', label: 'Address' },
    {
      key: 'createdAt',
      label: 'Created At',
      render: value => new Date(value).toLocaleString(),
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
    } catch {
      showNotification({
        title: 'Error',
        message: 'Failed to fetch patients',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    // TODO: Implement add patient modal
  };

  const handleEdit = (_patient: Patient) => {
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
            type: 'success',
          });
          fetchPatients();
        } else {
          showNotification({
            title: 'Error',
            message: 'Failed to delete patient',
            type: 'error',
          });
        }
      } catch {
        showNotification({
          title: 'Error',
          message: 'Failed to delete patient',
          type: 'error',
        });
      }
    }
  };

  const filteredData = patients.filter(patient => {
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
      addButtonText='Add Patient'
      columns={columns}
      data={patients}
      description='Manage patient information'
      emptyStateIcon='mdi:account-group'
      emptyStateMessage='No patients found'
      filterOptions={filterOptions}
      filterPlaceholder='Filter by gender'
      filterValue={filterValue}
      filteredData={filteredData}
      searchFields={['name', 'phone', 'id_card']}
      searchPlaceholder='Search by name, phone or ID card...'
      searchTerm={searchTerm}
      setFilterValue={setFilterValue}
      setSearchTerm={setSearchTerm}
      title='Patient Management'
      onAdd={handleAdd}
      onDelete={handleDelete}
      onEdit={handleEdit}
    />
  );
};

export default PatientManager;
