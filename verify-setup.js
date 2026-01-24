#!/usr/bin/env node
/**
 * OpenCRM Health Check Script
 * Run with: node verify-setup.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 OpenCRM Setup Verification\n');

let hasErrors = false;
const warnings = [];

// Check 1: .env file exists
if (fs.existsSync('.env')) {
    console.log('✅ .env file found');
    
    // Check env variables
    const envContent = fs.readFileSync('.env', 'utf8');
    const requiredVars = [
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        'RESEND_API_KEY',
        'NEXT_PUBLIC_GEMINI_API_KEY'
    ];
    
    requiredVars.forEach(varName => {
        if (envContent.includes(varName) && !envContent.includes(`${varName}=\n`)) {
            console.log(`✅ ${varName} configured`);
        } else {
            console.log(`⚠️  ${varName} missing or empty`);
            warnings.push(`Configure ${varName} in .env file`);
        }
    });
} else {
    console.log('❌ .env file not found');
    hasErrors = true;
}

// Check 2: node_modules exists
if (fs.existsSync('node_modules')) {
    console.log('✅ Dependencies installed');
} else {
    console.log('❌ node_modules not found - run: npm install');
    hasErrors = true;
}

// Check 3: Required files
const requiredFiles = [
    'package.json',
    'next.config.ts',
    'tsconfig.json',
    'lib/supabaseClient.ts',
    'components/Providers.tsx'
];

requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file} exists`);
    } else {
        console.log(`❌ ${file} missing`);
        hasErrors = true;
    }
});

// Check 4: Migrations
const migrationsDir = 'supabase/migrations';
if (fs.existsSync(migrationsDir)) {
    const migrations = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));
    console.log(`✅ Found ${migrations.length} database migration(s)`);
} else {
    console.log('⚠️  Migrations directory not found');
    warnings.push('Ensure supabase/migrations directory exists');
}

// Summary
console.log('\n' + '='.repeat(50));
if (hasErrors) {
    console.log('❌ Setup has errors - please fix the issues above');
    process.exit(1);
} else if (warnings.length > 0) {
    console.log('⚠️  Setup complete with warnings:');
    warnings.forEach(w => console.log(`   - ${w}`));
    console.log('\n💡 Run: npm run dev');
} else {
    console.log('✅ All checks passed! Your OpenCRM is ready.');
    console.log('\n🚀 Run: npm run dev');
}
