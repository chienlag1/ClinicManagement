import mongoose, { Schema } from 'mongoose';

// Define interface for medicine item in prescription
interface MedicineItem {
  medicine: mongoose.Types.ObjectId;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

// Define interface for prescription document
export interface IPrescription {
  _id?: string;
  id?: string;
  patient: mongoose.Types.ObjectId;
  doctor: mongoose.Types.ObjectId;
  diagnosis: string;
  medicines: MedicineItem[];
  notes: string;
  prescriptionDate: Date;
  status: 'active' | 'completed' | 'cancelled';
  appointment?: mongoose.Types.ObjectId;
}

// Create prescription schema
const prescriptionSchema = new Schema(
  {
    prescriptionCode: {
      type: String,
      unique: true,
      required: true,
    },
    patient: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    doctor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    diagnosis: {
      type: String,
      required: true,
    },
    medicines: [
      {
        medicine: {
          type: Schema.Types.ObjectId,
          ref: 'Medicine',
          required: true,
        },
        dosage: {
          type: String,
          required: true,
        },
        frequency: {
          type: String,
          required: true,
        },
        duration: {
          type: String,
          required: true,
        },
        instructions: {
          type: String,
          required: true,
        },
      },
    ],
    notes: {
      type: String,
      default: '',
    },
    prescriptionDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'cancelled'],
      default: 'pending',
    },
    paymentOrderCode: {
      type: Number,
    },
    appointment: {
      type: Schema.Types.ObjectId,
      ref: 'Appointment',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Prescription ||
  mongoose.model('Prescription', prescriptionSchema);
