const fs = require('fs');
const path = require('path');

const themes = [
  'original-warm', 'classic-elegant', 'modern-minimal', 'romantic-flower',
  'nature-green', 'luxury-gold', 'simple-clean', 'vintage-film',
  'watercolor-soft', 'midnight-navy', 'pastel-dream', 'korean-traditional'
];

const templatesData = {};

for (const theme of themes) {
  const dir = path.join(__dirname, 'templates', theme);
  const htmlPath = path.join(dir, 'index.html');
  const cssPath = path.join(dir, 'styles.css');
  const jsPath = path.join(dir, 'script.js');

  if (fs.existsSync(htmlPath) && fs.existsSync(cssPath) && fs.existsSync(jsPath)) {
    const html = fs.readFileSync(htmlPath, 'utf8');
    const css = fs.readFileSync(cssPath, 'utf8');
    const js = fs.readFileSync(jsPath, 'utf8');

    templatesData[theme] = { html, css, js };
    console.log(`Compiled ${theme}`);
  } else {
    console.error(`Missing files in ${theme}`);
  }
}

const outputContent = `// Compiled templates data for local file:// protocol compatibility
const TEMPLATES_DATA = ${JSON.stringify(templatesData, null, 2)};
`;

fs.writeFileSync(path.join(__dirname, 'templates_data.js'), outputContent, 'utf8');
console.log('Successfully generated templates_data.js');
