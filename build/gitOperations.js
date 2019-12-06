const { execSync } = require('child_process')


exports.gitPush = function gitPush(msg = 'add: add blog') {
  const commands = [
    'git add .',
    `git commit -m '${msg}'`,
    'git push -f',
  ]
  commands.forEach(cmd => execSync(cmd))
}