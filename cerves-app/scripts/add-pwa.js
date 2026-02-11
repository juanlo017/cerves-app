const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');
const publicDir = path.join(__dirname, '..', 'public');

// Files to copy
const filesToCopy = [
  'manifest.json',
  'service-worker.js',
  'register-sw.js'
];

console.log('📱 Adding PWA support...');

// Copy files from public to dist
filesToCopy.forEach(file => {
  const src = path.join(publicDir, file);
  const dest = path.join(distDir, file);

  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`✅ Copied ${file}`);
  } else {
    console.log(`⚠️  ${file} not found in public/`);
  }
});

// Update all HTML files to include manifest and service worker
const htmlFiles = fs.readdirSync(distDir)
  .filter(file => file.endsWith('.html'));

htmlFiles.forEach(file => {
  const filePath = path.join(distDir, file);
  let html = fs.readFileSync(filePath, 'utf8');

  // Add manifest link if not exists
  if (!html.includes('manifest.json')) {
    html = html.replace(
      '</head>',
      '  <link rel="manifest" href="/manifest.json">\n  <meta name="theme-color" content="#1A1A2E">\n  <meta name="apple-mobile-web-app-capable" content="yes">\n  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">\n  <meta name="apple-mobile-web-app-title" content="Cerves">\n  <link rel="apple-touch-icon" href="/assets/images/icon.png">\n</head>'
    );
  }

  // Add service worker registration if not exists
  if (!html.includes('register-sw.js')) {
    html = html.replace(
      '</body>',
      '  <script src="/register-sw.js"></script>\n</body>'
    );
  }

  fs.writeFileSync(filePath, html);
  console.log(`✅ Updated ${file}`);
});

console.log('✨ PWA support added successfully!');
