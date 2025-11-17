'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Button } from '@heroui/button';
import { Spinner } from '@heroui/spinner';
import { useUser } from '@clerk/nextjs';
import { Calendar, Users, FileText, Clock, Plus } from 'lucide-react';
import { Appointment } from '@/types/appointment';

export default function DoctorDashboardPage() {
  const { user } = useUser();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [prescriptionsCount, setPrescriptionsCount] = useState(0);
  const [patientsCount, setPatientsCount] = useState(0);

  // Helper function to format date to YYYY-MM-DD in local timezone
  const formatDateLocal = useCallback((date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  // Ngày hiện tại dạng yyyy-mm-dd (local timezone)
  const today = useMemo(() => formatDateLocal(new Date()), [formatDateLocal]);

  // Fetch appointments
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      // Sử dụng clerkUserId của user hiện tại làm doctor_id
      const doctorId = user.id; // clerkUserId

      try {
        // Fetch appointments
        console.log(
          'Dashboard - Fetching appointments for doctorId:',
          doctorId
        );
        const appointmentsRes = await fetch(`/api/appointments/${doctorId}`);
        if (appointmentsRes.ok) {
          const appointmentsData = await appointmentsRes.json();
          const appointmentsArray = Array.isArray(appointmentsData)
            ? appointmentsData
            : [];
          setAppointments(appointmentsArray);
          console.log(
            'Dashboard - Fetched appointments:',
            appointmentsArray.length
          );

          // Debug: Log all appointments với thông tin chi tiết
          if (appointmentsArray.length > 0) {
            appointmentsArray.forEach((apt: Appointment, index: number) => {
              console.log(`Dashboard - Appointment ${index + 1}:`, {
                appointment_id: apt.appointment_id,
                doctor_id: apt.doctor_id,
                appointment_date: apt.appointment_date,
                formatted_date: formatDateLocal(apt.appointment_date || ''),
                appointment_time: apt.appointment_time,
                patient:
                  typeof apt.patient_id === 'object'
                    ? apt.patient_id?.name
                    : apt.patient_id,
              });
            });
          } else {
            console.log(
              'Dashboard - No appointments found for doctor:',
              doctorId
            );
          }
        } else {
          const errorData = await appointmentsRes.json().catch(() => ({}));
          console.error(
            'Failed to fetch appointments:',
            appointmentsRes.status,
            errorData
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
          console.log(
            'Dashboard - Pending prescriptions:',
            pendingPrescriptions.length
          );
        }

        // Fetch patients count - API trả về { items: [...], total: ... }
        const patientsRes = await fetch('/api/doctor/patients?limit=100');
        if (patientsRes.ok) {
          const patientsData = await patientsRes.json();
          // API trả về { items: [...], total: number, page: number, limit: number, pages: number }
          // Sử dụng total để có tổng số patients của doctor
          const patientsCount =
            patientsData.total ??
            patientsData.items?.length ??
            (Array.isArray(patientsData) ? patientsData.length : 0);
          setPatientsCount(patientsCount || 0);
          console.log('Dashboard - Active patients:', {
            total: patientsData.total,
            items: patientsData.items?.length,
            count: patientsCount,
            data: patientsData,
          });
        } else {
          console.error('Failed to fetch patients:', patientsRes.status);
          setPatientsCount(0);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Filter appointments for today - sử dụng local timezone
  const todayAppointments = useMemo(() => {
    if (!Array.isArray(appointments)) {
      console.log('Dashboard - appointments is not an array:', appointments);
      return [];
    }

    const todayLocal = formatDateLocal(new Date());
    console.log('Dashboard - Filtering appointments for today:', todayLocal);
    console.log(
      'Dashboard - Total appointments to filter:',
      appointments.length
    );

    const filtered = appointments.filter(apt => {
      if (!apt.appointment_date) {
        console.log(
          'Dashboard - Appointment missing date:',
          apt.appointment_id
        );
        return false;
      }

      const appointmentDate = new Date(apt.appointment_date);
      if (isNaN(appointmentDate.getTime())) {
        console.log(
          'Dashboard - Invalid appointment date:',
          apt.appointment_date,
          apt.appointment_id
        );
        return false;
      }

      const appointmentDateStr = formatDateLocal(appointmentDate);
      const matches = appointmentDateStr === todayLocal;

      // Debug: Log tất cả appointments để xem tại sao không match
      console.log('Dashboard - Comparing appointment:', {
        appointment_id: apt.appointment_id,
        appointment_date_raw: apt.appointment_date,
        appointment_date_formatted: appointmentDateStr,
        today_local: todayLocal,
        matches: matches,
        patient:
          typeof apt.patient_id === 'object' ? apt.patient_id?.name : 'Unknown',
      });

      return matches;
    });

    console.log(
      `Dashboard - Today appointments: ${filtered.length} out of ${appointments.length} (Today: ${todayLocal})`
    );
    return filtered;
  }, [appointments, formatDateLocal]);

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
      href: '/doctor/prescriptions',
    },
    {
      label: 'View Schedule',
      icon: Clock,
      color: 'secondary',
      href: '/doctor/schedule',
    },
    {
      label: 'Patient Records',
      icon: Users,
      color: 'success',
      href: '/doctor/patients',
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
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
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
