'use client';

import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Button } from '@heroui/button';

interface Appointment {
  id: number;
  patient: string;
  time: string;
  type: string;
  notes?: string;
}

export default function SchedulePage() {
  const { user } = useUser();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Appointment | null>(null);

  useEffect(() => {
    if (!user) return;

    fetch(`/api/appointments/${user.id}`)
      .then(res => res.json())
      .then(data => {
        setAppointments(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [user]);

  // Map loại appointment → màu nền
  const typeColors: Record<string, string> = {
    Checkup: 'bg-blue-50 text-blue-700',
    'Follow-up': 'bg-green-50 text-green-700',
    Consultation: 'bg-yellow-50 text-yellow-700',
    'Dental Checkup': 'bg-purple-50 text-purple-700',
  };

  return (
    <div className='p-6 space-y-6'>
      <h1 className='text-3xl font-bold text-gray-900'>My Schedule</h1>
      {loading && <p>Loading...</p>}
      {!loading && appointments.length === 0 && <p>No appointments today.</p>}

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {appointments.map(a => (
          <Card key={a.id} className={typeColors[a.type] || ''}>
            <CardHeader className='font-semibold'>{a.patient}</CardHeader>
            <CardBody>
              <p className='font-medium'>{a.time}</p>
              <p>{a.type}</p>
              <Button
                className='mt-2'
                color='primary'
                size='sm'
                onClick={() => setSelected(a)}
              >
                View Details
              </Button>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Modal chi tiết */}
      {selected && (
        <div className='fixed inset-0 bg-black/50 flex justify-center items-center z-50'>
          <div className='bg-white rounded-lg p-6 w-96 relative shadow-lg'>
            <h2 className='text-xl font-bold text-gray-900 mb-4'>
              {selected.patient}
            </h2>
            <p className='text-gray-900 mb-1'>
              <strong>Time:</strong> {selected.time}
            </p>
            <p className='text-gray-900 mb-1'>
              <strong>Type:</strong>{' '}
              <span
                className={`px-2 py-1 rounded font-medium ${
                  typeColors[selected.type]
                    ? `${typeColors[selected.type]} font-semibold`
                    : 'bg-gray-200 text-gray-900'
                }`}
              >
                {selected.type}
              </span>
            </p>
            <p className='text-gray-900 mb-2'>
              <strong>Notes:</strong> {selected.notes || 'No notes'}
            </p>

            <Button
              className='mt-4 w-full'
              color='secondary'
              size='sm'
              onClick={() => setSelected(null)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
