// This is a startup script for Railway deployment
const { spawn } = require('child_process');
const path = require('path');

// Start the frontend
const frontend = spawn('npm', ['run', 'start'], {
  cwd: path.join(__dirname),
  stdio: 'inherit'
});

// Start the backend
const backend = spawn('npm', ['run', 'start'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit'
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Stopping services...');
  frontend.kill('SIGINT');
  backend.kill('SIGINT');
  process.exit(0);
});

// Log process events
frontend.on('exit', (code) => {
  console.log(`Frontend process exited with code ${code}`);
  if (code !== 0 && !frontend.killed) {
    console.log('Restarting frontend...');
    spawn('npm', ['run', 'start'], {
      cwd: path.join(__dirname),
      stdio: 'inherit'
    });
  }
});

backend.on('exit', (code) => {
  console.log(`Backend process exited with code ${code}`);
  if (code !== 0 && !backend.killed) {
    console.log('Restarting backend...');
    spawn('npm', ['run', 'start'], {
      cwd: path.join(__dirname, 'backend'),
      stdio: 'inherit'
    });
  }
});

console.log('BookLendiverse services started!'); 