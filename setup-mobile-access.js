#!/usr/bin/env node

import { networkInterfaces } from 'os';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Get local IP address
function getLocalIP() {
  const nets = networkInterfaces();
  const results = [];

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === 'IPv4' && !net.internal) {
        results.push(net.address);
      }
    }
  }

  return results[0] || 'localhost';
}

// Update environment files
function updateEnvFiles(ip) {
  const frontendEnvPath = join(process.cwd(), 'frontend', '.env');
  const backendEnvPath = join(process.cwd(), 'backend', '.env');

  try {
    // Update frontend .env
    let frontendEnv = readFileSync(frontendEnvPath, 'utf8');
    frontendEnv = frontendEnv.replace(
      /VITE_API_URL=http:\/\/localhost:5000\/api\/v1/g,
      `VITE_API_URL=http://${ip}:5000/api/v1`
    );
    frontendEnv = frontendEnv.replace(
      /VITE_SOCKET_URL=http:\/\/localhost:5000/g,
      `VITE_SOCKET_URL=http://${ip}:5000`
    );
    writeFileSync(frontendEnvPath, frontendEnv);

    // Update backend .env
    let backendEnv = readFileSync(backendEnvPath, 'utf8');
    backendEnv = backendEnv.replace(
      /FRONTEND_URL=http:\/\/localhost:5173/g,
      `FRONTEND_URL=http://${ip}:5173`
    );
    writeFileSync(backendEnvPath, backendEnv);

    console.log('✅ Environment files updated successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error updating environment files:', error.message);
    return false;
  }
}

// Main function
function main() {
  console.log('🔧 Setting up mobile access for EXCEL Tutoring Service...\n');

  const localIP = getLocalIP();
  console.log(`📱 Your local IP address: ${localIP}`);

  if (localIP === 'localhost') {
    console.log('⚠️  Could not detect local IP address.');
    console.log('Please manually find your IP address and update the configuration:');
    console.log('- Windows: Run "ipconfig" in Command Prompt');
    console.log('- Mac/Linux: Run "ifconfig" in Terminal');
    console.log('- Look for IPv4 address starting with 192.168. or 10.0.');
    return;
  }

  const success = updateEnvFiles(localIP);

  if (success) {
    console.log('\n🎉 Mobile access setup complete!');
    console.log('\n📋 Next steps:');
    console.log('1. Restart both frontend and backend servers');
    console.log('2. Make sure both devices are on the same WiFi network');
    console.log('3. Allow Node.js through your firewall if prompted');
    console.log(`4. Access from mobile browser: http://${localIP}:5173`);
    console.log('\n🔧 Commands to restart servers:');
    console.log('Backend: cd backend && npm run dev');
    console.log('Frontend: cd frontend && npm run dev');
    console.log('\n⚠️  Security Note: Only use this on trusted networks!');
  }
}

// Run the script
main();