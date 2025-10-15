"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Icon } from "@iconify/react";
import { Tabs, Tab } from "@heroui/tabs";

import { Pagination, usePagination } from "@/components/pagination";
import {
  useNotification,
  NotificationModal,
} from "@/components/notification-popup";
import {
  CRUDTemplate,
  CRUDModal,
  useCRUD,
  crudUtils,
  CRUDColumn,
  CRUDField,
} from "@/components/crud-template";

// Mock data types
interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive" | "pending";
  createdAt: string;
}

interface DemoProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: "available" | "out_of_stock" | "discontinued";
}

// Mock data
const mockUsers: DemoUser[] = Array.from({ length: 25 }, (_, i) => ({
  id: `user-${i + 1}`,
  name: `Người dùng ${i + 1}`,
  email: `user${i + 1}@example.com`,
  role: i % 3 === 0 ? "admin" : i % 3 === 1 ? "doctor" : "staff",
  status: i % 4 === 0 ? "active" : i % 4 === 1 ? "inactive" : "pending",
  createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
}));

const mockProducts: DemoProduct[] = Array.from({ length: 30 }, (_, i) => ({
  id: `product-${i + 1}`,
  name: `Sản phẩm ${i + 1}`,
  category: i % 4 === 0 ? "thuốc" : i % 4 === 1 ? "dụng cụ" : i % 4 === 2 ? "vật tư" : "khác",
  price: Math.floor(Math.random() * 1000000) + 10000,
  stock: Math.floor(Math.random() * 100),
  status: i % 3 === 0 ? "available" : i % 3 === 1 ? "out_of_stock" : "discontinued",
}));

const roleOptions = [
  { key: "admin", label: "Quản trị viên" },
  { key: "doctor", label: "Bác sĩ" },
  { key: "staff", label: "Nhân viên" },
];

const statusOptions = [
  { key: "active", label: "Hoạt động" },
  { key: "inactive", label: "Không hoạt động" },
  { key: "pending", label: "Chờ duyệt" },
];

const categoryOptions = [
  { key: "thuốc", label: "Thuốc" },
  { key: "dụng cụ", label: "Dụng cụ" },
  { key: "vật tư", label: "Vật tư" },
  { key: "khác", label: "Khác" },
];

const productStatusOptions = [
  { key: "available", label: "Có sẵn" },
  { key: "out_of_stock", label: "Hết hàng" },
  { key: "discontinued", label: "Ngừng bán" },
];

export default function DemoPage() {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"success" | "error" | "warning" | "info" | "loading">("success");
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  // Pagination demo
  const {
    currentPage: paginationPage,
    itemsPerPage: paginationItemsPerPage,
    handlePageChange: handlePaginationPageChange,
    handleItemsPerPageChange: handlePaginationItemsPerPageChange,
  } = usePagination(1, 5);

  // CRUD demo for users
  const {
    data: users,
    filteredData: filteredUsers,
    setFilteredData: setFilteredUsers,
    searchTerm: userSearchTerm,
    setSearchTerm: setUserSearchTerm,
    filterValue: userFilterValue,
    setFilterValue: setUserFilterValue,
    isModalOpen: isUserModalOpen,
    setIsModalOpen: setIsUserModalOpen,
    editingItem: editingUser,
    showDeleteModal: showUserDeleteModal,
    setShowDeleteModal: setShowUserDeleteModal,
    deletingItem: deletingUser,
    handleAdd: handleAddUser,
    handleEdit: handleEditUser,
    handleDelete: handleDeleteUser,
    handleSave: handleSaveUser,
    confirmDelete: confirmDeleteUser,
    showSuccess,
    showError,
  } = useCRUD<DemoUser>(mockUsers);

  // CRUD demo for products
  const {
    data: products,
    filteredData: filteredProducts,
    setFilteredData: setFilteredProducts,
    searchTerm: productSearchTerm,
    setSearchTerm: setProductSearchTerm,
    filterValue: productFilterValue,
    setFilterValue: setProductFilterValue,
    isModalOpen: isProductModalOpen,
    setIsModalOpen: setIsProductModalOpen,
    editingItem: editingProduct,
    showDeleteModal: showProductDeleteModal,
    setShowDeleteModal: setShowProductDeleteModal,
    deletingItem: deletingProduct,
    handleAdd: handleAddProduct,
    handleEdit: handleEditProduct,
    handleDelete: handleDeleteProduct,
    handleSave: handleSaveProduct,
    confirmDelete: confirmDeleteProduct,
  } = useCRUD<DemoProduct>(mockProducts);

  // Update filtered data when data changes
  useEffect(() => {
    setFilteredUsers(users);
  }, [users, setFilteredUsers]);

  useEffect(() => {
    setFilteredProducts(products);
  }, [products, setFilteredProducts]);

  // Filter users
  useEffect(() => {
    const filtered = crudUtils.filterData(
      users,
      userSearchTerm,
      userFilterValue,
      ["name", "email"],
      "role"
    );
    setFilteredUsers(filtered);
  }, [userSearchTerm, userFilterValue, users, setFilteredUsers]);

  // Filter products
  useEffect(() => {
    const filtered = crudUtils.filterData(
      products,
      productSearchTerm,
      productFilterValue,
      ["name"],
      "category"
    );
    setFilteredProducts(filtered);
  }, [productSearchTerm, productFilterValue, products, setFilteredProducts]);

  // User columns
  const userColumns: CRUDColumn<DemoUser>[] = [
    { key: "name", label: "Tên", render: (value) => <span className="font-medium">{value}</span> },
    { key: "email", label: "Email" },
    { 
      key: "role", 
      label: "Vai trò",
      render: (value) => {
        const roleInfo = roleOptions.find(r => r.key === value);
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            {roleInfo?.label || value}
          </span>
        );
      }
    },
    { 
      key: "status", 
      label: "Trạng thái",
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${crudUtils.getStatusColor(value)}`}>
          {statusOptions.find(s => s.key === value)?.label || value}
        </span>
      )
    },
    { key: "createdAt", label: "Ngày tạo", render: (value) => crudUtils.formatDate(value) },
  ];

  // User fields
  const userFields: CRUDField<DemoUser>[] = [
    { key: "name", label: "Tên", type: "text", placeholder: "Nhập tên", required: true },
    { key: "email", label: "Email", type: "email", placeholder: "Nhập email", required: true },
    { key: "role", label: "Vai trò", type: "select", options: roleOptions, required: true },
    { key: "status", label: "Trạng thái", type: "select", options: statusOptions, required: true },
  ];

  // Product columns
  const productColumns: CRUDColumn<DemoProduct>[] = [
    { key: "name", label: "Tên sản phẩm", render: (value) => <span className="font-medium">{value}</span> },
    { 
      key: "category", 
      label: "Danh mục",
      render: (value) => (
        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
          {categoryOptions.find(c => c.key === value)?.label || value}
        </span>
      )
    },
    { key: "price", label: "Giá", render: (value) => crudUtils.formatCurrency(value) },
    { key: "stock", label: "Tồn kho", render: (value) => `${value} sản phẩm` },
    { 
      key: "status", 
      label: "Trạng thái",
      render: (value) => {
        const statusInfo = productStatusOptions.find(s => s.key === value);
        const colorClass = value === "available" ? "bg-green-100 text-green-800" : 
                          value === "out_of_stock" ? "bg-red-100 text-red-800" : 
                          "bg-gray-100 text-gray-800";
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
            {statusInfo?.label || value}
          </span>
        );
      }
    },
  ];

  // Product fields
  const productFields: CRUDField<DemoProduct>[] = [
    { key: "name", label: "Tên sản phẩm", type: "text", placeholder: "Nhập tên sản phẩm", required: true },
    { key: "category", label: "Danh mục", type: "select", options: categoryOptions, required: true },
    { key: "price", label: "Giá (VND)", type: "number", placeholder: "Nhập giá", required: true },
    { key: "stock", label: "Tồn kho", type: "number", placeholder: "Nhập số lượng", required: true },
    { key: "status", label: "Trạng thái", type: "select", options: productStatusOptions, required: true },
  ];

  // Handle user save
  const handleSaveUserData = (userData: DemoUser) => {
    if (editingUser) {
      // Update existing user
      const updatedUsers = users.map(u => u.id === editingUser.id ? userData : u);
      setFilteredUsers(updatedUsers);
      showSuccess("Thành công", "Cập nhật người dùng thành công!");
    } else {
      // Add new user
      const newUser = {
        ...userData,
        id: `user-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setFilteredUsers([...users, newUser]);
      showSuccess("Thành công", "Thêm người dùng mới thành công!");
    }
    setIsUserModalOpen(false);
  };

  // Handle product save
  const handleSaveProductData = (productData: DemoProduct) => {
    if (editingProduct) {
      // Update existing product
      const updatedProducts = products.map(p => p.id === editingProduct.id ? productData : p);
      setFilteredProducts(updatedProducts);
      showSuccess("Thành công", "Cập nhật sản phẩm thành công!");
    } else {
      // Add new product
      const newProduct = {
        ...productData,
        id: `product-${Date.now()}`,
      };
      setFilteredProducts([...products, newProduct]);
      showSuccess("Thành công", "Thêm sản phẩm mới thành công!");
    }
    setIsProductModalOpen(false);
  };

  // Handle user delete
  const handleDeleteUserData = () => {
    if (deletingUser) {
      const updatedUsers = users.filter(u => u.id !== deletingUser.id);
      setFilteredUsers(updatedUsers);
      showSuccess("Thành công", "Xóa người dùng thành công!");
      setShowUserDeleteModal(false);
    }
  };

  // Handle product delete
  const handleDeleteProductData = () => {
    if (deletingProduct) {
      const updatedProducts = products.filter(p => p.id !== deletingProduct.id);
      setFilteredProducts(updatedProducts);
      showSuccess("Thành công", "Xóa sản phẩm thành công!");
      setShowProductDeleteModal(false);
    }
  };

  // Demo data for pagination
  const paginationData = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    name: `Item ${i + 1}`,
    description: `Mô tả cho item ${i + 1}`,
  }));

  const paginationTotalItems = paginationData.length;
  const paginationStartIndex = (paginationPage - 1) * paginationItemsPerPage;
  const paginationEndIndex = paginationStartIndex + paginationItemsPerPage;
  const paginationCurrentData = paginationData.slice(paginationStartIndex, paginationEndIndex);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎨 Demo Components
          </h1>
          <p className="text-xl text-gray-600">
            Showcase tất cả các common components đã tạo
          </p>
        </div>

        {/* Tabs */}
        <Tabs
          selectedKey={selectedTab}
          onSelectionChange={(key) => setSelectedTab(key as string)}
          className="mb-8"
        >
          <Tab key="overview" title="Tổng quan" />
          <Tab key="pagination" title="Pagination" />
          <Tab key="notifications" title="Notifications" />
          <Tab key="crud-users" title="CRUD - Users" />
          <Tab key="crud-products" title="CRUD - Products" />
        </Tabs>

        {/* Overview Tab */}
        {selectedTab === "overview" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h2 className="text-2xl font-semibold">Tổng quan Components</h2>
                <p className="text-gray-600">Danh sách tất cả components đã tạo</p>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Pagination Component */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
                    <div className="flex items-center mb-4">
                      <Icon className="w-8 h-8 text-blue-600 mr-3" icon="lucide:layers" />
                      <h3 className="text-lg font-semibold">Pagination</h3>
                    </div>
                    <p className="text-gray-700 mb-4">
                      Component phân trang với đầy đủ tính năng: search, filter, quick jump, items per page selector.
                    </p>
                    <div className="space-y-1">
                      <div className="text-sm text-blue-600">✓ Hook usePagination</div>
                      <div className="text-sm text-blue-600">✓ Utility functions</div>
                      <div className="text-sm text-blue-600">✓ Responsive design</div>
                    </div>
                  </div>

                  {/* Notification Component */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
                    <div className="flex items-center mb-4">
                      <Icon className="w-8 h-8 text-green-600 mr-3" icon="lucide:bell" />
                      <h3 className="text-lg font-semibold">Notifications</h3>
                    </div>
                    <p className="text-gray-700 mb-4">
                      Hệ thống thông báo toàn diện với toast notifications và modal confirmations.
                    </p>
                    <div className="space-y-1">
                      <div className="text-sm text-green-600">✓ Context API</div>
                      <div className="text-sm text-green-600">✓ 5 loại notifications</div>
                      <div className="text-sm text-green-600">✓ Auto-hide & positions</div>
                    </div>
                  </div>

                  {/* CRUD Template Component */}
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
                    <div className="flex items-center mb-4">
                      <Icon className="w-8 h-8 text-purple-600 mr-3" icon="lucide:database" />
                      <h3 className="text-lg font-semibold">CRUD Template</h3>
                    </div>
                    <p className="text-gray-700 mb-4">
                      Template generic cho các trang CRUD với search, filter, pagination tích hợp.
                    </p>
                    <div className="space-y-1">
                      <div className="text-sm text-purple-600">✓ Generic & reusable</div>
                      <div className="text-sm text-purple-600">✓ Hook useCRUD</div>
                      <div className="text-sm text-purple-600">✓ Customizable columns</div>
                    </div>
                  </div>
                </div>

                {/* Features Overview */}
                <div className="mt-8">
                  <h3 className="text-xl font-semibold mb-4">Tính năng chính</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2 text-blue-600">UI/UX Features</h4>
                      <ul className="space-y-1 text-sm text-gray-600">
                        <li>• Responsive design</li>
                        <li>• Dark/Light theme support</li>
                        <li>• HeroUI integration</li>
                        <li>• Vietnamese localization</li>
                        <li>• Accessibility features</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 text-green-600">Technical Features</h4>
                      <ul className="space-y-1 text-sm text-gray-600">
                        <li>• TypeScript support</li>
                        <li>• Generic components</li>
                        <li>• Custom hooks</li>
                        <li>• Utility functions</li>
                        <li>• Error handling</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Usage Stats */}
                <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-4">Thống kê sử dụng</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">3</div>
                      <div className="text-sm text-gray-600">Components</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">5+</div>
                      <div className="text-sm text-gray-600">Hooks</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">10+</div>
                      <div className="text-sm text-gray-600">Utility Functions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">100%</div>
                      <div className="text-sm text-gray-600">Reusable</div>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Pagination Demo */}
        {selectedTab === "pagination" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h2 className="text-2xl font-semibold">Pagination Component Demo</h2>
                <p className="text-gray-600">Demo các tính năng của Pagination component</p>
              </CardHeader>
              <CardBody>
                <div className="space-y-6">
                  {/* Data Table */}
                  <div className="bg-white rounded-lg border">
                    <div className="p-4 border-b">
                      <h3 className="text-lg font-medium">Danh sách Items</h3>
                    </div>
                    <div className="divide-y">
                      {paginationCurrentData.map((item) => (
                        <div key={item.id} className="p-4 hover:bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{item.name}</h4>
                              <p className="text-sm text-gray-600">{item.description}</p>
                            </div>
                            <span className="text-sm text-gray-500">ID: {item.id}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pagination Controls */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Pagination Controls</h3>
                    
                    {/* Basic Pagination */}
                    <div>
                      <h4 className="text-md font-medium mb-2">Basic Pagination</h4>
                      <Pagination
                        totalItems={paginationTotalItems}
                        currentPage={paginationPage}
                        itemsPerPage={paginationItemsPerPage}
                        onPageChange={handlePaginationPageChange}
                        onItemsPerPageChange={handlePaginationItemsPerPageChange}
                        itemsPerPageOptions={[5, 10, 20]}
                        showTotal={true}
                        showItemsPerPage={true}
                        showFirstLast={true}
                        size="md"
                        color="primary"
                      />
                    </div>

                    {/* Compact Pagination */}
                    <div>
                      <h4 className="text-md font-medium mb-2">Compact Pagination</h4>
                      <Pagination
                        totalItems={paginationTotalItems}
                        currentPage={paginationPage}
                        itemsPerPage={paginationItemsPerPage}
                        onPageChange={handlePaginationPageChange}
                        compact={true}
                        size="sm"
                        color="secondary"
                      />
                    </div>

                    {/* Pagination with Quick Jump */}
                    <div>
                      <h4 className="text-md font-medium mb-2">Pagination with Quick Jump</h4>
                      <Pagination
                        totalItems={paginationTotalItems}
                        currentPage={paginationPage}
                        itemsPerPage={paginationItemsPerPage}
                        onPageChange={handlePaginationPageChange}
                        onItemsPerPageChange={handlePaginationItemsPerPageChange}
                        itemsPerPageOptions={[5, 10, 20, 50]}
                        showTotal={true}
                        showItemsPerPage={true}
                        showQuickJump={true}
                        showFirstLast={true}
                        size="lg"
                        color="success"
                      />
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Notifications Demo */}
        {selectedTab === "notifications" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h2 className="text-2xl font-semibold">Notification System Demo</h2>
                <p className="text-gray-600">Demo các loại thông báo và modal</p>
              </CardHeader>
              <CardBody>
                <div className="space-y-6">
                  {/* Toast Notifications */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Toast Notifications</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <Button
                        color="success"
                        onPress={() => showSuccess("Thành công!", "Thao tác đã được thực hiện thành công")}
                      >
                        Success Toast
                      </Button>
                      <Button
                        color="danger"
                        onPress={() => showError("Lỗi!", "Đã xảy ra lỗi trong quá trình xử lý")}
                      >
                        Error Toast
                      </Button>
                      <Button
                        color="warning"
                        onPress={() => showSuccess("Cảnh báo!", "Vui lòng kiểm tra lại thông tin")}
                      >
                        Warning Toast
                      </Button>
                      <Button
                        color="primary"
                        onPress={() => showSuccess("Thông tin", "Đây là thông báo thông tin")}
                      >
                        Info Toast
                      </Button>
                      <Button
                        color="default"
                        onPress={() => showSuccess("Đang tải...", "Vui lòng chờ trong giây lát")}
                      >
                        Loading Toast
                      </Button>
                      <Button
                        color="secondary"
                        onPress={() => {
                          showSuccess("Custom Toast", "Thông báo tùy chỉnh", {
                            duration: 10000,
                            position: "top-center",
                          });
                        }}
                      >
                        Custom Toast
                      </Button>
                    </div>
                  </div>

                  {/* Modal Notifications */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Modal Notifications</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <Button
                        color="success"
                        onPress={() => {
                          setModalType("success");
                          setModalTitle("Thành công!");
                          setModalMessage("Dữ liệu đã được lưu thành công");
                          setShowModal(true);
                        }}
                      >
                        Success Modal
                      </Button>
                      <Button
                        color="danger"
                        onPress={() => {
                          setModalType("error");
                          setModalTitle("Lỗi!");
                          setModalMessage("Không thể thực hiện thao tác này");
                          setShowModal(true);
                        }}
                      >
                        Error Modal
                      </Button>
                      <Button
                        color="warning"
                        onPress={() => {
                          setModalType("warning");
                          setModalTitle("Cảnh báo!");
                          setModalMessage("Bạn có chắc chắn muốn tiếp tục?");
                          setShowModal(true);
                        }}
                      >
                        Warning Modal
                      </Button>
                      <Button
                        color="primary"
                        onPress={() => {
                          setModalType("info");
                          setModalTitle("Thông tin");
                          setModalMessage("Đây là thông tin quan trọng");
                          setShowModal(true);
                        }}
                      >
                        Info Modal
                      </Button>
                      <Button
                        color="default"
                        onPress={() => {
                          setModalType("loading");
                          setModalTitle("Đang xử lý...");
                          setModalMessage("Vui lòng chờ trong giây lát");
                          setShowModal(true);
                        }}
                      >
                        Loading Modal
                      </Button>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* CRUD Users Demo */}
        {selectedTab === "crud-users" && (
          <div className="space-y-6">
            <CRUDTemplate
              title="Quản lý Người dùng"
              description="Demo CRUD template với dữ liệu người dùng"
              data={users}
              filteredData={filteredUsers}
              searchTerm={userSearchTerm}
              setSearchTerm={setUserSearchTerm}
              filterValue={userFilterValue}
              setFilterValue={setUserFilterValue}
              filterOptions={roleOptions}
              searchFields={["name", "email"]}
              columns={userColumns}
              onAdd={handleAddUser}
              onEdit={handleEditUser}
              onDelete={handleDeleteUser}
              emptyStateIcon="lucide:users"
              emptyStateMessage="Không tìm thấy người dùng nào"
              addButtonText="Thêm người dùng"
              searchPlaceholder="Tìm kiếm người dùng..."
              filterPlaceholder="Lọc theo vai trò"
            />

            {/* User Modal */}
            <CRUDModal
              isOpen={isUserModalOpen}
              onClose={() => setIsUserModalOpen(false)}
              title={editingUser ? "Chỉnh sửa Người dùng" : "Thêm Người dùng Mới"}
              data={editingUser || ({} as DemoUser)}
              onSave={handleSaveUserData}
              fields={userFields}
            />

            {/* User Delete Modal */}
            <NotificationModal
              isOpen={showUserDeleteModal}
              onClose={() => setShowUserDeleteModal(false)}
              type="error"
              title="Xác nhận xóa người dùng"
              message={`Bạn có chắc chắn muốn xóa người dùng "${deletingUser?.name}" không?`}
              confirmText="Xóa"
              cancelText="Hủy"
              showCancel={true}
              onConfirm={handleDeleteUserData}
              onCancel={() => setShowUserDeleteModal(false)}
            />
          </div>
        )}

        {/* CRUD Products Demo */}
        {selectedTab === "crud-products" && (
          <div className="space-y-6">
            <CRUDTemplate
              title="Quản lý Sản phẩm"
              description="Demo CRUD template với dữ liệu sản phẩm"
              data={products}
              filteredData={filteredProducts}
              searchTerm={productSearchTerm}
              setSearchTerm={setProductSearchTerm}
              filterValue={productFilterValue}
              setFilterValue={setProductFilterValue}
              filterOptions={categoryOptions}
              searchFields={["name"]}
              columns={productColumns}
              onAdd={handleAddProduct}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
              emptyStateIcon="lucide:package"
              emptyStateMessage="Không tìm thấy sản phẩm nào"
              addButtonText="Thêm sản phẩm"
              searchPlaceholder="Tìm kiếm sản phẩm..."
              filterPlaceholder="Lọc theo danh mục"
            />

            {/* Product Modal */}
            <CRUDModal
              isOpen={isProductModalOpen}
              onClose={() => setIsProductModalOpen(false)}
              title={editingProduct ? "Chỉnh sửa Sản phẩm" : "Thêm Sản phẩm Mới"}
              data={editingProduct || ({} as DemoProduct)}
              onSave={handleSaveProductData}
              fields={productFields}
            />

            {/* Product Delete Modal */}
            <NotificationModal
              isOpen={showProductDeleteModal}
              onClose={() => setShowProductDeleteModal(false)}
              type="error"
              title="Xác nhận xóa sản phẩm"
              message={`Bạn có chắc chắn muốn xóa sản phẩm "${deletingProduct?.name}" không?`}
              confirmText="Xóa"
              cancelText="Hủy"
              showCancel={true}
              onConfirm={handleDeleteProductData}
              onCancel={() => setShowProductDeleteModal(false)}
            />
          </div>
        )}

        {/* Demo Modal */}
        <NotificationModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          type={modalType}
          title={modalTitle}
          message={modalMessage}
          confirmText="Đóng"
          showCancel={false}
          onConfirm={() => setShowModal(false)}
        />
      </div>
    </div>
  );
}