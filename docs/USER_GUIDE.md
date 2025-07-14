# Claude Context System - User Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Getting Started](#getting-started)
4. [Core Concepts](#core-concepts)
5. [Daily Workflow](#daily-workflow)
6. [Commands Reference](#commands-reference)
7. [Dashboard Guide](#dashboard-guide)
8. [Configuration](#configuration)
9. [CLAUDE.md Guidelines](#claudemd-guidelines)
10. [Project Types](#project-types)
11. [Troubleshooting](#troubleshooting)
12. [Best Practices](#best-practices)
13. [Advanced Usage](#advanced-usage)
14. [FAQ](#faq)

## Introduction

Claude Context is a development workflow management system designed to help developers maintain context, track progress, and optimize their development sessions when working with AI assistants like Claude.

### Key Benefits

- **Never lose context** - Automatically maintains project state between sessions
- **Track progress** - Monitor development time, commits, and changes
- **Find TODOs** - Automatically extract and track tasks across your codebase
- **Real-time monitoring** - Interactive dashboard shows session status
- **AI-friendly** - Provides structured context for AI assistants

## Installation

### Quick Start

```bash
# In your project directory
npx create-claude-context

# Follow the interactive prompts
```

### Installation Options

```bash
# With project name
npx create-claude-context my-project

# With specific project type
npx create-claude-context --type nextjs

# Skip all prompts (use defaults)
npx create-claude-context --yes

# Skip dependency installation
npx create-claude-context --skip-install
```

### Global Installation

```bash
# Install globally
npm install -g create-claude-context

# Use anywhere
create-claude-context
```

## Getting Started

### 1. Initialize Claude Context

Run the initialization command in your project root:

```bash
npx create-claude-context
```

You'll be prompted for:
- **Project name** - Defaults to current directory name
- **Project type** - Next.js, Node.js, Python, or Generic
- **Project description** - Brief description for context
- **Install dependencies** - Whether to install required packages

### 2. Verify Installation

After installation, you'll see:

```
✅ Claude Context initialized successfully!

📚 Quick Start:
  npm run claude:start    - Start a development session
  npm run claude:dashboard - Open interactive dashboard
  npm run claude:todos    - Extract TODOs from codebase
  npm run claude:end      - End session with summary
```

### 3. Create CLAUDE.md

Create a `CLAUDE.md` file in your project root:

```markdown
# CLAUDE.md

Essential guidelines for AI assistants working on this project.

## Project Overview
My project is a web application that...

## Key Technologies
- React 18
- TypeScript
- PostgreSQL

## Development Guidelines
1. Always use TypeScript
2. Follow existing patterns
3. Write tests for new features
```

### 4. Start Your First Session

```bash
npm run claude:start
```

## Core Concepts

### Sessions

A **session** represents a continuous period of development work. Sessions track:
- Start and end time
- Files modified
- Commits made
- Breaks taken
- TODOs completed

### Context

**Context** is the current state of your project, including:
- Git status and recent commits
- Active bugs and issues
- Current milestone progress
- TODO items
- Project structure

### Dashboard

The **dashboard** provides real-time monitoring of your development session with health checks, quick actions, and progress tracking.

## Daily Workflow

### Starting Your Day

1. **Start a session**
   ```bash
   npm run claude:start
   ```

2. **Check the dashboard**
   ```bash
   npm run claude:dashboard
   ```

3. **Review TODOs**
   ```bash
   npm run claude:todos
   ```

### During Development

- The context auto-updates every 5 minutes
- Use the dashboard to monitor progress
- Update CLAUDE.md with important decisions
- Commit regularly for better tracking

### Ending Your Day

1. **End the session**
   ```bash
   npm run claude:end
   ```

2. **Review the summary**
   - Session duration
   - Files changed
   - Commits made
   - TODOs completed

## Commands Reference

### Session Management

| Command | Description |
|---------|-------------|
| `npm run claude:start` | Start a new development session |
| `npm run claude:end` | End current session with summary |
| `npm run claude:quick` | Quick status check |

### Context Updates

| Command | Description |
|---------|-------------|
| `npm run claude:update` | Manually update context |
| `npm run claude:init` | Re-initialize context files |

### Monitoring

| Command | Description |
|---------|-------------|
| `npm run claude:dashboard` | Open interactive dashboard |
| `npm run claude:todos` | Extract all TODOs |
| `npm run claude:priorities` | View current priorities |

### Using claude-context CLI

After installation, you also have access to the `claude-context` command:

```bash
# Check status
claude-context status

# Start session
claude-context start

# Open dashboard
claude-context dashboard
```

## Dashboard Guide

### Launching the Dashboard

```bash
npm run claude:dashboard
```

### Dashboard Layout

```
🤖 Claude Context Dashboard
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Session: 2h 15m | 💾 3 commits | 📝 12 files modified

🎯 Current Focus
├─ Milestone: Feature Implementation
├─ Progress: 75% complete
└─ Next: Add unit tests

📋 Recent TODOs (3)
├─ ✅ Implement user authentication
├─ ⏳ Add error handling
└─ 📌 Write documentation

🏥 Health Checks
├─ ✅ TypeScript: No errors
├─ ⚠️  Tests: 2 failing
└─ ✅ Lint: All passed

⚡ Quick Actions
├─ [r] Refresh display
├─ [u] Update context
├─ [t] Run tests
├─ [c] Check types
└─ [q] Quit
```

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `r` | Refresh the display |
| `u` | Update context manually |
| `t` | Run test suite |
| `c` | Run TypeScript check |
| `l` | Run linter |
| `g` | Show git status |
| `q` | Quit dashboard |

### Understanding Indicators

- **🟢 Green** - All checks passing
- **🟡 Yellow** - Warnings or minor issues
- **🔴 Red** - Errors requiring attention
- **⏳ Spinner** - Operation in progress

## Configuration

### Configuration File

Claude Context uses `.claude/config.json` for configuration:

```json
{
  "project": {
    "name": "my-project",
    "description": "My awesome project",
    "type": "nextjs",
    "mainBranch": "main"
  },
  "context": {
    "autoUpdateInterval": 300000,  // 5 minutes
    "cacheTTL": 300000,           // 5 minutes
    "maxFileSize": 100000,        // 100KB
    "excludePatterns": [
      "**/node_modules/**",
      "**/dist/**",
      "**/.next/**"
    ]
  },
  "features": {
    "sessionTracking": true,
    "dashboard": true,
    "autoUpdate": true,
    "githubIntegration": false,
    "healthChecks": true
  },
  "paths": {
    "roadmap": "docs/roadmap.md",
    "mainDoc": "README.md",
    "contextDir": ".claude"
  }
}
```

### Configuration Options

#### Project Settings

- **name** - Your project name
- **description** - Brief project description
- **type** - Project type (nextjs, node, python, generic)
- **mainBranch** - Main git branch name

#### Context Settings

- **autoUpdateInterval** - How often to auto-update (milliseconds)
- **cacheTTL** - Cache lifetime (milliseconds)
- **maxFileSize** - Maximum file size to include in context
- **excludePatterns** - Glob patterns to exclude

#### Feature Toggles

- **sessionTracking** - Enable/disable session tracking
- **dashboard** - Enable/disable dashboard
- **autoUpdate** - Enable/disable auto-updates
- **githubIntegration** - Enable/disable GitHub features
- **healthChecks** - Enable/disable health checks

## CLAUDE.md Guidelines

The `CLAUDE.md` file is your project's instruction manual for AI assistants.

### Structure Template

```markdown
# CLAUDE.md

# [Project Name] Development Guidelines

Essential guidelines for Claude Code when working on [Project].

## Project Overview

[Brief description of what the project does]

**Stack**: [List key technologies]

## Current Sprint Focus

- **Active**: [Current milestone/feature]
- **Progress**: [X]% complete
- **Next**: [Next major task]
- **Blocked**: [Any blockers]

## Architecture Overview

[Describe key architectural decisions]

```
├── src/
│   ├── components/    # React components
│   ├── services/      # Business logic
│   └── utils/         # Utilities
```

## Development Workflow

### 1. Branch Strategy
- feature/* for new features
- fix/* for bug fixes
- chore/* for maintenance

### 2. Testing Requirements
- Unit tests for all business logic
- Integration tests for APIs
- E2E tests for critical paths

### 3. Code Standards
- TypeScript strict mode
- ESLint + Prettier
- Conventional commits

## Common Patterns

### API Endpoints
```typescript
// Always use this pattern
export const GET = createHandler(async (req) => {
  // Implementation
});
```

### State Management
- Use Context for global state
- Use useState for local state
- Use React Query for server state

## Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails | Check TypeScript errors |
| Tests fail | Run npm test locally first |
| Slow performance | Check React DevTools |

## Remember

1. Always test locally before pushing
2. Update documentation for new features
3. Follow existing patterns
4. Ask if unsure about architecture
```

### Best Practices for CLAUDE.md

1. **Keep it updated** - Update after major decisions
2. **Be specific** - Include exact patterns and examples
3. **Document gotchas** - Note any tricky areas
4. **Include context** - Explain why decisions were made
5. **Quick reference** - Make it scannable

## Project Types

### Next.js Projects

Claude Context automatically detects Next.js projects and:
- Monitors build errors
- Checks for React warnings
- Tracks API route changes
- Includes Next.js-specific health checks

```bash
# Additional commands for Next.js
npm run claude:build-check  # Check build before committing
npm run claude:dev         # Start dev server with session
```

### Node.js Projects

For Node.js APIs and applications:
- Monitors test coverage
- Tracks endpoint changes
- Includes API documentation
- Checks for security issues

### Python Projects

For Python projects:
- Uses pytest for testing
- Monitors pip dependencies
- Tracks module changes
- Includes pylint checks

### Generic Projects

For any other project type:
- Basic file tracking
- Git integration
- TODO extraction
- Custom configuration

## Troubleshooting

### Common Issues

#### "Claude Context not initialized"

```bash
# Solution: Initialize Claude Context
npx create-claude-context
```

#### "No active session"

```bash
# Solution: Start a session
npm run claude:start
```

#### "Context not updating"

```bash
# Solution 1: Check permissions
ls -la .claude/

# Solution 2: Manual update
npm run claude:update

# Solution 3: Clear cache
rm -rf .claude/cache/*
```

#### "Dashboard not working"

```bash
# Solution 1: Check chalk installation
npm install --save-dev chalk@4.1.2

# Solution 2: Check Node version
node --version  # Should be >= 14
```

### Debug Mode

Enable debug logging:

```bash
# Set environment variable
export CLAUDE_DEBUG=true

# Run any command
npm run claude:dashboard
```

### Getting Help

1. Check `.claude/logs/` for error details
2. Run `claude-context status` for quick diagnostics
3. Review your `.claude/config.json` settings
4. Check file permissions in `.claude/` directory

## Best Practices

### 1. Daily Routine

```bash
# Morning
npm run claude:start        # Start session
npm run claude:dashboard    # Check status
npm run claude:todos        # Review tasks

# Throughout the day
# (Auto-updates every 5 minutes)

# Evening
npm run claude:end          # End session
git commit -m "feat: ..."   # Commit work
```

### 2. Commit Messages

Use conventional commits for better tracking:
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation
- `refactor:` - Code refactoring
- `test:` - Test updates
- `chore:` - Maintenance

### 3. TODO Management

```javascript
// TODO: Implement user authentication
// FIXME: Handle edge case for empty array
// NOTE: This is a temporary workaround
```

### 4. Context Optimization

- Keep CLAUDE.md under 1000 lines
- Update it weekly or after major changes
- Include examples of patterns
- Document decisions and tradeoffs

### 5. Session Hygiene

- Start fresh sessions daily
- Take breaks (automatically detected)
- End sessions before long breaks
- Review session summaries

## Advanced Usage

### Custom Scripts

Add custom Claude Context scripts:

```javascript
// .claude/scripts/custom-check.js
const { updateContext } = require('claude-context');

async function customCheck() {
  // Your custom logic
  console.log('Running custom check...');
  
  // Update context
  await updateContext();
}

customCheck();
```

Add to package.json:
```json
{
  "scripts": {
    "claude:custom": "node .claude/scripts/custom-check.js"
  }
}
```

### API Integration

```javascript
const { 
  startSession, 
  endSession, 
  updateContext 
} = require('create-claude-context');

// Programmatic usage
async function myWorkflow() {
  await startSession();
  
  // Your development work
  
  await updateContext();
  await endSession();
}
```

### CI/CD Integration

```yaml
# .github/workflows/claude-context.yml
name: Update Claude Context
on: [push]

jobs:
  update-context:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm install
      - run: npm run claude:update
      - uses: actions/upload-artifact@v2
        with:
          name: claude-context
          path: .claude/index.md
```

### Custom Health Checks

```javascript
// .claude/health-checks.js
module.exports = [
  {
    name: 'Database Connection',
    check: async () => {
      // Test database connection
      return { passed: true, message: 'Connected' };
    }
  },
  {
    name: 'API Endpoints',
    check: async () => {
      // Test API endpoints
      return { passed: true, message: 'All endpoints responding' };
    }
  }
];
```

## FAQ

### General Questions

**Q: What is Claude Context?**
A: It's a development workflow system that maintains project context for AI assistants.

**Q: Do I need Claude to use this?**
A: No, it works with any AI assistant or as a standalone development tool.

**Q: Is my code sent anywhere?**
A: No, everything stays local. Only you share context with your AI assistant.

**Q: Can I use it with multiple projects?**
A: Yes, install it in each project directory.

### Technical Questions

**Q: What Node version is required?**
A: Node.js 14 or higher.

**Q: Can I customize the scripts?**
A: Yes, all scripts are in `.claude/scripts/` and can be modified.

**Q: How do I exclude sensitive files?**
A: Add patterns to `excludePatterns` in `.claude/config.json`.

**Q: Can I use it with monorepos?**
A: Yes, install at the monorepo root or in individual packages.

### Workflow Questions

**Q: Should I commit .claude directory?**
A: Commit everything except cache/, logs/, and session files (see .claude/.gitignore).

**Q: How often should I update CLAUDE.md?**
A: After major architectural decisions or weekly during active development.

**Q: Can multiple developers use it?**
A: Yes, each developer has their own session tracking.

**Q: How do I migrate from manual context management?**
A: Run `npx create-claude-context` and move your existing context to CLAUDE.md.

## Support

- **Documentation**: [GitHub Repository](https://github.com/yourusername/create-claude-context)
- **Issues**: [GitHub Issues](https://github.com/yourusername/create-claude-context/issues)
- **Updates**: Run `npm update create-claude-context`

---

Happy coding with Claude Context! 🤖✨