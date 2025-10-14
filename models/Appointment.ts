// models/Appointment.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IAppointment extends Document {
  doctorId: string; // id của bác sĩ (từ Clerk)
  patientId: string; // id của patient
  time: Date;
  type: string;
  notes?: string;
}

const AppointmentSchema: Schema = new Schema(
  {
    doctorId: { type: String, required: true },
    patientId: { type: String, required: true },
    time: { type: Date, required: true },
    type: { type: String, required: true },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Appointment ||
  mongoose.model<IAppointment>('Appointment', AppointmentSchema);
