#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const packageRoot = path.join(__dirname, '..');

// Update all JavaScript files to use process.cwd() instead of __dirname for .claude paths
function updatePaths() {
  const files = [
    'lib/core/claude-session-tracker.js',
    'lib/core/claude-dashboard.js',
    'lib/core/claude-priorities.js',
    'lib/core/claude-auto-init.js',
    'lib/core/update-claude-context.js',
    'lib/core/update-claude-context-v2.js',
    'lib/core/extract-todos.js',
    'lib/core/init-claude-context.js',
    'lib/core/sync-milestone.js'
  ];

  files.forEach(file => {
    const filePath = path.join(packageRoot, file);
    if (fs.existsSync(filePath)) {
      console.log(`Cleaning ${file}...`);
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Update path references
      content = content.replace(/path\.join\(__dirname, '\.\.', '\.claude'\)/g, "path.join(process.cwd(), '.claude')");
      content = content.replace(/path\.join\(__dirname, '\.\.'/g, "path.join(process.cwd()");
      content = content.replace(/__dirname/g, "process.cwd()");
      
      // Remove Ora-specific references
      content = content.replace(/ora-system/g, path.basename(process.cwd()));
      content = content.replace(/Ora System/g, 'Project');
      content = content.replace(/🤖 Ora/g, '🤖 Claude Context');
      
      // Update specific file references
      content = content.replace(/docs\/ora-roadmap-milestones\.md/g, 'docs/roadmap.md');
      content = content.replace(/\.claude\/WORKFLOW\.md/g, '.claude/workflow.md');
      
      fs.writeFileSync(filePath, content);
    }
  });
}

// Update bash scripts
function updateBashScripts() {
  const scripts = [
    'lib/core/claude-session-start.sh',
    'lib/core/claude-session-end.sh'
  ];

  scripts.forEach(script => {
    const scriptPath = path.join(packageRoot, script);
    if (fs.existsSync(scriptPath)) {
      console.log(`Cleaning ${script}...`);
      let content = fs.readFileSync(scriptPath, 'utf8');
      
      // Update references
      content = content.replace(/ora-system/g, '${PROJECT_NAME}');
      content = content.replace(/Ora/g, 'Claude Context');
      
      fs.writeFileSync(scriptPath, content);
    }
  });
}

// Update config templates
function updateConfigTemplates() {
  const configPath = path.join(packageRoot, 'lib/templates/base/.claude/config.json');
  if (fs.existsSync(configPath)) {
    console.log('Updating config template...');
    const config = {
      "project": {
        "name": "{{PROJECT_NAME}}",
        "description": "{{PROJECT_DESCRIPTION}}",
        "type": "{{PROJECT_TYPE}}",
        "mainBranch": "main"
      },
      "context": {
        "autoUpdateInterval": 300000,
        "cacheTTL": 300000,
        "maxFileSize": 100000,
        "excludePatterns": [
          "**/node_modules/**",
          "**/dist/**",
          "**/.next/**",
          "**/coverage/**",
          "**/.git/**"
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
    };
    
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  }
}

console.log('🧹 Cleaning Claude Context package files...\n');

updatePaths();
updateBashScripts();
updateConfigTemplates();

console.log('\n✅ All files cleaned successfully!');