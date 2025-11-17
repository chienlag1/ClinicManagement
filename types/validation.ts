// Validation Types
export interface ValidationRule<T = any> {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: T) => boolean | string;
  message?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  fieldErrors: Record<string, string>;
}

export interface FormValidationConfig {
  rules: Record<string, ValidationRule>;
  messages: Record<string, string>;
  mode: 'onChange' | 'onBlur' | 'onSubmit';
}

// Common Validation Rules
export const VALIDATION_RULES = {
  required: (message = 'Trường này là bắt buộc'): ValidationRule => ({
    required: true,
    message,
  }),

  minLength: (min: number, message?: string): ValidationRule => ({
    minLength: min,
    message: message || `Tối thiểu ${min} ký tự`,
  }),

  maxLength: (max: number, message?: string): ValidationRule => ({
    maxLength: max,
    message: message || `Tối đa ${max} ký tự`,
  }),

  email: (message = 'Email không hợp lệ'): ValidationRule => ({
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message,
  }),

  phone: (message = 'Số điện thoại không hợp lệ'): ValidationRule => ({
    pattern: /^[0-9]{10,11}$/,
    message,
  }),

  idCard: (message = 'CMND/CCCD không hợp lệ'): ValidationRule => ({
    pattern: /^[0-9]{9,12}$/,
    message,
  }),

  date: (message = 'Ngày không hợp lệ'): ValidationRule => ({
    custom: (value: string) => {
      const date = new Date(value);
      return !isNaN(date.getTime()) && date > new Date();
    },
    message,
  }),

  time: (message = 'Giờ không hợp lệ'): ValidationRule => ({
    pattern: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    message,
  }),
};

// Form Validation Messages
export const VALIDATION_MESSAGES = {
  required: 'Trường này là bắt buộc',
  email: 'Email không hợp lệ',
  phone: 'Số điện thoại không hợp lệ',
  idCard: 'CMND/CCCD không hợp lệ',
  date: 'Ngày không hợp lệ',
  time: 'Giờ không hợp lệ',
  minLength: 'Quá ngắn',
  maxLength: 'Quá dài',
  pattern: 'Định dạng không đúng',
  custom: 'Giá trị không hợp lệ',
};

// Validation Functions
export const validateField = <T>(
  value: T,
  rules: ValidationRule<T>
): string | null => {
  if (
    rules.required &&
    (!value || (typeof value === 'string' && value.trim() === ''))
  ) {
    return rules.message || VALIDATION_MESSAGES.required;
  }

  if (typeof value === 'string') {
    if (rules.minLength && value.length < rules.minLength) {
      return rules.message || `Tối thiểu ${rules.minLength} ký tự`;
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      return rules.message || `Tối đa ${rules.maxLength} ký tự`;
    }

    if (rules.pattern && !rules.pattern.test(value)) {
      return rules.message || VALIDATION_MESSAGES.pattern;
    }
  }

  if (typeof value === 'number') {
    if (rules.min !== undefined && value < rules.min) {
      return rules.message || `Tối thiểu ${rules.min}`;
    }

    if (rules.max !== undefined && value > rules.max) {
      return rules.message || `Tối đa ${rules.max}`;
    }
  }

  if (rules.custom) {
    const result = rules.custom(value);
    if (typeof result === 'string') {
      return result;
    }
    if (result === false) {
      return rules.message || VALIDATION_MESSAGES.custom;
    }
  }

  return null;
};

export const validateForm = <T extends Record<string, any>>(
  data: T,
  rules: Record<string, ValidationRule>
): ValidationResult => {
  const errors: string[] = [];
  const fieldErrors: Record<string, string> = {};

  Object.entries(rules).forEach(([field, rule]) => {
    const value = data[field];
    const error = validateField(value, rule);

    if (error) {
      errors.push(error);
      fieldErrors[field] = error;
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    fieldErrors,
  };
};

// Specific Form Validations
export const APPOINTMENT_VALIDATION_RULES = {
  id_card: VALIDATION_RULES.idCard(),
  name: VALIDATION_RULES.required('Tên là bắt buộc'),
  phone: VALIDATION_RULES.phone(),
  email: VALIDATION_RULES.email(),
  clinic_id: VALIDATION_RULES.required('Phòng khám là bắt buộc'),
  doctor_id: VALIDATION_RULES.required('Bác sĩ là bắt buộc'),
  appointment_date: VALIDATION_RULES.date(
    'Ngày hẹn phải là ngày trong tương lai'
  ),
  appointment_time: VALIDATION_RULES.time(),
  symptoms: VALIDATION_RULES.minLength(
    10,
    'Mô tả triệu chứng tối thiểu 10 ký tự'
  ),
};

export const PATIENT_VALIDATION_RULES = {
  id_card: VALIDATION_RULES.idCard(),
  name: VALIDATION_RULES.required('Tên là bắt buộc'),
  phone: VALIDATION_RULES.phone(),
  email: VALIDATION_RULES.email(),
  address: VALIDATION_RULES.required('Địa chỉ là bắt buộc'),
  birth_date: VALIDATION_RULES.required('Ngày sinh là bắt buộc'),
  gender: VALIDATION_RULES.required('Giới tính là bắt buộc'),
};
