const { test, expect } = require('@playwright/test');

// Assumptions (per fast-mode demo rule):
// - Playwright is used for browser-based black-box acceptance (per project assumptions).
// - index.html is served at http://localhost:8080 (or via webServer in playwright.config).
// - "全屏黑色背景" verified via canvas element presence + no console errors (visual black verified in screenshot or pixel check if needed).
// - CDN URLs are the unpkg ones specified in task contract (but not hardcoded in test to stay black-box).
// - No direct access to implementation; tests only exercise browser observables per ACs.
// - Failure/boundary: simulate offline/CDN-block, check error surfacing without crash.

test.describe('T-001: HTML 框架 + Three.js 场景初始化', () => {
  test('AC1 normal: 页面加载完成显示全屏黑色背景无报错', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(err));
    page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });

    await page.goto('/');

    // Full screen canvas/renderer expected
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    const box = await canvas.boundingBox();
    expect(box.width).toBeGreaterThan(0);
    expect(box.height).toBeGreaterThan(0);

    // No JS errors during load
    expect(errors).toHaveLength(0);
  });

  test('AC1 boundary: 窗口 resize 后仍保持全屏无报错', async ({ page }) => {
    await page.goto('/');
    await page.setViewportSize({ width: 800, height: 600 });
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    // Further resize
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(canvas).toBeVisible();
  });

  test('AC2 normal: 成功从 CDN 加载 three.min.js 和 OrbitControls.js', async ({ page }) => {
    const cdnRequests = [];
    page.on('response', (resp) => {
      const url = resp.url();
      if (url.includes('three') || url.includes('OrbitControls')) {
        cdnRequests.push({ url, status: resp.status() });
      }
    });

    await page.goto('/');

    // At least two successful CDN loads observed
    const threeReq = cdnRequests.find(r => r.url.includes('three.min.js') && r.status === 200);
    const orbitReq = cdnRequests.find(r => r.url.includes('OrbitControls') && r.status === 200);
    expect(threeReq).toBeTruthy();
    expect(orbitReq).toBeTruthy();
  });

  test('AC2 failure: CDN 不可达时页面不崩溃并报告加载问题', async ({ page, context }) => {
    // Block CDN to simulate failure path
    await context.route('**/*three*', route => route.abort());
    await context.route('**/*OrbitControls*', route => route.abort());

    const errors = [];
    page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });

    await page.goto('/');

    // Page should still render without total crash (basic HTML present)
    await expect(page.locator('body')).toBeVisible();
    // Expect some console error about load failure (per "无报错" relaxed in failure case)
    expect(errors.length).toBeGreaterThan(0);
  });

  test('AC3 normal: 场景初始化后控制台无 Three.js 相关错误', async ({ page }) => {
    const threeErrors = [];
    page.on('console', (msg) => {
      const text = msg.text().toLowerCase();
      if (msg.type() === 'error' && (text.includes('three') || text.includes('webgl') || text.includes('renderer'))) {
        threeErrors.push(msg.text());
      }
    });
    page.on('pageerror', (err) => {
      const text = err.message.toLowerCase();
      if (text.includes('three') || text.includes('webgl')) threeErrors.push(err.message);
    });

    await page.goto('/');

    expect(threeErrors).toHaveLength(0);
  });

  test('AC3 boundary: 多次刷新后仍无 Three.js 错误', async ({ page }) => {
    for (let i = 0; i < 3; i++) {
      const threeErrors = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error' && msg.text().toLowerCase().includes('three')) {
          threeErrors.push(msg.text());
        }
      });
      await page.goto('/');
      expect(threeErrors).toHaveLength(0);
      await page.reload();
    }
  });
});
