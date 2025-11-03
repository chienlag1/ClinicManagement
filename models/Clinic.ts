import mongoose, { Schema, Document } from 'mongoose';

export interface IClinic extends Document {
  clinic_id: string;
  clinic_code: string;
  status: string;
  capacity?: number;
  description?: string;
}

const ClinicSchema: Schema = new Schema(
  {
    clinic_id: { type: String, required: true, unique: true },
    clinic_code: { type: String, required: true, unique: true },
    status: { type: String, required: true },
    capacity: { type: Number, min: 1, max: 50 },
    description: { type: String, maxLength: 500 },
  },
  { timestamps: true }
);

export default mongoose.models.Clinic ||
  mongoose.model<IClinic>('Clinic', ClinicSchema);
