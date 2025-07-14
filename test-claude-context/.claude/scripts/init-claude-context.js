#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🤖 Initializing Claude Code context for Ora...\n');

// Create .claude directory
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
  
  // Display key reminders
  console.log('\n🎯 Key Ora Principles:');
  console.log('  - Intelligence is INLINE (purple text)');
  console.log('  - Sources are color-coded (green/cyan)');
  console.log('  - Extend existing components');
  console.log('  - Test in Source Lab first');
  console.log('  - Ora is a partner, not a tool\n');
} else {
  console.log('⚠️  Some context files missing. Creating...');
}

console.log('💡 Start new Claude sessions with:');
console.log('   "Check /init for project context"\n');