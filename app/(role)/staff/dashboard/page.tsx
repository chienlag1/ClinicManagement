'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Icon } from '@iconify/react';

import { Appointment } from '@/types/appointment';

export default function StaffDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch('/api/appointments');

        if (!response.ok)
          throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();

        setAppointments(data);
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

  const handleDetail = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
  };

  const closeDetail = () => {
    setSelectedAppointment(null);
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
              <a
                className='p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-center transition-colors block'
                href='/staff/appointment'
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
                className='p-4 bg-green-50 hover:bg-green-100 rounded-lg text-center transition-colors block'
                href='/staff/patient-manager'
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
                className='p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-center transition-colors block'
                href='/staff/clinics'
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
                className='p-4 bg-orange-50 hover:bg-orange-100 rounded-lg text-center transition-colors block'
                href='/staff/medicine-manager'
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
          <h3 className='text-lg font-semibold'>Lịch hẹn hôm nay</h3>
          <a
            className='text-sm text-blue-600 hover:text-blue-800 font-medium'
            href='/staff/schedule'
          >
            Xem tất cả →
          </a>
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
                    <div className='text-sm font-medium text-gray-900 w-20'>
                      {appointment.appointment_time ||
                        appointment.time ||
                        new Date(appointment.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
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
                      className='px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs'
                      onClick={() => handleDetail(appointment)}
                    >
                      Detail
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='text-center py-8'>
              <Icon
                className='w-12 h-12 text-gray-400 mx-auto mb-4'
                icon='lucide:calendar-x'
              />
              <p className='text-gray-500 mb-2'>Không có lịch hẹn hôm nay.</p>
              <a
                className='text-blue-600 hover:text-blue-800 font-medium'
                href='/staff/appointment'
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
                className='text-gray-500 hover:text-gray-700'
                onClick={closeDetail}
              >
                <Icon className='w-6 h-6' icon='lucide:x' />
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
