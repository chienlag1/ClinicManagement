'use client';

import { useUser } from '@clerk/nextjs';
import { Button } from '@heroui/button';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Input } from '@heroui/input';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@heroui/modal';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useNotification } from '@/components/notification-popup';

interface Patient {
  _id: string;
  patient_id: string;
  id_card: string;
  name: string;
  gender: 'male' | 'female';
  birth_date: string;
  phone: string;
  address: string;
}

export default function UserProfile() {
  const router = useRouter();
  const {} = useUser();
  const { showNotification } = useNotification();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<
    Omit<Patient, '_id' | 'patient_id'>
  >({
    id_card: '',
    name: '',
    gender: 'male',
    birth_date: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    fetchPatientData();
  }, []);

  const fetchPatientData = async () => {
    try {
      const response = await fetch(`/api/patients`);
      const data = await response.json();

      if (data.items.length > 0) {
        setPatient(data.items[0]);
        setEditFormData({
          id_card: data.items[0].id_card,
          name: data.items[0].name,
          gender: data.items[0].gender,
          birth_date: new Date(data.items[0].birth_date)
            .toISOString()
            .split('T')[0],
          phone: data.items[0].phone,
          address: data.items[0].address,
        });
      }
    } catch {}
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/patients/${patient?._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });

      if (!response.ok) {
        throw new Error('Failed to update patient information');
      }

      showNotification({
        title: 'Success',
        message: 'Patient information updated successfully',
        type: 'success',
      });

      setIsEditModalOpen(false);
      fetchPatientData();
    } catch (error: any) {
      showNotification({
        title: 'Error',
        message: error.message,
        type: 'error',
      });
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/patients/${patient?._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete patient information');
      }

      showNotification({
        title: 'Success',
        message: 'Patient information deleted successfully',
        type: 'success',
      });

      setIsDeleteModalOpen(false);
      setPatient(null);

      // Redirect to welcome page after successful deletion
      router.push('/');
    } catch (error: any) {
      showNotification({
        title: 'Error',
        message: error.message,
        type: 'error',
      });
    }
  };

  return (
    <div className='container mx-auto px-4 py-8'>
      <Card>
        <CardHeader>
          <h1 className='text-2xl font-bold'>Patient Profile</h1>
        </CardHeader>
        <CardBody>
          {patient ? (
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='font-semibold' htmlFor='patient-id-display'>
                    Patient ID:
                  </label>
                  <p id='patient-id-display'>{patient.patient_id}</p>
                </div>
                <div>
                  <label className='font-semibold' htmlFor='id-card-display'>
                    ID Card:
                  </label>
                  <p id='id-card-display'>{patient.id_card}</p>
                </div>
                <div>
                  <label className='font-semibold' htmlFor='name-display'>
                    Name:
                  </label>
                  <p id='name-display'>{patient.name}</p>
                </div>
                <div>
                  <label className='font-semibold' htmlFor='gender-display'>
                    Gender:
                  </label>
                  <p className='capitalize' id='gender-display'>
                    {patient.gender}
                  </p>
                </div>
                <div>
                  <label className='font-semibold' htmlFor='birth-date-display'>
                    Birth Date:
                  </label>
                  <p id='birth-date-display'>
                    {new Date(patient.birth_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className='font-semibold' htmlFor='phone-display'>
                    Phone:
                  </label>
                  <p id='phone-display'>{patient.phone}</p>
                </div>
                <div className='col-span-2'>
                  <label className='font-semibold' htmlFor='address-display'>
                    Address:
                  </label>
                  <p id='address-display'>{patient.address}</p>
                </div>
              </div>

              <div className='flex justify-end space-x-2'>
                <Button
                  variant='bordered'
                  onClick={() => setIsEditModalOpen(true)}
                >
                  Edit
                </Button>
                <Button
                  color='danger'
                  variant='bordered'
                  onClick={() => setIsDeleteModalOpen(true)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ) : (
            <div className='text-center py-8'>
              <p>No patient information found.</p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <ModalContent>
          <form onSubmit={handleEdit}>
            <ModalHeader>Edit Patient Information</ModalHeader>
            <ModalBody>
              <div className='space-y-4'>
                <Input
                  required
                  label='ID Card'
                  value={editFormData.id_card}
                  onChange={e =>
                    setEditFormData({
                      ...editFormData,
                      id_card: e.target.value,
                    })
                  }
                />
                <Input
                  required
                  label='Name'
                  value={editFormData.name}
                  onChange={e =>
                    setEditFormData({ ...editFormData, name: e.target.value })
                  }
                />
                <div className='w-full'>
                  <label
                    className='block text-sm font-medium mb-2'
                    htmlFor='gender-select'
                  >
                    Gender
                  </label>
                  <select
                    required
                    className='w-full px-3 py-2 border rounded-md'
                    id='gender-select'
                    value={editFormData.gender}
                    onChange={e =>
                      setEditFormData({
                        ...editFormData,
                        gender: e.target.value as 'male' | 'female',
                      })
                    }
                  >
                    <option value='male'>Male</option>
                    <option value='female'>Female</option>
                  </select>
                </div>
                <Input
                  required
                  label='Birth Date'
                  type='date'
                  value={editFormData.birth_date}
                  onChange={e =>
                    setEditFormData({
                      ...editFormData,
                      birth_date: e.target.value,
                    })
                  }
                />
                <Input
                  required
                  label='Phone'
                  value={editFormData.phone}
                  onChange={e =>
                    setEditFormData({ ...editFormData, phone: e.target.value })
                  }
                />
                <Input
                  required
                  label='Address'
                  value={editFormData.address}
                  onChange={e =>
                    setEditFormData({
                      ...editFormData,
                      address: e.target.value,
                    })
                  }
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                variant='bordered'
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type='submit' variant='solid'>
                Save Changes
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      >
        <ModalContent>
          <ModalHeader>Confirm Deletion</ModalHeader>
          <ModalBody>
            <p>Are you sure you want to delete your patient information?</p>
          </ModalBody>
          <ModalFooter>
            <Button
              variant='bordered'
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button color='danger' variant='solid' onClick={handleDelete}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
