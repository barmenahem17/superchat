#!/usr/bin/env node
require('dotenv').config();

console.log('🧪 Testing Environment Variables...');
console.log('=====================================');

const requiredVars = [
  'DATABASE_URL',
  'FX_NOW',
  'TWELVEDATA_KEY',
  'NODE_ENV'
];

let allFound = true;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    // Mask sensitive values
    const displayValue = varName === 'TWELVEDATA_KEY' 
      ? `${value.substring(0, 8)}...${value.substring(value.length - 4)}`
      : value;
    console.log(`✅ ${varName}: ${displayValue}`);
  } else {
    console.log(`❌ ${varName}: NOT FOUND`);
    allFound = false;
  }
});

console.log('=====================================');
if (allFound) {
  console.log('🎉 All environment variables loaded successfully!');
  process.exit(0);
} else {
  console.log('💥 Some environment variables are missing!');
  process.exit(1);
}
