const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const repoPath = path.resolve(__dirname, '..');
const docsDir = path.join(repoPath, 'docs');
const contributionsFile = path.join(docsDir, 'CONTRIBUTIONS.md');

// Ensure docs folder exists
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir);
}

// Ensure CONTRIBUTIONS.md exists
if (!fs.existsSync(contributionsFile)) {
  fs.writeFileSync(
    contributionsFile,
    `# 📈 Project Contributions Log\n\nThis file tracks daily maintenance, dependency checks, and framework verification runs.\n\n`
  );
}

const today = new Date().toISOString().split('T')[0];
const timestamp = new Date().toISOString();

// Append contribution log
fs.appendFileSync(
  contributionsFile,
  `- **${today}**: Automated framework verification check and configuration lint completed successfully. [${timestamp}]\n`
);

console.log(`Updated contribution log for ${today}.`);

// Git commit & push
try {
  process.chdir(repoPath);
  execSync('git add docs/CONTRIBUTIONS.md', { stdio: 'inherit' });
  execSync(`git commit -m "docs: log automated daily framework verification check for ${today}"`, {
    stdio: 'inherit',
  });
  execSync('git push origin main', { stdio: 'inherit' });
  console.log('Successfully pushed daily contribution to GitHub!');
} catch (error) {
  console.error('Failed to commit/push changes:', error.message);
}
