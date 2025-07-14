#!/usr/bin/env node
/**
 * Claude Priority Status Command
 * Shows detailed priority information and enforcement
 */

const chalk = require('chalk');
const { loadPriorities } = require('./claude-auto-init');

function displayDetailedPriorities() {
  const priorities = loadPriorities();
  
  console.log(chalk.bold.cyan('\n📊 Detailed Priority Status'));
  console.log(chalk.cyan('═'.repeat(60)));
  console.log(chalk.gray(`Last Updated: ${priorities.lastUpdated || 'Unknown'}`));
  console.log(chalk.yellow(`Current Priority: ${priorities.currentPriority}`));

  const priorityOrder = ['P0', 'P1', 'P2', 'P3'];
  
  priorityOrder.forEach(key => {
    const priority = priorities[key];
    if (!priority) return;

    console.log(chalk.bold.white(`\n${key}: ${priority.name}`));
    console.log(chalk.gray('─'.repeat(40)));
    
    // Status line
    const statusColor = priority.status === 'completed' ? chalk.green :
                       priority.status === 'in-progress' ? chalk.yellow :
                       priority.status === 'blocked' ? chalk.red :
                       chalk.gray;
    
    console.log(`Status: ${statusColor(priority.status.toUpperCase())}`);
    console.log(`Completion: ${priority.completion || 0}%`);
    
    if (priority.blockedBy) {
      console.log(chalk.red(`Blocked by: ${priority.blockedBy}`));
    }

    // Tasks
    if (priority.tasks) {
      console.log(chalk.bold('\nTasks:'));
      Object.entries(priority.tasks).forEach(([taskKey, task]) => {
        const icon = task.status === 'completed' ? '✅' :
                    task.status === 'in-progress' ? '🔄' :
                    task.status === 'pending' ? '⏳' : '❓';
        
        const statusText = task.status === 'completed' ? chalk.green('[DONE]') :
                          task.status === 'in-progress' ? chalk.yellow('[IN PROGRESS]') :
                          chalk.gray('[PENDING]');
        
        console.log(`  ${icon} ${task.description} ${statusText}`);
        
        if (task.assignee) {
          console.log(chalk.gray(`     Assigned to: ${task.assignee}`));
        }
        if (task.notes) {
          console.log(chalk.gray(`     Notes: ${task.notes}`));
        }
      });
    }

    // Metrics
    if (priority.metrics) {
      console.log(chalk.bold('\nMetrics:'));
      Object.entries(priority.metrics).forEach(([metric, value]) => {
        console.log(`  ${metric}: ${value}`);
      });
    }
  });

  // Enforcement rules
  console.log(chalk.bold.cyan('\n🚦 Priority Enforcement Rules'));
  console.log(chalk.gray('─'.repeat(40)));
  console.log('1. ' + chalk.red('P0 (Security)') + ' must be completed before any other work');
  console.log('2. ' + chalk.yellow('P1 (Architecture)') + ' blocks P2 and P3');
  console.log('3. ' + chalk.blue('P2 (Quality)') + ' blocks P3');
  console.log('4. Override requires explicit justification');

  // Next actions
  const current = priorities[priorities.currentPriority];
  if (current && current.tasks) {
    const nextTasks = Object.entries(current.tasks)
      .filter(([_, task]) => task.status !== 'completed')
      .slice(0, 3);

    if (nextTasks.length > 0) {
      console.log(chalk.bold.green('\n✅ Next Actions'));
      console.log(chalk.gray('─'.repeat(40)));
      nextTasks.forEach(([_, task], index) => {
        console.log(`${index + 1}. ${task.description}`);
      });
    }
  }

  // Commands
  console.log(chalk.bold.cyan('\n⚡ Priority Commands'));
  console.log(chalk.gray('─'.repeat(40)));
  console.log('npm run claude:complete <task>  - Mark task complete');
  console.log('npm run claude:override <P#>    - Override priority');
  console.log('npm run claude:assign <task>    - Assign task');
}

// Main execution
if (require.main === module) {
  displayDetailedPriorities();
}

module.exports = { displayDetailedPriorities };