'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Icon } from '@iconify/react';
import { Pagination, usePagination } from '@/components/pagination';
import { Appointment } from '@/types/appointment';

interface Activity {
  id: string;
  type: 'appointment' | 'prescription' | 'patient';
  message: string;
  time: string;
  icon: string;
  timestamp: Date;
}

export default function StaffDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  // Pagination
  const {
    currentPage,
    itemsPerPage,
    handlePageChange,
    handleItemsPerPageChange,
  } = usePagination(1, 5);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch('/api/appointments');
        if (!response.ok)
          throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        setAppointments(data);

        // Lọc lịch hẹn hôm nay
        const today = new Date().toISOString().split('T')[0];
        const todayAppts = data.filter((apt: Appointment) => {
          if (!apt.appointment_date) return false;
          const aptDate = new Date(apt.appointment_date);
          if (isNaN(aptDate.getTime())) return false;
          return aptDate.toISOString().split('T')[0] === today;
        });
        setTodayAppointments(todayAppts);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Có lỗi xảy ra khi lấy danh sách lịch khám.'
        );
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  // Fetch recent activities from multiple sources
  useEffect(() => {
    const fetchRecentActivities = async () => {
      try {
        const [appointmentsRes, prescriptionsRes, patientsRes] = await Promise.all([
          fetch('/api/appointments'),
          fetch('/api/prescriptions'),
          fetch('/api/patients')
        ]);

        const appointments = appointmentsRes.ok ? await appointmentsRes.json() : [];
        const prescriptions = prescriptionsRes.ok ? await prescriptionsRes.json() : [];
        const patients = patientsRes.ok ? await patientsRes.json() : [];

        const activities: Activity[] = [];

        // Add recent appointments (last 5)
        appointments
          .sort((a: any, b: any) => new Date(b.createdAt || b.appointment_date).getTime() - new Date(a.createdAt || a.appointment_date).getTime())
          .slice(0, 5)
          .forEach((apt: any) => {
            const patientName = typeof apt.patient_id === 'object' ? apt.patient_id?.name : apt.patient_id || 'Bệnh nhân';
            activities.push({
              id: apt._id,
              type: 'appointment',
              message: `Đã đặt lịch khám cho ${patientName}`,
              time: getRelativeTime(apt.createdAt || apt.appointment_date),
              icon: 'lucide:calendar-plus',
              timestamp: new Date(apt.createdAt || apt.appointment_date)
            });
          });

        // Add recent prescriptions (last 5)
        prescriptions
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5)
          .forEach((pres: any) => {
            const patientName = typeof pres.patient === 'object' ? pres.patient?.name : pres.patient || 'Bệnh nhân';
            activities.push({
              id: pres._id,
              type: 'prescription',
              message: `Đơn thuốc mới cho ${patientName}`,
              time: getRelativeTime(pres.createdAt),
              icon: 'lucide:pill',
              timestamp: new Date(pres.createdAt)
            });
          });

        // Add recent patients (last 5)
        patients
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5)
          .forEach((patient: any) => {
            activities.push({
              id: patient._id,
              type: 'patient',
              message: `Bệnh nhân mới: ${patient.name}`,
              time: getRelativeTime(patient.createdAt),
              icon: 'lucide:user-plus',
              timestamp: new Date(patient.createdAt)
            });
          });

        // Sort all activities by timestamp and take the most recent 4
        const sortedActivities = activities
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
          .slice(0, 4);

        setRecentActivities(sortedActivities);
      } catch (err) {
        console.error('Error fetching recent activities:', err);
      }
    };

    fetchRecentActivities();
  }, []);

  // Helper function to calculate relative time
  const getRelativeTime = (date: string | Date): string => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return then.toLocaleDateString('vi-VN');
  };

  const handleDetail = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
  };

  const closeDetail = () => {
    setSelectedAppointment(null);
  };

  const stats = [
    {
      title: "Today's Appointments",
      value: todayAppointments.length.toString(),
      icon: 'lucide:calendar',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Appointments',
      value: appointments.length.toString(),
      icon: 'lucide:users',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Confirmed',
      value: todayAppointments.filter(apt => apt.priority).length.toString(),
      icon: 'lucide:check-circle',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Pending',
      value: todayAppointments.filter(apt => !apt.priority).length.toString(),
      icon: 'lucide:clock',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
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
              <a
                href='/staff/appointment'
                className='p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-center transition-colors block'
              >
                <Icon
                  className='w-6 h-6 text-blue-600 mx-auto mb-2'
                  icon='lucide:calendar-plus'
                />
                <p className='text-sm font-medium text-blue-900'>
                  Đặt lịch khám
                </p>
              </a>
              <a
                href='/staff/patient-manager'
                className='p-4 bg-green-50 hover:bg-green-100 rounded-lg text-center transition-colors block'
              >
                <Icon
                  className='w-6 h-6 text-green-600 mx-auto mb-2'
                  icon='lucide:user-plus'
                />
                <p className='text-sm font-medium text-green-900'>
                  Quản lý bệnh nhân
                </p>
              </a>
              <a
                href='/staff/clinics'
                className='p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-center transition-colors block'
              >
                <Icon
                  className='w-6 h-6 text-purple-600 mx-auto mb-2'
                  icon='lucide:building'
                />
                <p className='text-sm font-medium text-purple-900'>
                  Quản lý phòng khám
                </p>
              </a>
              <a
                href='/staff/medicine-manager'
                className='p-4 bg-orange-50 hover:bg-orange-100 rounded-lg text-center transition-colors block'
              >
                <Icon
                  className='w-6 h-6 text-orange-600 mx-auto mb-2'
                  icon='lucide:pill'
                />
                <p className='text-sm font-medium text-orange-900'>
                  Quản lý thuốc
                </p>
              </a>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Today's Schedule */}
      <Card>
        <CardHeader className='flex justify-between items-center'>
          <h3 className='text-lg font-semibold'>
            Lịch hẹn hôm nay ({todayAppointments.length})
          </h3>
          <a
            href='/staff/schedule'
            className='text-sm text-blue-600 hover:text-blue-800 font-medium'
          >
            Xem tất cả →
          </a>
        </CardHeader>
        <CardBody>
          {loading ? (
            <p className='text-center text-gray-500'>Đang tải...</p>
          ) : error ? (
            <p className='text-center text-red-500'>{error}</p>
          ) : todayAppointments.length > 0 ? (
            <>
              <div className='space-y-3'>
                {todayAppointments
                  .slice(
                    (currentPage - 1) * itemsPerPage,
                    currentPage * itemsPerPage
                  )
                  .map((appointment, index) => (
                    <div
                      key={appointment._id || index}
                      className='flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors'
                    >
                      <div className='flex items-center gap-3'>
                        <div className='text-sm font-medium text-gray-900 w-20'>
                          {appointment.appointment_time ||
                            appointment.time ||
                            new Date(appointment.createdAt).toLocaleTimeString(
                              [],
                              {
                                hour: '2-digit',
                                minute: '2-digit',
                              }
                            )}
                        </div>
                        <div>
                          <p className='font-medium text-gray-900'>
                            {typeof appointment.patient_id === 'string'
                              ? appointment.patient_id
                              : appointment.patient_id?.name ||
                                `Patient ${index + 1}`}
                          </p>
                          <p className='text-sm text-gray-600'>
                            {typeof appointment.doctor_id === 'string'
                              ? appointment.doctor_id
                              : appointment.doctor_id?.name || 'Bác sĩ'}
                            {typeof appointment.doctor_id === 'object' &&
                              appointment.doctor_id?.specialty &&
                              ` - ${appointment.doctor_id.specialty}`}
                          </p>
                          <p className='text-xs text-gray-500'>
                            {appointment.symptoms
                              ? appointment.symptoms.substring(0, 50) +
                                (appointment.symptoms.length > 50 ? '...' : '')
                              : 'Không có triệu chứng'}
                          </p>
                        </div>
                      </div>
                      <div className='flex gap-2'>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            appointment.priority
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {appointment.priority ? 'Confirmed' : 'Pending'}
                        </span>
                        <button
                          onClick={() => handleDetail(appointment)}
                          className='px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs'
                        >
                          Detail
                        </button>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Pagination */}
              {todayAppointments.length > itemsPerPage && (
                <div className='mt-4'>
                  <Pagination
                    color='primary'
                    currentPage={currentPage}
                    itemsPerPage={itemsPerPage}
                    itemsPerPageOptions={[5, 10, 15, 20]}
                    showFirstLast={true}
                    showItemsPerPage={true}
                    showQuickJump={false}
                    showTotal={true}
                    size='md'
                    totalItems={todayAppointments.length}
                    onItemsPerPageChange={handleItemsPerPageChange}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          ) : (
            <div className='text-center py-8'>
              <Icon
                icon='lucide:calendar-x'
                className='w-12 h-12 text-gray-400 mx-auto mb-4'
              />
              <p className='text-gray-500 mb-2'>Không có lịch hẹn hôm nay.</p>
              <a
                href='/staff/appointment'
                className='text-blue-600 hover:text-blue-800 font-medium'
              >
                Đặt lịch khám ngay →
              </a>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Modal for Appointment Details */}
      {selectedAppointment && (
        <dialog
          open
          className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'
        >
          <div className='bg-white p-6 rounded-lg shadow-lg w-96'>
            <div className='flex justify-between items-center mb-4'>
              <h3 className='text-lg font-semibold'>Chi tiết lịch hẹn</h3>
              <button
                onClick={closeDetail}
                className='text-gray-500 hover:text-gray-700'
              >
                <Icon icon='lucide:x' className='w-6 h-6' />
              </button>
            </div>
            <div className='space-y-2'>
              <p>
                <strong>ID:</strong> {selectedAppointment._id}
              </p>
              <p>
                <strong>Bệnh nhân:</strong>{' '}
                {typeof selectedAppointment.patient_id === 'string'
                  ? selectedAppointment.patient_id
                  : selectedAppointment.patient_id?.name || 'Không xác định'}
              </p>
              <p>
                <strong>Phòng khám:</strong>{' '}
                {typeof selectedAppointment.clinic_id === 'string'
                  ? selectedAppointment.clinic_id
                  : selectedAppointment.clinic_id?.name ||
                    'Không xác định'}{' '}
                -{' '}
                {typeof selectedAppointment.clinic_id === 'string'
                  ? ''
                  : selectedAppointment.clinic_id?.address || ''}
              </p>
              <p>
                <strong>Bác sĩ:</strong>{' '}
                {typeof selectedAppointment.doctor_id === 'string'
                  ? selectedAppointment.doctor_id
                  : selectedAppointment.doctor_id?.name ||
                    'Không xác định'}{' '}
                {typeof selectedAppointment.doctor_id === 'string'
                  ? ''
                  : `(${selectedAppointment.doctor_id?.specialty || ''})`}
              </p>
              <p>
                <strong>Ngày hẹn:</strong>{' '}
                {selectedAppointment.appointment_date
                  ? new Date(
                      selectedAppointment.appointment_date
                    ).toLocaleDateString('vi-VN')
                  : 'Chưa xác định'}
              </p>
              <p>
                <strong>Giờ hẹn:</strong>{' '}
                {selectedAppointment.appointment_time ||
                  selectedAppointment.time ||
                  'Chưa xác định'}
              </p>
              <p>
                <strong>Ưu tiên:</strong>{' '}
                {selectedAppointment.priority ? 'Có' : 'Không'}
              </p>
              <p>
                <strong>Triệu chứng:</strong>{' '}
                {selectedAppointment.symptoms || 'Không có'}
              </p>
              <p>
                <strong>Ghi chú:</strong>{' '}
                {selectedAppointment.note || 'Không có'}
              </p>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}
