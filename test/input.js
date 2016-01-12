var readline = require('readline');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Name: ', function(answer) {
  console.log('Your name is ' + answer);
  rl.close();
});

process.on('SIGINT', function() {
  console.log('SIGINT received!');
  process.exit(0);
});
