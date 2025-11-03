import { PatientData, Patient, Doctor } from './appointment';
import { Clinic } from './clinic';

// Form Props Interfaces
export interface AppointmentFormProps {
  onSubmit: (
    isNewPatient: boolean,
    patientData: PatientData | null,
    selectedPatientId: string | null,
    clinic_id: string,
    doctor_id: string,
    appointment_date: string,
    appointment_time: string,
    priority: boolean,
    symptoms: string,
    note: string
  ) => void;
}

export interface AppointmentFormState {
  isNewPatient: boolean;
  patientData: PatientData;
  selectedPatientId: string | null;
  clinicId: string;
  doctorId: string;
  appointmentDate: string;
  appointmentTime: string;
  priority: boolean;
  symptoms: string;
  note: string;
  error: string;
  success: string;
  isLoading: boolean;
}

export interface AppointmentFormData {
  patients: Patient[];
  clinics: Clinic[];
  doctors: Doctor[];
}

// Form Field Props
export interface FormFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  variant?: 'bordered' | 'flat' | 'faded' | 'underlined';
  className?: string;
}

export interface SelectFieldProps extends FormFieldProps {
  options: Array<{
    key: string;
    label: string;
    value: string;
  }>;
  selectedValue: string;
  onSelectionChange: (value: string) => void;
}

// Select Component Props
export interface PatientSelectProps {
  patients: Patient[];
  selectedPatientId: string | null;
  onPatientSelect: (patientId: string | null) => void;
}

export interface ClinicSelectProps {
  clinics: Clinic[];
  selectedClinicId: string;
  onClinicSelect: (clinicId: string) => void;
}

export interface DoctorSelectProps {
  doctors: Doctor[];
  selectedDoctorId: string;
  onDoctorSelect: (doctorId: string) => void;
}

// Event Handlers
export interface FormEventHandlers {
  onPatientToggle: (isNew: boolean) => void;
  onPatientDataChange: (data: Partial<PatientData>) => void;
  onPatientSelect: (patientId: string | null) => void;
  onClinicSelect: (clinicId: string) => void;
  onDoctorSelect: (doctorId: string) => void;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  onPriorityToggle: (priority: boolean) => void;
  onSymptomsChange: (symptoms: string) => void;
  onNoteChange: (note: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

// Validation
export interface FormValidation {
  isPatientDataValid: boolean;
  isAppointmentDataValid: boolean;
  isFormValid: boolean;
  errors: string[];
}

export interface FormSubmission {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  message: string;
}

// Time Management
export interface TimeSlot {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface AppointmentTimeSlots {
  morning: TimeSlot[];
  afternoon: TimeSlot[];
  all: TimeSlot[];
}

export interface FormConfig {
  timeSlots: AppointmentTimeSlots;
  minDate: string;
  maxDate: string;
  requiredFields: string[];
  validationRules: Record<string, (value: any) => boolean>;
}

// Constants
export const APPOINTMENT_TIME_SLOTS: AppointmentTimeSlots = {
  morning: [
    { value: '08:00', label: '08:00' },
    { value: '08:30', label: '08:30' },
    { value: '09:00', label: '09:00' },
    { value: '09:30', label: '09:30' },
    { value: '10:00', label: '10:00' },
    { value: '10:30', label: '10:30' },
    { value: '11:00', label: '11:00' },
    { value: '11:30', label: '11:30' },
  ],
  afternoon: [
    { value: '14:00', label: '14:00' },
    { value: '14:30', label: '14:30' },
    { value: '15:00', label: '15:00' },
    { value: '15:30', label: '15:30' },
    { value: '16:00', label: '16:00' },
    { value: '16:30', label: '16:30' },
    { value: '17:00', label: '17:00' },
    { value: '17:30', label: '17:30' },
  ],
  all: [
    { value: '08:00', label: '08:00' },
    { value: '08:30', label: '08:30' },
    { value: '09:00', label: '09:00' },
    { value: '09:30', label: '09:30' },
    { value: '10:00', label: '10:00' },
    { value: '10:30', label: '10:30' },
    { value: '11:00', label: '11:00' },
    { value: '11:30', label: '11:30' },
    { value: '14:00', label: '14:00' },
    { value: '14:30', label: '14:30' },
    { value: '15:00', label: '15:00' },
    { value: '15:30', label: '15:30' },
    { value: '16:00', label: '16:00' },
    { value: '16:30', label: '16:30' },
    { value: '17:00', label: '17:00' },
    { value: '17:30', label: '17:30' },
  ],
};

export const FORM_CONFIG: FormConfig = {
  timeSlots: APPOINTMENT_TIME_SLOTS,
  minDate: new Date().toISOString().split('T')[0],
  maxDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0], // 30 days from now
  requiredFields: [
    'clinicId',
    'doctorId',
    'appointmentDate',
    'appointmentTime',
  ],
  validationRules: {
    patient_id: (value: string) => value.length > 0,
    id_card: (value: string) => value.length > 0,
    name: (value: string) => value.length > 0,
    phone: (value: string) => /^[0-9]{10,11}$/.test(value),
    email: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  },
};
