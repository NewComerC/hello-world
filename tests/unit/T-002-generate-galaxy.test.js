const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const INDEX_PATH = path.join(__dirname, '..', '..', 'index.html');

describe('T-002: generateGalaxy particle galaxy', () => {
  test('defines generateGalaxy(scene, particleCount) per interface contract', () => {
    const html = fs.readFileSync(INDEX_PATH, 'utf8');
    assert.match(html, /function generateGalaxy\s*\(\s*scene\s*,\s*particleCount\s*\)/);
  });

  test('uses BufferGeometry with position, color, size attributes', () => {
    const html = fs.readFileSync(INDEX_PATH, 'utf8');
    assert.match(html, /BufferGeometry/);
    assert.match(html, /setAttribute\s*\(\s*['"]position['"]/);
    assert.match(html, /setAttribute\s*\(\s*['"]color['"]/);
    assert.match(html, /setAttribute\s*\(\s*['"]size['"]/);
  });

  test('uses PointsMaterial with vertexColors enabled', () => {
    const html = fs.readFileSync(INDEX_PATH, 'utf8');
    assert.match(html, /PointsMaterial/);
    assert.match(html, /vertexColors\s*:\s*true/);
  });

  test('implements 3 spiral arms with 2π/3 offset', () => {
    const html = fs.readFileSync(INDEX_PATH, 'utf8');
    assert.match(html, /arms:\s*3/);
    assert.match(html, /armOffset|armAngle|CONFIG\.arms/);
    assert.match(html, /Math\.PI\s*\*\s*2/);
  });

  test('exposes scene and generateGalaxy on window for testability', () => {
    const html = fs.readFileSync(INDEX_PATH, 'utf8');
    assert.match(html, /window\.scene\s*=/);
    assert.match(html, /window\.generateGalaxy\s*=/);
  });

  test('includes center halo via Sprite or PointLight', () => {
    const html = fs.readFileSync(INDEX_PATH, 'utf8');
    const hasHalo = /PointLight|Sprite/.test(html);
    assert.ok(hasHalo, 'expected PointLight or Sprite for center glow');
  });
});
