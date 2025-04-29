
import fs from 'fs';
import { join } from 'path';
import archiver from 'archiver';

const distDir = 'dist';
const outputFile = join(distDir, 'project.zip');

// Create output directory if it doesn't exist
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

// Create a file to stream archive data to
const output = fs.createWriteStream(outputFile);
const archive = archiver('zip', {
  zlib: { level: 9 } // Sets the compression level
});

// Listen for all archive data to be written
output.on('close', function() {
  console.log('Archive created successfully');
  console.log('Total bytes:', archive.pointer());
});

// Handle archive warnings
archive.on('warning', function(err) {
  if (err.code === 'ENOENT') {
    console.warn('Warning:', err);
  } else {
    throw err;
  }
});

// Handle archive errors
archive.on('error', function(err) {
  throw err;
});

// Pipe archive data to the file
archive.pipe(output);

// Add files and directories
const filesToInclude = [
  'client',
  'server',
  'shared',
  'db',
  'package.json',
  'tsconfig.json',
  'drizzle.config.ts',
  'tailwind.config.ts',
  'postcss.config.js',
  'components.json'
];

filesToInclude.forEach(file => {
  if (fs.existsSync(file)) {
    if (fs.lstatSync(file).isDirectory()) {
      archive.directory(file, file);
    } else {
      archive.file(file, { name: file });
    }
  }
});

// Finalize the archive
archive.finalize();
