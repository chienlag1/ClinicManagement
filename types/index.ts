import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};
export const MEDICINE_TYPES = [
  {
    key: "kháng sinh",
    label: "Kháng sinh",
    color: "bg-green-100 text-green-600",
  },
  { key: "an thần", label: "An thần", color: "bg-purple-100 text-purple-600" },
  { key: "vitamin", label: "Vitamin", color: "bg-yellow-100 text-yellow-700" },
  {
    key: "thuốc giảm đau",
    label: "Thuốc giảm đau",
    color: "bg-blue-100 text-blue-600",
  },
];

export const MEDICINE_UNITS = [
  { key: "viên", label: "Viên" },
  { key: "hộp", label: "Hộp" },
  { key: "chai", label: "Chai" },
  { key: "ống", label: "Ống" },
];
