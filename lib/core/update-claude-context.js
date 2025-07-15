#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CLAUDE_DIR = path.join(process.cwd(), '.claude');
const INDEX_PATH = path.join(CLAUDE_DIR, 'index.md');
const CONFIG_PATH = path.join(CLAUDE_DIR, 'config.json');

// Load configuration
function loadConfig() {
  if (fs.existsSync(CONFIG_PATH)) {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  }
  return { paths: { roadmap: 'docs/roadmap.md' } };
}

const config = loadConfig();
const ROADMAP_PATH = path.join(process.cwd(), config.paths?.roadmap || 'docs/roadmap.md');

// Ensure .claude directory exists
if (!fs.existsSync(CLAUDE_DIR)) {
  fs.mkdirSync(CLAUDE_DIR, { recursive: true });
}

// Get git information
function getGitInfo() {
  try {
    const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    const lastCommit = execSync('git log -1 --pretty=format:"%h %s"', { encoding: 'utf8' }).trim();
    const status = execSync('git status --porcelain', { encoding: 'utf8' }).trim();
    const modifiedFiles = status ? status.split('\n').length : 0;
    
    return { branch, lastCommit, modifiedFiles };
  } catch (error) {
    return { branch: 'unknown', lastCommit: 'unknown', modifiedFiles: 0 };
  }
}

// Extract current milestone from roadmap
function getCurrentMilestone() {
  try {
    if (fs.existsSync(ROADMAP_PATH)) {
      const content = fs.readFileSync(ROADMAP_PATH, 'utf8');
      const activeMatch = content.match(/\*\*Active Milestone\*\*:\s*(.+)/);
      const progressMatch = content.match(/\*\*Progress\*\*:\s*(.+)/);
      
      return {
        milestone: activeMatch ? activeMatch[1].trim() : 'Unknown',
        progress: progressMatch ? progressMatch[1].trim() : 'Unknown'
      };
    }
  } catch (error) {
    console.error('Error reading roadmap:', error.message);
  }
  
  return { milestone: 'Unknown', progress: 'Unknown' };
}

// Find active bugs in recent logs
function findActiveBugs() {
  const bugs = [];
  const logDirs = [
    path.join(process.cwd(), 'logs'),
    path.join(process.cwd(), 'apps', 'web', 'logs')
  ];
  
  for (const logDir of logDirs) {
    if (fs.existsSync(logDir)) {
      try {
        const recentErrors = execSync(
          `find ${logDir} -name "*.log" -mtime -1 -exec grep -l "ERROR\\|CRITICAL" {} \\; | head -5`,
          { encoding: 'utf8' }
        ).trim();
        
        if (recentErrors) {
          bugs.push('Recent errors detected in logs');
        }
      } catch (error) {
        // No errors found
      }
    }
  }
  
  // Check for TODO/FIXME in changed files
  try {
    const changedFiles = execSync('git diff --name-only', { encoding: 'utf8' }).trim();
    if (changedFiles) {
      const todoCount = execSync(
        `git diff | grep -E "\\+.*TODO|\\+.*FIXME|\\+.*BUG" | wc -l`,
        { encoding: 'utf8' }
      ).trim();
      
      if (parseInt(todoCount) > 0) {
        bugs.push(`${todoCount} new TODOs/FIXMEs in uncommitted changes`);
      }
    }
  } catch (error) {
    // Ignore errors
  }
  
  return bugs.length > 0 ? bugs[0] : 'None critical';
}

// Generate updated index content
function generateIndexContent() {
  const { branch, lastCommit, modifiedFiles } = getGitInfo();
  const { milestone, progress } = getCurrentMilestone();
  const activeBug = findActiveBugs();
  const now = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const projectName = config.project?.name;
  return `# ${projectName || 'Project'} Context Index
*Last Updated: ${now}*

## 🚀 Quick Status
- **Current Work**: ${milestone}
- **Progress**: ${progress}
- **Active Bug**: ${activeBug}
- **Branch**: ${branch}
- **Modified Files**: ${modifiedFiles}

## 📍 Where We Left Off
Last commit: ${lastCommit}

${modifiedFiles > 0 ? `### Uncommitted Changes
You have ${modifiedFiles} modified files. Run \`git status\` for details.
` : ''}
## 🔧 Context Commands
Only load what you need:
- \`cat .claude/current-bug.md\` - Active bug details
- \`cat .claude/session-log.md\` - Recent work sessions
- \`grep "TODO" .claude/session-log.md\` - Pending tasks

## 💡 Quick Checks
- Run tests: \`npm test -- --watch=false\`
- Check types: \`npm run type-check\`
- Dev server: \`npm run dev\`
- Update context: \`npm run claude:update\``;
}

// Main execution
function main() {
  console.log('📝 Updating Claude context...');
  
  const content = generateIndexContent();
  fs.writeFileSync(INDEX_PATH, content, 'utf8');
  
  console.log('✅ Context updated successfully!');
  console.log(`📍 ${INDEX_PATH}`);
  
  // Show summary
  const { branch, modifiedFiles } = getGitInfo();
  console.log(`\n📊 Summary:`);
  console.log(`  Branch: ${branch}`);
  console.log(`  Modified files: ${modifiedFiles}`);
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { getGitInfo, getCurrentMilestone, findActiveBugs };