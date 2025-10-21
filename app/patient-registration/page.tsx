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
  const { user, isSignedIn } = useUser();
  const { showNotification } = useNotification();

  const [formData, setFormData] = useState({
    id_card: '',
    name: '',
    gender: 'male',
    birth_date: '',
    phone: '',
    address: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isSignedIn) router.push('/sign-in');
  }, [isSignedIn, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, userId: user?.id }),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || 'Failed to register patient');

      showNotification({
        title: 'Success',
        message: 'Patient registered successfully! Redirecting...',
        type: 'success',
      });

      setTimeout(() => router.push('/user/profile'), 1500);
    } catch (error: any) {
      showNotification({
        title: 'Error',
        message: error.message,
        type: 'error',
      });
      setIsSubmitting(false);
    }
  };

  if (!isSignedIn) return null;

  // ✅ Reusable styles
  const inputClasses = {
    inputWrapper:
      'rounded-xl border border-gray-300 focus-within:border-blue-500 hover:border-blue-400 transition-all shadow-sm bg-white',
    label: 'text-sm font-medium text-gray-700',
  };

  const sectionClasses =
    'flex justify-center items-start min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 pt-24 pb-12';

  const cardClasses =
    'w-full max-w-3xl shadow-lg border border-gray-200 rounded-2xl bg-white/90 backdrop-blur-sm p-8';

  return (
    <div className={sectionClasses}>
      <Card className={cardClasses}>
        <CardHeader className='flex flex-col items-center space-y-3 mb-6'>
          <h1 className='text-3xl font-bold text-gray-800 text-center'>
            Patient <span className='text-blue-600'>Registration</span>
          </h1>
          <p className='text-gray-600 text-center text-base'>
            Please fill in your information accurately
          </p>
        </CardHeader>

        <CardBody>
          <form onSubmit={handleSubmit} className='space-y-8'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <Input
                label='ID Card Number'
                placeholder='Enter your ID card number'
                required
                value={formData.id_card}
                onChange={e =>
                  setFormData({ ...formData, id_card: e.target.value })
                }
                classNames={inputClasses}
              />

              <Input
                label='Full Name'
                placeholder='Enter your full name'
                required
                value={formData.name}
                onChange={e =>
                  setFormData({ ...formData, name: e.target.value })
                }
                classNames={inputClasses}
              />

              <div>
                <label htmlFor='gender' className='block text-sm font-medium text-gray-700 mb-1'>
                  Gender
                </label>
                <select
                  id='gender'
                  value={formData.gender}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      gender: e.target.value as 'male' | 'female',
                    })
                  }
                  required
                  className='w-full rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 px-3 py-2 bg-white shadow-sm transition-all'
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
                classNames={inputClasses}
              />

              <Input
                label='Phone Number'
                placeholder='Enter your phone number'
                required
                value={formData.phone}
                onChange={e =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                classNames={inputClasses}
              />

              <Input
                label='Address'
                placeholder='Enter your complete address'
                required
                value={formData.address}
                onChange={e =>
                  setFormData({ ...formData, address: e.target.value })
                }
                classNames={inputClasses}
              />
            </div>

            <div className='flex justify-end gap-4 pt-8'>
              <Button
                variant='flat'
                onClick={() => router.push('/user/profile')}
                className='rounded-xl px-8 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all'
              >
                Cancel
              </Button>

              <Button
                type='submit'
                color='primary'
                variant='solid'
                isDisabled={isSubmitting}
                className='rounded-xl px-8 py-2 text-white text-base font-semibold shadow-md hover:bg-blue-700 transition-all min-w-[130px]'
              >
                {isSubmitting ? 'Registering...' : 'Register'}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
