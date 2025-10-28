#!/usr/bin/env node

/**
 * Script to fix formatting issues and clean up legacy directories
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing code formatting and cleaning up legacy directories...');

// Function to safely execute commands
function safeExec(command, options = {}) {
  try {
    console.log(`Running: ${command}`);
    execSync(command, { stdio: 'inherit', ...options });
    return true;
  } catch (error) {
    console.error(`Failed to run: ${command}`);
    console.error(error.message);
    return false;
  }
}

// Function to check if directory exists
function dirExists(dirPath) {
  try {
    return fs.statSync(dirPath).isDirectory();
  } catch {
    return false;
  }
}

// Clean up legacy directories if they exist
const legacyDirs = ['BACKEND', 'Frontend'];
legacyDirs.forEach(dir => {
  if (dirExists(dir)) {
    console.log(`⚠️  Warning: Legacy directory '${dir}' found. Please manually review and remove if no longer needed.`);
  }
});

// Format code in smaller batches to avoid command line length issues
console.log('📝 Formatting JavaScript files...');
safeExec('prettier --write "backend/**/*.js"');
safeExec('prettier --write "frontend/src/**/*.{js,jsx}"');

console.log('🎨 Formatting CSS files...');
safeExec('prettier --write "frontend/src/**/*.{css,scss}"');

console.log('📄 Formatting documentation files...');
safeExec('prettier --write "*.{json,md}"');
safeExec('prettier --write "**/README.md"');

console.log('🔍 Running ESLint fixes...');
safeExec('npm run lint:fix:backend');
safeExec('npm run lint:fix:frontend');

console.log('✅ Code formatting and cleanup complete!');