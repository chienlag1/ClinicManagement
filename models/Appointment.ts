import mongoose, { Schema, Document } from 'mongoose';

export interface IAppointment extends Document {
  appointment_id: string;
  patient_id: mongoose.Types.ObjectId;
  clinic_id: mongoose.Types.ObjectId;
  doctor_id: mongoose.Types.ObjectId;
  appointment_date: Date;
  appointment_time: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  priority: boolean;
  symptoms: string;
  notes: string;
  created_by: string; // Staff ID who created the appointment
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema: Schema = new Schema(
  {
    appointment_id: {
      type: String,
      required: true,
      unique: true,
      default: () =>
        'APT' + Math.random().toString(36).substring(2, 8).toUpperCase(),
    },
    patient_id: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    clinic_id: {
      type: Schema.Types.Mixed,
      required: true,
    },
    doctor_id: {
      type: Schema.Types.Mixed,
      required: true,
    },
    appointment_date: {
      type: Date,
      required: true,
    },
    appointment_time: {
      type: String,
      required: true,
      enum: [
        '08:00',
        '08:30',
        '09:00',
        '09:30',
        '10:00',
        '10:30',
        '11:00',
        '11:30',
        '14:00',
        '14:30',
        '15:00',
        '15:30',
        '16:00',
        '16:30',
        '17:00',
        '17:30',
      ],
    },
    status: {
      type: String,
      required: true,
      enum: ['scheduled', 'confirmed', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    priority: {
      type: Boolean,
      default: false,
    },
    symptoms: {
      type: String,
      required: true,
      maxLength: 1000,
    },
    notes: {
      type: String,
      maxLength: 1000,
    },
    created_by: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Index để tối ưu hóa truy vấn
AppointmentSchema.index({ appointment_date: 1, appointment_time: 1 });
AppointmentSchema.index({ patient_id: 1 });
AppointmentSchema.index({ doctor_id: 1 });
AppointmentSchema.index({ clinic_id: 1 });

export default mongoose.models.Appointment ||
  mongoose.model<IAppointment>('Appointment', AppointmentSchema);
