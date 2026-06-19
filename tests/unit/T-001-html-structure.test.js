const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const INDEX_PATH = path.join(__dirname, '..', '..', 'index.html');

describe('T-001: index.html structure', () => {
  test('loads three.min.js from unpkg CDN', () => {
    const html = fs.readFileSync(INDEX_PATH, 'utf8');
    assert.match(
      html,
      /https:\/\/unpkg\.com\/three@0\.160\.0\/build\/three\.min\.js/
    );
  });

  test('loads OrbitControls from unpkg CDN', () => {
    const html = fs.readFileSync(INDEX_PATH, 'utf8');
    assert.match(
      html,
      /OrbitControls\.js/
    );
    assert.match(
      html,
      /unpkg\.com\/three@0\.160\.0/
    );
  });

  test('initializes Scene, PerspectiveCamera, WebGLRenderer with black background', () => {
    const html = fs.readFileSync(INDEX_PATH, 'utf8');
    assert.match(html, /new THREE\.Scene\(\)/);
    assert.match(html, /new THREE\.PerspectiveCamera\(/);
    assert.match(html, /new THREE\.WebGLRenderer\(/);
    assert.match(html, /scene\.background = new THREE\.Color\(0x000000\)/);
    assert.match(html, /renderer\.setSize\(window\.innerWidth, window\.innerHeight\)/);
  });
});
