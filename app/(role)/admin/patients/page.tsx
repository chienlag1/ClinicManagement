"use client";

import React, { useState, useEffect } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Icon } from "@iconify/react";
import { Pagination, usePagination } from "@/components/pagination";
import { useNotification, NotificationModal } from "@/components/notification-popup";

// Mock data
const mockPatients = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  name: `Bệnh nhân ${i + 1}`,
  email: `patient${i + 1}@example.com`,
  phone: `0${Math.floor(Math.random() * 900000000) + 100000000}`,
  age: Math.floor(Math.random() * 60) + 18,
  gender: i % 2 === 0 ? "Nam" : "Nữ",
  status: i % 4 === 0 ? "active" : i % 4 === 1 ? "inactive" : i % 4 === 2 ? "pending" : "blocked",
  createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
}));

export default function PatientsPage() {
  const [patients, setPatients] = useState(mockPatients);
  const [filteredPatients, setFilteredPatients] = useState(mockPatients);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [modalType, setModalType] = useState<"delete" | "edit" | "view">("view");

  const {
    currentPage,
    itemsPerPage,
    handlePageChange,
    handleItemsPerPageChange,
  } = usePagination(1, 10);

  const {
    showSuccess,
    showError,
    showConfirm,
  } = useNotification();

  // Filter patients
  useEffect(() => {
    let filtered = patients;

    if (searchTerm) {
      filtered = filtered.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone.includes(searchTerm)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(patient => patient.status === statusFilter);
    }

    setFilteredPatients(filtered);
    handlePageChange(1); // Reset to first page when filtering
  }, [searchTerm, statusFilter, patients]);

  // Pagination logic
  const totalItems = filteredPatients.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPatients = filteredPatients.slice(startIndex, endIndex);

  const handleDelete = (patient: any) => {
    setSelectedPatient(patient);
    setModalType("delete");
    setShowModal(true);
  };

  const handleEdit = (patient: any) => {
    setSelectedPatient(patient);
    setModalType("edit");
    setShowModal(true);
  };

  const handleView = (patient: any) => {
    setSelectedPatient(patient);
    setModalType("view");
    setShowModal(true);
  };

  const confirmDelete = () => {
    if (selectedPatient) {
      setPatients(patients.filter(p => p.id !== selectedPatient.id));
      setFilteredPatients(filteredPatients.filter(p => p.id !== selectedPatient.id));
      showSuccess("Thành công!", "Bệnh nhân đã được xóa thành công.");
      setShowModal(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "blocked":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Hoạt động";
      case "inactive":
        return "Không hoạt động";
      case "pending":
        return "Chờ duyệt";
      case "blocked":
        return "Bị khóa";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Quản lý Bệnh nhân</h1>
        <p className="text-gray-600 mt-2">
          Quản lý thông tin bệnh nhân trong hệ thống
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Tìm kiếm bệnh nhân..."
              value={searchTerm}
              onValueChange={setSearchTerm}
              startContent={<Icon icon="lucide:search" className="w-4 h-4 text-gray-400" />}
            />
            <Select
              placeholder="Lọc theo trạng thái"
              selectedKeys={[statusFilter]}
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0] as string;
                setStatusFilter(value);
              }}
            >
              <SelectItem key="all">Tất cả</SelectItem>
              <SelectItem key="active">Hoạt động</SelectItem>
              <SelectItem key="inactive">Không hoạt động</SelectItem>
              <SelectItem key="pending">Chờ duyệt</SelectItem>
              <SelectItem key="blocked">Bị khóa</SelectItem>
            </Select>
            <Button color="primary" startContent={<Icon icon="lucide:plus" className="w-4 h-4" />}>
              Thêm bệnh nhân
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Patients Table */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Danh sách Bệnh nhân</h2>
        </CardHeader>
        <CardBody>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">ID</th>
                  <th className="text-left py-3 px-4">Tên</th>
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-left py-3 px-4">Số điện thoại</th>
                  <th className="text-left py-3 px-4">Tuổi</th>
                  <th className="text-left py-3 px-4">Giới tính</th>
                  <th className="text-left py-3 px-4">Trạng thái</th>
                  <th className="text-left py-3 px-4">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {currentPatients.map((patient) => (
                  <tr key={patient.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{patient.id}</td>
                    <td className="py-3 px-4 font-medium">{patient.name}</td>
                    <td className="py-3 px-4">{patient.email}</td>
                    <td className="py-3 px-4">{patient.phone}</td>
                    <td className="py-3 px-4">{patient.age}</td>
                    <td className="py-3 px-4">{patient.gender}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}
                      >
                        {getStatusText(patient.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="light"
                          isIconOnly
                          onPress={() => handleView(patient)}
                        >
                          <Icon icon="lucide:eye" className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="light"
                          color="primary"
                          isIconOnly
                          onPress={() => handleEdit(patient)}
                        >
                          <Icon icon="lucide:edit" className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="light"
                          color="danger"
                          isIconOnly
                          onPress={() => handleDelete(patient)}
                        >
                          <Icon icon="lucide:trash-2" className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {currentPatients.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Icon icon="lucide:users" className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Không tìm thấy bệnh nhân nào</p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Pagination */}
      <Pagination
        totalItems={totalItems}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
        itemsPerPageOptions={[5, 10, 20, 50]}
        showTotal={true}
        showItemsPerPage={true}
        showQuickJump={true}
        showFirstLast={true}
        size="md"
        color="primary"
      />

      {/* Modal */}
      <NotificationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        type={modalType === "delete" ? "error" : "info"}
        title={
          modalType === "delete" ? "Xác nhận xóa bệnh nhân" :
          modalType === "edit" ? "Chỉnh sửa bệnh nhân" :
          "Thông tin bệnh nhân"
        }
        message={
          modalType === "delete" ? `Bạn có chắc chắn muốn xóa bệnh nhân "${selectedPatient?.name}" không? Hành động này không thể hoàn tác.` :
          modalType === "edit" ? `Chỉnh sửa thông tin bệnh nhân "${selectedPatient?.name}"` :
          `Thông tin chi tiết của bệnh nhân "${selectedPatient?.name}"`
        }
        onConfirm={modalType === "delete" ? confirmDelete : () => setShowModal(false)}
        onCancel={() => setShowModal(false)}
        confirmText={modalType === "delete" ? "Xóa" : "Đóng"}
        cancelText="Hủy"
        showCancel={modalType === "delete"}
      />
    </div>
  );
}
