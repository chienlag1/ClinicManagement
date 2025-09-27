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
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import axios from "axios";
import { Medicine, MEDICINE_TYPES, MEDICINE_UNITS } from "@/types/medicine";
import { Pagination, usePagination } from "@/components/pagination";
import {
  useNotification,
  NotificationModal,
} from "@/components/notification-popup";

export default function MedicineManager() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [filteredMedicines, setFilteredMedicines] = useState<Medicine[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [newMedicine, setNewMedicine] = useState<Medicine>({
    medicine_code: "",
    medicine_name: "",
    type: "",
    price: 0,
    unit: "",
  });
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);

  const {
    currentPage,
    itemsPerPage,
    handlePageChange,
    handleItemsPerPageChange,
  } = usePagination(1, 10);

  const { showSuccess, showError, showWarning } = useNotification();

  useEffect(() => {
    fetchMedicines();
  }, []);

  // Filter medicines
  useEffect(() => {
    let filtered = medicines;

    if (searchTerm) {
      filtered = filtered.filter(
        (medicine) =>
          medicine.medicine_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          medicine.medicine_code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((medicine) => medicine.type === typeFilter);
    }

    setFilteredMedicines(filtered);
    handlePageChange(1); // Reset to first page when filtering
  }, [searchTerm, typeFilter, medicines]);

  const fetchMedicines = async () => {
    try {
      const res = await axios.get("/api/medicines");
      setMedicines(res.data);
    } catch (error) {
      console.error("Failed to fetch medicines", error);
      showError("Lỗi", "Không thể tải danh sách thuốc. Vui lòng thử lại.");
    }
  };

  const handleSaveMedicine = async () => {
    if (
      !newMedicine.medicine_code ||
      !newMedicine.medicine_name ||
      !newMedicine.type ||
      !newMedicine.unit
    ) {
      showError("Lỗi", "Vui lòng điền đầy đủ thông tin!");
      return;
    }

    try {
      if (editingId) {
        const res = await axios.put(`/api/medicines/${editingId}`, newMedicine);
        setMedicines(
          medicines.map((m) => (m._id === editingId ? res.data : m))
        );
        showSuccess("Thành công", "Cập nhật thuốc thành công!");
      } else {
        const res = await axios.post("/api/medicines", newMedicine);
        setMedicines([...medicines, res.data]);
        showSuccess("Thành công", "Thêm thuốc mới thành công!");
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
      showError("Lỗi", "Không thể lưu thuốc. Vui lòng thử lại.");
    }
  };

  const handleDelete = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedMedicine?._id) return;

    try {
      await axios.delete(`/api/medicines/${selectedMedicine._id}`);
      setMedicines(medicines.filter((m) => m._id !== selectedMedicine._id));
      showSuccess("Thành công", "Xóa thuốc thành công!");
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Failed to delete medicine", error);
      showError("Lỗi", "Không thể xóa thuốc. Vui lòng thử lại.");
    }
  };

  const handleEdit = (med: Medicine) => {
    setNewMedicine(med);
    setEditingId(med._id || null);
    setIsOpen(true);
  };

  const getTypeColor = (type: string) => {
    const found = MEDICINE_TYPES.find((t) => t.key === type.toLowerCase());
    return found ? found.color : "bg-gray-100 text-gray-600";
  };

  const getTypeLabel = (type: string) => {
    const found = MEDICINE_TYPES.find((t) => t.key === type.toLowerCase());
    return found ? found.label : type;
  };

  // Pagination logic
  const totalItems = filteredMedicines.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMedicines = filteredMedicines.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Quản lý Thuốc</h1>
        <p className="text-gray-600 mt-2">
          Quản lý thông tin thuốc trong hệ thống
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Tìm kiếm thuốc..."
              startContent={
                <Icon className="w-4 h-4 text-gray-400" icon="lucide:search" />
              }
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <Select
              placeholder="Lọc theo loại thuốc"
              selectedKeys={[typeFilter]}
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0] as string;
                setTypeFilter(value);
              }}
            >
              <SelectItem key="all">Tất cả</SelectItem>
              {MEDICINE_TYPES.map((type) => (
                <SelectItem key={type.key}>{type.label}</SelectItem>
              )) as any}
            </Select>
            <Button
              color="primary"
              startContent={<Icon className="w-4 h-4" icon="lucide:plus" />}
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
            >
              Thêm thuốc
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Medicines Table */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Danh sách Thuốc</h2>
        </CardHeader>
        <CardBody>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Mã thuốc</th>
                  <th className="text-left py-3 px-4">Tên thuốc</th>
                  <th className="text-left py-3 px-4">Loại</th>
                  <th className="text-left py-3 px-4">Giá</th>
                  <th className="text-left py-3 px-4">Đơn vị</th>
                  <th className="text-left py-3 px-4">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {currentMedicines.map((med) => (
                  <tr key={med._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{med.medicine_code}</td>
                    <td className="py-3 px-4">{med.medicine_name}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(
                          med.type
                        )}`}
                      >
                        {getTypeLabel(med.type)}
                      </span>
                    </td>
                    <td className="py-3 px-4">{med.price.toLocaleString()} VND</td>
                    <td className="py-3 px-4">{med.unit}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button
                          isIconOnly
                          size="sm"
                          color="primary"
                          variant="light"
                          onPress={() => handleEdit(med)}
                        >
                          <Icon className="w-4 h-4" icon="lucide:edit" />
                        </Button>
                        <Button
                          isIconOnly
                          size="sm"
                          color="danger"
                          variant="light"
                          onPress={() => handleDelete(med)}
                        >
                          <Icon className="w-4 h-4" icon="lucide:trash-2" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {currentMedicines.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Icon
                className="w-12 h-12 mx-auto mb-4 text-gray-300"
                icon="lucide:pill"
              />
              <p>Không tìm thấy thuốc nào</p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Pagination */}
      <Pagination
        color="primary"
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        itemsPerPageOptions={[5, 10, 20, 50]}
        showFirstLast={true}
        showItemsPerPage={true}
        showQuickJump={true}
        showTotal={true}
        size="md"
        totalItems={totalItems}
        onItemsPerPageChange={handleItemsPerPageChange}
        onPageChange={handlePageChange}
      />

      {/* Add/Edit Modal */}
      <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
        <ModalContent>
          <ModalHeader>
            {editingId ? "Chỉnh sửa Thuốc" : "Thêm Thuốc Mới"}
          </ModalHeader>
          <ModalBody>
            <Input
              label="Mã thuốc"
              placeholder="Nhập mã thuốc"
              value={newMedicine.medicine_code}
              onValueChange={(value) =>
                setNewMedicine({
                  ...newMedicine,
                  medicine_code: value,
                })
              }
            />
            <Input
              label="Tên thuốc"
              placeholder="Nhập tên thuốc"
              value={newMedicine.medicine_name}
              onValueChange={(value) =>
                setNewMedicine({
                  ...newMedicine,
                  medicine_name: value,
                })
              }
            />

            <Select
              label="Loại thuốc"
              placeholder="Chọn loại thuốc"
              selectedKeys={[newMedicine.type]}
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0] as string;
                setNewMedicine({ ...newMedicine, type: value });
              }}
            >
              {MEDICINE_TYPES.map((t) => (
                <SelectItem key={t.key}>{t.label}</SelectItem>
              ))}
            </Select>

            <Input
              label="Giá (VND)"
              type="number"
              placeholder="Nhập giá thuốc"
              value={newMedicine.price.toString()}
              onValueChange={(value) =>
                setNewMedicine({
                  ...newMedicine,
                  price: Number(value) || 0,
                })
              }
            />

            <Select
              label="Đơn vị"
              placeholder="Chọn đơn vị"
              selectedKeys={[newMedicine.unit]}
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0] as string;
                setNewMedicine({ ...newMedicine, unit: value });
              }}
            >
              {MEDICINE_UNITS.map((u) => (
                <SelectItem key={u.key}>{u.label}</SelectItem>
              ))}
            </Select>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={() => setIsOpen(false)}>
              Hủy
            </Button>
            <Button color="primary" onPress={handleSaveMedicine}>
              {editingId ? "Cập nhật" : "Lưu"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <NotificationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        type="error"
        title="Xác nhận xóa thuốc"
        message={`Bạn có chắc chắn muốn xóa thuốc "${selectedMedicine?.medicine_name}" không? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        showCancel={true}
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
}
