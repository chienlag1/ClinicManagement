"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Icon } from "@iconify/react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
} from "@heroui/react";

interface Medicine {
  id: number;
  medicine_code: string;
  medicine_name: string;
  type: string;
  price: number;
  unit: string;
}

export default function MedicineManager() {
  const [medicines, setMedicines] = useState<Medicine[]>([
    {
      id: 1,
      medicine_code: "MED001",
      medicine_name: "Paracetamol 500mg",
      type: "Thuốc giảm đau",
      price: 15000,
      unit: "Viên",
    },
    {
      id: 2,
      medicine_code: "MED002",
      medicine_name: "Amoxicillin 250mg",
      type: "Kháng sinh",
      price: 25000,
      unit: "Viên",
    },
    {
      id: 3,
      medicine_code: "MED003",
      medicine_name: "Vitamin C 1000mg",
      type: "Vitamin",
      price: 8000,
      unit: "Viên",
    },
  ]);

  const [newMedicine, setNewMedicine] = useState<Omit<Medicine, "id">>({
    medicine_code: "",
    medicine_name: "",
    type: "",
    price: 0,
    unit: "",
  });

  const [isOpen, setIsOpen] = useState(false);

  const handleAddMedicine = () => {
    if (
      !newMedicine.medicine_code ||
      !newMedicine.medicine_name ||
      !newMedicine.type ||
      !newMedicine.unit
    ) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    const newItem: Medicine = {
      id: medicines.length + 1,
      ...newMedicine,
    };
    setMedicines([...medicines, newItem]);
    setNewMedicine({
      medicine_code: "",
      medicine_name: "",
      type: "",
      price: 0,
      unit: "",
    });
    setIsOpen(false);
  };

  const handleDelete = (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa thuốc này?")) {
      setMedicines(medicines.filter((m) => m.id !== id));
    }
  };

  // Gắn màu tag theo loại thuốc
  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "thuốc giảm đau":
        return "bg-blue-100 text-blue-600";
      case "kháng sinh":
        return "bg-green-100 text-green-600";
      case "vitamin":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="space-y-6">
      {/* Nút thêm thuốc */}
      <div className="flex justify-end">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Icon icon="lucide:plus-circle" className="w-5 h-5" />
          Thêm thuốc mới
        </button>
      </div>

      {/* Danh sách thuốc */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Danh sách thuốc</h3>
        </CardHeader>
        <CardBody>
          <table className="w-full border border-gray-200 text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="p-3 text-left">Mã thuốc</th>
                <th className="p-3 text-left">Tên thuốc</th>
                <th className="p-3 text-left">Loại thuốc</th>
                <th className="p-3 text-left">Giá</th>
                <th className="p-3 text-left">Đơn vị</th>
                <th className="p-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {medicines.map((med) => (
                <tr key={med.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{med.medicine_code}</td>
                  <td className="p-3">{med.medicine_name}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(
                        med.type
                      )}`}
                    >
                      {med.type}
                    </span>
                  </td>
                  <td className="p-3">{med.price.toLocaleString()} VND</td>
                  <td className="p-3">{med.unit}</td>
                  <td className="p-3 text-center flex justify-center gap-2">
                    <button className="text-blue-600 hover:text-blue-800">
                      <Icon icon="lucide:edit" className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(med.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Icon icon="lucide:trash-2" className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>

      {/* Modal thêm thuốc */}
      <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
        <ModalContent>
          <ModalHeader>Thêm thuốc mới</ModalHeader>
          <ModalBody>
            <Input
              label="Mã thuốc"
              value={newMedicine.medicine_code}
              onChange={(e) =>
                setNewMedicine({ ...newMedicine, medicine_code: e.target.value })
              }
            />
            <Input
              label="Tên thuốc"
              value={newMedicine.medicine_name}
              onChange={(e) =>
                setNewMedicine({ ...newMedicine, medicine_name: e.target.value })
              }
            />
            <Input
              label="Loại thuốc"
              value={newMedicine.type}
              onChange={(e) =>
                setNewMedicine({ ...newMedicine, type: e.target.value })
              }
            />
            <Input
              type="number"
              label="Giá"
              value={newMedicine.price.toString()}
              onChange={(e) =>
                setNewMedicine({
                  ...newMedicine,
                  price: Number(e.target.value),
                })
              }
            />
            <Input
              label="Đơn vị (Viên/Hộp/Chai)"
              value={newMedicine.unit}
              onChange={(e) =>
                setNewMedicine({ ...newMedicine, unit: e.target.value })
              }
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onClick={() => setIsOpen(false)}>
              Hủy
            </Button>
            <Button color="primary" onClick={handleAddMedicine}>
              Lưu
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
