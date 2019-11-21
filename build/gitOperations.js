const { execSync } = require('child_process')


exports.gitPush = function gitPush(msg = 'add: add blog') {
  const commands = [
    'git add -A',
    `git ci -m '${msg}'`,
    'git push',
  ]
  commands.forEach(cmd => execSync(cmd))
}