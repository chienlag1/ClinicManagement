'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Button } from '@heroui/button';
import { Spinner } from '@heroui/spinner';
import { useUser } from '@clerk/nextjs';
import {
  Calendar,
  Users,
  FileText,
  FlaskConical,
  Clock,
  Plus,
  FileBarChart,
} from 'lucide-react';
import { Appointment } from '@/types/appointment';

export default function DoctorDashboardPage() {
  const { user } = useUser();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [prescriptionsCount, setPrescriptionsCount] = useState(0);
  const [patientsCount, setPatientsCount] = useState(0);

  // Ngày hiện tại dạng yyyy-mm-dd
  const today = useMemo(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  // Fetch appointments
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      // Sử dụng clerkUserId của user hiện tại làm doctor_id
      const doctorId = user.id; // clerkUserId

      try {
        // Fetch appointments
        const appointmentsRes = await fetch(`/api/appointments/${doctorId}`);
        if (appointmentsRes.ok) {
          const appointmentsData = await appointmentsRes.json();
          setAppointments(
            Array.isArray(appointmentsData) ? appointmentsData : []
          );
        } else {
          console.error(
            'Failed to fetch appointments:',
            appointmentsRes.status
          );
          setAppointments([]);
        }

        // Fetch prescriptions count
        const prescriptionsRes = await fetch(
          `/api/prescriptions?doctorId=${user.id}`
        );
        if (prescriptionsRes.ok) {
          const prescriptionsData = await prescriptionsRes.json();
          const pendingPrescriptions =
            prescriptionsData.prescriptions?.filter(
              (p: any) => p.status === 'active'
            ) || [];
          setPrescriptionsCount(pendingPrescriptions.length);
        }

        // Fetch patients count
        const patientsRes = await fetch('/api/doctor/patients');
        if (patientsRes.ok) {
          const patientsData = await patientsRes.json();
          setPatientsCount(patientsData.patients?.length || 0);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Filter appointments for today
  const todayAppointments = useMemo(() => {
    if (!Array.isArray(appointments)) return [];
    return appointments.filter(apt => {
      if (!apt.appointment_date) return false;
      const appointmentDate = new Date(apt.appointment_date);
      if (isNaN(appointmentDate.getTime())) return false;
      const appointmentDateStr = appointmentDate.toISOString().split('T')[0];
      return appointmentDateStr === today;
    });
  }, [appointments, today]);

  // Format time for display
  const formatTime = (time: string) => {
    if (!time) return '';
    // If time is already in HH:MM format, return as is
    if (time.match(/^\d{1,2}:\d{2}$/)) {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    }
    return time;
  };

  // Get patient name from appointment
  const getPatientName = (appointment: Appointment): string => {
    if (typeof appointment.patient_id === 'object' && appointment.patient_id) {
      return appointment.patient_id.name || 'Unknown';
    }
    return 'Unknown Patient';
  };

  // Get appointment type/notes
  const getAppointmentType = (appointment: Appointment): string => {
    return appointment.symptoms || appointment.notes || 'Consultation';
  };

  const quickActions = [
    {
      label: 'New Prescription',
      icon: Plus,
      color: 'primary',
      href: '/doctor/prescriptions/new',
    },
    {
      label: 'View Reports',
      icon: FileBarChart,
      color: 'secondary',
      href: '/doctor/prescriptions',
    },
    {
      label: 'Patient Records',
      icon: Users,
      color: 'success',
      href: '/doctor/patients',
    },
    {
      label: 'Lab Results',
      icon: FlaskConical,
      color: 'warning',
      href: '/doctor/prescriptions',
    },
  ];

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div>
        <h1 className='text-3xl font-bold text-gray-900'>Doctor Dashboard</h1>
        <p className='text-gray-600 mt-2'>
          Welcome back, Dr. {user?.firstName} {user?.lastName}
        </p>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <Card className='border border-gray-200 shadow-sm hover:shadow-md transition-shadow'>
          <CardBody className='p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='p-3 bg-blue-100 rounded-lg'>
                <Calendar className='w-6 h-6 text-blue-600' />
              </div>
            </div>
            <h3 className='text-sm font-medium text-gray-600 mb-1'>
              Today&apos;s Appointments
            </h3>
            {loading ? (
              <Spinner size='sm' className='mt-2' />
            ) : (
              <>
                <div className='text-3xl font-bold text-gray-900 mb-1'>
                  {todayAppointments.length}
                </div>
                <p className='text-sm text-gray-500'>
                  {todayAppointments.length > 0
                    ? `${todayAppointments.length} scheduled`
                    : 'No appointments'}
                </p>
              </>
            )}
          </CardBody>
        </Card>

        <Card className='border border-gray-200 shadow-sm hover:shadow-md transition-shadow'>
          <CardBody className='p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='p-3 bg-green-100 rounded-lg'>
                <Users className='w-6 h-6 text-green-600' />
              </div>
            </div>
            <h3 className='text-sm font-medium text-gray-600 mb-1'>
              Active Patients
            </h3>
            {loading ? (
              <Spinner size='sm' className='mt-2' />
            ) : (
              <>
                <div className='text-3xl font-bold text-gray-900 mb-1'>
                  {patientsCount}
                </div>
                <p className='text-sm text-gray-500'>Total patients</p>
              </>
            )}
          </CardBody>
        </Card>

        <Card className='border border-gray-200 shadow-sm hover:shadow-md transition-shadow'>
          <CardBody className='p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='p-3 bg-orange-100 rounded-lg'>
                <FileText className='w-6 h-6 text-orange-600' />
              </div>
            </div>
            <h3 className='text-sm font-medium text-gray-600 mb-1'>
              Pending Prescriptions
            </h3>
            {loading ? (
              <Spinner size='sm' className='mt-2' />
            ) : (
              <>
                <div className='text-3xl font-bold text-gray-900 mb-1'>
                  {prescriptionsCount}
                </div>
                <p className='text-sm text-gray-500'>Need review</p>
              </>
            )}
          </CardBody>
        </Card>

        <Card className='border border-gray-200 shadow-sm hover:shadow-md transition-shadow'>
          <CardBody className='p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='p-3 bg-purple-100 rounded-lg'>
                <FlaskConical className='w-6 h-6 text-purple-600' />
              </div>
            </div>
            <h3 className='text-sm font-medium text-gray-600 mb-1'>
              Lab Results
            </h3>
            <div className='text-3xl font-bold text-gray-900 mb-1'>0</div>
            <p className='text-sm text-gray-500'>Awaiting review</p>
          </CardBody>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Today's Schedule */}
        <Card className='border border-gray-200 shadow-sm'>
          <CardHeader className='pb-3'>
            <div className='flex items-center gap-2'>
              <Clock className='w-5 h-5 text-gray-600' />
              <h3 className='text-lg font-semibold text-gray-900'>
                Today&apos;s Schedule
              </h3>
            </div>
          </CardHeader>
          <CardBody className='pt-0'>
            {loading ? (
              <div className='flex items-center justify-center py-8'>
                <Spinner size='lg' />
              </div>
            ) : todayAppointments.length === 0 ? (
              <div className='text-center py-8'>
                <p className='text-gray-500'>
                  No appointments scheduled for today
                </p>
              </div>
            ) : (
              <>
                <div className='space-y-3'>
                  {todayAppointments
                    .slice(0, 3)
                    .sort((a, b) => {
                      const timeA = a.appointment_time || '';
                      const timeB = b.appointment_time || '';
                      return timeA.localeCompare(timeB);
                    })
                    .map((appointment, index) => (
                      <div
                        key={appointment._id || index}
                        className='flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors'
                      >
                        <div className='flex-1'>
                          <p className='font-semibold text-gray-900 mb-1'>
                            {getPatientName(appointment)}
                          </p>
                          <div className='flex items-center gap-2 text-sm text-gray-600'>
                            <Clock className='w-4 h-4' />
                            <span>
                              {formatTime(appointment.appointment_time)} -{' '}
                              {getAppointmentType(appointment)}
                            </span>
                          </div>
                        </div>
                        <Button
                          color='primary'
                          size='sm'
                          variant='flat'
                          onPress={() => router.push('/doctor/schedule')}
                        >
                          View
                        </Button>
                      </div>
                    ))}
                </div>
                {todayAppointments.length > 3 && (
                  <div className='mt-4 pt-4 border-t border-gray-200'>
                    <p className='text-sm text-gray-600 text-center mb-2'>
                      +{todayAppointments.length - 3} more appointments
                    </p>
                  </div>
                )}
                <div className='mt-4 pt-4 border-t border-gray-200'>
                  <Button
                    variant='light'
                    color='primary'
                    className='w-full'
                    onPress={() => router.push('/doctor/schedule')}
                  >
                    View Full Schedule
                  </Button>
                </div>
              </>
            )}
          </CardBody>
        </Card>

        {/* Quick Actions */}
        <Card className='border border-gray-200 shadow-sm'>
          <CardHeader className='pb-3'>
            <h3 className='text-lg font-semibold text-gray-900'>
              Quick Actions
            </h3>
          </CardHeader>
          <CardBody className='pt-0'>
            <div className='grid grid-cols-2 gap-4'>
              {quickActions.map((action, index) => {
                const IconComponent = action.icon;
                return (
                  <Button
                    key={index}
                    className='h-24 flex flex-col gap-2 bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all'
                    color={action.color as any}
                    variant='flat'
                    onPress={() => router.push(action.href)}
                  >
                    <IconComponent className='w-6 h-6' />
                    <span className='text-sm font-medium'>{action.label}</span>
                  </Button>
                );
              })}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
