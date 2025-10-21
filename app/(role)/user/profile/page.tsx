'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@heroui/modal';
import { useNotification } from '@/components/notification-popup';
import { Card, CardHeader, CardBody } from '@heroui/card';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Select, SelectItem } from '@heroui/select';

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
  const { user } = useUser();
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
      } else {
        setPatient(null);
      }
    } catch (error) {
      console.error('Failed to fetch patient data:', error);
    }
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
                  <div className='font-semibold'>Patient ID:</div>
                  <p>{patient.patient_id}</p>
                </div>
                <div>
                  <div className='font-semibold'>ID Card:</div>
                  <p>{patient.id_card}</p>
                </div>
                <div>
                  <div className='font-semibold'>Name:</div>
                  <p>{patient.name}</p>
                </div>
                <div>
                  <div className='font-semibold'>Gender:</div>
                  <p className='capitalize'>{patient.gender}</p>
                </div>
                <div>
                  <div className='font-semibold'>Birth Date:</div>
                  <p>{new Date(patient.birth_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <div className='font-semibold'>Phone:</div>
                  <p>{patient.phone}</p>
                </div>
                <div className='col-span-2'>
                  <div className='font-semibold'>Address:</div>
                  <p>{patient.address}</p>
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
                  variant='bordered'
                  color='danger'
                  onClick={() => setIsDeleteModalOpen(true)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ) : (
            <div className='text-center py-8 space-y-4'>
              <p className='text-gray-600'>
                You haven&apos;t created your profile yet.
              </p>
              <Button
                color='primary'
                onClick={() => router.push('/patient-registration')}
              >
                Go back
              </Button>
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
                  label='ID Card'
                  required
                  value={editFormData.id_card}
                  onChange={e =>
                    setEditFormData({
                      ...editFormData,
                      id_card: e.target.value,
                    })
                  }
                />
                <Input
                  label='Name'
                  required
                  value={editFormData.name}
                  onChange={e =>
                    setEditFormData({ ...editFormData, name: e.target.value })
                  }
                />
                <div className='w-full'>
                  <label htmlFor='edit-gender' className='block text-sm font-medium mb-2'>
                    Gender
                  </label>
                  <select
                    id='edit-gender'
                    className='w-full px-3 py-2 border rounded-md'
                    value={editFormData.gender}
                    onChange={e =>
                      setEditFormData({
                        ...editFormData,
                        gender: e.target.value as 'male' | 'female',
                      })
                    }
                    required
                  >
                    <option value='male'>Male</option>
                    <option value='female'>Female</option>
                  </select>
                </div>
                <Input
                  type='date'
                  label='Birth Date'
                  required
                  value={editFormData.birth_date}
                  onChange={e =>
                    setEditFormData({
                      ...editFormData,
                      birth_date: e.target.value,
                    })
                  }
                />
                <Input
                  label='Phone'
                  required
                  value={editFormData.phone}
                  onChange={e =>
                    setEditFormData({ ...editFormData, phone: e.target.value })
                  }
                />
                <Input
                  label='Address'
                  required
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
            <Button variant='solid' color='danger' onClick={handleDelete}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
