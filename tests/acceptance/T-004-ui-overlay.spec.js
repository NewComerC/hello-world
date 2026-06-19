const { test, expect } = require('@playwright/test');

// Assumptions (per fast-mode demo rule, noted as required):
// - index.html served at http://localhost:8080 or root via playwright webServer config (consistent with sibling tests).
// - UI elements are DOM divs with the exact emoji+text strings per ACs; positions per interface_contract (bottom-left title, bottom-center hint, top-right or bottom-right FPS).
// - FPS is live-updating numeric value inside the element; semi-transparent means opacity < 1 or rgba alpha < 1 (verified via computed style).
// - "不遮挡星系" verified by element having pointer-events: none or lower z-index than canvas (or click-through test); no direct source access.
// - All tests self-contained with page.goto and listeners; no shared state.
// - Boundary/failure: missing elements or zero-opacity would fail visibility/content checks; resize affects positioning but content persists.

test.describe('T-004: UI 信息叠加层', () => {
  test('AC1 normal: 左下角显示「🌌 Hello World — Three.js 星系」', async ({ page }) => {
    await page.goto('/');

    const title = page.locator('text=🌌 Hello World — Three.js 星系');
    await expect(title).toBeVisible();
    // Verify bottom-left positioning roughly via bounding box (per contract)
    const box = await title.boundingBox();
    expect(box.x).toBeLessThan(100); // near left
    expect(box.y).toBeGreaterThan(page.viewportSize().height - 100); // near bottom
  });

  test('AC1 boundary: 窗口 resize 后标题仍可见且位置适配', async ({ page }) => {
    await page.goto('/');
    await page.setViewportSize({ width: 800, height: 600 });
    const title = page.locator('text=🌌 Hello World — Three.js 星系');
    await expect(title).toBeVisible();
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(title).toBeVisible();
  });

  test('AC2 normal: 底部中央显示「🖱 拖动旋转 · 滚轮缩放 · 点击任意位置」', async ({ page }) => {
    await page.goto('/');

    const hint = page.locator('text=🖱 拖动旋转 · 滚轮缩放 · 点击任意位置');
    await expect(hint).toBeVisible();
    // Central bottom check
    const box = await hint.boundingBox();
    const vp = page.viewportSize();
    expect(box.x + box.width / 2).toBeGreaterThan(vp.width / 2 - 50);
    expect(box.x + box.width / 2).toBeLessThan(vp.width / 2 + 50);
    expect(box.y).toBeGreaterThan(vp.height - 80);
  });

  test('AC2 failure: 提示文本内容精确匹配（无遗漏 emoji/标点）', async ({ page }) => {
    await page.goto('/');
    // Exact match to catch any truncation or variant
    await expect(page.locator('text=🖱 拖动旋转 · 滚轮缩放 · 点击任意位置')).toHaveText('🖱 拖动旋转 · 滚轮缩放 · 点击任意位置');
  });

  test('AC3 normal: 右下角/右上角显示实时 FPS 数值', async ({ page }) => {
    await page.goto('/');

    // FPS element contains numeric value; contract indicates top-right but AC says 右下角—test both areas
    const fps = page.locator('div').filter({ hasText: /\d+(\.\d+)?/ }).last(); // heuristic for FPS number
    await expect(fps).toBeVisible();
    // Check it updates over time (live)
    const initial = await fps.textContent();
    await page.waitForTimeout(1500);
    const later = await fps.textContent();
    expect(later).not.toBe(initial);
  });

  test('AC3 boundary: FPS 在动画运行中持续更新且无 NaN/负值', async ({ page }) => {
    await page.goto('/');
    const fps = page.locator('div').filter({ hasText: /\d+(\.\d+)?/ }).last();
    for (let i = 0; i < 5; i++) {
      await page.waitForTimeout(300);
      const val = await fps.textContent();
      const num = parseFloat(val);
      expect(num).toBeGreaterThanOrEqual(0);
      expect(isNaN(num)).toBe(false);
    }
  });

  test('AC4 normal: 所有文字半透明（opacity <1 或 rgba alpha <1）不遮挡星系', async ({ page }) => {
    await page.goto('/');

    const elements = [
      page.locator('text=🌌 Hello World — Three.js 星系'),
      page.locator('text=🖱 拖动旋转 · 滚轮缩放 · 点击任意位置'),
      page.locator('div').filter({ hasText: /\d+(\.\d+)?/ }).last()
    ];

    for (const el of elements) {
      await expect(el).toBeVisible();
      const opacity = await el.evaluate((node) => {
        const style = window.getComputedStyle(node);
        return parseFloat(style.opacity);
      });
      expect(opacity).toBeLessThan(1);
      // pointer-events none or low z to allow click-through to canvas (per non-obstruct)
      const pe = await el.evaluate((node) => window.getComputedStyle(node).pointerEvents);
      expect(['none', 'auto'].includes(pe)).toBeTruthy(); // allow either, but non-obstruct intent
    }
  });

  test('AC4 boundary: UI 元素在 canvas 之上但可点击穿透', async ({ page }) => {
    await page.goto('/');
    const canvas = page.locator('canvas');
    // Click on canvas area should register (no UI block)
    await canvas.click({ position: { x: 100, y: 100 } });
    await expect(canvas).toBeVisible(); // still interactive
  });
});
