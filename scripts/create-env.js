#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const envContent = `# Database
DATABASE_URL="file:./dev.db"

# Fallback FX rate
FX_NOW=3.70

# TwelveData API Key
TWELVEDATA_KEY=63717df61b5b435480466a619bd360f9

# Node Environment
NODE_ENV=development
`;

const envPath = path.join(process.cwd(), '.env');

fs.writeFileSync(envPath, envContent);
console.log('✅ .env file created successfully!');
console.log('📁 Location:', envPath);
console.log('🔑 TWELVEDATA_KEY configured');
