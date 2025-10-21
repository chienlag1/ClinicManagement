'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Button } from '@heroui/button';
import { Calendar } from 'lucide-react';

interface Appointment {
  id: string;
  patient: string;
  time: string;
  type: string;
  notes?: string;
  date?: string;
}

export default function SchedulePage() {
  const { user } = useUser();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [filterMode, setFilterMode] = useState<'today' | 'all' | 'custom'>('today');

  const dateInputRef = useRef<HTMLInputElement>(null);

  // ✅ Ngày hiện tại dạng yyyy-mm-dd
  const today = new Date().toISOString().split('T')[0];

  // ✅ Fetch danh sách appointments
  useEffect(() => {
    if (!user) return;

    setLoading(true);
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

  // ✅ Lọc danh sách theo chế độ
  const getFilteredAppointments = () => {
    if (filterMode === 'all') return appointments;
    if (filterMode === 'today') {
      return appointments.filter(a => a.date === today);
    }
    return appointments.filter(a => a.date === selectedDate);
  };

  const filteredAppointments = getFilteredAppointments();

  // ✅ Khi chọn “Today” hoặc “All”, cập nhật selectedDate về hôm nay
  const handleModeChange = (mode: 'today' | 'all' | 'custom') => {
    setFilterMode(mode);
    if (mode === 'today' || mode === 'all') {
      setSelectedDate(today);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">My Schedule</h1>

      {/* Bộ lọc ngày */}
      <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          {/* Nút chọn nhanh */}
          <div className="flex flex-wrap gap-2">
            {(['today', 'all'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => handleModeChange(mode)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filterMode === mode
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {mode === 'today' ? 'Today' : 'All'}
              </button>
            ))}
          </div>

          {/* Bộ chọn ngày thủ công */}
          <div className="flex items-center gap-2">
            <label htmlFor="selectedDate" className="font-medium text-gray-700">
              or pick date:
            </label>

            <div className="relative flex items-center">
              {/* Input chọn ngày */}
              <input
                ref={dateInputRef}
                id="selectedDate"
                type="date"
                className="border border-gray-300 rounded-md pl-3 pr-8 py-1 text-gray-900 focus:ring-2 focus:ring-blue-400 cursor-pointer"
                value={selectedDate}
                onChange={e => {
                  setSelectedDate(e.target.value);
                  setFilterMode('custom');
                }}
              />

              {/* Icon lịch — nằm bên phải */}
              <Calendar
                className="absolute right-2 text-gray-500 w-4 h-4 cursor-pointer hover:text-blue-500 transition"
                onClick={() => dateInputRef.current?.showPicker()} // 👈 mở date picker
              />
            </div>
          </div>
        </div>
      </div>

      {/* Danh sách lịch hẹn */}
      {loading && <p>Loading...</p>}
      {!loading && filteredAppointments.length === 0 && (
        <p>No appointments found for this selection.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAppointments.map(a => (
          <Card key={a.id} className={typeColors[a.type] || ''}>
            <CardHeader className="font-semibold">{a.patient}</CardHeader>
            <CardBody>
              <p className="font-medium">{a.time}</p>
              <p>{a.type}</p>
              <Button
                className="mt-2"
                color="primary"
                size="sm"
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
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 relative shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {selected.patient}
            </h2>
            <p className="text-gray-900 mb-1">
              <strong>Time:</strong> {selected.time}
            </p>
            <p className="text-gray-900 mb-1">
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
            <p className="text-gray-900 mb-2">
              <strong>Notes:</strong> {selected.notes || 'No notes'}
            </p>

            <Button
              className="mt-4 w-full"
              color="secondary"
              size="sm"
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
