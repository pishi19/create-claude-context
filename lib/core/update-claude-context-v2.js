#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CLAUDE_DIR = path.join(process.cwd(), '.claude');
const INDEX_PATH = path.join(CLAUDE_DIR, 'index.md');
const CONFIG_PATH = path.join(CLAUDE_DIR, 'config.json');
const CACHE_PATH = path.join(CLAUDE_DIR, '.cache.json');

// Load configuration
function loadConfig() {
  if (fs.existsSync(CONFIG_PATH)) {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  }
  return { context: { maxLines: 100 }, display: { colors: {}, icons: {} } };
}

// Cache management
class ContextCache {
  constructor() {
    this.cache = {};
    this.load();
  }
  
  load() {
    if (fs.existsSync(CACHE_PATH)) {
      try {
        const data = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'));
        this.cache = data.cache || {};
        this.timestamp = data.timestamp || 0;
      } catch (e) {
        this.cache = {};
      }
    } else {
      // Initialize cache file
      this.save();
    }
  }
  
  save() {
    fs.writeFileSync(CACHE_PATH, JSON.stringify({
      cache: this.cache,
      timestamp: Date.now()
    }, null, 2));
  }
  
  get(key, ttl = 300) {
    const item = this.cache[key];
    if (item && (Date.now() - item.timestamp) < ttl * 1000) {
      return item.value;
    }
    return null;
  }
  
  set(key, value) {
    this.cache[key] = {
      value: value,
      timestamp: Date.now()
    };
    this.save();
  }
}

// Enhanced git information with branch awareness
function getGitInfo(config) {
  const cache = new ContextCache();
  const cachedInfo = cache.get('gitInfo', 60);
  if (cachedInfo) return cachedInfo;
  
  try {
    const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    const lastCommit = execSync('git log -1 --pretty=format:"%h %s"', { encoding: 'utf8' }).trim();
    const status = execSync('git status --porcelain', { encoding: 'utf8' }).trim();
    const modifiedFiles = status ? status.split('\n').length : 0;
    
    // Get branch type
    let branchType = 'feature';
    for (const [pattern, settings] of Object.entries(config.branches?.patterns || {})) {
      const regex = new RegExp(pattern.replace('*', '.*'));
      if (regex.test(branch)) {
        branchType = settings.template || 'feature';
        break;
      }
    }
    
    // Get file categories
    const fileCategories = categorizeFiles(status);
    
    // Check for PR info
    let prInfo = null;
    try {
      const prNumber = execSync('gh pr view --json number,title,state 2>/dev/null', { encoding: 'utf8' });
      if (prNumber) {
        prInfo = JSON.parse(prNumber);
      }
    } catch (e) {
      // No PR or gh not installed
    }
    
    const info = { 
      branch, 
      lastCommit, 
      modifiedFiles, 
      branchType,
      fileCategories,
      prInfo
    };
    
    cache.set('gitInfo', info);
    return info;
  } catch (error) {
    return { 
      branch: 'unknown', 
      lastCommit: 'unknown', 
      modifiedFiles: 0,
      branchType: 'feature',
      fileCategories: {}
    };
  }
}

// Categorize modified files
function categorizeFiles(statusOutput) {
  if (!statusOutput) return {};
  
  const categories = {
    ui: [],
    api: [],
    tests: [],
    docs: [],
    config: [],
    other: []
  };
  
  const lines = statusOutput.split('\n');
  lines.forEach(line => {
    const file = line.substring(3).trim();
    if (!file) return;
    
    if (file.includes('components/') || file.endsWith('.tsx')) {
      categories.ui.push(file);
    } else if (file.includes('api/') || file.includes('route.ts')) {
      categories.api.push(file);
    } else if (file.includes('test') || file.endsWith('.spec.ts')) {
      categories.tests.push(file);
    } else if (file.endsWith('.md')) {
      categories.docs.push(file);
    } else if (file.includes('config') || file.endsWith('.json')) {
      categories.config.push(file);
    } else {
      categories.other.push(file);
    }
  });
  
  // Remove empty categories
  Object.keys(categories).forEach(key => {
    if (categories[key].length === 0) delete categories[key];
  });
  
  return categories;
}

// Get session time
function getSessionTime() {
  const sessionFile = path.join(CLAUDE_DIR, '.session-start');
  if (fs.existsSync(sessionFile)) {
    const startTime = parseInt(fs.readFileSync(sessionFile, 'utf8'));
    const elapsed = Date.now() - startTime;
    const hours = Math.floor(elapsed / 3600000);
    const minutes = Math.floor((elapsed % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  }
  return 'Not tracked';
}

// Generate progress bar
function progressBar(percent, width = 20) {
  const filled = Math.floor(width * percent / 100);
  const empty = width - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

// Generate enhanced index content
function generateIndexContent(config) {
  const { branch, lastCommit, modifiedFiles, branchType, fileCategories, prInfo } = getGitInfo(config);
  const { milestone, progress } = require('./update-claude-context.js').getCurrentMilestone();
  const bugs = require('./sync-milestone.js').generateBugReport();
  const sessionTime = getSessionTime();
  const now = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const icons = config.display?.icons || {};
  const bugIcon = bugs.length > 0 ? icons.error || '❌' : icons.success || '✅';
  
  let content = `# Ora Context Index
*Last Updated: ${now} | Session: ${sessionTime}*

## 🚀 Quick Status
- **Current Work**: ${milestone}
- **Progress**: ${progress} ${progressBar(parseInt(progress) || 0)}
- **Active Bug**: ${bugIcon} ${bugs.length > 0 ? `${bugs.length} issues` : 'All clear'}
- **Branch**: ${branch} (${branchType} mode)
- **Modified Files**: ${modifiedFiles}`;

  if (prInfo) {
    content += `\n- **PR**: #${prInfo.number} - ${prInfo.title} (${prInfo.state})`;
  }

  content += `\n\n## 📍 Where We Left Off
Last commit: ${lastCommit}`;

  if (modifiedFiles > 0) {
    content += `\n\n### Uncommitted Changes by Category`;
    for (const [category, files] of Object.entries(fileCategories)) {
      content += `\n- **${category}**: ${files.length} files`;
      if (files.length <= 3) {
        files.forEach(f => content += `\n  - ${path.basename(f)}`);
      }
    }
  }

  // Branch-specific context
  const branchConfig = config.branches?.patterns?.[`${branchType}/*`] || {};
  if (branchConfig.contextFiles) {
    content += `\n\n## 📚 Relevant Documentation`;
    branchConfig.contextFiles.forEach(file => {
      content += `\n- ${file}`;
    });
  }

  content += `\n\n## 🔧 Context Commands
- \`npm run claude:dashboard\` - Interactive dashboard
- \`cat .claude/current-bug.md\` - Active bug details
- \`cat .claude/session-log.md\` - Recent work sessions
- \`node scripts/extract-todos.js\` - Find all TODOs

## 💡 Quick Checks
- Run tests: \`pnpm test\`
- Check types: \`pnpm type-check\`
- Dev server: \`pnpm dev\`
- Update context: \`npm run claude:update\``;

  if (branchConfig.checks) {
    content += `\n\n## ✅ Required Checks (${branchType} mode)`;
    branchConfig.checks.forEach(check => {
      content += `\n- [ ] ${check}`;
    });
  }

  return content;
}

// Main execution
function main() {
  const config = loadConfig();
  console.log('📝 Updating Claude context (v2)...');
  
  // Track session start if not already
  const sessionFile = path.join(CLAUDE_DIR, '.session-start');
  if (!fs.existsSync(sessionFile)) {
    fs.writeFileSync(sessionFile, Date.now().toString());
  }
  
  const content = generateIndexContent(config);
  fs.writeFileSync(INDEX_PATH, content, 'utf8');
  
  console.log('✅ Context updated successfully!');
  
  // Show enhanced summary
  const { branch, modifiedFiles, branchType } = getGitInfo(config);
  console.log(`\n📊 Summary:`);
  console.log(`  Branch: ${branch} (${branchType} mode)`);
  console.log(`  Modified files: ${modifiedFiles}`);
  console.log(`  Session time: ${getSessionTime()}`);
  
  // Warnings
  if (modifiedFiles > 20) {
    console.log('\n⚠️  Warning: Many uncommitted changes!');
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { getGitInfo, categorizeFiles };