#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const appJsonPath = path.join(__dirname, '..', 'app.json');
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

// Increment patch version
const [major, minor, patch] = appJson.expo.version.split('.').map(Number);
const newVersion = `${major}.${minor}.${patch + 1}`;

appJson.expo.version = newVersion;

fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + '\n');

console.log(`✅ Version bumped to ${newVersion}`);
