import mongoose, { Schema, Document } from 'mongoose';

export interface IDoctor extends Document {
  doctor_id: string;
  name: string;
  specialty: string;
}

const DoctorSchema: Schema = new Schema(
  {
    doctor_id: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    specialty: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export default mongoose.models.Doctor || mongoose.model<IDoctor>('Doctor', DoctorSchema);