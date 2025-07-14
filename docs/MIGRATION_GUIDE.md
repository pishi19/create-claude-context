# Migration Guide - From Manual Context to Claude Context

## Table of Contents

1. [Overview](#overview)
2. [Before You Start](#before-you-start)
3. [Migration Strategies](#migration-strategies)
4. [Step-by-Step Migration](#step-by-step-migration)
5. [Migrating Different Setups](#migrating-different-setups)
6. [Common Patterns](#common-patterns)
7. [Troubleshooting](#troubleshooting)
8. [Rollback Plan](#rollback-plan)

## Overview

This guide helps you migrate from manual context management (text files, markdown docs, etc.) to the automated Claude Context System.

### Benefits of Migration

- **Automated Updates** - No more manual copying and pasting
- **Session Tracking** - Know exactly what you worked on
- **TODO Management** - Automatic extraction from code
- **Real-time Dashboard** - Monitor your development
- **Consistent Format** - Standardized context structure

## Before You Start

### 1. Backup Your Current Setup

```bash
# Create a backup of your current context files
mkdir -p .backup/context-$(date +%Y%m%d)
cp -r docs/context* .backup/context-$(date +%Y%m%d)/
cp README.md .backup/context-$(date +%Y%m%d)/
```

### 2. Identify Your Current Structure

Common manual setups include:
- Single context file (`CONTEXT.md`, `README-CLAUDE.md`)
- Multiple context files (`context/`, `docs/ai-context/`)
- Scattered information (README + CONTRIBUTING + TODO)
- No formal context (relying on file structure)

### 3. Prepare Your Content

Review and organize your existing context:
- Current project state
- Architecture decisions
- Development guidelines
- TODO items
- Common issues and solutions

## Migration Strategies

### Strategy 1: Fresh Start (Recommended)

Best for: Projects with minimal existing context or those wanting a clean slate.

```bash
# 1. Initialize Claude Context
npx create-claude-context

# 2. Create new CLAUDE.md from scratch
# 3. Import key information from old context
```

### Strategy 2: Gradual Migration

Best for: Large projects with extensive documentation.

```bash
# 1. Initialize alongside existing setup
npx create-claude-context

# 2. Run both systems in parallel
# 3. Gradually move content to CLAUDE.md
# 4. Remove old system when comfortable
```

### Strategy 3: Full Import

Best for: Well-organized existing context.

```bash
# 1. Initialize Claude Context
npx create-claude-context

# 2. Import all existing content
# 3. Reorganize into Claude Context structure
# 4. Remove old files
```

## Step-by-Step Migration

### Step 1: Initialize Claude Context

```bash
npx create-claude-context
```

Choose appropriate options:
- Project name
- Project type (nextjs, node, python, generic)
- Project description

### Step 2: Create CLAUDE.md

Start with the template and add your content:

```markdown
# CLAUDE.md

# [Your Project] Development Guidelines

Essential guidelines for Claude Code when working on [Project].

## Project Overview
[Copy from your existing context]

## Current Sprint Focus
- **Active**: [Current work]
- **Progress**: [Estimate]%
- **Next**: [Next priority]

## Architecture Overview
[Copy your architecture docs]

## Development Workflow
[Copy your workflow docs]

## Common Patterns
[Copy code examples]

## Quick Troubleshooting
[Copy common issues]

## Remember
[Key principles from old context]
```

### Step 3: Import Existing TODOs

If you have a TODO file:

```bash
# Copy existing TODOs to a temporary file
cp TODO.md .claude/import-todos.md

# Run TODO extraction to merge
npm run claude:todos
```

Or add directly to CLAUDE.md:
```markdown
## Current TODOs
- [ ] Existing TODO item 1
- [ ] Existing TODO item 2
```

### Step 4: Configure Exclusions

Update `.claude/config.json` to match your project:

```json
{
  "context": {
    "excludePatterns": [
      "**/node_modules/**",
      "**/dist/**",
      "**/coverage/**",
      "**/.old-context/**"  // Exclude old context files
    ]
  }
}
```

### Step 5: Test the System

```bash
# Start a session
npm run claude:start

# Check dashboard
npm run claude:dashboard

# Update context
npm run claude:update

# View generated context
cat .claude/index.md
```

### Step 6: Remove Old System

Once comfortable with Claude Context:

```bash
# Archive old context files
mkdir -p .archived-context
mv CONTEXT.md .archived-context/
mv docs/ai-context .archived-context/

# Update .gitignore
echo ".archived-context/" >> .gitignore
```

## Migrating Different Setups

### From Single Context File

If you have a single `CONTEXT.md` or similar:

```bash
# 1. Initialize Claude Context
npx create-claude-context

# 2. Copy content sections to CLAUDE.md
# - Project overview → Project Overview section
# - Setup instructions → Development Workflow
# - Architecture → Architecture Overview
# - Guidelines → Remember section

# 3. Move code examples to Common Patterns

# 4. Extract TODOs to separate section
```

### From Multiple Context Files

If you have multiple files (`context/`, `docs/`):

```bash
# 1. Initialize Claude Context
npx create-claude-context

# 2. Consolidate into CLAUDE.md
cat docs/context/overview.md >> CLAUDE.md
cat docs/context/architecture.md >> CLAUDE.md
cat docs/context/guidelines.md >> CLAUDE.md

# 3. Edit CLAUDE.md to remove duplicates and organize

# 4. Keep specialized docs separate if needed
# Just ensure they're referenced in CLAUDE.md
```

### From No Formal Context

If you've been providing context ad-hoc:

```bash
# 1. Initialize Claude Context
npx create-claude-context

# 2. Document current state in CLAUDE.md:
# - What is this project?
# - What stack/technologies?
# - What are you working on?
# - What patterns to follow?
# - Common issues faced?

# 3. Let Claude Context handle the rest automatically
```

### From Custom Scripts

If you have custom context generation scripts:

```javascript
// 1. Review your scripts for useful patterns

// 2. Convert to Claude Context plugins
// .claude/plugins/my-custom-extractor.js
module.exports = {
  name: 'custom-extractor',
  activate(context) {
    context.registerHook('pre-update', async () => {
      // Your custom extraction logic
      const customData = await myExtractor();
      context.addToContext('Custom Data', customData);
    });
  }
};

// 3. Add to config.json
{
  "plugins": ["./plugins/my-custom-extractor.js"]
}
```

## Common Patterns

### Pattern 1: Preserving Git History Context

If your old system included git history:

```javascript
// .claude/plugins/git-history.js
const { execSync } = require('child_process');

module.exports = {
  name: 'git-history',
  activate(context) {
    context.registerHook('pre-update', async () => {
      const history = execSync('git log --oneline -20').toString();
      context.addToContext('Recent Git History', history);
    });
  }
};
```

### Pattern 2: Migrating Custom Templates

If you had template files for context:

```bash
# 1. Copy templates to .claude/templates/
cp -r my-templates/* .claude/templates/

# 2. Reference in CLAUDE.md
## Code Templates
See `.claude/templates/` for:
- Component templates
- API endpoint templates
- Test templates
```

### Pattern 3: Maintaining Team Standards

If you have team coding standards:

```markdown
# In CLAUDE.md

## Team Standards

### Code Review Checklist
- [ ] TypeScript types added
- [ ] Tests written
- [ ] Documentation updated
- [ ] No console.logs

### Naming Conventions
- Components: PascalCase
- Functions: camelCase
- Constants: UPPER_SNAKE_CASE
```

## Troubleshooting

### Issue: Too Much Context

**Problem**: CLAUDE.md becomes too large after migration.

**Solution**:
```markdown
# Split into focused sections
## Architecture Overview
See `docs/ARCHITECTURE.md` for detailed architecture.

## API Documentation  
See `docs/API.md` for endpoint documentation.

# Keep only essential day-to-day info in CLAUDE.md
```

### Issue: Missing Information

**Problem**: Realized important context wasn't migrated.

**Solution**:
```bash
# 1. Add to CLAUDE.md immediately
echo "## Missing Section" >> CLAUDE.md
echo "Important info..." >> CLAUDE.md

# 2. Update context
npm run claude:update
```

### Issue: Conflicting Workflows

**Problem**: Team members using different context systems.

**Solution**:
```bash
# 1. Create migration guide for team
cp docs/MIGRATION_GUIDE.md TEAM_MIGRATION.md

# 2. Set transition period
echo "Note: Migrating to Claude Context by [date]" >> README.md

# 3. Provide training session
npm run claude:dashboard  # Show the benefits
```

### Issue: Build Process Integration

**Problem**: Existing build process expects old context files.

**Solution**:
```bash
# 1. Create symbolic links temporarily
ln -s .claude/index.md CONTEXT.md

# 2. Update build scripts gradually
# Replace references to old files

# 3. Remove links when done
```

## Rollback Plan

If you need to rollback:

### Quick Rollback

```bash
# 1. Your old files are in .backup/
cp -r .backup/context-[date]/* .

# 2. Remove Claude Context (keep the code)
rm -rf .claude
npm uninstall create-claude-context

# 3. Remove Claude scripts from package.json
```

### Partial Rollback

Keep Claude Context for some features:

```bash
# 1. Disable features in .claude/config.json
{
  "features": {
    "autoUpdate": false,
    "sessionTracking": false,
    "dashboard": true  // Keep only dashboard
  }
}

# 2. Use alongside old system
```

## Best Practices

### 1. Start Small

- Migrate core information first
- Add details gradually
- Don't try to migrate everything at once

### 2. Keep Both Systems

- Run in parallel for a week
- Compare outputs
- Ensure nothing is missed

### 3. Get Team Buy-in

- Show the dashboard to teammates
- Demonstrate time savings
- Share session summaries

### 4. Customize Gradually

- Start with defaults
- Add custom plugins later
- Adjust configuration based on usage

### 5. Document the Migration

```bash
# Create migration log
echo "# Migration Log" > MIGRATION_LOG.md
echo "- $(date): Initialized Claude Context" >> MIGRATION_LOG.md
echo "- $(date): Migrated overview section" >> MIGRATION_LOG.md
# ... continue logging progress
```

## Post-Migration Checklist

- [ ] Claude Context initialized
- [ ] CLAUDE.md created with essential information
- [ ] Old context backed up
- [ ] Team notified of new system
- [ ] CI/CD updated if needed
- [ ] README.md updated to reference Claude Context
- [ ] Old context files removed or archived
- [ ] First session started successfully
- [ ] Dashboard working correctly
- [ ] Context updates automatically

## Getting Help

- Check the [User Guide](USER_GUIDE.md)
- See [Common Issues](TROUBLESHOOTING.md)
- Run `npm run claude:dashboard` for system status
- Create an issue on GitHub if stuck

---

Welcome to automated context management! 🤖✨