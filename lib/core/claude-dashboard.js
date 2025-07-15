#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m'
};

// Box drawing characters
const box = {
  tl: '╔', tr: '╗', bl: '╚', br: '╝',
  h: '═', v: '║', t: '╦', b: '╩',
  l: '╠', r: '╣', c: '╬'
};

// Clear screen and move cursor
function clearScreen() {
  console.clear();
  process.stdout.write('\x1b[H');
}

// Draw a box
function drawBox(title, content, width = 60) {
  const lines = content.split('\n');
  const titleStr = title ? ` ${title} ` : '';
  
  // Top border
  console.log(box.tl + titleStr + box.h.repeat(width - titleStr.length - 2) + box.tr);
  
  // Content
  lines.forEach(line => {
    const padding = width - line.replace(/\x1b\[[0-9;]*m/g, '').length - 2;
    console.log(box.v + line + ' '.repeat(Math.max(0, padding)) + box.v);
  });
  
  // Bottom border
  console.log(box.bl + box.h.repeat(width - 2) + box.br);
}

// Progress bar with percentage
function progressBar(percent, width = 30, showPercent = true) {
  const filled = Math.floor(width * percent / 100);
  const empty = width - filled;
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  return showPercent ? `${bar} ${percent}%` : bar;
}

// Format file size
function formatSize(bytes) {
  if (bytes < 1024) return bytes + 'B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'KB';
  return (bytes / (1024 * 1024)).toFixed(1) + 'MB';
}

// Get system status
function getSystemStatus() {
  const status = {
    branch: 'unknown',
    commits: 0,
    modified: 0,
    ahead: 0,
    behind: 0,
    diskUsage: '0MB'
  };
  
  try {
    status.branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    status.modified = parseInt(execSync('git status --porcelain | wc -l', { encoding: 'utf8' }).trim());
    
    // Get ahead/behind status
    const tracking = execSync('git status -sb', { encoding: 'utf8' }).split('\n')[0];
    const aheadMatch = tracking.match(/ahead (\d+)/);
    const behindMatch = tracking.match(/behind (\d+)/);
    
    if (aheadMatch) status.ahead = parseInt(aheadMatch[1]);
    if (behindMatch) status.behind = parseInt(behindMatch[1]);
    
    // Get disk usage
    const projectSize = execSync('du -sh . | cut -f1', { encoding: 'utf8' }).trim();
    status.diskUsage = projectSize;
  } catch (e) {
    // Git commands failed
  }
  
  return status;
}

// Get milestone info
function getMilestoneInfo() {
  try {
    const { getCurrentMilestone } = require('./update-claude-context.js');
    return getCurrentMilestone();
  } catch (e) {
    return { milestone: 'Unknown', progress: 'Unknown' };
  }
}

// Get recent activity
function getRecentActivity() {
  const activities = [];
  
  try {
    // Recent commits
    const commits = execSync('git log --oneline -5', { encoding: 'utf8' })
      .trim()
      .split('\n')
      .filter(Boolean);
    
    commits.forEach(commit => {
      const [hash, ...msg] = commit.split(' ');
      activities.push({
        type: 'commit',
        icon: '📝',
        text: msg.join(' ').substring(0, 40) + '...',
        time: 'recent'
      });
    });
  } catch (e) {
    // No commits
  }
  
  return activities.slice(0, 5);
}

// Get health checks
function getHealthChecks() {
  const checks = [];
  
  // TypeScript check
  try {
    const tsErrors = execSync('npm run type-check 2>&1 | grep -c "error TS" || true', { encoding: 'utf8' }).trim();
    checks.push({
      name: 'TypeScript',
      status: parseInt(tsErrors) === 0 ? 'pass' : 'fail',
      message: parseInt(tsErrors) === 0 ? 'No errors' : `${tsErrors} errors`,
      icon: parseInt(tsErrors) === 0 ? '✅' : '❌'
    });
  } catch (e) {
    checks.push({
      name: 'TypeScript',
      status: 'unknown',
      message: 'Not checked',
      icon: '❓'
    });
  }
  
  // Test status
  checks.push({
    name: 'Tests',
    status: 'unknown',
    message: 'Run npm test',
    icon: '🧪'
  });
  
  // Lint status
  checks.push({
    name: 'Lint',
    status: 'unknown',
    message: 'Run npm run lint',
    icon: '🔍'
  });
  
  return checks;
}

// Get session info
function getSessionInfo() {
  const sessionFile = path.join(process.cwd(), '.claude', '.session-start');
  
  if (fs.existsSync(sessionFile)) {
    const startTime = parseInt(fs.readFileSync(sessionFile, 'utf8'));
    const elapsed = Date.now() - startTime;
    const hours = Math.floor(elapsed / 3600000);
    const minutes = Math.floor((elapsed % 3600000) / 60000);
    
    return {
      active: true,
      duration: `${hours}h ${minutes}m`,
      startTime: new Date(startTime).toLocaleTimeString()
    };
  }
  
  return {
    active: false,
    duration: 'No session',
    startTime: 'Not started'
  };
}

// Main dashboard
function showDashboard() {
  clearScreen();
  
  const status = getSystemStatus();
  const milestone = getMilestoneInfo();
  const activities = getRecentActivity();
  const checks = getHealthChecks();
  const session = getSessionInfo();
  
  // Header
  console.log(`${colors.bright}${colors.cyan}╔════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}║            🤖 Claude Context Dashboard v2.0                ║${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}╚════════════════════════════════════════════════════════════╝${colors.reset}\n`);
  
  // Two column layout
  const leftColumn = [];
  const rightColumn = [];
  
  // Git Status (Left)
  leftColumn.push(`${colors.bright}📊 Git Status${colors.reset}`);
  leftColumn.push(`Branch: ${colors.yellow}${status.branch}${colors.reset}`);
  leftColumn.push(`Modified: ${status.modified > 0 ? colors.red : colors.green}${status.modified} files${colors.reset}`);
  if (status.ahead > 0) leftColumn.push(`Ahead: ${colors.green}↑${status.ahead}${colors.reset}`);
  if (status.behind > 0) leftColumn.push(`Behind: ${colors.red}↓${status.behind}${colors.reset}`);
  leftColumn.push('');
  
  // Milestone Progress (Left)
  leftColumn.push(`${colors.bright}🎯 Milestone Progress${colors.reset}`);
  leftColumn.push(`${milestone.milestone}`);
  leftColumn.push(progressBar(parseInt(milestone.progress) || 0, 25));
  leftColumn.push('');
  
  // Session Info (Right)
  rightColumn.push(`${colors.bright}⏱️  Session${colors.reset}`);
  rightColumn.push(`Status: ${session.active ? colors.green + 'Active' : colors.dim + 'Inactive'}${colors.reset}`);
  rightColumn.push(`Duration: ${session.duration}`);
  rightColumn.push(`Started: ${session.startTime}`);
  rightColumn.push('');
  
  // Health Checks (Right)
  rightColumn.push(`${colors.bright}🏥 Health Checks${colors.reset}`);
  checks.forEach(check => {
    const color = check.status === 'pass' ? colors.green : 
                  check.status === 'fail' ? colors.red : colors.dim;
    rightColumn.push(`${check.icon} ${check.name}: ${color}${check.message}${colors.reset}`);
  });
  
  // Print two columns
  const maxLines = Math.max(leftColumn.length, rightColumn.length);
  for (let i = 0; i < maxLines; i++) {
    const left = leftColumn[i] || '';
    const right = rightColumn[i] || '';
    const leftClean = left.replace(/\x1b\[[0-9;]*m/g, '');
    const padding = 35 - leftClean.length;
    console.log(left + ' '.repeat(Math.max(0, padding)) + right);
  }
  
  console.log('');
  
  // Recent Activity
  drawBox('Recent Activity', activities.map(a => 
    `${a.icon} ${a.text}`
  ).join('\n') || 'No recent activity');
  
  // Commands
  console.log(`\n${colors.bright}⚡ Quick Commands:${colors.reset}`);
  console.log(`  ${colors.cyan}r${colors.reset} - Refresh dashboard`);
  console.log(`  ${colors.cyan}u${colors.reset} - Update context`);
  console.log(`  ${colors.cyan}t${colors.reset} - Run tests`);
  console.log(`  ${colors.cyan}c${colors.reset} - Type check`);
  console.log(`  ${colors.cyan}q${colors.reset} - Quit`);
  
  // Status line
  console.log(`\n${colors.dim}Last updated: ${new Date().toLocaleTimeString()} | Press key for command${colors.reset}`);
}

// Interactive mode
function startInteractive() {
  showDashboard();
  
  // Check if running in TTY mode
  if (!process.stdin.isTTY) {
    console.log('\n💡 Run directly in terminal for interactive mode');
    process.exit(0);
  }
  
  // Set up key handling
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  
  process.stdin.on('data', (key) => {
    if (key === 'q' || key === '\x03') { // q or Ctrl+C
      console.log('\n👋 Goodbye!');
      process.exit(0);
    }
    
    if (key === 'r') {
      showDashboard();
    }
    
    if (key === 'u') {
      console.log('\n📝 Updating context...');
      execSync('npm run claude:update', { stdio: 'inherit' });
      setTimeout(showDashboard, 1000);
    }
    
    if (key === 't') {
      console.log('\n🧪 Running tests...');
      try {
        execSync('npm test', { stdio: 'inherit' });
      } catch (e) {
        // Tests failed
      }
      setTimeout(showDashboard, 1000);
    }
    
    if (key === 'c') {
      console.log('\n🔍 Type checking...');
      try {
        execSync('npm run type-check', { stdio: 'inherit' });
      } catch (e) {
        // Type check failed
      }
      setTimeout(showDashboard, 1000);
    }
  });
  
  // Auto-refresh every 30 seconds
  setInterval(showDashboard, 30000);
}

// Start dashboard
if (require.main === module) {
  startInteractive();
}

module.exports = { showDashboard };