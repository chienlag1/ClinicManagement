import mongoose, { Schema, Document } from 'mongoose';

export interface IPatient extends Document {
  name: string;
  gender: 'male' | 'female';
  birth_date: Date;
  phone: string;
  address: string;
}

const PatientSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    gender: { type: String, required: true, enum: ['male', 'female'] },
    birth_date: { type: Date, required: true },
    phone: { type: String, required: true, unique: true, trim: true },
    address: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export default mongoose.models.Patient ||
  mongoose.model<IPatient>('Patient', PatientSchema);
