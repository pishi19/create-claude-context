#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Patterns to replace
const replacements = [
  // Project name references
  { pattern: /ora-system/g, replacement: '{{PROJECT_NAME}}' },
  { pattern: /Ora System/g, replacement: '{{PROJECT_TITLE}}' },
  { pattern: /Ora Context Index/g, replacement: '{{PROJECT_TITLE}} Context Index' },
  { pattern: /Ora/g, replacement: '{{PROJECT_SHORT_NAME}}' },
  
  // Package manager references
  { pattern: /pnpm test/g, replacement: 'npm test' },
  { pattern: /pnpm type-check/g, replacement: 'npm run type-check' },
  { pattern: /pnpm run type-check/g, replacement: 'npm run type-check' },
  { pattern: /pnpm dev/g, replacement: 'npm run dev' },
  { pattern: /pnpm build/g, replacement: 'npm run build' },
  { pattern: /pnpm lint/g, replacement: 'npm run lint' },
  { pattern: /pnpm /g, replacement: 'npm run ' },
  
  // Hardcoded paths
  { pattern: /\/Users\/air\/Projects\/ora-system/g, replacement: '{{PROJECT_ROOT}}' },
  { pattern: /path\.join\(__dirname, '\.\.', '\.claude'\)/g, replacement: "path.join(process.cwd(), '.claude')" },
  { pattern: /path\.join\(__dirname, '\.\.'/g, replacement: "path.join(process.cwd()" },
  
  // Ora-specific files
  { pattern: /docs\/ora-roadmap-milestones\.md/g, replacement: 'docs/roadmap.md' },
  { pattern: /apps\/web\/app\/ora\/TODO\.md/g, replacement: 'TODO.md' },
  { pattern: /CLAUDE\.md/g, replacement: '{{CLAUDE_MD_PATH}}' },
  
  // Remove Ora-specific features
  { pattern: /workstream/gi, replacement: 'project' },
  { pattern: /workstreams/gi, replacement: 'projects' },
];

// Files to clean
const filesToClean = [
  'lib/core/*.js',
  'lib/templates/base/.claude/*.json'
];

function cleanFile(filePath) {
  console.log(`Cleaning ${filePath}...`);
  let content = fs.readFileSync(filePath, 'utf8');
  
  replacements.forEach(({ pattern, replacement }) => {
    content = content.replace(pattern, replacement);
  });
  
  fs.writeFileSync(filePath, content);
}

// Process all files
filesToClean.forEach(pattern => {
  const files = glob.sync(pattern, { cwd: __dirname + '/../..' });
  files.forEach(file => {
    cleanFile(path.join(__dirname, '../..', file));
  });
});

console.log('✅ Cleaned all Ora-specific references');