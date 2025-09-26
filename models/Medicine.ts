import mongoose, { Schema, Document } from "mongoose";

export interface IMedicine extends Document {
  medicine_code: string;
  medicine_name: string;
  type: string;
  price: number;
  unit: string;
}

const MedicineSchema: Schema = new Schema(
  {
    medicine_code: { type: String, required: true, unique: true },
    medicine_name: { type: String, required: true },
    type: { type: String, required: true },
    price: { type: Number, required: true },
    unit: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Medicine ||
  mongoose.model<IMedicine>("Medicine", MedicineSchema);
