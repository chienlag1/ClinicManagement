"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Icon } from "@iconify/react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import axios from "axios";

interface Medicine {
  _id?: string; // Mongo ID
  medicine_code: string;
  medicine_name: string;
  type: string;
  price: number;
  unit: string;
}

export default function MedicineManager() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [newMedicine, setNewMedicine] = useState<Medicine>({
    medicine_code: "",
    medicine_name: "",
    type: "",
    price: 0,
    unit: "",
  });
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null); // ✅ track editing


  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      const res = await axios.get("/api/medicines");
      setMedicines(res.data);
    } catch (error) {
      console.error("Failed to fetch medicines", error);
    }
  };


  const handleSaveMedicine = async () => {
    if (
      !newMedicine.medicine_code ||
      !newMedicine.medicine_name ||
      !newMedicine.type ||
      !newMedicine.unit
    ) {
      alert("Please fill all fields!");
      return;
    }

    try {
      if (editingId) {
        const res = await axios.put(`/api/medicines/${editingId}`, newMedicine);
        setMedicines(
          medicines.map((m) => (m._id === editingId ? res.data : m))
        );
      } else {
        const res = await axios.post("/api/medicines", newMedicine);
        setMedicines([...medicines, res.data]);
      }

      setNewMedicine({
        medicine_code: "",
        medicine_name: "",
        type: "",
        price: 0,
        unit: "",
      });
      setEditingId(null);
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to save medicine", error);
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (confirm("Are you sure you want to delete this medicine?")) {
      try {
        await axios.delete(`/api/medicines/${id}`);
        setMedicines(medicines.filter((m) => m._id !== id));
      } catch (error) {
        console.error("Failed to delete medicine", error);
      }
    }
  };


  const handleEdit = (med: Medicine) => {
    setNewMedicine(med);
    setEditingId(med._id || null);
    setIsOpen(true);
  };


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
      <div className="flex justify-end">
        <button
          onClick={() => {
            setEditingId(null);
            setNewMedicine({
              medicine_code: "",
              medicine_name: "",
              type: "",
              price: 0,
              unit: "",
            });
            setIsOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Icon icon="lucide:plus-circle" className="w-5 h-5" />
          Add Medicine
        </button>
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Medicine List</h3>
        </CardHeader>
        <CardBody>
          <table className="w-full border border-gray-200 text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="p-3 text-left">Code</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Price</th>
                <th className="p-3 text-left">Unit</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {medicines.map((med) => (
                <tr key={med._id} className="border-t hover:bg-gray-50">
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
                    <button
                      onClick={() => handleEdit(med)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Icon icon="lucide:edit" className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(med._id)}
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

      <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
        <ModalContent>
          <ModalHeader>
            {editingId ? "Edit Medicine" : "Add New Medicine"}
          </ModalHeader>
          <ModalBody>
            <Input
              label="Code"
              value={newMedicine.medicine_code}
              onChange={(e) =>
                setNewMedicine({ ...newMedicine, medicine_code: e.target.value })
              }
            />
            <Input
              label="Name"
              value={newMedicine.medicine_name}
              onChange={(e) =>
                setNewMedicine({ ...newMedicine, medicine_name: e.target.value })
              }
            />
            <Input
              label="Type"
              value={newMedicine.type}
              onChange={(e) =>
                setNewMedicine({ ...newMedicine, type: e.target.value })
              }
            />
            <Input
              type="number"
              label="Price"
              value={newMedicine.price.toString()}
              onChange={(e) =>
                setNewMedicine({
                  ...newMedicine,
                  price: Number(e.target.value),
                })
              }
            />
            <Input
              label="Unit (Viên/Hộp/Chai)"
              value={newMedicine.unit}
              onChange={(e) =>
                setNewMedicine({ ...newMedicine, unit: e.target.value })
              }
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button color="primary" onClick={handleSaveMedicine}>
              {editingId ? "Update" : "Save"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
