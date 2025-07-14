# Claude Context NPM Package - Next Session Instructions

## Current Status
- Created basic package structure
- Set up package.json with dependencies
- Created directory structure for the NPM package

## Next Steps to Complete

### 1. Extract Core Files (First Priority)
```bash
# Copy and clean the Claude scripts
cp .claude/scripts/claude-*.js create-claude-context/lib/core/
cd create-claude-context/lib/core/
# Then remove all Ora-specific references
```

### 2. Create the CLI Entry Point
Create `bin/create-claude-context.js`:
```javascript
#!/usr/bin/env node
const { program } = require('commander');
const inquirer = require('inquirer');
const { initializeProject } = require('../lib/index');

program
  .name('create-claude-context')
  .description('Initialize Claude Context for your project')
  .version('1.0.0');

program
  .argument('[project-name]', 'Name of the project')
  .option('-t, --type <type>', 'Project type (nextjs, node, python, generic)')
  .option('-s, --skip-install', 'Skip npm install')
  .action(async (projectName, options) => {
    // Implementation here
  });
```

### 3. Key Files to Create

#### lib/index.js (Main entry point)
```javascript
module.exports = {
  initializeProject: require('./core/init'),
  updateContext: require('./core/update'),
  startSession: require('./core/session').start,
  // ... other exports
};
```

#### lib/core/config.js (Configuration management)
- Extract from Ora's config handling
- Make all paths configurable
- Create default templates for different project types

#### lib/templates/base/.claude/config.json
```json
{
  "project": {
    "name": "{{PROJECT_NAME}}",
    "type": "{{PROJECT_TYPE}}",
    "description": "{{PROJECT_DESCRIPTION}}"
  },
  "context": {
    "autoUpdateInterval": 300000,
    "cacheTTL": 300000
  }
}
```

### 4. Abstract Ora-Specific Code

Search and replace patterns:
- `ora-system` → `{{projectName}}`
- `/Users/air/Projects/ora-system` → `process.cwd()`
- `docs/ora-roadmap-milestones.md` → `{{roadmapPath}}`
- Remove all hardcoded paths

### 5. Create Template System

```javascript
// lib/templates/index.js
const templates = {
  nextjs: {
    files: ['next.config.js', 'tsconfig.json'],
    scripts: {
      'claude:build-check': 'next build && claude-context update --tag build'
    }
  },
  node: {
    files: ['index.js', 'package.json'],
    scripts: {
      'claude:test-check': 'npm test && claude-context update --tag test'
    }
  }
};
```

### 6. Testing Commands

After implementing:
```bash
# Test local installation
cd create-claude-context
npm link

# Test in a new project
cd /tmp
npx create-claude-context test-project --type nextjs

# Verify it works
cd test-project
npm run claude:start
```

### 7. Documentation Structure

Create these files:
- README.md - Main documentation
- docs/API.md - API reference
- docs/PLUGINS.md - Plugin development guide
- docs/MIGRATION.md - Migration from manual setup
- examples/ - Example projects

### 8. Critical Abstractions

1. **Project Detection**
   ```javascript
   function detectProjectType(projectPath) {
     if (fs.existsSync(path.join(projectPath, 'next.config.js'))) return 'nextjs';
     if (fs.existsSync(path.join(projectPath, 'setup.py'))) return 'python';
     // etc.
   }
   ```

2. **Path Resolution**
   ```javascript
   function resolveProjectPaths(projectRoot) {
     return {
       context: path.join(projectRoot, '.claude'),
       cache: path.join(projectRoot, '.claude', 'cache'),
       // etc.
     };
   }
   ```

3. **Template Injection**
   ```javascript
   function injectTemplate(projectPath, templateName, variables) {
     // Replace {{VARIABLE}} with actual values
   }
   ```

## Files to Copy from Ora

Priority files to extract:
1. `.claude/scripts/claude-start.js`
2. `.claude/scripts/claude-update-v2.js`
3. `.claude/scripts/claude-dashboard.js`
4. `.claude/scripts/claude-session.js`
5. `.claude/scripts/claude-extract-todos.js`

## Remember
- Remove ALL Ora-specific references
- Make everything configurable
- Use template variables for project-specific values
- Test with different project types
- Keep the core functionality but make it generic