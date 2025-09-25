# Common Components

Bộ các component tái sử dụng cho dự án Clinic Management.

## 1. Pagination Component

Component phân trang có thể tái sử dụng cho tất cả các trang cần hiển thị dữ liệu có phân trang.

### Cách sử dụng:

```tsx
import { Pagination, usePagination } from "@/components/pagination";

function MyPage() {
  const {
    currentPage,
    itemsPerPage,
    handlePageChange,
    handleItemsPerPageChange,
  } = usePagination(1, 10);

  const totalItems = 100;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  return (
    <div>
      {/* Your data display */}
      <div>
        {currentData.map(item => (
          <div key={item.id}>{item.name}</div>
        ))}
      </div>

      {/* Pagination */}
      <Pagination
        totalItems={totalItems}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
        itemsPerPageOptions={[10, 20, 50, 100]}
        showTotal={true}
        showItemsPerPage={true}
        showQuickJump={true}
        showFirstLast={true}
        size="md"
        color="primary"
      />
    </div>
  );
}
```

### Props:

- `totalItems`: Tổng số items
- `currentPage`: Trang hiện tại
- `itemsPerPage`: Số items per page
- `onPageChange`: Callback khi thay đổi trang
- `onItemsPerPageChange`: Callback khi thay đổi số items per page
- `itemsPerPageOptions`: Các options cho items per page (default: [10, 20, 50, 100])
- `showTotal`: Hiển thị thông tin tổng số items (default: true)
- `showItemsPerPage`: Hiển thị selector items per page (default: true)
- `showQuickJump`: Hiển thị quick jump (default: false)
- `showFirstLast`: Hiển thị first/last page buttons (default: true)
- `size`: Size của pagination ("sm" | "md" | "lg", default: "md")
- `color`: Color theme (default: "primary")
- `compact`: Compact mode (default: false)

### Hook usePagination:

```tsx
const {
  currentPage,
  itemsPerPage,
  handlePageChange,
  handleItemsPerPageChange,
  resetPagination,
} = usePagination(initialPage, initialItemsPerPage);
```

## 2. Notification Components

Bộ các component thông báo để hiển thị thông báo cho người dùng.

### Cách sử dụng:

#### 1. Sử dụng NotificationProvider (đã được thêm vào app/providers.tsx):

```tsx
import { useNotification } from "@/components/notification-popup";

function MyComponent() {
  const {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    showConfirm,
  } = useNotification();

  const handleSave = async () => {
    try {
      showLoading("Đang lưu...", "Vui lòng chờ trong giây lát.");
      
      await saveData();
      
      showSuccess("Thành công!", "Dữ liệu đã được lưu thành công.");
    } catch (error) {
      showError("Lỗi!", "Đã xảy ra lỗi khi lưu dữ liệu.");
    }
  };

  const handleDelete = () => {
    showConfirm(
      "Xác nhận xóa",
      "Bạn có chắc chắn muốn xóa dữ liệu này không?",
      () => {
        // Xử lý xóa
        showSuccess("Đã xóa!", "Dữ liệu đã được xóa thành công.");
      },
      () => {
        showInfo("Đã hủy", "Hành động đã được hủy.");
      }
    );
  };

  return (
    <div>
      <button onClick={handleSave}>Lưu</button>
      <button onClick={handleDelete}>Xóa</button>
    </div>
  );
}
```

#### 2. Sử dụng NotificationModal:

```tsx
import { NotificationModal } from "@/components/notification-popup";

function MyComponent() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div>
      <button onClick={() => setShowModal(true)}>Mở Modal</button>
      
      <NotificationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        type="warning"
        title="Cảnh báo!"
        message="Bạn có chắc chắn muốn thực hiện hành động này không?"
        onConfirm={() => {
          setShowModal(false);
          // Xử lý xác nhận
        }}
        onCancel={() => {
          setShowModal(false);
          // Xử lý hủy
        }}
        confirmText="Xác nhận"
        cancelText="Hủy"
        showCancel={true}
      />
    </div>
  );
}
```

### Các loại thông báo:

1. **Success**: Thông báo thành công (màu xanh)
2. **Error**: Thông báo lỗi (màu đỏ, không tự động đóng)
3. **Warning**: Thông báo cảnh báo (màu vàng)
4. **Info**: Thông báo thông tin (màu xanh dương)
5. **Loading**: Thông báo đang xử lý (màu xám, không tự động đóng)

### Các method có sẵn:

- `showSuccess(title, message?, options?)`: Hiển thị thông báo thành công
- `showError(title, message?, options?)`: Hiển thị thông báo lỗi
- `showWarning(title, message?, options?)`: Hiển thị thông báo cảnh báo
- `showInfo(title, message?, options?)`: Hiển thị thông báo thông tin
- `showLoading(title, message?, options?)`: Hiển thị thông báo đang xử lý
- `showConfirm(title, message, onConfirm, onCancel?)`: Hiển thị dialog xác nhận

### Utility functions:

```tsx
import { notificationUtils } from "@/components/notification-popup";

// Tạo thông báo từ API error
const errorNotification = notificationUtils.createErrorFromApi(apiError);

// Tạo thông báo từ API success
const successNotification = notificationUtils.createSuccessFromApi("Dữ liệu đã được lưu");

// Tạo thông báo xác nhận
const confirmNotification = notificationUtils.createConfirm(
  "Xác nhận xóa",
  "Bạn có chắc chắn muốn xóa không?",
  () => console.log("Confirmed"),
  () => console.log("Cancelled")
);
```

## 3. Demo Page

Truy cập `/demo` để xem demo các components.

## 4. Tích hợp vào CRUD

### Ví dụ sử dụng trong CRUD operations:

```tsx
import { useNotification } from "@/components/notification-popup";
import { Pagination, usePagination } from "@/components/pagination";

function PatientList() {
  const { showSuccess, showError, showConfirm } = useNotification();
  const { currentPage, itemsPerPage, handlePageChange, handleItemsPerPageChange } = usePagination();
  const [patients, setPatients] = useState([]);
  const [totalPatients, setTotalPatients] = useState(0);

  const handleDelete = (patientId: string) => {
    showConfirm(
      "Xác nhận xóa bệnh nhân",
      "Bạn có chắc chắn muốn xóa bệnh nhân này không?",
      async () => {
        try {
          await deletePatient(patientId);
          setPatients(patients.filter(p => p.id !== patientId));
          showSuccess("Thành công!", "Bệnh nhân đã được xóa.");
        } catch (error) {
          showError("Lỗi!", "Không thể xóa bệnh nhân.");
        }
      }
    );
  };

  const handleSave = async (patientData: any) => {
    try {
      await savePatient(patientData);
      showSuccess("Thành công!", "Bệnh nhân đã được lưu.");
      // Refresh data
      fetchPatients();
    } catch (error) {
      showError("Lỗi!", "Không thể lưu bệnh nhân.");
    }
  };

  return (
    <div>
      {/* Patient list */}
      <div>
        {patients.map(patient => (
          <div key={patient.id}>
            {patient.name}
            <button onClick={() => handleDelete(patient.id)}>Xóa</button>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <Pagination
        totalItems={totalPatients}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />
    </div>
  );
}
```

## 5. Customization

Các components có thể được customize thông qua props và CSS classes. Tất cả đều sử dụng Tailwind CSS và HeroUI components.
