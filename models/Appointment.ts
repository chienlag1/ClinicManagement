import mongoose, { Schema, Document } from 'mongoose';

export interface IAppointment extends Document {
  patient_id: mongoose.Schema.Types.ObjectId;
  clinic_id: mongoose.Schema.Types.ObjectId;
  doctor_id: mongoose.Schema.Types.ObjectId;
  priority: boolean;
  symptoms: string;
  note: string;
  createdAt: Date;
}

const appointmentSchema: Schema = new Schema(
  {
    patient_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    clinic_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Clinic',
      required: true,
    },
    doctor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    priority: {
      type: Boolean,
      default: false,
    },
    symptoms: { type: String },
    note: { type: String },
  },
  { timestamps: true }
);

export const Appointment = mongoose.models.Appointment || mongoose.model<IAppointment>('Appointment', appointmentSchema);