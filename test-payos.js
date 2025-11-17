// Quick test script to verify PayOS credentials
const { PayOS } = require('@payos/node');

console.log('Testing PayOS credentials...\n');

console.log('Environment variables:');
console.log('PAYOS_CLIENT_ID:', process.env.PAYOS_CLIENT_ID || 'NOT SET');
console.log('PAYOS_API_KEY:', process.env.PAYOS_API_KEY || 'NOT SET');
console.log(
  'PAYOS_CHECKSUM_KEY:',
  process.env.PAYOS_CHECKSUM_KEY ? 'SET' : 'NOT SET'
);
console.log('');

try {
  const payos = new PayOS({
    clientId:
      process.env.PAYOS_CLIENT_ID || '305fabc3-e3e2-46f1-9d02-3a1dc3f06275',
    apiKey: process.env.PAYOS_API_KEY || '6f2761d0-0a34-408c-b78a-1e23331a03fe',
    checksumKey:
      process.env.PAYOS_CHECKSUM_KEY ||
      '519ff31cff7e987d9b0f06c27e8de01afc7eacd052cf01b6a831a31c65c6e76e',
  });

  console.log('✓ PayOS initialized successfully');
  console.log('');

  // Test creating a payment link
  const testPayment = {
    orderCode: Number(String(Date.now()).slice(-6)),
    amount: 50000,
    description: 'Test payment',
    returnUrl: 'http://localhost:3000/test',
    cancelUrl: 'http://localhost:3000/test',
  };

  console.log('Creating test payment with data:', testPayment);
  console.log('');

  payos.paymentRequests
    .create(testPayment)
    .then(result => {
      console.log('✓ Payment link created successfully!');
      console.log('Checkout URL:', result.checkoutUrl);
    })
    .catch(error => {
      console.error('✗ Payment creation failed:');
      console.error('Error:', error.message);
      if (error.response) {
        console.error('Response:', error.response.data);
      }
    });
} catch (error) {
  console.error('✗ Failed to initialize PayOS:');
  console.error(error);
}
