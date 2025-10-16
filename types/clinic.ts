export const CLINIC_STATUS = [
  {
    key: "available",
    label: "Có sẵn",
    color: "bg-green-100 text-green-600",
  },
  {
    key: "occupied",
    label: "Đang sử dụng",
    color: "bg-red-100 text-red-600",
  },
  {
    key: "maintenance",
    label: "Bảo trì",
    color: "bg-yellow-100 text-yellow-600",
  },
];

export interface Clinic {
  _id?: string; // Mongo ID
  clinic_id: string;
  clinic_code: string;
  status: string;
  capacity?: number;
  description?: string;
}
