'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { Button } from '@heroui/button';
import { Card, CardHeader, CardBody } from '@heroui/card';

export default function Home() {
  const { isSignedIn } = useUser();
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    // Check if user has a patient profile
    if (isSignedIn) {
      fetch('/api/patients')
        .then(res => res.json())
        .then(data => {
          setHasProfile(data.items && data.items.length > 0);
        })
        .catch(error => {
          console.error('Error checking patient profile:', error);
        });
    }
  }, [isSignedIn]);

  return (
    <div className='flex justify-center items-start min-h-screen bg-gray-50 px-4 pt-24'>
      <Card className='w-full max-w-lg shadow-lg rounded-2xl p-6'>
        <CardHeader className='flex flex-col items-center space-y-3'>
          <h1 className='text-3xl font-bold text-center text-gray-800'>
            Welcome to <span className='text-blue-600'>Clinic Management</span>
          </h1>
          <p className='text-gray-600 text-center text-base'>
            Manage your health records efficiently
          </p>
        </CardHeader>

        <CardBody className='flex justify-center mt-6'>
          {isSignedIn ? (
            <Button
              as={Link}
              href='/patient-registration'
              color='primary'
              variant='solid'
              size='lg'
              className='rounded-xl px-6 py-2 text-white text-base font-semibold shadow-md hover:opacity-90 transition'
            >
              Register as Patient
            </Button>
          ) : (
            <Button
              as={Link}
              href='/sign-in'
              color='primary'
              variant='solid'
              size='lg'
              className='rounded-xl px-6 py-2 text-white text-base font-semibold shadow-md hover:opacity-90 transition'
            >
              Sign In to Register
            </Button>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
