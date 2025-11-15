const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Load .env manually
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) {
    process.env[key.trim()] = valueParts.join('=').trim();
  }
});

const MONGODB_URI = process.env.MONGODB_URI;

const billSchema = new mongoose.Schema(
  {
    prescription: { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription' },
    paymentStatus: String,
    billCode: String,
  },
  { strict: false, strictPopulate: false }
);

const prescriptionSchema = new mongoose.Schema(
  {
    prescriptionCode: String,
    status: String,
    paymentStatus: String,
  },
  { strict: false, strictPopulate: false }
);

const Bill = mongoose.models.Bill || mongoose.model('Bill', billSchema);
const Prescription =
  mongoose.models.Prescription ||
  mongoose.model('Prescription', prescriptionSchema);

async function checkSync() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB\n');

    const bills = await Bill.find({
      prescription: { $exists: true, $ne: null },
    }).populate('prescription');

    console.log(`Found ${bills.length} bills with prescriptions:\n`);

    for (const bill of bills) {
      if (bill.prescription) {
        console.log(`Bill: ${bill.billCode}`);
        console.log(`  Bill PaymentStatus: ${bill.paymentStatus}`);
        console.log(
          `  Prescription Code: ${bill.prescription.prescriptionCode}`
        );
        console.log(`  Prescription Status: ${bill.prescription.status}`);
        console.log(
          `  Prescription PaymentStatus: ${bill.prescription.paymentStatus}`
        );

        if (bill.paymentStatus !== bill.prescription.paymentStatus) {
          console.log('  ⚠️  MISMATCH - Needs sync!');
        } else {
          console.log('  ✓ Synced');
        }
        console.log('');
      }
    }

    await mongoose.disconnect();
    console.log('✓ Disconnected');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkSync();
