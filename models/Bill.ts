import mongoose, { Schema, Document } from 'mongoose';

export interface IBill extends Document {
  billCode: string; // Mã hóa đơn (unique, auto generate)
  patient: mongoose.Types.ObjectId; // Ref to Patient
  prescription?: mongoose.Types.ObjectId; // Ref to Prescription (optional)
  appointment?: mongoose.Types.ObjectId; // Ref to Appointment (optional)

  // Thông tin hóa đơn
  description: string; // "Thanh toán đơn thuốc", "Phí khám", etc.
  totalAmount: number; // Tổng tiền

  // Thanh toán
  paymentStatus: 'pending' | 'paid' | 'cancelled';
  paymentDate?: Date; // Ngày thanh toán
  paymentOrderCode?: number; // Mã đơn hàng PayOS (nếu thanh toán online)

  // Ghi chú
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BillSchema: Schema = new Schema(
  {
    billCode: {
      type: String,
      required: true,
      unique: true,
      default: () =>
        'BILL' +
        Date.now().toString(36).toUpperCase() +
        Math.random().toString(36).substring(2, 6).toUpperCase(),
    },
    patient: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    prescription: {
      type: Schema.Types.ObjectId,
      ref: 'Prescription',
    },
    appointment: {
      type: Schema.Types.ObjectId,
      ref: 'Appointment',
    },
    description: {
      type: String,
      required: true,
      default: 'Thanh toán đơn thuốc',
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'cancelled'],
      default: 'pending',
    },
    paymentDate: {
      type: Date,
    },
    paymentOrderCode: {
      type: Number,
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

// Indexes
BillSchema.index({ patient: 1 });
BillSchema.index({ paymentStatus: 1 });
BillSchema.index({ createdAt: -1 });
BillSchema.index({ billCode: 1 });

export default mongoose.models.Bill ||
  mongoose.model<IBill>('Bill', BillSchema);
