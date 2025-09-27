export const MEDICINE_TYPES = [
  {
    key: 'antibiotic',
    label: 'Kháng sinh',
    color: 'bg-green-100 text-green-600',
  },
  {
    key: 'sedative',
    label: 'An thần',
    color: 'bg-purple-100 text-purple-600',
  },
  { key: 'vitamin', label: 'Vitamin', color: 'bg-yellow-100 text-yellow-700' },
  {
    key: 'painkiller',
    label: 'Thuốc giảm đau',
    color: 'bg-blue-100 text-blue-600',
  },
];

export const MEDICINE_UNITS = [
  { key: 'tablet', label: 'Viên' },
  { key: 'box', label: 'Hộp' },
  { key: 'bottle', label: 'Chai' },
  { key: 'vial', label: 'Ống' },
];

export interface Medicine {
  _id?: string; // Mongo ID
  medicine_code: string;
  medicine_name: string;
  type: string;
  price: number;
  unit: string;
}
