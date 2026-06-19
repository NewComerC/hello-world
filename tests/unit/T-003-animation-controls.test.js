const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const INDEX_PATH = path.join(__dirname, '..', '..', 'index.html');

describe('T-003: animation loop + interaction controls', () => {
  test('defines animate(), onWindowResize(), updateFPS() per interface contract', () => {
    const html = fs.readFileSync(INDEX_PATH, 'utf8');
    assert.match(html, /function animate\s*\(\s*\)/);
    assert.match(html, /function onWindowResize\s*\(\s*\)/);
    assert.match(html, /function updateFPS\s*\(\s*\)/);
  });

  test('uses requestAnimationFrame animation loop with galaxy rotation', () => {
    const html = fs.readFileSync(INDEX_PATH, 'utf8');
    assert.match(html, /requestAnimationFrame\s*\(\s*animate\s*\)/);
    assert.match(html, /galaxyRef\.rotation\.y\s*\+=/);
    assert.match(html, /cancelAnimationFrame\s*\(\s*animationId\s*\)/);
  });

  test('configures OrbitControls with enableDamping=true', () => {
    const html = fs.readFileSync(INDEX_PATH, 'utf8');
    assert.match(html, /new OrbitControls\s*\(\s*camera\s*,\s*renderer\.domElement\s*\)/);
    assert.match(html, /controls\.enableDamping\s*=\s*true/);
  });

  test('handles window resize for fullscreen canvas', () => {
    const html = fs.readFileSync(INDEX_PATH, 'utf8');
    assert.match(html, /camera\.aspect\s*=\s*window\.innerWidth\s*\/\s*window\.innerHeight/);
    assert.match(html, /camera\.updateProjectionMatrix\s*\(\s*\)/);
    assert.match(html, /renderer\.setSize\s*\(\s*window\.innerWidth\s*,\s*window\.innerHeight\s*\)/);
    assert.match(html, /addEventListener\s*\(\s*['"]resize['"]\s*,\s*onWindowResize\s*\)/);
  });

  test('updates FPS counter DOM element each second', () => {
    const html = fs.readFileSync(INDEX_PATH, 'utf8');
    assert.match(html, /id\s*=\s*["']fps-counter["']/);
    assert.match(html, /getElementById\s*\(\s*['"]fps-counter['"]\s*\)/);
    assert.match(html, /fpsElement\.textContent\s*=/);
  });

  test('exposes animate, onWindowResize, updateFPS, controls on window', () => {
    const html = fs.readFileSync(INDEX_PATH, 'utf8');
    assert.match(html, /window\.animate\s*=/);
    assert.match(html, /window\.onWindowResize\s*=/);
    assert.match(html, /window\.updateFPS\s*=/);
    assert.match(html, /window\.controls\s*=/);
  });
});
