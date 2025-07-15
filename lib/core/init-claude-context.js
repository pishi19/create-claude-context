#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load configuration
const configPath = path.join(claudeDir, 'config.json');
let config = {};
if (fs.existsSync(configPath)) {
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

const projectName = config.project?.name || 'your project';
console.log(`🤖 Initializing Claude Code context for ${projectName}...\n`);

const claudeDir = path.join(process.cwd(), '.claude');
if (!fs.existsSync(claudeDir)) {
  fs.mkdirSync(claudeDir);
  console.log('✅ Created .claude directory');
}

// Check for context files
const contextFile = path.join(claudeDir, 'CONTEXT.md');
const initFile = path.join(process.cwd(), 'init');

if (fs.existsSync(contextFile) && fs.existsSync(initFile)) {
  console.log('📄 Context files found');
  
  // Display key reminders based on project type
  console.log('\n🎯 Key Project Principles:');
  if (config.project?.principles) {
    config.project.principles.forEach(principle => {
      console.log(`  - ${principle}`);
    });
  } else {
    console.log('  - Follow existing code patterns');
    console.log('  - Write comprehensive tests');
    console.log('  - Document your changes');
    console.log('  - Keep code modular and maintainable');
  }
  console.log();
} else {
  console.log('⚠️  Some context files missing. Creating...');
}

console.log('💡 Start new Claude sessions with:');
console.log('   "Check /init for project context"\n');