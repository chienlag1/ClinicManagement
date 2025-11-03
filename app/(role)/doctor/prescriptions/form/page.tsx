'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
  Textarea,
  Chip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { useNotification } from '@/components/notification-popup';
import MedicineSelector from '../components/MedicineSelector';
import MedicineTypeFilter from '../components/MedicineTypeFilter';

interface FormOptions {
  patients: Array<{ id: string; fullName: string }>;
  medicines: Array<{ id: string; name: string }>;
}

export default function PrescriptionFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const { showSuccess, showError } = useNotification();
  const prescriptionId = searchParams.get('id');
  const isEdit = !!prescriptionId;

  const [formData, setFormData] = useState({
    patient: '',
    prescriptionDate: '',
    diagnosis: '',
    medicines: [] as Array<{
      medicine: string;
      dosage: string;
      frequency: string;
      duration: string;
      instructions: string;
    }>,
    status: 'active',
    notes: '',
  });

  const [formOptions, setFormOptions] = useState<FormOptions>({
    patients: [],
    medicines: [],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedMedicineType, setSelectedMedicineType] = useState<string>('');
  const [allMedicines, setAllMedicines] = useState<
    Array<{ id: string; name: string; type?: string }>
  >([]);

  // Fetch patients and medicines
  useEffect(() => {
    const fetchOptions = async () => {
      setLoading(true);
      try {
        // Fetch patients
        const patientsResponse = await fetch('/api/patients?limit=1000');
        if (patientsResponse.ok) {
          const patientsData = await patientsResponse.json();
          const patientsList = patientsData.items || patientsData || [];
          setFormOptions(prev => ({
            ...prev,
            patients: patientsList.map((p: any) => ({
              id: p._id,
              fullName: p.name || `${p.id_card || 'N/A'}`,
            })),
          }));
        }

        // Fetch medicines
        const medicinesResponse = await fetch('/api/medicines');
        if (medicinesResponse.ok) {
          const medicinesData = await medicinesResponse.json();
          const medicinesList = Array.isArray(medicinesData)
            ? medicinesData
            : [];
          const formattedMedicines = medicinesList.map((m: any) => ({
            id: m._id,
            name: m.medicine_name || m.name,
            type: m.type,
          }));
          setFormOptions(prev => ({
            ...prev,
            medicines: formattedMedicines.map(m => ({
              id: m.id,
              name: m.name,
            })),
          }));
          setAllMedicines(formattedMedicines);
        }

        // If editing, fetch prescription data
        if (isEdit && prescriptionId) {
          const prescriptionResponse = await fetch(
            `/api/prescriptions/${prescriptionId}`
          );
          if (prescriptionResponse.ok) {
            const prescriptionResult = await prescriptionResponse.json();
            const prescriptionData = prescriptionResult.prescription;

            if (prescriptionData) {
              setFormData({
                patient:
                  typeof prescriptionData.patient === 'object'
                    ? prescriptionData.patient._id ||
                      prescriptionData.patient.id ||
                      ''
                    : prescriptionData.patient || '',
                prescriptionDate: prescriptionData.prescriptionDate
                  ? new Date(prescriptionData.prescriptionDate)
                      .toISOString()
                      .split('T')[0]
                  : '',
                diagnosis: prescriptionData.diagnosis || '',
                medicines:
                  prescriptionData.medicines?.map((m: any) => ({
                    medicine:
                      typeof m.medicine === 'object'
                        ? m.medicine._id || m.medicine.id
                        : m.medicine || '',
                    dosage: m.dosage || '',
                    frequency: m.frequency || '',
                    duration: m.duration || '',
                    instructions: m.instructions || '',
                  })) || [],
                status: prescriptionData.status || 'active',
                notes: prescriptionData.notes || '',
              });
            }
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, [isEdit, prescriptionId]);

  const handleFieldChange = useCallback((key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (
      !formData.patient ||
      !formData.diagnosis ||
      formData.medicines.length === 0
    ) {
      showError(
        'Thiếu thông tin',
        'Vui lòng điền đầy đủ thông tin bệnh nhân, chẩn đoán và ít nhất một loại thuốc.'
      );
      return;
    }

    // Validate medicines
    const invalidMedicine = formData.medicines.find(
      m => !m.medicine || !m.dosage || !m.frequency || !m.duration
    );
    if (invalidMedicine) {
      showError(
        'Thông tin thuốc chưa đầy đủ',
        'Vui lòng điền đầy đủ thông tin cho tất cả các loại thuốc (tên, liều lượng, tần suất, thời gian dùng).'
      );
      return;
    }

    setSaving(true);

    try {
      const payload = {
        patient: formData.patient,
        // doctor will be set automatically from auth.userId in API
        diagnosis: formData.diagnosis,
        medicines: formData.medicines.map(m => ({
          medicine: m.medicine,
          dosage: m.dosage,
          frequency: m.frequency,
          duration: m.duration,
          instructions: m.instructions || '',
        })),
        notes: formData.notes || '',
        prescriptionDate: formData.prescriptionDate || new Date().toISOString(),
        status: formData.status,
      };

      const url = isEdit
        ? `/api/prescriptions/${prescriptionId}`
        : '/api/prescriptions';

      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Có lỗi xảy ra khi lưu đơn thuốc');
      }

      // Show success notification
      showSuccess(
        isEdit ? 'Cập nhật thành công' : 'Tạo đơn thuốc thành công',
        isEdit
          ? 'Đơn thuốc đã được cập nhật thành công.'
          : 'Đơn thuốc mới đã được tạo thành công và đã hiển thị trong danh sách.'
      );

      // Navigate back to prescriptions list with refresh
      router.push('/doctor/prescriptions?refresh=true');
    } catch (error: any) {
      console.error('Error saving prescription:', error);
      showError(
        'Lỗi khi lưu đơn thuốc',
        error.message || 'Có lỗi xảy ra khi lưu đơn thuốc. Vui lòng thử lại.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/doctor/prescriptions');
  };

  // Filter medicines by selected type
  const filteredMedicines = useMemo(() => {
    return selectedMedicineType
      ? allMedicines.filter(m => m.type === selectedMedicineType)
      : allMedicines;
  }, [selectedMedicineType, allMedicines]);

  const statusLabels = {
    active: 'Đang xử lý',
    completed: 'Đã hoàn thành',
    cancelled: 'Đã hủy',
  };

  const statusColors = {
    active: 'warning',
    completed: 'success',
    cancelled: 'danger',
  } as const;

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='text-center'>
          <Icon
            icon='lucide:loader-2'
            className='w-8 h-8 animate-spin mx-auto mb-4 text-primary'
          />
          <p className='text-gray-500'>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>
            {isEdit ? 'Chỉnh sửa đơn thuốc' : 'Kê đơn thuốc mới'}
          </h1>
          <p className='text-gray-600 mt-2'>
            {isEdit
              ? 'Cập nhật thông tin đơn thuốc'
              : 'Tạo đơn thuốc mới cho bệnh nhân'}
          </p>
        </div>
        <div className='flex gap-2'>
          <Button variant='flat' color='default' onPress={handleCancel}>
            <Icon icon='lucide:arrow-left' className='w-4 h-4' />
            Quay lại
          </Button>
        </div>
      </div>

      {/* Status Chip (only when editing) */}
      {isEdit && (
        <div>
          <Chip
            color={statusColors[formData.status as keyof typeof statusColors]}
            variant='flat'
            size='lg'
          >
            {statusLabels[formData.status as keyof typeof statusLabels]}
          </Chip>
        </div>
      )}

      <form onSubmit={handleSubmit} className='space-y-6'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Patient Information */}
          <Card>
            <CardHeader className='flex gap-3'>
              <Icon icon='lucide:user' className='w-5 h-5 text-primary' />
              <h2 className='text-xl font-semibold'>Thông tin bệnh nhân</h2>
            </CardHeader>
            <CardBody className='space-y-4'>
              <div>
                <label htmlFor='patient-select' className='block text-sm font-medium text-gray-700 mb-2'>
                  Bệnh nhân <span className='text-red-500'>*</span>
                </label>
                <Dropdown id='patient-select'>
                  <DropdownTrigger>
                    <Button variant='bordered' className='w-full justify-start'>
                      {formData.patient
                        ? formOptions.patients.find(
                            p => p.id === formData.patient
                          )?.fullName || 'Chọn bệnh nhân'
                        : 'Chọn bệnh nhân'}
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    aria-label='Chọn bệnh nhân'
                    selectedKeys={formData.patient ? [formData.patient] : []}
                    onSelectionChange={keys => {
                      const selected = Array.from(keys)[0] as string;
                      handleFieldChange('patient', selected || '');
                    }}
                    selectionMode='single'
                  >
                    {formOptions.patients.map(patient => (
                      <DropdownItem key={patient.id}>
                        {patient.fullName}
                      </DropdownItem>
                    ))}
                  </DropdownMenu>
                </Dropdown>
              </div>
            </CardBody>
          </Card>

          {/* Date and Status */}
          <Card>
            <CardHeader className='flex gap-3'>
              <Icon icon='lucide:calendar' className='w-5 h-5 text-primary' />
              <h2 className='text-xl font-semibold'>Thông tin ngày tháng</h2>
            </CardHeader>
            <CardBody className='space-y-4'>
              <div>
                <label htmlFor='prescription-date' className='block text-sm font-medium text-gray-700 mb-2'>
                  Ngày kê đơn
                </label>
                <Input
                  id='prescription-date'
                  type='date'
                  value={formData.prescriptionDate}
                  onValueChange={value =>
                    handleFieldChange('prescriptionDate', value)
                  }
                />
              </div>
              <div>
                <label htmlFor='status-select' className='block text-sm font-medium text-gray-700 mb-2'>
                  Trạng thái
                </label>
                <Dropdown id='status-select'>
                  <DropdownTrigger>
                    <Button variant='bordered' className='w-full justify-start'>
                      {
                        statusLabels[
                          formData.status as keyof typeof statusLabels
                        ]
                      }
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    aria-label='Chọn trạng thái'
                    selectedKeys={[formData.status]}
                    onSelectionChange={keys => {
                      const selected = Array.from(keys)[0] as string;
                      handleFieldChange('status', selected || 'active');
                    }}
                    selectionMode='single'
                  >
                    <DropdownItem key='active'>Đang xử lý</DropdownItem>
                    <DropdownItem key='completed'>Đã hoàn thành</DropdownItem>
                    <DropdownItem key='cancelled'>Đã hủy</DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Diagnosis */}
        <Card>
          <CardHeader className='flex gap-3'>
            <Icon icon='lucide:stethoscope' className='w-5 h-5 text-primary' />
            <h2 className='text-xl font-semibold'>Chẩn đoán</h2>
          </CardHeader>
          <CardBody>
            <Textarea
              value={formData.diagnosis}
              onValueChange={value => handleFieldChange('diagnosis', value)}
              placeholder='Nhập chẩn đoán chi tiết...'
              minRows={4}
              isRequired
            />
          </CardBody>
        </Card>

        {/* Medicines */}
        <Card>
          <CardHeader className='flex gap-3'>
            <Icon icon='lucide:pills' className='w-5 h-5 text-primary' />
            <h2 className='text-xl font-semibold'>Danh sách thuốc</h2>
          </CardHeader>
          <CardBody className='space-y-6'>
            <MedicineTypeFilter
              selectedType={selectedMedicineType}
              onTypeChange={setSelectedMedicineType}
              filteredCount={filteredMedicines.length}
            />
            <MedicineSelector
              medicines={formOptions.medicines.map(m => ({
                id: m.id,
                name: m.name,
              }))}
              value={formData.medicines}
              onChange={value => handleFieldChange('medicines', value)}
              selectedType={selectedMedicineType}
              filteredMedicines={filteredMedicines}
            />
          </CardBody>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader className='flex gap-3'>
            <Icon icon='lucide:file-text' className='w-5 h-5 text-primary' />
            <h2 className='text-xl font-semibold'>Ghi chú</h2>
          </CardHeader>
          <CardBody>
            <Textarea
              value={formData.notes}
              onValueChange={value => handleFieldChange('notes', value)}
              placeholder='Ghi chú thêm về đơn thuốc...'
              minRows={4}
            />
          </CardBody>
        </Card>

        {/* Actions */}
        <div className='flex justify-end gap-4 pt-4'>
          <Button
            variant='flat'
            color='default'
            onPress={handleCancel}
            isDisabled={saving}
          >
            Hủy
          </Button>
          <Button
            type='submit'
            color='primary'
            isLoading={saving}
            isDisabled={
              !formData.patient ||
              !formData.diagnosis ||
              formData.medicines.length === 0
            }
          >
            {saving ? (
              'Đang lưu...'
            ) : (
              <>
                <Icon icon='lucide:save' className='w-4 h-4' />
                {isEdit ? 'Cập nhật' : 'Tạo đơn thuốc'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
