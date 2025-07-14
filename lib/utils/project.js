const fs = require('fs');
const path = require('path');

/**
 * Detect the type of project based on files present
 */
function detectProjectType(projectPath = process.cwd()) {
  // Check for Next.js
  if (fs.existsSync(path.join(projectPath, 'next.config.js')) ||
      fs.existsSync(path.join(projectPath, 'next.config.mjs'))) {
    return 'nextjs';
  }

  // Check for Python
  if (fs.existsSync(path.join(projectPath, 'setup.py')) ||
      fs.existsSync(path.join(projectPath, 'pyproject.toml')) ||
      fs.existsSync(path.join(projectPath, 'requirements.txt'))) {
    return 'python';
  }

  // Check for Node.js
  if (fs.existsSync(path.join(projectPath, 'package.json'))) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(path.join(projectPath, 'package.json'), 'utf8'));
      
      // Check for specific frameworks
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      if (deps['react']) return 'react';
      if (deps['vue']) return 'vue';
      if (deps['express'] || deps['fastify'] || deps['koa']) return 'node-api';
      
      return 'node';
    } catch (e) {
      return 'node';
    }
  }

  // Check for Rust
  if (fs.existsSync(path.join(projectPath, 'Cargo.toml'))) {
    return 'rust';
  }

  // Check for Go
  if (fs.existsSync(path.join(projectPath, 'go.mod'))) {
    return 'go';
  }

  // Default to generic
  return 'generic';
}

/**
 * Get project-specific configuration based on type
 */
function getProjectConfig(projectType) {
  const configs = {
    nextjs: {
      buildCommand: 'next build',
      testCommand: 'npm test',
      lintCommand: 'next lint',
      excludePatterns: [
        '**/node_modules/**',
        '**/.next/**',
        '**/out/**',
        '**/dist/**'
      ],
      todoPatterns: ['*.tsx', '*.ts', '*.jsx', '*.js']
    },
    python: {
      buildCommand: 'python -m build',
      testCommand: 'pytest',
      lintCommand: 'pylint',
      excludePatterns: [
        '**/__pycache__/**',
        '**/*.pyc',
        '**/venv/**',
        '**/.env/**'
      ],
      todoPatterns: ['*.py']
    },
    node: {
      buildCommand: 'npm run build',
      testCommand: 'npm test',
      lintCommand: 'npm run lint',
      excludePatterns: [
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**'
      ],
      todoPatterns: ['*.js', '*.ts']
    },
    generic: {
      buildCommand: 'echo "No build command configured"',
      testCommand: 'echo "No test command configured"',
      lintCommand: 'echo "No lint command configured"',
      excludePatterns: [
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',
        '**/.git/**'
      ],
      todoPatterns: ['*']
    }
  };

  return configs[projectType] || configs.generic;
}

module.exports = {
  detectProjectType,
  getProjectConfig
};