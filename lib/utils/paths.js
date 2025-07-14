const path = require('path');

/**
 * Resolve all Claude Context paths for a project
 */
function resolveProjectPaths(projectRoot = process.cwd()) {
  const claudeDir = path.join(projectRoot, '.claude');
  
  return {
    root: projectRoot,
    context: claudeDir,
    cache: path.join(claudeDir, 'cache'),
    history: path.join(claudeDir, 'history'),
    sessions: path.join(claudeDir, 'sessions'),
    logs: path.join(claudeDir, 'logs'),
    config: path.join(claudeDir, 'config.json'),
    index: path.join(claudeDir, 'index.md'),
    priorities: path.join(claudeDir, 'priorities.json'),
    sessionFile: path.join(claudeDir, '.session-start'),
    metricsFile: path.join(claudeDir, '.session-metrics.json'),
    cacheFile: path.join(claudeDir, '.cache.json')
  };
}

/**
 * Get relative path from project root
 */
function getRelativePath(absolutePath, projectRoot = process.cwd()) {
  return path.relative(projectRoot, absolutePath);
}

/**
 * Ensure path exists
 */
async function ensurePath(pathToEnsure) {
  const fs = require('fs-extra');
  await fs.ensureDir(path.dirname(pathToEnsure));
  return pathToEnsure;
}

module.exports = {
  resolveProjectPaths,
  getRelativePath,
  ensurePath
};