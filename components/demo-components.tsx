"use client";

import React, { useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Pagination, usePagination } from "./pagination";
import { useNotification, NotificationModal } from "./notification-popup";

// Demo data
const mockData = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  name: `Item ${i + 1}`,
  description: `This is description for item ${i + 1}`,
  status: i % 3 === 0 ? "active" : i % 3 === 1 ? "inactive" : "pending",
}));

export function DemoComponents() {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"success" | "error" | "warning" | "info">("info");
  
  const {
    currentPage,
    itemsPerPage,
    handlePageChange,
    handleItemsPerPageChange,
  } = usePagination(1, 10);

  const {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    showConfirm,
  } = useNotification();

  // Pagination logic
  const totalItems = mockData.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = mockData.slice(startIndex, endIndex);

  const handleNotificationDemo = (type: "success" | "error" | "warning" | "info") => {
    switch (type) {
      case "success":
        showSuccess("Thành công!", "Dữ liệu đã được lưu thành công.");
        break;
      case "error":
        showError("Lỗi!", "Đã xảy ra lỗi khi xử lý dữ liệu.");
        break;
      case "warning":
        showWarning("Cảnh báo!", "Dữ liệu có thể không chính xác.");
        break;
      case "info":
        showInfo("Thông tin", "Đây là thông báo thông tin.");
        break;
    }
  };

  const handleLoadingDemo = () => {
    const id = showLoading("Đang xử lý...", "Vui lòng chờ trong giây lát.");
    
    // Simulate async operation
    setTimeout(() => {
      showSuccess("Hoàn thành!", "Dữ liệu đã được xử lý thành công.");
    }, 3000);
  };

  const handleConfirmDemo = () => {
    showConfirm(
      "Xác nhận xóa",
      "Bạn có chắc chắn muốn xóa dữ liệu này không? Hành động này không thể hoàn tác.",
      () => {
        showSuccess("Đã xóa!", "Dữ liệu đã được xóa thành công.");
      },
      () => {
        showInfo("Đã hủy", "Hành động đã được hủy.");
      }
    );
  };

  const handleModalDemo = (type: "success" | "error" | "warning" | "info") => {
    setModalType(type);
    setShowModal(true);
  };

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-3xl font-bold">Demo Common Components</h1>

      {/* Pagination Demo */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Pagination Component Demo</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="text-sm text-gray-600">
            Hiển thị {startIndex + 1}-{Math.min(endIndex, totalItems)} trong tổng số {totalItems} items
          </div>
          
          {/* Data table */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">ID</th>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Description</th>
                  <th className="px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {currentData.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="px-4 py-2">{item.id}</td>
                    <td className="px-4 py-2">{item.name}</td>
                    <td className="px-4 py-2">{item.description}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          item.status === "active"
                            ? "bg-green-100 text-green-800"
                            : item.status === "inactive"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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
        </CardBody>
      </Card>

      {/* Notification Demo */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Notification Component Demo</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              color="success"
              onPress={() => handleNotificationDemo("success")}
            >
              Success Notification
            </Button>
            <Button
              color="danger"
              onPress={() => handleNotificationDemo("error")}
            >
              Error Notification
            </Button>
            <Button
              color="warning"
              onPress={() => handleNotificationDemo("warning")}
            >
              Warning Notification
            </Button>
            <Button
              color="primary"
              onPress={() => handleNotificationDemo("info")}
            >
              Info Notification
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              color="secondary"
              onPress={handleLoadingDemo}
            >
              Loading Notification
            </Button>
            <Button
              color="danger"
              variant="bordered"
              onPress={handleConfirmDemo}
            >
              Confirm Dialog
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Modal Demo */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Modal Component Demo</h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              color="success"
              onPress={() => handleModalDemo("success")}
            >
              Success Modal
            </Button>
            <Button
              color="danger"
              onPress={() => handleModalDemo("error")}
            >
              Error Modal
            </Button>
            <Button
              color="warning"
              onPress={() => handleModalDemo("warning")}
            >
              Warning Modal
            </Button>
            <Button
              color="primary"
              onPress={() => handleModalDemo("info")}
            >
              Info Modal
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Modal Component */}
      <NotificationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        type={modalType}
        title={
          modalType === "success" ? "Thành công!" :
          modalType === "error" ? "Lỗi!" :
          modalType === "warning" ? "Cảnh báo!" :
          "Thông tin"
        }
        message={
          modalType === "success" ? "Dữ liệu đã được lưu thành công." :
          modalType === "error" ? "Đã xảy ra lỗi khi xử lý dữ liệu." :
          modalType === "warning" ? "Dữ liệu có thể không chính xác." :
          "Đây là thông báo thông tin."
        }
        onConfirm={() => {
          setShowModal(false);
          showSuccess("Đã xác nhận!", "Bạn đã xác nhận thông báo.");
        }}
        onCancel={() => {
          setShowModal(false);
          showInfo("Đã hủy", "Bạn đã hủy thông báo.");
        }}
        confirmText="Xác nhận"
        cancelText="Hủy"
        showCancel={true}
      />
    </div>
  );
}
