import { Clinic } from './clinic';

// Base interfaces for API responses
export interface Patient {
  _id: string;
  patient_id: string;
  name: string;
  phone?: string;
  gender?: 'male' | 'female';
  birth_date?: string;
  address?: string;
  id_card?: string;
}

// Clinic interface is exported from ./clinic.ts

export interface Doctor {
  _id: string;
  doctor_id: string;
  name: string;
  specialty: string;
  phone?: string;
  email?: string;
}

// Appointment interfaces
export interface Appointment {
  _id: string;
  appointment_id: string;
  patient_id: Patient | string;
  clinic_id: Clinic | string;
  doctor_id: Doctor | string;
  appointment_date: string;
  appointment_time: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  priority: boolean;
  symptoms: string;
  notes?: string;
  created_by: string;
  createdAt: string;
  updatedAt: string;
  // Legacy fields for backward compatibility
  date?: string;
  time?: string;
  type?: string;
  note?: string;
}

// Populated appointment (when patient_id is populated)
export interface PopulatedAppointment extends Omit<Appointment, 'patient_id'> {
  patient_id: Patient;
}

// Form data interfaces
export interface PatientData {
  patient_id: string;
  id_card: string;
  name: string;
  gender: 'male' | 'female';
  birth_date: string;
  phone: string;
  address: string;
}

// AppointmentFormData is exported from ./form.ts

// API response interfaces are exported from ./api.ts

// Filter and pagination interfaces
export type FilterMode = 'today' | 'all' | 'custom';

export interface AppointmentFilters {
  mode: FilterMode;
  selectedDate: string;
  status?: string;
  priority?: boolean;
}

// Status colors mapping
export const statusColors: Record<string, string> = {
  scheduled: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  completed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800',
};

// Status labels mapping
export const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'scheduled':
      return 'Đã đặt';
    case 'confirmed':
      return 'Đã xác nhận';
    case 'completed':
      return 'Hoàn thành';
    case 'cancelled':
      return 'Đã hủy';
    default:
      return 'Không xác định';
  }
};
