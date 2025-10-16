'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Icon } from '@iconify/react';
import AppointmentForm from '@/components/AppointmentForm';

interface Appointment {
  _id: string;
  patient_id: { _id: string; name: string };
  clinic_id: { _id: string; name: string; address: string };
  doctor_id: { _id: string; name: string; specialty: string };
  priority: boolean;
  symptoms: string;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export default function StaffDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch('/api/appointments');
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        setAppointments(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi lấy danh sách lịch khám.');
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const handleSubmit = (
    isNewPatient: boolean,
    patientData: { patient_id: string; id_card: string; name: string; gender: 'male' | 'female'; birth_date: string; phone: string; address: string } | null,
    selectedPatientId: string | null,
    clinic_id: string,
    doctor_id: string,
    priority: boolean,
    symptoms: string,
    note: string
  ) => {
    console.log({
      isNewPatient,
      patientData,
      selectedPatientId,
      clinic_id,
      doctor_id,
      priority,
      symptoms,
      note,
    });
    // Refresh appointments after submit
    fetch('/api/appointments')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then(data => setAppointments(data))
      .catch(err => console.error('Error refreshing appointments:', err));
  };

  const stats = [
    {
      title: "Today's Appointments",
      value: '12',
      icon: 'lucide:calendar',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Pending Patients',
      value: '8',
      icon: 'lucide:users',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Lab Results',
      value: '5',
      icon: 'lucide:flask',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Prescriptions',
      value: '15',
      icon: 'lucide:pill',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'appointment',
      message: 'New appointment scheduled for John Doe',
      time: '10 minutes ago',
      icon: 'lucide:calendar-plus',
    },
    {
      id: 2,
      type: 'lab',
      message: 'Lab results ready for Sarah Wilson',
      time: '25 minutes ago',
      icon: 'lucide:flask',
    },
    {
      id: 3,
      type: 'prescription',
      message: 'Prescription refill requested by Mike Johnson',
      time: '1 hour ago',
      icon: 'lucide:pill',
    },
    {
      id: 4,
      type: 'patient',
      message: 'New patient registration: Emily Brown',
      time: '2 hours ago',
      icon: 'lucide:user-plus',
    },
  ];

  return (
    <div className='space-y-6'>
      {/* Welcome Section */}
      <div className='bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white'>
        <h1 className='text-2xl font-bold mb-2'>Welcome to Staff Dashboard</h1>
        <p className='text-blue-100'>
          Manage your daily tasks, appointments, and patient care efficiently.
        </p>
      </div>

      {/* Stats Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {stats.map((stat, index) => (
          <Card key={index} className='hover:shadow-lg transition-shadow'>
            <CardBody className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600 mb-1'>
                    {stat.title}
                  </p>
                  <p className='text-2xl font-bold text-gray-900'>
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} icon={stat.icon} />
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <h3 className='text-lg font-semibold'>Recent Activities</h3>
          </CardHeader>
          <CardBody>
            <div className='space-y-4'>
              {recentActivities.map(activity => (
                <div key={activity.id} className='flex items-start gap-3'>
                  <div className='p-2 bg-gray-100 rounded-lg'>
                    <Icon
                      className='w-4 h-4 text-gray-600'
                      icon={activity.icon}
                    />
                  </div>
                  <div className='flex-1'>
                    <p className='text-sm font-medium text-gray-900'>
                      {activity.message}
                    </p>
                    <p className='text-xs text-gray-500'>{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <h3 className='text-lg font-semibold'>Quick Actions</h3>
          </CardHeader>
          <CardBody>
            <div className='grid grid-cols-2 gap-3'>
              <button className='p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-center transition-colors'>
                <Icon
                  className='w-6 h-6 text-blue-600 mx-auto mb-2'
                  icon='lucide:calendar-plus'
                />
                <p className='text-sm font-medium text-blue-900'>
                  New Appointment
                </p>
              </button>
              <button className='p-4 bg-green-50 hover:bg-green-100 rounded-lg text-center transition-colors'>
                <Icon
                  className='w-6 h-6 text-green-600 mx-auto mb-2'
                  icon='lucide:user-plus'
                />
                <p className='text-sm font-medium text-green-900'>
                  Add Patient
                </p>
              </button>
              <button className='p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-center transition-colors'>
                <Icon
                  className='w-6 h-6 text-purple-600 mx-auto mb-2'
                  icon='lucide:file-text'
                />
                <p className='text-sm font-medium text-purple-900'>
                  View Records
                </p>
              </button>
              <button className='p-4 bg-orange-50 hover:bg-orange-100 rounded-lg text-center transition-colors'>
                <Icon
                  className='w-6 h-6 text-orange-600 mx-auto mb-2'
                  icon='lucide:pill'
                />
                <p className='text-sm font-medium text-orange-900'>
                  Prescriptions
                </p>
              </button>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Appointment Form */}
      <Card>
        <CardHeader>
          <h3 className='text-lg font-semibold'>Đặt lịch khám</h3>
        </CardHeader>
        <CardBody>
          <AppointmentForm onSubmit={handleSubmit} />
        </CardBody>
      </Card>

      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <h3 className='text-lg font-semibold'>Today&apos Schedule</h3>
        </CardHeader>
        <CardBody>
          {loading ? (
            <p className='text-center text-gray-500'>Đang tải...</p>
          ) : error ? (
            <p className='text-center text-red-500'>{error}</p>
          ) : appointments.length > 0 ? (
            <div className='space-y-3'>
              {appointments.map((appointment, index) => (
                <div
                  key={index}
                  className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
                >
                  <div className='flex items-center gap-3'>
                    <div className='text-sm font-medium text-gray-900 w-16'>
                      {new Date(appointment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div>
                      <p className='font-medium text-gray-900'>
                        {appointment.patient_id.name || `Patient ${index + 1}`}
                      </p>
                      <p className='text-sm text-gray-600'>Consultation</p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      appointment.priority ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {appointment.priority ? 'Confirmed' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className='text-center text-gray-500'>Không có lịch hẹn hôm nay.</p>
          )}
        </CardBody>
      </Card>
    </div>
  );
}