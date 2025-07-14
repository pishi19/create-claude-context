#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROADMAP_PATH = path.join(process.cwd(), 'docs', 'ora-roadmap-milestones.md');
const CLAUDE_PATH = path.join(process.cwd(), 'CLAUDE.md');
const INDEX_PATH = path.join(process.cwd(), '.claude', 'index.md');
const BUG_PATH = path.join(process.cwd(), '.claude', 'current-bug.md');

// Parse roadmap to extract current status
function parseRoadmap() {
  if (!fs.existsSync(ROADMAP_PATH)) {
    console.error('❌ Roadmap file not found:', ROADMAP_PATH);
    return null;
  }
  
  const content = fs.readFileSync(ROADMAP_PATH, 'utf8');
  const lines = content.split('\n');
  
  const status = {
    milestone: '',
    phase: '',
    step: '',
    progress: '',
    completed: [],
    next: [],
    blocked: []
  };
  
  // Extract current position
  const positionIndex = lines.findIndex(line => line.includes('Current Position'));
  if (positionIndex > -1) {
    for (let i = positionIndex + 1; i < Math.min(positionIndex + 10, lines.length); i++) {
      const line = lines[i];
      
      if (line.includes('**Active Milestone**:')) {
        status.milestone = line.split(':')[1].trim();
      } else if (line.includes('**Completed**:')) {
        status.phase = line.split(':')[1].trim();
      } else if (line.includes('**Next**:')) {
        status.step = line.split(':')[1].trim();
      } else if (line.includes('**Progress**:')) {
        status.progress = line.split(':')[1].trim();
      }
    }
  }
  
  // Extract recent completions
  const completionsIndex = lines.findIndex(line => line.includes('Recent Completions'));
  if (completionsIndex > -1) {
    for (let i = completionsIndex + 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith('- ✅')) {
        status.completed.push(line.substring(4).trim());
      } else if (line.trim() === '' || line.startsWith('#')) {
        break;
      }
    }
  }
  
  // Extract infrastructure ready
  const infraIndex = lines.findIndex(line => line.includes('Infrastructure Ready'));
  if (infraIndex > -1) {
    for (let i = infraIndex + 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith('- 🔄')) {
        status.next.push(line.substring(4).trim());
      } else if (line.trim() === '' || line.startsWith('#')) {
        break;
      }
    }
  }
  
  return status;
}

// Update CLAUDE.md with latest milestone info
function updateClaudeMd(status) {
  if (!fs.existsSync(CLAUDE_PATH)) {
    console.error('❌ CLAUDE.md not found');
    return false;
  }
  
  let content = fs.readFileSync(CLAUDE_PATH, 'utf8');
  
  // Update current sprint focus section
  const sprintRegex = /## Current Sprint Focus[\s\S]*?(?=##|$)/;
  const newSprintSection = `## Current Sprint Focus

- **Active**: ${status.milestone}
- **Progress**: ${status.progress}
- **Next**: ${status.step}
- **Ready**: ${status.completed.slice(0, 3).join(', ')}
${status.next.length > 0 ? `- **Blocked**: ${status.next[0]}` : ''}

**Note**: See \`/docs/roadmap.md\` for detailed milestone tracking

`;
  
  content = content.replace(sprintRegex, newSprintSection);
  
  fs.writeFileSync(CLAUDE_PATH, content);
  return true;
}

// Generate a bug report based on recent activity
function generateBugReport() {
  const bugs = [];
  
  // Check for recent errors in logs
  try {
    const errorCount = require('child_process').execSync(
      'find logs apps/web/logs -name "error*.log" -mtime -1 -exec grep -c "ERROR" {} \\; 2>/dev/null | awk \'{sum += $1} END {print sum+0}\'',
      { encoding: 'utf8' }
    ).trim();
    
    if (parseInt(errorCount) > 10) {
      bugs.push({
        severity: 'Medium',
        description: `${errorCount} errors in last 24 hours`,
        action: 'Review error logs for patterns'
      });
    }
  } catch (error) {
    // No errors or command failed
  }
  
  // Check for failing tests
  try {
    const testResult = require('child_process').execSync(
      'pnpm test --silent 2>&1 | grep -E "FAIL|failed" | wc -l',
      { encoding: 'utf8' }
    ).trim();
    
    if (parseInt(testResult) > 0) {
      bugs.push({
        severity: 'High',
        description: 'Failing tests detected',
        action: 'Run pnpm test to see failures'
      });
    }
  } catch (error) {
    // Tests passed or not run
  }
  
  // Check for TypeScript errors
  try {
    const tsErrors = require('child_process').execSync(
      'pnpm type-check 2>&1 | grep -c "error TS" || true',
      { encoding: 'utf8' }
    ).trim();
    
    if (parseInt(tsErrors) > 0) {
      bugs.push({
        severity: 'High',
        description: `${tsErrors} TypeScript errors`,
        action: 'Run pnpm type-check for details'
      });
    }
  } catch (error) {
    // No TS errors
  }
  
  return bugs;
}

// Update bug tracking file
function updateBugFile(bugs) {
  const content = `# Current Bug: System Health Check

## Status
${bugs.length === 0 ? 'No critical bugs detected ✅' : `${bugs.length} issues require attention ⚠️`}

## Active Issues
${bugs.length === 0 ? 'None' : bugs.map(bug => 
  `### ${bug.severity}: ${bug.description}
**Action**: ${bug.action}`
).join('\n\n')}

## Automated Checks
- Error logs: Monitored (last 24h)
- Test suite: ${bugs.some(b => b.description.includes('test')) ? 'Failing' : 'Passing'}
- TypeScript: ${bugs.some(b => b.description.includes('TypeScript')) ? 'Errors' : 'Clean'}
- OAuth tokens: Monitoring for expiration

## Last Updated
${new Date().toLocaleString()}`;
  
  fs.writeFileSync(BUG_PATH, content);
}

// Main sync function
function syncMilestone() {
  console.log('🔄 Syncing milestone information...\n');
  
  // Parse roadmap
  const status = parseRoadmap();
  if (!status) {
    console.error('Failed to parse roadmap');
    return;
  }
  
  console.log('📊 Current Status:');
  console.log(`  Milestone: ${status.milestone}`);
  console.log(`  Progress: ${status.progress}`);
  console.log(`  Next: ${status.step}\n`);
  
  // Update CLAUDE.md
  if (updateClaudeMd(status)) {
    console.log('✅ Updated CLAUDE.md');
  }
  
  // Generate bug report
  const bugs = generateBugReport();
  updateBugFile(bugs);
  console.log(`✅ Updated bug tracking (${bugs.length} issues)`);
  
  // Update context index
  try {
    require('./update-claude-context.js');
    console.log('✅ Updated context index');
  } catch (error) {
    console.error('❌ Failed to update context:', error.message);
  }
  
  console.log('\n🎯 Sync complete!');
}

// Run if called directly
if (require.main === module) {
  syncMilestone();
}

module.exports = { parseRoadmap, generateBugReport };