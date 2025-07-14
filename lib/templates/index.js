const fs = require('fs-extra');
const path = require('path');

/**
 * Load a template by name
 */
async function loadTemplate(templateName) {
  const templatePath = path.join(__dirname, templateName);
  
  if (!await fs.pathExists(templatePath)) {
    throw new Error(`Template "${templateName}" not found`);
  }
  
  return templatePath;
}

/**
 * Inject template variables into files
 */
async function injectTemplate(targetDir, variables) {
  const files = await getAllFiles(targetDir);
  
  for (const file of files) {
    // Skip binary files
    if (isBinaryFile(file)) continue;
    
    try {
      let content = await fs.readFile(file, 'utf8');
      
      // Replace all template variables
      Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        content = content.replace(regex, value);
      });
      
      await fs.writeFile(file, content);
    } catch (error) {
      console.warn(`Warning: Could not process ${file}:`, error.message);
    }
  }
}

/**
 * Get all files recursively
 */
async function getAllFiles(dir, files = []) {
  const items = await fs.readdir(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = await fs.stat(fullPath);
    
    if (stat.isDirectory()) {
      // Skip certain directories
      if (['node_modules', '.git', 'dist', 'build'].includes(item)) continue;
      await getAllFiles(fullPath, files);
    } else {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Check if file is binary
 */
function isBinaryFile(filePath) {
  const binaryExtensions = [
    '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg',
    '.pdf', '.zip', '.tar', '.gz', '.exe', '.dll',
    '.so', '.dylib', '.bin', '.dat'
  ];
  
  return binaryExtensions.some(ext => filePath.endsWith(ext));
}

/**
 * Get template configuration for project type
 */
function getTemplateConfig(projectType) {
  const configs = {
    nextjs: {
      additionalScripts: {
        'claude:build-check': 'next build && npm run claude:update',
        'claude:dev': 'npm run claude:start && next dev'
      },
      additionalFiles: [
        '.claude/templates/nextjs-component.tsx',
        '.claude/templates/nextjs-api-route.ts'
      ]
    },
    python: {
      additionalScripts: {
        'claude:test-check': 'pytest && npm run claude:update',
        'claude:lint-check': 'pylint **/*.py && npm run claude:update'
      },
      additionalFiles: [
        '.claude/templates/python-module.py',
        '.claude/templates/python-test.py'
      ]
    },
    node: {
      additionalScripts: {
        'claude:test-watch': 'npm run claude:start && npm test -- --watch'
      },
      additionalFiles: []
    },
    generic: {
      additionalScripts: {},
      additionalFiles: []
    }
  };
  
  return configs[projectType] || configs.generic;
}

module.exports = {
  loadTemplate,
  injectTemplate,
  getTemplateConfig
};