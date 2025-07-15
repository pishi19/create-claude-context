const fs = require('fs');
const path = require('path');

/**
 * Detects the package manager used in a project
 * @returns {string} The detected package manager (npm, yarn, pnpm, bun)
 */
function detectPackageManager(projectPath = process.cwd()) {
  // Check for lock files
  if (fs.existsSync(path.join(projectPath, 'yarn.lock'))) {
    return 'yarn';
  }
  if (fs.existsSync(path.join(projectPath, 'pnpm-lock.yaml'))) {
    return 'pnpm';
  }
  if (fs.existsSync(path.join(projectPath, 'bun.lockb'))) {
    return 'bun';
  }
  
  // Check package.json for packageManager field
  const packageJsonPath = path.join(projectPath, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      if (packageJson.packageManager) {
        const pm = packageJson.packageManager.split('@')[0];
        if (['npm', 'yarn', 'pnpm', 'bun'].includes(pm)) {
          return pm;
        }
      }
    } catch (e) {
      // Ignore parse errors
    }
  }
  
  // Default to npm
  return 'npm';
}

/**
 * Gets the appropriate commands for the detected package manager
 * @param {string} packageManager The package manager to get commands for
 * @returns {object} Command mappings
 */
function getCommands(packageManager) {
  const commands = require('../templates/commands.json');
  return commands[packageManager] || commands.npm;
}

module.exports = { detectPackageManager, getCommands };