'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Card, CardHeader, CardBody } from '@heroui/card';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
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
        message: 'Patient registered successfully',
        type: 'success',
      });
      router.push('/user/profile');
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
    <div className='flex justify-center items-start min-h-screen bg-gray-50 px-4 pt-24'>
      <Card className='w-full max-w-3xl shadow-lg rounded-2xl p-8'>
        <CardHeader className='flex flex-col items-center space-y-3 mb-4'>
          <h1 className='text-3xl font-bold text-center text-gray-800'>
            Patient <span className='text-blue-600'>Registration</span>
          </h1>
          <p className='text-gray-600 text-center text-base'>
            Please fill in your information accurately
          </p>
        </CardHeader>

        <CardBody>
          <form onSubmit={handleSubmit} className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <Input
                label='ID Card Number'
                placeholder='Enter your ID card number'
                required
                value={formData.id_card}
                onChange={e =>
                  setFormData({ ...formData, id_card: e.target.value })
                }
                classNames={{
                  inputWrapper:
                    'rounded-xl border border-gray-300 focus-within:border-blue-500 hover:border-blue-400 transition-all',
                  label: 'text-sm font-medium text-gray-700',
                }}
              />

              <Input
                label='Full Name'
                placeholder='Enter your full name'
                required
                value={formData.name}
                onChange={e =>
                  setFormData({ ...formData, name: e.target.value })
                }
                classNames={{
                  inputWrapper:
                    'rounded-xl border border-gray-300 focus-within:border-blue-500 hover:border-blue-400 transition-all',
                  label: 'text-sm font-medium text-gray-700',
                }}
              />

              <div>
                <label
                  htmlFor='genderSelect'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  Gender
                </label>
                <select
                  id='genderSelect'
                  value={formData.gender}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      gender: e.target.value as 'male' | 'female',
                    })
                  }
                  className='w-full rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all px-3 py-2 bg-white'
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
                value={formData.birth_date}
                onChange={e =>
                  setFormData({ ...formData, birth_date: e.target.value })
                }
                classNames={{
                  inputWrapper:
                    'rounded-xl border border-gray-300 focus-within:border-blue-500 hover:border-blue-400 transition-all',
                  label: 'text-sm font-medium text-gray-700',
                }}
              />

              <Input
                label='Phone Number'
                placeholder='Enter your phone number'
                required
                value={formData.phone}
                onChange={e =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                classNames={{
                  inputWrapper:
                    'rounded-xl border border-gray-300 focus-within:border-blue-500 hover:border-blue-400 transition-all',
                  label: 'text-sm font-medium text-gray-700',
                }}
              />

              <Input
                label='Address'
                placeholder='Enter your complete address'
                required
                value={formData.address}
                onChange={e =>
                  setFormData({ ...formData, address: e.target.value })
                }
                classNames={{
                  inputWrapper:
                    'rounded-xl border border-gray-300 focus-within:border-blue-500 hover:border-blue-400 transition-all',
                  label: 'text-sm font-medium text-gray-700',
                }}
              />
            </div>

            <div className='flex justify-end gap-4 pt-6'>
              <Button
                variant='bordered'
                onClick={() => router.push('/user/profile')}
                className='rounded-xl px-8 py-2 text-gray-700 hover:bg-gray-100 transition'
              >
                Cancel
              </Button>

              <Button
                type='submit'
                color='primary'
                variant='solid'
                className='rounded-xl px-8 py-2 text-white text-base font-semibold shadow-md hover:opacity-90 transition'
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
