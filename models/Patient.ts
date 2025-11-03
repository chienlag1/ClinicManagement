import mongoose, { Schema, Document } from 'mongoose';

export interface IPatient extends Document {
  patient_id: string;
  id_card: string;
  name: string;
  gender: 'male' | 'female';
  birth_date: Date;
  phone: string;
  address: string;
  medical_history: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const PatientSchema: Schema = new Schema(
  {
    patient_id: {
      type: String,
      required: true,
      unique: true,
      default: () =>
        'PT' + Math.random().toString(36).substring(2, 8).toUpperCase(),
    },
    id_card: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    gender: { type: String, required: true, enum: ['male', 'female'] },
    birth_date: { type: Date, required: true },
    phone: { type: String, required: true, unique: true, trim: true },
    address: { type: String, required: true, trim: true },
    medical_history: [{ type: Schema.Types.ObjectId, ref: 'Diagnosis' }],
  },
  { timestamps: true }
);

export default mongoose.models.Patient ||
  mongoose.model<IPatient>('Patient', PatientSchema);
