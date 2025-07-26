# Claude Context Workflow Guide

This guide explains how to effectively use claude-context while developing with Claude Code.

## 🎯 Quick Reference Card

### Terminal Commands
| Command | Purpose | When to Use |
|---------|---------|-------------|
| `npm run claude:start` | Start development session | Beginning of work |
| `npm run claude:dashboard` | Live progress monitor | Keep open in separate tab |
| `npm run claude:todos` | View all TODOs | Check what needs doing |
| `npm run claude:quick` | Quick status check | Periodic progress check |
| `npm run claude:update` | Manual context update | After external changes |
| `npm run claude:end` | End session with summary | End of work period |

### Division of Labor
- **Terminal**: Session management, progress tracking, monitoring
- **Claude Code**: Implementation, file operations, TODO updates, commits

## 📋 Detailed Workflow Pattern

### 1. Starting a Development Session

**In Terminal:**
```bash
# Start your day
cd "your-project-directory"
npm run claude:start

# Open dashboard in new terminal tab
npm run claude:dashboard  # Keep this running
```

**What this does:**
- Initializes session tracking
- Updates context with current project state
- Shows current priorities and TODOs
- Starts time tracking

### 2. During Development

**With Claude Code:**
```
You: "Let's work on [specific feature]"
Claude: *Creates files, implements features, marks TODOs complete*
```

**In Terminal (periodically):**
```bash
# Check progress without interrupting work
npm run claude:quick

# Full TODO list when planning next steps
npm run claude:todos
```

### 3. Testing Cycle

1. **Claude Code implements feature**
2. **You test locally**
3. **Report results to Claude Code**
4. **Claude Code fixes issues**
5. **Terminal shows updated progress**

### 4. Ending a Session

**In Terminal:**
```bash
# Generate session summary
npm run claude:end

# This shows:
# - Time worked
# - TODOs completed
# - Files changed
# - Suggested next steps
```

## 💡 Best Practices

### 1. Session Management
- ✅ Always start with `npm run claude:start`
- ✅ Keep dashboard open for visibility
- ✅ End properly with `npm run claude:end`
- ❌ Don't skip session tracking

### 2. TODO Tracking
- ✅ Let Claude Code update TODO files
- ✅ Check progress regularly with dashboard
- ✅ Add new TODOs as you discover edge cases
- ❌ Don't manually edit TODO checkboxes during active session

### 3. Development Rhythm
```
Morning:
  1. npm run claude:start
  2. npm run claude:todos (see priorities)
  3. Work with Claude Code

Midday:
  1. npm run claude:quick (progress check)
  2. Test features
  3. Continue with Claude Code

Evening:
  1. Claude Code commits completed work
  2. npm run claude:end (summary)
  3. Review tomorrow's priorities
```

## 🔧 Troubleshooting

### Common Issues

**TODOs not updating?**
```bash
npm run claude:update  # Force context refresh
```

**Dashboard shows wrong counts?**
- Check file formatting
- Ensure TODO format matches: `- [ ] TODO: description`

**Session not tracking?**
- Always use `npm run claude:start` first
- Check .claude/sessions/ directory exists

**Context out of sync?**
```bash
# Full reset
npm run claude:end
npm run claude:start
```

## 🚀 Quick Start Checklist

Starting work? Run through this:

- [ ] Open terminal in project directory
- [ ] Run `npm run claude:start`
- [ ] Open new terminal tab
- [ ] Run `npm run claude:dashboard`
- [ ] Switch to Claude Code
- [ ] Say "Let's work on [specific task]"
- [ ] Test changes locally
- [ ] End with `npm run claude:end`

---

Remember: **Terminal for tracking, Claude Code for doing!**