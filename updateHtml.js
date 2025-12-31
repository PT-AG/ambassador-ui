const fs = require('fs');
const path = './dist/index.html'; 


let html = fs.readFileSync(path, 'utf8');


html = html.replace('app.bundle.js', 'app.bundle.min.js');


fs.writeFileSync(path, html);

console.log('HTML updated to use app.bundle.min.js');
