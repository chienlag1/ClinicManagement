'use client';

import React from 'react';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Button } from '@heroui/button';
import { useUser } from '@clerk/nextjs';

export default function DoctorDashboardPage() {
  const { user } = useUser();

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold text-gray-900'>Doctor Dashboard</h1>
        <p className='text-gray-600 mt-2'>
          Welcome back, Dr. {user?.firstName} {user?.lastName}
        </p>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <Card>
          <CardHeader>
            <h3 className='text-lg font-semibold'>Today&apos;s Appointments</h3>
          </CardHeader>
          <CardBody>
            <div className='text-3xl font-bold text-blue-600'>12</div>
            <p className='text-sm text-gray-500'>+2 from yesterday</p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className='text-lg font-semibold'>Active Patients</h3>
          </CardHeader>
          <CardBody>
            <div className='text-3xl font-bold text-green-600'>48</div>
            <p className='text-sm text-gray-500'>+5 this week</p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className='text-lg font-semibold'>Pending Prescriptions</h3>
          </CardHeader>
          <CardBody>
            <div className='text-3xl font-bold text-orange-600'>7</div>
            <p className='text-sm text-gray-500'>Need review</p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className='text-lg font-semibold'>Lab Results</h3>
          </CardHeader>
          <CardBody>
            <div className='text-3xl font-bold text-purple-600'>15</div>
            <p className='text-sm text-gray-500'>Awaiting review</p>
          </CardBody>
        </Card>
      </div>

      {/* Recent Activities */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <Card>
          <CardHeader>
            <h3 className='text-lg font-semibold'>Today&apos;s Schedule</h3>
          </CardHeader>
          <CardBody>
            <div className='space-y-4'>
              <div className='flex items-center justify-between p-3 bg-blue-50 rounded-lg'>
                <div>
                  <p className='font-medium'>John Smith</p>
                  <p className='text-sm text-gray-500'>
                    9:00 AM - General Checkup
                  </p>
                </div>
                <Button color='primary' size='sm'>
                  View
                </Button>
              </div>
              <div className='flex items-center justify-between p-3 bg-green-50 rounded-lg'>
                <div>
                  <p className='font-medium'>Sarah Johnson</p>
                  <p className='text-sm text-gray-500'>10:30 AM - Follow-up</p>
                </div>
                <Button color='primary' size='sm'>
                  View
                </Button>
              </div>
              <div className='flex items-center justify-between p-3 bg-yellow-50 rounded-lg'>
                <div>
                  <p className='font-medium'>Mike Davis</p>
                  <p className='text-sm text-gray-500'>
                    2:00 PM - Consultation
                  </p>
                </div>
                <Button color='primary' size='sm'>
                  View
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className='text-lg font-semibold'>Quick Actions</h3>
          </CardHeader>
          <CardBody>
            <div className='grid grid-cols-2 gap-4'>
              <Button className='h-20 flex flex-col' color='primary'>
                <span className='text-lg'>📋</span>
                <span>New Prescription</span>
              </Button>
              <Button className='h-20 flex flex-col' color='secondary'>
                <span className='text-lg'>📊</span>
                <span>View Reports</span>
              </Button>
              <Button className='h-20 flex flex-col' color='success'>
                <span className='text-lg'>👥</span>
                <span>Patient Records</span>
              </Button>
              <Button className='h-20 flex flex-col' color='warning'>
                <span className='text-lg'>🔬</span>
                <span>Lab Results</span>
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Role Sync Test */}
      <Card>
        <CardHeader>
          <h3 className='text-lg font-semibold'>Role Information</h3>
        </CardHeader>
        <CardBody>
          <div className='space-y-2'>
            <p>
              <strong>Current Role:</strong> Doctor
            </p>
            <p>
              <strong>User ID:</strong> {user?.id}
            </p>
            <p>
              <strong>Email:</strong> {user?.emailAddresses[0]?.emailAddress}
            </p>
            <div className='flex gap-2 mt-4'>
              <Button color='primary' size='sm'>
                Sync Role
              </Button>
              <Button color='secondary' size='sm'>
                View Profile
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
