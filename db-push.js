import { exec } from 'child_process';

// Function to execute a shell command and return a promise
function executeCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing command: ${error.message}`);
        reject(error);
        return;
      }
      console.log(stdout);
      if (stderr) console.error(stderr);
      resolve(stdout);
    });
  });
}

async function main() {
  try {
    console.log('Running drizzle-kit push to update database schema...');
    
    // Set the NODE_TLS_REJECT_UNAUTHORIZED environment variable to 0 for the command
    const command = 'NODE_TLS_REJECT_UNAUTHORIZED=0 npx drizzle-kit push --force';
    
    await executeCommand(command);
    
    console.log('Database schema updated successfully.');
  } catch (error) {
    console.error('Failed to update database schema:', error);
    process.exit(1);
  }
}

main();