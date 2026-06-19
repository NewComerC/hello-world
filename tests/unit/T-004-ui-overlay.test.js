const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const INDEX_PATH = path.join(__dirname, '..', '..', 'index.html');

describe('T-004: UI overlay layer', () => {
  test('title element shows Chinese galaxy title at bottom-left', () => {
    const html = fs.readFileSync(INDEX_PATH, 'utf8');
    assert.match(html, /id\s*=\s*["']title["']/);
    assert.match(html, /🌌 Hello World — Three\.js 星系/);
    assert.match(html, /#title[\s\S]*bottom:\s*20px/);
    assert.match(html, /#title[\s\S]*left:\s*20px/);
  });

  test('hint element shows interaction guide at bottom center', () => {
    const html = fs.readFileSync(INDEX_PATH, 'utf8');
    assert.match(html, /id\s*=\s*["']hint["']/);
    assert.match(html, /🖱 拖动旋转 · 滚轮缩放 · 点击任意位置/);
    assert.match(html, /#hint[\s\S]*bottom:\s*20px/);
    assert.match(html, /#hint[\s\S]*translateX\(-50%\)/);
  });

  test('fps element positioned top-right with live update hook', () => {
    const html = fs.readFileSync(INDEX_PATH, 'utf8');
    assert.match(html, /id\s*=\s*["']fps-counter["']/);
    assert.match(html, /#fps-counter[\s\S]*top:\s*20px/);
    assert.match(html, /#fps-counter[\s\S]*right:\s*20px/);
    assert.match(html, /getElementById\s*\(\s*['"]fps-counter['"]\s*\)/);
    assert.match(html, /fpsElement\.textContent\s*=/);
  });

  test('ui layer uses pointer-events none for click-through', () => {
    const html = fs.readFileSync(INDEX_PATH, 'utf8');
    assert.match(html, /#ui-layer[\s\S]*pointer-events:\s*none/);
  });

  test('ui text uses semi-transparent styling', () => {
    const html = fs.readFileSync(INDEX_PATH, 'utf8');
    assert.match(html, /\.ui-text[\s\S]*opacity:\s*0\.[0-9]+/);
    assert.match(html, /rgba\(255,\s*255,\s*255,\s*0\.[0-9]+\)/);
  });
});
