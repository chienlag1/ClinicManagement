# Types Documentation

Thư mục này chứa tất cả các type definitions cho ứng dụng Clinic Management.

## 📁 Cấu trúc thư mục

```
types/
├── appointment.ts    # Types cho appointment system
├── clinic.ts         # Types cho clinic management
├── medicine.ts       # Types cho medicine management
├── form.ts          # Types cho form components
├── ui.ts            # Types cho UI components
├── api.ts           # Types cho API responses
├── validation.ts    # Types cho validation
├── index.ts         # Export tất cả types
└── README.md        # Documentation
```

## 🎯 Sử dụng

### Import tất cả types
```typescript
import { 
  AppointmentFormProps, 
  Patient, 
  Clinic, 
  ButtonProps,
  ValidationRule 
} from '@/types';
```

### Import specific types
```typescript
import { AppointmentFormProps } from '@/types/form';
import { Patient } from '@/types/appointment';
import { Clinic } from '@/types/clinic';
```

## 📋 Các loại types

### 1. **appointment.ts** - Appointment System
- `Patient` - Thông tin bệnh nhân
- `Doctor` - Thông tin bác sĩ
- `Appointment` - Thông tin lịch hẹn
- `PatientData` - Dữ liệu form bệnh nhân
- `AppointmentFormData` - Dữ liệu form lịch hẹn

### 2. **clinic.ts** - Clinic Management
- `Clinic` - Thông tin phòng khám
- `CLINIC_STATUS` - Trạng thái phòng khám

### 3. **medicine.ts** - Medicine Management
- `Medicine` - Thông tin thuốc
- `MEDICINE_CATEGORIES` - Danh mục thuốc

### 4. **form.ts** - Form Components
- `AppointmentFormProps` - Props cho form đặt lịch
- `FormFieldProps` - Props cho form fields
- `FormValidation` - Validation logic
- `APPOINTMENT_TIME_SLOTS` - Khung giờ hẹn

### 5. **ui.ts** - UI Components
- `ButtonProps` - Props cho button
- `InputProps` - Props cho input
- `SelectProps` - Props cho select
- `CardProps` - Props cho card
- `ModalProps` - Props cho modal

### 6. **api.ts** - API Responses
- `ApiResponse<T>` - Generic API response
- `PaginatedResponse<T>` - Paginated response
- `AuthUser` - User authentication
- `HealthCheck` - Health check response

### 7. **validation.ts** - Validation
- `ValidationRule<T>` - Validation rule
- `ValidationResult` - Validation result
- `VALIDATION_RULES` - Common validation rules
- `VALIDATION_MESSAGES` - Error messages

## 🔧 Constants

### Time Slots
```typescript
import { APPOINTMENT_TIME_SLOTS } from '@/types';

// Sử dụng
APPOINTMENT_TIME_SLOTS.morning  // Giờ sáng
APPOINTMENT_TIME_SLOTS.afternoon // Giờ chiều
APPOINTMENT_TIME_SLOTS.all       // Tất cả giờ
```

### Form Config
```typescript
import { FORM_CONFIG } from '@/types';

// Sử dụng
FORM_CONFIG.minDate     // Ngày tối thiểu
FORM_CONFIG.maxDate     // Ngày tối đa
FORM_CONFIG.timeSlots   // Khung giờ
```

### Validation Rules
```typescript
import { VALIDATION_RULES, APPOINTMENT_VALIDATION_RULES } from '@/types';

// Sử dụng
VALIDATION_RULES.required('Custom message')
VALIDATION_RULES.email()
VALIDATION_RULES.phone()
APPOINTMENT_VALIDATION_RULES.patient_id
```

## 🎨 Best Practices

### 1. **Type Safety**
```typescript
// ✅ Good
const patient: Patient = {
  _id: '123',
  name: 'John Doe',
  // ... other required fields
};

// ❌ Bad
const patient = {
  name: 'John Doe'
  // Missing required fields
};
```

### 2. **Interface Extension**
```typescript
// ✅ Good
interface ExtendedPatient extends Patient {
  appointments: Appointment[];
  lastVisit: string;
}
```

### 3. **Generic Types**
```typescript
// ✅ Good
interface ApiResponse<T> {
  data: T;
  success: boolean;
}

// Sử dụng
const patientResponse: ApiResponse<Patient> = await fetchPatient();
```

### 4. **Validation**
```typescript
// ✅ Good
import { validateForm, APPOINTMENT_VALIDATION_RULES } from '@/types';

const result = validateForm(formData, APPOINTMENT_VALIDATION_RULES);
if (!result.isValid) {
  console.log(result.errors);
}
```

## 🚀 Migration Guide

### Từ local types sang centralized types

**Before:**
```typescript
// Trong component
interface MyComponentProps {
  data: any;
  onSave: () => void;
}
```

**After:**
```typescript
// Import từ types
import { MyComponentProps } from '@/types';
```

## 📝 Notes

- Tất cả types đều có JSDoc comments
- Constants được export để tái sử dụng
- Validation rules có thể customize
- UI types tương thích với HeroUI
- API types hỗ trợ generic responses

