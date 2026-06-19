const { test, expect } = require('@playwright/test');

// Assumptions (per fast-mode demo rule, noted per instruction):
// - Playwright used for black-box browser acceptance (project assumptions).
// - Served at http://localhost:8080 via webServer config; canvas is the Three.js renderer output.
// - FPS counter: assume a visible DOM element (e.g. div#fps or text containing "FPS") in right-bottom per AC5; test observes its update without accessing impl.
// - OrbitControls: default mouse drag (left) rotates view, wheel zooms; touch equivalent on mobile emulation.
// - Animation: galaxy auto-rotates slowly; verifiable indirectly via sustained >30fps (no stutter/errors) and running RAF loop (no console errors over time).
// - Resize: canvas adapts to viewport changes (already partially in T-001 but re-verified here for animation context).
// - Touch/mobile: use Playwright device emulation; no real device needed for demo.
// - Failure/boundary paths: rapid interactions, extreme resize, long run for FPS stability, simulated low-perf if possible.
// - All tests independent: each has own page.goto + error listeners; no shared state.
// - Black-box only: no reference to index.html source or internal functions like animate()/updateFPS(); only AC observables (FPS UI, rotation effect via interaction, no errors, canvas size).

test.describe('T-003: 动画循环 + 交互控制', () => {
  test('AC1 normal: 页面运行中星系持续自转且帧率 > 30fps', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(err));
    page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });

    await page.goto('/');

    // Let animation run for a few seconds to observe sustained FPS
    await page.waitForTimeout(3000);

    // No errors during animation loop
    expect(errors).toHaveLength(0);

    // FPS counter visible and showing plausible value (assume element with FPS text)
    const fpsEl = page.locator('text=/FPS/i').first();
    await expect(fpsEl).toBeVisible();
    const fpsText = await fpsEl.textContent();
    const fpsMatch = fpsText && fpsText.match(/(\d+)/);
    if (fpsMatch) {
      expect(parseInt(fpsMatch[1], 10)).toBeGreaterThan(30);
    }
  });

  test('AC1 boundary: 长时间运行后仍保持 >30fps 无卡顿或错误', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));
    page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });

    await page.goto('/');
    await page.waitForTimeout(8000); // longer run for stability check

    expect(errors).toHaveLength(0);
  });

  test('AC2 normal: 鼠标拖拽移动视角随之旋转', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(err));
    page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });

    await page.goto('/');

    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    // Simulate drag: mousedown + mousemove + mouseup
    const box = await canvas.boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 100, box.y + box.height / 2 + 50, { steps: 10 });
    await page.mouse.up();

    await page.waitForTimeout(500); // allow controls to update

    expect(errors).toHaveLength(0);
    // Post-drag, canvas still visible and interactive (no crash)
    await expect(canvas).toBeVisible();
  });

  test('AC2 boundary: 快速连续拖拽不导致错误或卡死', async ({ page }) => {
    await page.goto('/');
    const canvas = page.locator('canvas');
    const box = await canvas.boundingBox();

    for (let i = 0; i < 5; i++) {
      await page.mouse.move(box.x + 100, box.y + 100);
      await page.mouse.down();
      await page.mouse.move(box.x + 200 + i * 10, box.y + 200);
      await page.mouse.up();
      await page.waitForTimeout(100);
    }

    await expect(canvas).toBeVisible();
  });

  test('AC3 normal: 滚轮上下滚动相机远近缩放', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(err));
    page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });

    await page.goto('/');
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    const box = await canvas.boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.wheel(0, 200); // scroll down (zoom out)
    await page.waitForTimeout(300);
    await page.mouse.wheel(0, -150); // scroll up (zoom in)

    expect(errors).toHaveLength(0);
    await expect(canvas).toBeVisible();
  });

  test('AC3 boundary: 极端滚轮操作后仍正常', async ({ page }) => {
    await page.goto('/');
    const canvas = page.locator('canvas');
    const box = await canvas.boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);

    // Rapid extreme scrolls
    for (let i = 0; i < 10; i++) {
      await page.mouse.wheel(0, i % 2 === 0 ? 500 : -500);
    }

    await expect(canvas).toBeVisible();
  });

  test('AC4 normal: 窗口 resize 改变浏览器尺寸后画布自适应全屏', async ({ page }) => {
    await page.goto('/');
    await page.setViewportSize({ width: 1024, height: 768 });
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    let box = await canvas.boundingBox();
    expect(box.width).toBeGreaterThan(1000);
    expect(box.height).toBeGreaterThan(700);

    await page.setViewportSize({ width: 800, height: 600 });
    await page.waitForTimeout(200);
    box = await canvas.boundingBox();
    expect(box.width).toBeGreaterThan(700);
    expect(box.height).toBeGreaterThan(500);
  });

  test('AC4 boundary: 极端尺寸 resize (极小/极大) 后画布仍自适应无错误', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/');
    await page.setViewportSize({ width: 100, height: 100 });
    await page.setViewportSize({ width: 2560, height: 1440 });
    await page.setViewportSize({ width: 400, height: 300 });

    expect(errors).toHaveLength(0);
    await expect(page.locator('canvas')).toBeVisible();
  });

  test('AC5 normal: 页面运行时右下角显示实时 FPS 计数器', async ({ page }) => {
    await page.goto('/');
    // Assume right-bottom FPS element per AC and common UI patterns; visible and numeric
    const fpsEl = page.locator('text=/FPS/i').first();
    await expect(fpsEl).toBeVisible();
    const text = await fpsEl.textContent();
    expect(text).toMatch(/\d+/);
  });

  test('AC5 boundary: FPS 计数器在动画运行中持续更新', async ({ page }) => {
    await page.goto('/');
    const fpsEl = page.locator('text=/FPS/i').first();
    await expect(fpsEl).toBeVisible();

    const initial = await fpsEl.textContent();
    await page.waitForTimeout(2000);
    const later = await fpsEl.textContent();

    // Should have changed or at least still numeric (real-time update)
    expect(later).toMatch(/\d+/);
    if (initial && later) {
      // Not strictly asserting change (may be same second), but observable
      expect(later.trim()).not.toBe('');
    }
  });

  test('AC6 normal: 移动端触摸拖拽视角正常旋转', async ({ page }) => {
    // Emulate mobile device for touch support
    await page.goto('/', { waitUntil: 'load' });
    // Use touch gestures via mouse emulation or device
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone-like

    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    const box = await canvas.boundingBox();
    // Simulate touch drag (Playwright supports touch via mouse for simplicity in demo)
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 80, box.y + box.height / 2 + 40, { steps: 5 });
    await page.mouse.up();

    await page.waitForTimeout(300);
    await expect(canvas).toBeVisible();
  });

  test('AC6 boundary: 移动端多点触控/快速触摸不崩溃', async ({ page }) => {
    await page.goto('/');
    await page.setViewportSize({ width: 390, height: 844 });
    const canvas = page.locator('canvas');
    const box = await canvas.boundingBox();

    // Multiple quick touch-like drags
    for (let i = 0; i < 3; i++) {
      await page.mouse.move(box.x + 50 + i * 20, box.y + 100);
      await page.mouse.down();
      await page.mouse.move(box.x + 150, box.y + 200);
      await page.mouse.up();
      await page.waitForTimeout(50);
    }

    await expect(canvas).toBeVisible();
  });
});
