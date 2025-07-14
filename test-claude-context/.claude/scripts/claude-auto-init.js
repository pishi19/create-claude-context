#!/usr/bin/env node
/**
 * Claude Auto-Initialization Script
 * Automatically runs when Claude starts working on the Ora system
 * Provides immediate context and status dashboard
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Configuration
const CLAUDE_DIR = path.join(process.cwd(), '.claude');
const CONFIG_FILE = path.join(CLAUDE_DIR, 'config.json');
const PRIORITIES_FILE = path.join(CLAUDE_DIR, 'priorities.json');
const AUTO_INIT_FLAG = path.join(CLAUDE_DIR, '.auto-init-complete');
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Check if we've already run recently
function shouldRunInit() {
  if (!fs.existsSync(AUTO_INIT_FLAG)) return true;
  
  const stats = fs.statSync(AUTO_INIT_FLAG);
  const age = Date.now() - stats.mtimeMs;
  return age > CACHE_TTL;
}

// Load or create priorities
function loadPriorities() {
  const defaultPriorities = {
    currentPriority: "P0",
    lastUpdated: new Date().toISOString(),
    P0: {
      name: "Critical Security",
      status: "pending",
      completion: 0,
      tasks: {
        tokenEncryption: { status: "pending", description: "Encrypt OAuth tokens in database" },
        sessionManagement: { status: "pending", description: "Implement httpOnly cookies" },
        gitCleanup: { status: "pending", description: "Remove API keys from git history" },
        hardcodedPaths: { status: "pending", description: "Fix hardcoded paths" }
      }
    },
    P1: {
      name: "Architecture",
      status: "in-progress",
      completion: 40,
      blockedBy: "P0",
      tasks: {
        domainLayer: { status: "completed", description: "Domain layer implementation" },
        repositories: { status: "pending", description: "Fix repositories to return domain entities" },
        serviceLayer: { status: "pending", description: "Create service layer" },
        crossLayer: { status: "pending", description: "Fix cross-layer imports" }
      }
    },
    P2: {
      name: "Quality",
      status: "blocked",
      completion: 0,
      blockedBy: "P1",
      tasks: {
        typescript: { status: "pending", description: "Fix TypeScript errors" },
        tests: { status: "pending", description: "Fix failing tests" },
        coverage: { status: "pending", description: "Increase test coverage to 85%" },
        imports: { status: "pending", description: "Fix broken UI imports" }
      }
    }
  };

  if (!fs.existsSync(PRIORITIES_FILE)) {
    fs.writeFileSync(PRIORITIES_FILE, JSON.stringify(defaultPriorities, null, 2));
    return defaultPriorities;
  }

  try {
    return JSON.parse(fs.readFileSync(PRIORITIES_FILE, 'utf8'));
  } catch (e) {
    return defaultPriorities;
  }
}

// Get current metrics
function getMetrics() {
  const metrics = {
    typescript: { errors: 0, status: 'unknown' },
    tests: { passing: 0, failing: 0, status: 'unknown' },
    git: { branch: 'unknown', modified: 0 },
    architecture: { violations: 47, progress: 40 }
  };

  try {
    // Get TypeScript errors
    try {
      execSync('pnpm type-check', { stdio: 'pipe' });
      metrics.typescript.errors = 0;
      metrics.typescript.status = 'passing';
    } catch (e) {
      const output = e.stdout?.toString() || '';
      const errorMatch = output.match(/(\d+)\s+error/);
      if (errorMatch) {
        metrics.typescript.errors = parseInt(errorMatch[1]);
        metrics.typescript.status = 'failing';
      }
    }

    // Get git status
    metrics.git.branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    metrics.git.modified = execSync('git status --porcelain | wc -l', { encoding: 'utf8' }).trim();

  } catch (e) {
    // Ignore errors, use defaults
  }

  return metrics;
}

// Display priority status
function displayPriorities(priorities) {
  console.log(chalk.bold.cyan('\n📊 Priority Status'));
  console.log(chalk.gray('═'.repeat(50)));

  // Check if this is local development
  const isLocal = priorities.projectType === 'local-development';
  const priorityOrder = isLocal ? ['P1', 'P2', 'P3', 'P0'] : ['P0', 'P1', 'P2', 'P3'];
  
  priorityOrder.forEach(key => {
    const priority = priorities[key];
    if (!priority) return;

    const icon = key === priorities.currentPriority ? '🔴' : 
                 priority.status === 'completed' ? '✅' :
                 priority.status === 'in-progress' ? '🟠' :
                 priority.status === 'blocked' ? '🟡' : 
                 priority.status === 'deferred' ? '⏸️' : '⚪';

    const status = key === priorities.currentPriority ? chalk.red('ACTIVE') :
                   priority.status === 'completed' ? chalk.green('COMPLETE') :
                   priority.status === 'in-progress' ? chalk.yellow('IN PROGRESS') :
                   priority.status === 'blocked' ? chalk.gray(`BLOCKED by ${priority.blockedBy}`) :
                   priority.status === 'deferred' ? chalk.blue('DEFERRED - Supabase') :
                   chalk.gray('PENDING');

    console.log(`\n${icon} ${chalk.bold(key)}: ${priority.name} (${priority.completion || 0}% complete) ${status}`);

    if (priority.tasks && (key === priorities.currentPriority || priority.status === 'in-progress')) {
      Object.entries(priority.tasks).forEach(([taskKey, task]) => {
        const taskIcon = task.status === 'completed' ? '✅' :
                        task.status === 'in-progress' ? '🔄' : '⏳';
        console.log(`   ${taskIcon} ${task.description}`);
      });
    }
  });

  // Show current focus
  const current = priorities[priorities.currentPriority];
  if (current) {
    const pendingTasks = Object.entries(current.tasks || {})
      .filter(([_, task]) => task.status !== 'completed')
      .map(([_, task]) => task.description);

    if (pendingTasks.length > 0) {
      console.log(chalk.bold.yellow(`\n⚡ Current Focus: ${pendingTasks[0]}`));
    }
  }
}

// Display dashboard
function displayDashboard() {
  console.clear();
  
  console.log(chalk.bold.cyan('╔════════════════════════════════════════════════════════════╗'));
  console.log(chalk.bold.cyan('║            🤖 Claude Context Auto-Initialization           ║'));
  console.log(chalk.bold.cyan('║                    LOCAL DEVELOPMENT                       ║'));
  console.log(chalk.bold.cyan('╚════════════════════════════════════════════════════════════╝'));

  const metrics = getMetrics();
  const priorities = loadPriorities();

  // Git status
  console.log(chalk.bold('\n📍 Git Status'));
  console.log(`Branch: ${chalk.yellow(metrics.git.branch)}`);
  console.log(`Modified files: ${metrics.git.modified > 0 ? chalk.red(metrics.git.modified) : chalk.green('0')}`);

  // Architecture progress
  console.log(chalk.bold('\n🏗️  Architecture Refactoring'));
  const progress = metrics.architecture.progress;
  const progressBar = '█'.repeat(Math.floor(progress / 5)) + '░'.repeat(20 - Math.floor(progress / 5));
  console.log(`Progress: ${progressBar} ${progress}%`);
  console.log(`Violations: ${chalk.yellow(metrics.architecture.violations)} → ${chalk.green('0')} (target)`);

  // Health checks
  console.log(chalk.bold('\n🏥 Health Checks'));
  console.log(`TypeScript: ${metrics.typescript.errors > 0 ? chalk.red(`${metrics.typescript.errors} errors`) : chalk.green('✓ No errors')}`);
  console.log(`Tests: ${chalk.gray('Run pnpm test to check')}`);
  console.log(`Build: ${chalk.gray('Run pnpm build to check')}`);

  // Display priorities
  displayPriorities(priorities);

  // Quick commands
  console.log(chalk.bold.cyan('\n⚡ Quick Commands:'));
  console.log(chalk.gray('  npm run claude:dashboard   - Interactive dashboard'));
  console.log(chalk.gray('  npm run claude:update      - Update context'));
  console.log(chalk.gray('  npm run claude:priorities  - Detailed priority view'));
  console.log(chalk.gray('  npm run claude:end         - End session'));

  // Mark as initialized
  fs.writeFileSync(AUTO_INIT_FLAG, new Date().toISOString());
}

// Main execution
function main() {
  if (!shouldRunInit()) {
    console.log(chalk.gray('Claude Context already initialized (cached for 5 minutes)'));
    console.log(chalk.gray('Run "npm run claude:dashboard" for live updates'));
    return;
  }

  displayDashboard();

  // Update context in background
  console.log(chalk.gray('\n📝 Updating context in background...'));
  try {
    execSync('node scripts/update-claude-context.js', { stdio: 'ignore' });
  } catch (e) {
    // Ignore errors
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { displayDashboard, loadPriorities };