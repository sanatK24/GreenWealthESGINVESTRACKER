
import fs from 'fs';
import path from 'path';

const dbExportDir = './db-export';
const outputDir = './client/src/data';

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Convert kebab/snake case to pascal case
const toPascalCase = (str: string) => {
  return str
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
};

// Process each JSON file
fs.readdirSync(dbExportDir).forEach(file => {
  if (file.endsWith('.json')) {
    const filePath = path.join(dbExportDir, file);
    const fileName = file.replace('.json', '');
    const outputPath = path.join(outputDir, `${fileName}.tsx`);
    
    // Read JSON content
    const jsonContent = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(jsonContent);
    
    // Create TSX content
    const tsxContent = `// Auto-generated from ${file}
// Do not edit manually

const ${toPascalCase(fileName)} = ${JSON.stringify(data, null, 2)} as const;

export default ${toPascalCase(fileName)};
`;

    // Write TSX file
    fs.writeFileSync(outputPath, tsxContent);
    console.log(`Converted ${file} to ${path.basename(outputPath)}`);
  }
});

console.log('Conversion complete!');
