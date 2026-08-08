const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src').filter(f => f.endsWith('.js') || f.endsWith('.jsx'));
let count = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('http://localhost:5000')) {
    
    const replacement = "`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}$1`";
    
    // Match single quotes
    content = content.replace(/'http:\/\/localhost:5000([^']*)'/g, replacement);
    
    // Match double quotes
    content = content.replace(/"http:\/\/localhost:5000([^"]*)"/g, replacement);
    
    // Match backticks (template literals)
    content = content.replace(/`http:\/\/localhost:5000([^`]*)`/g, replacement);
    
    fs.writeFileSync(file, content);
    count++;
  }
});

console.log(`Updated ${count} files.`);
