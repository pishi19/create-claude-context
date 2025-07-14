# Claude Context Troubleshooting Guide

## Table of Contents

1. [Quick Fixes](#quick-fixes)
2. [Installation Issues](#installation-issues)
3. [Runtime Errors](#runtime-errors)
4. [Dashboard Problems](#dashboard-problems)
5. [Context Update Issues](#context-update-issues)
6. [Session Management](#session-management)
7. [Performance Issues](#performance-issues)
8. [Integration Problems](#integration-problems)
9. [Debug Mode](#debug-mode)
10. [Getting Support](#getting-support)

## Quick Fixes

### 🔧 Most Common Solutions

```bash
# Fix 90% of issues with these commands:

# 1. Clear cache
rm -rf .claude/cache/*

# 2. Restart session
npm run claude:end
npm run claude:start

# 3. Force update
npm run claude:update -- --force

# 4. Check permissions
chmod -R 755 .claude/

# 5. Reinstall dependencies
npm install --save-dev chalk@4.1.2
```

## Installation Issues

### Error: "npx command not found"

**Problem**: npx is not available in your environment.

**Solution**:
```bash
# Update npm to get npx
npm install -g npm@latest

# Or use npm init instead
npm init create-claude-context
```

### Error: "EACCES: permission denied"

**Problem**: Permission issues during installation.

**Solution**:
```bash
# Option 1: Fix npm permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# Option 2: Use sudo (not recommended)
sudo npx create-claude-context

# Option 3: Change directory ownership
sudo chown -R $(whoami) .
```

### Error: "Cannot find module 'chalk'"

**Problem**: Dependencies not installed properly.

**Solution**:
```bash
# Install missing dependency
npm install --save-dev chalk@4.1.2

# If that doesn't work, clear npm cache
npm cache clean --force
rm -rf node_modules
npm install
```

### Error: "Claude Context already initialized"

**Problem**: Trying to initialize in a project that already has Claude Context.

**Solution**:
```bash
# Option 1: Update existing installation
npx create-claude-context update

# Option 2: Remove and reinstall
rm -rf .claude
npx create-claude-context

# Option 3: Force reinitialize
npx create-claude-context --force
```

## Runtime Errors

### Error: "No active session"

**Problem**: Trying to run commands without an active session.

**Solution**:
```bash
# Start a session
npm run claude:start

# Check if session exists
cat .claude/.session-start

# If file exists but error persists
rm .claude/.session-start
npm run claude:start
```

### Error: "Cannot read property 'startTime' of undefined"

**Problem**: Corrupted session file.

**Solution**:
```bash
# Remove corrupted session files
rm .claude/.session-*
rm .claude/sessions/*

# Start fresh session
npm run claude:start
```

### Error: "ENOENT: no such file or directory"

**Problem**: Missing required files or directories.

**Solution**:
```bash
# Recreate directory structure
mkdir -p .claude/{cache,sessions,logs,scripts}

# Reinitialize if needed
npx create-claude-context update
```

### Error: "Command failed: git log"

**Problem**: Not in a git repository or git not installed.

**Solution**:
```bash
# Initialize git if needed
git init

# Or disable git features in config
# .claude/config.json
{
  "features": {
    "githubIntegration": false
  }
}
```

## Dashboard Problems

### Dashboard not updating

**Problem**: Dashboard shows stale information.

**Solution**:
```bash
# 1. Press 'r' to refresh in dashboard

# 2. Clear cache and restart
rm -rf .claude/cache/*
npm run claude:dashboard

# 3. Check if update process is running
ps aux | grep claude
```

### Dashboard keyboard shortcuts not working

**Problem**: Terminal not capturing keyboard input correctly.

**Solution**:
```bash
# 1. Ensure terminal has focus (click on it)

# 2. Try different terminal emulator

# 3. Run in raw mode
CLAUDE_RAW_MODE=true npm run claude:dashboard
```

### Dashboard shows garbled characters

**Problem**: Terminal doesn't support Unicode or colors.

**Solution**:
```bash
# 1. Set proper locale
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8

# 2. Use different terminal (iTerm2, Windows Terminal)

# 3. Disable colors
NO_COLOR=1 npm run claude:dashboard
```

### Dashboard crashes immediately

**Problem**: Missing dependencies or configuration issues.

**Solution**:
```bash
# 1. Check Node.js version
node --version  # Should be >= 14

# 2. Reinstall dependencies
rm -rf node_modules
npm install

# 3. Run in debug mode
DEBUG=claude:* npm run claude:dashboard
```

## Context Update Issues

### Context not updating automatically

**Problem**: Auto-update feature not working.

**Solution**:
```bash
# 1. Check configuration
cat .claude/config.json | grep autoUpdate

# 2. Enable auto-update
# .claude/config.json
{
  "features": {
    "autoUpdate": true
  },
  "context": {
    "autoUpdateInterval": 300000  // 5 minutes
  }
}

# 3. Check for background process
ps aux | grep claude-auto
```

### Context file too large

**Problem**: Context growing beyond manageable size.

**Solution**:
```bash
# 1. Add more exclusions
# .claude/config.json
{
  "context": {
    "excludePatterns": [
      "**/node_modules/**",
      "**/dist/**",
      "**/*.log",
      "**/coverage/**",
      "**/build/**"
    ],
    "maxFileSize": 50000  // 50KB limit per file
  }
}

# 2. Clear cache and rebuild
rm -rf .claude/cache/*
npm run claude:update
```

### Sensitive information in context

**Problem**: Accidentally including secrets or private data.

**Solution**:
```bash
# 1. Add to exclusions immediately
# .claude/config.json
{
  "context": {
    "excludePatterns": [
      "**/.env*",
      "**/secrets/**",
      "**/*secret*",
      "**/*private*",
      "**/*.key",
      "**/*.pem"
    ]
  }
}

# 2. Clear existing context
rm .claude/index.md
rm -rf .claude/cache/*

# 3. Regenerate
npm run claude:update
```

## Session Management

### Multiple sessions detected

**Problem**: Previous session wasn't closed properly.

**Solution**:
```bash
# 1. Force end all sessions
npm run claude:end --force

# 2. Clean session files
rm .claude/.session-*
rm .claude/sessions/*

# 3. Start fresh
npm run claude:start
```

### Session metrics not tracking

**Problem**: Commits or file changes not being tracked.

**Solution**:
```bash
# 1. Check git configuration
git config user.email
git config user.name

# 2. Ensure git is initialized
git status

# 3. Check session metrics file
cat .claude/.session-metrics.json
```

### Session history lost

**Problem**: Previous session data disappeared.

**Solution**:
```bash
# 1. Check sessions directory
ls -la .claude/sessions/

# 2. Restore from backup if available
cp .claude/sessions-backup/* .claude/sessions/

# 3. Enable session archiving
# .claude/config.json
{
  "features": {
    "sessionArchiving": true
  }
}
```

## Performance Issues

### Slow context updates

**Problem**: Updates taking too long to complete.

**Solution**:
```bash
# 1. Add more exclusions
# .claude/config.json
{
  "context": {
    "excludePatterns": [
      "**/node_modules/**",
      "**/.git/objects/**",
      "**/coverage/**",
      "**/dist/**",
      "**/*.min.js",
      "**/*.map"
    ]
  }
}

# 2. Reduce file size limit
{
  "context": {
    "maxFileSize": 25000  // 25KB
  }
}

# 3. Disable expensive features
{
  "features": {
    "githubIntegration": false,
    "healthChecks": false
  }
}
```

### High CPU usage

**Problem**: Claude Context using too much CPU.

**Solution**:
```bash
# 1. Increase update interval
# .claude/config.json
{
  "context": {
    "autoUpdateInterval": 600000  // 10 minutes
  }
}

# 2. Disable auto-update
{
  "features": {
    "autoUpdate": false
  }
}

# 3. Use manual updates only
npm run claude:update  # When needed
```

### Memory issues

**Problem**: Running out of memory during operations.

**Solution**:
```bash
# 1. Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# 2. Process files in batches
# .claude/config.json
{
  "context": {
    "batchSize": 50,  // Process 50 files at a time
    "maxConcurrent": 5  // Max 5 concurrent operations
  }
}
```

## Integration Problems

### CI/CD pipeline failures

**Problem**: Claude Context causing CI/CD to fail.

**Solution**:
```yaml
# 1. Skip in CI environment
# package.json
{
  "scripts": {
    "claude:update": "[ -z \"$CI\" ] && node .claude/scripts/update-claude-context-v2.js || echo 'Skipping in CI'"
  }
}

# 2. Or configure for CI
# .claude/config.ci.json
{
  "features": {
    "sessionTracking": false,
    "dashboard": false,
    "autoUpdate": false
  }
}
```

### Git hooks conflicts

**Problem**: Git hooks interfering with Claude Context.

**Solution**:
```bash
# 1. Check existing hooks
ls .git/hooks/

# 2. Make hooks compatible
# .git/hooks/pre-commit
#!/bin/bash
# Run Claude Context update
npm run claude:update --silent || true

# Continue with other hooks...
```

### IDE/Editor integration issues

**Problem**: IDE file watchers conflicting with Claude Context.

**Solution**:
```
# 1. Add to IDE exclusions
# VS Code: .vscode/settings.json
{
  "files.watcherExclude": {
    "**/.claude/cache/**": true,
    "**/.claude/logs/**": true
  }
}

# 2. IntelliJ: Mark directory as excluded
# Right-click .claude > Mark Directory as > Excluded
```

## Debug Mode

### Enable verbose logging

```bash
# Set debug environment variable
export CLAUDE_DEBUG=true
export DEBUG=claude:*

# Run any command
npm run claude:dashboard

# Check logs
tail -f .claude/logs/debug.log
```

### Debug configuration

```json
// .claude/config.json
{
  "debug": {
    "enabled": true,
    "logLevel": "verbose",
    "logFile": ".claude/logs/debug.log",
    "includeStackTraces": true
  }
}
```

### Common debug commands

```bash
# Check file permissions
ls -la .claude/

# Verify Node.js version
node --version

# Check npm packages
npm list --depth=0

# Test git access
git status

# Verify configuration
node -e "console.log(require('./.claude/config.json'))"

# Test individual scripts
node .claude/scripts/extract-todos.js --debug
```

## Getting Support

### 1. Self-Diagnosis

Run the diagnostic tool:
```bash
npx claude-context diagnose
```

This will check:
- File permissions
- Dependencies
- Configuration
- Git status
- Node.js version

### 2. Check Logs

```bash
# View recent errors
tail -20 .claude/logs/error.log

# Search for specific error
grep -r "ERROR" .claude/logs/

# Check session logs
cat .claude/logs/session-*.log
```

### 3. Community Support

- **GitHub Issues**: [Report bugs](https://github.com/yourusername/create-claude-context/issues)
- **Discussions**: [Ask questions](https://github.com/yourusername/create-claude-context/discussions)
- **Stack Overflow**: Tag with `claude-context`

### 4. Reporting Issues

Include this information:
```bash
# Generate debug report
npx claude-context debug-report > debug-report.txt
```

The report includes:
- System information
- Configuration
- Recent errors
- Directory structure
- Installed versions

### 5. Emergency Recovery

If all else fails:
```bash
# Backup current state
cp -r .claude .claude-backup

# Complete reinstall
rm -rf .claude node_modules
npm install
npx create-claude-context --force

# Restore data
cp .claude-backup/sessions/* .claude/sessions/
cp .claude-backup/CLAUDE.md ./CLAUDE.md
```

---

Still having issues? Create a [GitHub issue](https://github.com/yourusername/create-claude-context/issues) with your debug report.