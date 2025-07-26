const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { execSync } = require('child_process');

// Import utilities
const { detectProjectType } = require('./utils/project');
const { resolveProjectPaths } = require('./utils/paths');
const { loadTemplate, injectTemplate } = require('./templates');

/**
 * Initialize Claude Context for a project
 */
async function initializeProject(config) {
  const {
    projectName,
    projectType = 'generic',
    projectDescription,
    installDependencies = true
  } = config;

  const projectRoot = process.cwd();
  const paths = resolveProjectPaths(projectRoot);

  // Create .claude directory structure
  console.log(chalk.gray('Creating .claude directory structure...'));
  await fs.ensureDir(paths.context);
  await fs.ensureDir(paths.cache);
  await fs.ensureDir(paths.history);
  await fs.ensureDir(paths.sessions);
  await fs.ensureDir(paths.logs);

  // Copy template files
  console.log(chalk.gray('Copying template files...'));
  const templateDir = path.join(__dirname, 'templates', 'base');
  await fs.copy(templateDir, projectRoot, {
    overwrite: false,
    filter: (src) => !src.includes('node_modules')
  });

  // Copy core scripts
  console.log(chalk.gray('Installing Claude Context scripts...'));
  const scriptsDir = path.join(paths.context, 'scripts');
  await fs.ensureDir(scriptsDir);
  
  const coreScripts = await fs.readdir(path.join(__dirname, 'core'));
  for (const script of coreScripts) {
    if (script.endsWith('.js') || script.endsWith('.sh')) {
      await fs.copy(
        path.join(__dirname, 'core', script),
        path.join(scriptsDir, script)
      );
    }
  }

  // Inject template variables
  console.log(chalk.gray('Configuring for your project...'));
  const templateVars = {
    PROJECT_NAME: projectName,
    PROJECT_TYPE: projectType,
    PROJECT_DESCRIPTION: projectDescription,
    PROJECT_TITLE: projectName.charAt(0).toUpperCase() + projectName.slice(1),
    PROJECT_SHORT_NAME: projectName.substring(0, 3).toUpperCase(),
    PROJECT_ROOT: projectRoot,
    ROADMAP_PATH: 'docs/roadmap.md',
    CLAUDE_MD_PATH: 'CLAUDE.md'
  };

  await injectTemplate(paths.context, templateVars);

  // Update package.json with Claude scripts
  console.log(chalk.gray('Updating package.json...'));
  await updatePackageJson(projectRoot);

  // Install dependencies if requested
  if (installDependencies) {
    console.log(chalk.gray('Installing dependencies...'));
    try {
      execSync('npm install --save-dev chalk@4.1.2', { stdio: 'inherit' });
    } catch (error) {
      console.warn(chalk.yellow('⚠️  Could not install dependencies automatically'));
    }
  }

  // Create initial CLAUDE.md if it doesn't exist
  const claudeMdPath = path.join(projectRoot, 'CLAUDE.md');
  if (!await fs.pathExists(claudeMdPath)) {
    await createInitialClaudeMd(claudeMdPath, config);
  }

  console.log(chalk.green('✅ Claude Context initialized!'));
}

/**
 * Update an existing Claude Context installation
 */
async function updateProject() {
  const projectRoot = process.cwd();
  const paths = resolveProjectPaths(projectRoot);

  if (!await fs.pathExists(paths.context)) {
    throw new Error('Claude Context not found in this project. Run "create-claude-context" first.');
  }

  console.log(chalk.gray('Updating Claude Context scripts...'));
  
  // Update core scripts
  const scriptsDir = path.join(paths.context, 'scripts');
  const coreScripts = await fs.readdir(path.join(__dirname, 'core'));
  
  for (const script of coreScripts) {
    if (script.endsWith('.js') || script.endsWith('.sh')) {
      await fs.copy(
        path.join(__dirname, 'core', script),
        path.join(scriptsDir, script),
        { overwrite: true }
      );
    }
  }

  console.log(chalk.green('✅ Claude Context updated!'));
}

/**
 * Update package.json with Claude Context scripts
 */
async function updatePackageJson(projectRoot) {
  const packageJsonPath = path.join(projectRoot, 'package.json');
  
  if (!await fs.pathExists(packageJsonPath)) {
    console.log(chalk.yellow('⚠️  No package.json found, creating one...'));
    const newPackageJson = {
      name: path.basename(projectRoot).toLowerCase().replace(/\s+/g, '-'),
      version: '1.0.0',
      description: '',
      scripts: {},
      devDependencies: {}
    };
    await fs.writeJson(packageJsonPath, newPackageJson, { spaces: 2 });
  }

  const packageJson = await fs.readJson(packageJsonPath);
  
  // Add Claude Context scripts
  if (!packageJson.scripts) {
    packageJson.scripts = {};
  }

  const claudeScripts = {
    'claude:start': 'bash .claude/scripts/claude-session-start.sh',
    'claude:end': 'bash .claude/scripts/claude-session-end.sh',
    'claude:update': 'node .claude/scripts/update-claude-context-v2.js',
    'claude:dashboard': 'node .claude/scripts/claude-dashboard.js',
    'claude:todos': 'node .claude/scripts/extract-todos.js',
    'claude:priorities': 'node .claude/scripts/claude-priorities.js',
    'claude:quick': 'echo "Quick status:" && node .claude/scripts/extract-todos.js | head -20',
    'claude:init': 'node .claude/scripts/claude-auto-init.js'
  };

  Object.assign(packageJson.scripts, claudeScripts);

  await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
}

/**
 * Create initial CLAUDE.md file
 */
async function createInitialClaudeMd(claudeMdPath, config) {
  const template = `# CLAUDE.md

# ${config.projectName} Development Guidelines

Essential guidelines for Claude Code when working on ${config.projectName}.

## Project Overview

${config.projectDescription}

**Stack**: [Your technology stack]

## Current Sprint Focus

- **Active**: Initial setup
- **Progress**: 0%
- **Next**: Define initial milestones

## Architecture Overview

[Your architecture description]

## Development Workflow

### 1. Branch Strategy
\`\`\`bash
git checkout -b feature/description
\`\`\`

### 2. Commit Format
- feat: new feature
- fix: bug fix
- docs: documentation
- refactor: code refactoring
- test: adding tests
- chore: maintenance

## Common Patterns

[Your project's common code patterns]

## Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| [Common issue 1] | [Solution] |
| [Common issue 2] | [Solution] |

## Remember

1. Follow project conventions
2. Write tests for new features
3. Update documentation
`;

  await fs.writeFile(claudeMdPath, template);
}

// Export main functions
module.exports = {
  initializeProject,
  updateProject,
  detectProjectType: require('./utils/project').detectProjectType,
  startSession: () => require('./core/claude-session-tracker').trackSession('start'),
  endSession: () => require('./core/claude-session-tracker').trackSession('end'),
  updateContext: () => require('./core/update-claude-context-v2').updateContext()
};