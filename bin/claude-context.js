#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const path = require('path');
const { spawn } = require('child_process');

// Map commands to scripts
const scriptMap = {
  'start': 'claude-session-tracker.js start',
  'end': 'claude-session-tracker.js end',
  'update': 'update-claude-context-v2.js',
  'dashboard': 'claude-dashboard.js',
  'todos': 'extract-todos.js',
  'priorities': 'claude-priorities.js',
  'init': 'claude-auto-init.js',
  'session': 'claude-session-tracker.js'
};

program
  .name('claude-context')
  .description('Claude Context System - Development workflow management')
  .version('1.0.0');

// Add commands dynamically
Object.keys(scriptMap).forEach(cmd => {
  program
    .command(cmd)
    .description(`Run claude:${cmd} command`)
    .action(() => {
      const scriptPath = path.join(__dirname, '..', 'lib', 'core', scriptMap[cmd].split(' ')[0]);
      const args = scriptMap[cmd].split(' ').slice(1);
      
      const child = spawn('node', [scriptPath, ...args], {
        stdio: 'inherit',
        cwd: process.cwd()
      });
      
      child.on('error', (error) => {
        console.error(chalk.red(`Failed to run ${cmd}:`, error.message));
        process.exit(1);
      });
      
      child.on('exit', (code) => {
        process.exit(code);
      });
    });
});

// Add quick status command
program
  .command('status')
  .description('Show quick Claude Context status')
  .action(() => {
    console.log(chalk.cyan('\n🤖 Claude Context Status\n'));
    
    try {
      const fs = require('fs');
      const claudeDir = path.join(process.cwd(), '.claude');
      
      if (!fs.existsSync(claudeDir)) {
        console.log(chalk.yellow('⚠️  Claude Context not initialized in this project'));
        console.log(chalk.white('\nRun: npx create-claude-context\n'));
        return;
      }
      
      // Check for active session
      const sessionFile = path.join(claudeDir, '.session-start');
      if (fs.existsSync(sessionFile)) {
        const startTime = parseInt(fs.readFileSync(sessionFile, 'utf8'));
        const elapsed = Date.now() - startTime;
        const hours = Math.floor(elapsed / 3600000);
        const minutes = Math.floor((elapsed % 3600000) / 60000);
        console.log(chalk.green(`✅ Active session: ${hours}h ${minutes}m`));
      } else {
        console.log(chalk.gray('📴 No active session'));
      }
      
      // Check last update
      const indexFile = path.join(claudeDir, 'index.md');
      if (fs.existsSync(indexFile)) {
        const stats = fs.statSync(indexFile);
        const lastUpdate = new Date(stats.mtime);
        console.log(chalk.blue(`📅 Last update: ${lastUpdate.toLocaleString()}`));
      }
      
      console.log(chalk.white('\n💡 Run "claude-context dashboard" for detailed view\n'));
    } catch (error) {
      console.error(chalk.red('Error getting status:', error.message));
    }
  });

program.parse();