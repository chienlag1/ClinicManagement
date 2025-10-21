import Patient from '@/models/Patient';

export async function generatePatientId(): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const prefix = 'PT';

  let attempt = 0;
  const maxAttempts = 10;

  while (attempt < maxAttempts) {
    try {
      // Get the count of patients registered today
      const startOfDay = new Date(year, now.getMonth(), now.getDate());
      const endOfDay = new Date(year, now.getMonth(), now.getDate() + 1);

      const count = await Patient.countDocuments({
        createdAt: {
          $gte: startOfDay,
          $lt: endOfDay,
        },
      });

      // Format: PT-YYYYMMDD-xxx where xxx is a sequential number padded with zeros
      const sequentialNumber = (count + 1).toString().padStart(3, '0');
      const patientId = `${prefix}-${year}${month}${day}-${sequentialNumber}`;

      // Try to find if this ID already exists (double-check)
      const existing = await Patient.findOne({ patient_id: patientId });
      if (!existing) {
        return patientId;
      }

      // If ID exists, increment attempt and try again
      attempt++;
    } catch (error) {
      console.error('Error generating patient ID:', error);
      attempt++;
    }
  }

  throw new Error(
    'Failed to generate unique patient ID after multiple attempts'
  );
}
