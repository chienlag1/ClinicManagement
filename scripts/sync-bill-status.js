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
    paymentDate: Date,
    paymentOrderCode: Number,
    billCode: String,
  },
  { strict: false, strictPopulate: false, timestamps: true }
);

const prescriptionSchema = new mongoose.Schema(
  {
    prescriptionCode: String,
    status: String,
    paymentStatus: String,
    paymentOrderCode: Number,
  },
  { strict: false, strictPopulate: false }
);

const Bill = mongoose.models.Bill || mongoose.model('Bill', billSchema);
const Prescription =
  mongoose.models.Prescription ||
  mongoose.model('Prescription', prescriptionSchema);

async function syncStatus() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB\n');

    const bills = await Bill.find({
      prescription: { $exists: true, $ne: null },
    }).populate('prescription');

    let updatedCount = 0;
    let skippedCount = 0;

    for (const bill of bills) {
      const prescription = bill.prescription;

      if (!prescription) {
        skippedCount++;
        continue;
      }

      let shouldUpdate = false;
      const updates = {};

      // Đồng bộ paymentStatus từ prescription
      if (
        prescription.paymentStatus &&
        prescription.paymentStatus !== bill.paymentStatus
      ) {
        updates.paymentStatus = prescription.paymentStatus;
        shouldUpdate = true;

        // Nếu paymentStatus là paid, set paymentDate nếu chưa có
        if (prescription.paymentStatus === 'paid' && !bill.paymentDate) {
          updates.paymentDate = new Date();
        }
      }

      // Đồng bộ paymentOrderCode nếu có
      if (prescription.paymentOrderCode && !bill.paymentOrderCode) {
        updates.paymentOrderCode = prescription.paymentOrderCode;
        shouldUpdate = true;
      }

      if (shouldUpdate) {
        await Bill.findByIdAndUpdate(bill._id, updates);
        console.log(`✓ Updated bill ${bill.billCode}`);
        console.log(
          `  Status: ${bill.paymentStatus} -> ${updates.paymentStatus}`
        );
        if (updates.paymentDate) {
          console.log(`  PaymentDate: ${updates.paymentDate}`);
        }
        updatedCount++;
      } else {
        skippedCount++;
      }
    }

    console.log('\n--- Summary ---');
    console.log(`✓ Updated: ${updatedCount}`);
    console.log(`⊘ Skipped: ${skippedCount}`);
    console.log(`Total: ${bills.length}`);

    await mongoose.disconnect();
    console.log('\n✓ Disconnected');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

syncStatus();
