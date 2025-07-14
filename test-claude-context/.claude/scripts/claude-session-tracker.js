#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CLAUDE_DIR = path.join(process.cwd(), '.claude');
const SESSION_FILE = path.join(CLAUDE_DIR, '.session-start');
const METRICS_FILE = path.join(CLAUDE_DIR, '.session-metrics.json');

// Initialize or update session tracking
function trackSession(action = 'update') {
  if (!fs.existsSync(CLAUDE_DIR)) {
    fs.mkdirSync(CLAUDE_DIR, { recursive: true });
  }
  
  if (action === 'start') {
    // Start new session
    fs.writeFileSync(SESSION_FILE, Date.now().toString());
    fs.writeFileSync(METRICS_FILE, JSON.stringify({
      startTime: Date.now(),
      commits: 0,
      filesModified: new Set(),
      commands: [],
      breaks: []
    }));
    console.log('📊 Session tracking started');
    return;
  }
  
  if (action === 'end') {
    // End session and generate report
    if (!fs.existsSync(SESSION_FILE)) {
      console.log('❌ No active session to end');
      return;
    }
    
    const report = generateSessionReport();
    console.log(report);
    
    // Archive session
    const archiveDir = path.join(CLAUDE_DIR, 'sessions');
    if (!fs.existsSync(archiveDir)) {
      fs.mkdirSync(archiveDir);
    }
    
    const sessionDate = new Date().toISOString().split('T')[0];
    const archivePath = path.join(archiveDir, `session-${sessionDate}.json`);
    
    const metrics = loadMetrics();
    metrics.endTime = Date.now();
    metrics.report = report;
    
    fs.writeFileSync(archivePath, JSON.stringify(metrics, null, 2));
    
    // Clean up
    fs.unlinkSync(SESSION_FILE);
    fs.unlinkSync(METRICS_FILE);
    
    console.log(`\n📁 Session archived: ${archivePath}`);
    return;
  }
  
  // Update metrics
  updateMetrics();
}

// Load current metrics
function loadMetrics() {
  if (fs.existsSync(METRICS_FILE)) {
    const data = JSON.parse(fs.readFileSync(METRICS_FILE, 'utf8'));
    // Handle filesModified - could be array or missing
    if (Array.isArray(data.filesModified)) {
      data.filesModified = new Set(data.filesModified);
    } else {
      data.filesModified = new Set();
    }
    return data;
  }
  return {
    startTime: Date.now(),
    commits: 0,
    filesModified: new Set(),
    commands: [],
    breaks: []
  };
}

// Save metrics
function saveMetrics(metrics) {
  const toSave = {
    ...metrics,
    filesModified: Array.from(metrics.filesModified)
  };
  fs.writeFileSync(METRICS_FILE, JSON.stringify(toSave, null, 2));
}

// Update session metrics
function updateMetrics() {
  const metrics = loadMetrics();
  
  // Count commits since session start
  try {
    const sessionStart = new Date(metrics.startTime).toISOString();
    const commits = execSync(
      `git log --since="${sessionStart}" --oneline | wc -l`,
      { encoding: 'utf8' }
    ).trim();
    metrics.commits = parseInt(commits) || 0;
  } catch (e) {
    // Git command failed
  }
  
  // Track modified files
  try {
    const modifiedFiles = execSync('git diff --name-only', { encoding: 'utf8' })
      .trim()
      .split('\n')
      .filter(Boolean);
    
    modifiedFiles.forEach(file => metrics.filesModified.add(file));
  } catch (e) {
    // No changes
  }
  
  // Detect breaks (gaps > 30 minutes)
  const now = Date.now();
  const lastActivity = metrics.lastActivity || metrics.startTime;
  if (now - lastActivity > 30 * 60 * 1000) {
    metrics.breaks.push({
      start: lastActivity,
      end: now,
      duration: now - lastActivity
    });
  }
  
  metrics.lastActivity = now;
  saveMetrics(metrics);
}

// Generate session report
function generateSessionReport() {
  if (!fs.existsSync(SESSION_FILE)) {
    return 'No active session';
  }
  
  const metrics = loadMetrics();
  const startTime = parseInt(fs.readFileSync(SESSION_FILE, 'utf8'));
  const totalTime = Date.now() - startTime;
  
  // Calculate productive time (exclude breaks)
  const breakTime = metrics.breaks.reduce((sum, b) => sum + b.duration, 0);
  const productiveTime = totalTime - breakTime;
  
  // Format times
  const formatDuration = (ms) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };
  
  // Calculate velocity
  const velocity = {
    commitsPerHour: (metrics.commits / (productiveTime / 3600000)).toFixed(1),
    filesPerCommit: metrics.commits > 0 ? 
      (metrics.filesModified.size / metrics.commits).toFixed(1) : 0
  };
  
  // Generate report
  let report = `
📊 Session Report
═════════════════

⏱️  Duration: ${formatDuration(totalTime)}
⚡ Productive: ${formatDuration(productiveTime)}
☕ Breaks: ${metrics.breaks.length} (${formatDuration(breakTime)})

📈 Metrics:
- Commits: ${metrics.commits}
- Files touched: ${metrics.filesModified.size}
- Velocity: ${velocity.commitsPerHour} commits/hour
- Scope: ${velocity.filesPerCommit} files/commit

🎯 Focus Areas:`;
  
  // Categorize files
  const categories = {};
  metrics.filesModified.forEach(file => {
    const category = getFileCategory(file);
    categories[category] = (categories[category] || 0) + 1;
  });
  
  Object.entries(categories)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => {
      report += `\n  - ${cat}: ${count} files`;
    });
  
  // Performance rating
  const rating = getPerformanceRating(metrics, productiveTime);
  report += `\n\n${rating.icon} Performance: ${rating.text}`;
  
  return report;
}

// Get file category
function getFileCategory(file) {
  if (file.includes('test')) return 'Tests';
  if (file.endsWith('.tsx') || file.includes('components/')) return 'UI';
  if (file.includes('api/') || file.includes('route.ts')) return 'API';
  if (file.endsWith('.md')) return 'Docs';
  if (file.includes('config') || file.endsWith('.json')) return 'Config';
  return 'Other';
}

// Get performance rating
function getPerformanceRating(metrics, productiveTime) {
  const hoursWorked = productiveTime / 3600000;
  const commitsPerHour = metrics.commits / hoursWorked;
  
  if (commitsPerHour >= 2) return { icon: '🚀', text: 'Excellent' };
  if (commitsPerHour >= 1) return { icon: '✅', text: 'Good' };
  if (commitsPerHour >= 0.5) return { icon: '📊', text: 'Steady' };
  return { icon: '🐌', text: 'Slow' };
}

// CLI handling
const args = process.argv.slice(2);
const action = args[0] || 'update';

trackSession(action);

module.exports = { trackSession, generateSessionReport };