'use client';

import { useUser } from '@clerk/nextjs';
import { Button } from '@heroui/button';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Input } from '@heroui/input';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useNotification } from '@/components/notification-popup';

export default function PatientRegistration() {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const { showNotification } = useNotification();

  const [formData, setFormData] = useState({
    id_card: '',
    name: '',
    gender: 'male',
    birth_date: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    if (!isSignedIn) router.push('/sign-in');
  }, [isSignedIn, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok)
        throw new Error(data.error || 'Failed to register patient');

      showNotification({
        title: 'Success',
        message: 'Patient registered successfully!',
        type: 'success',
      });

      router.push(`/user/profile`);
    } catch (error: any) {
      showNotification({
        title: 'Error',
        message: error.message,
        type: 'error',
      });
    }
  };

  if (!isSignedIn) return null;

  return (
    <div className='flex justify-center items-start min-h-screen bg-gradient-to-br from-blue-50 to-white px-4 pt-20 pb-10'>
      <Card className='w-full max-w-3xl shadow-xl rounded-2xl p-8 border border-gray-100'>
        <CardHeader className='flex flex-col items-center mb-8'>
          <h1 className='text-3xl font-bold text-center text-gray-800'>
            Patient Registration
          </h1>
          <p className='text-gray-600 text-center text-sm mt-2'>
            Please fill in your information accurately
          </p>
        </CardHeader>

        <CardBody>
          <form className='space-y-6' onSubmit={handleSubmit}>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <Input
                required
                label='ID Card Number'
                placeholder='Enter your ID card number'
                value={formData.id_card}
                onChange={e =>
                  setFormData({ ...formData, id_card: e.target.value })
                }
              />

              <Input
                required
                label='Full Name'
                placeholder='Enter your full name'
                value={formData.name}
                onChange={e =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />

              <div>
                <label
                  className='block text-sm font-semibold text-gray-700 mb-2'
                  htmlFor='gender-select'
                >
                  Gender
                </label>
                <select
                  className='w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm p-2.5'
                  id='gender-select'
                  value={formData.gender}
                  onChange={e =>
                    setFormData({
                      ...formData,
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
                value={formData.birth_date}
                onChange={e =>
                  setFormData({ ...formData, birth_date: e.target.value })
                }
              />

              <Input
                required
                label='Phone Number'
                placeholder='Enter your phone number'
                value={formData.phone}
                onChange={e =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />

              <Input
                required
                label='Address'
                placeholder='Enter your complete address'
                value={formData.address}
                onChange={e =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
            </div>

            <div className='flex justify-end gap-4 pt-6'>
              <Button
                className='rounded-xl px-6 py-2'
                variant='bordered'
                onClick={() => router.push('/user/profile')}
              >
                Cancel
              </Button>
              <Button
                className='rounded-xl px-6 py-2'
                color='primary'
                type='submit'
                variant='solid'
              >
                Register
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
