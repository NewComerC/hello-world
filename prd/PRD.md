# PRD: Hello World — Three.js 交互星系

- **Project ID:** hello-world
- **Version:** 2.0
- **Status:** Draft

## 1. 概述

构建一个视觉惊艳的**交互式 3D 星系粒子系统**作为研发团队矩阵的首个验证项目。单文件 HTML，零后端依赖，在浏览器中运行。通过鼠标拖拽旋转视角、滚轮缩放，带来沉浸式太空体验。

## 2. 目标

1. 验证从 PRD → 实现 → 门禁 → 预览的完整研发流水线
2. 产出可直接通过 `python3 -m http.server 8080` 部署的单页 HTML
3. 视觉上具有极强的演示价值

## 3. 功能需求

### F-1: 3D 粒子星系

- 使用 Three.js（CDN）渲染数千个彩色粒子构成螺旋星系
- 粒子呈螺旋臂分布（2-3 条旋臂）
- 粒子颜色随距离中心远近渐变（中心暖色 → 边缘冷色）
- 粒子缓慢自转，营造星系旋转效果
- 星系中心有一个柔和光晕

### F-2: 鼠标交互

- 鼠标拖拽：旋转视角（OrbitControls）
- 鼠标滚轮：缩放
- 鼠标悬停到粒子时显示微弱 glow 效果（可选）

### F-3: 信息叠加层

- 页面左下角显示「Hello World — Three.js Galaxy」标题
- 右下角显示 FPS 计数器
- 提示文字：「🖱 拖动旋转 · 滚轮缩放」
- 所有 UI 半透明，不遮挡星系

### F-4: 响应式适配

- 全屏自适应（100vw × 100vh）
- 移动端支持 touch 拖拽

### F-5: 性能

- 粒子数量根据设备性能自适应（桌面 8000-15000，移动端 4000-6000）
- 使用 BufferGeometry + Points 而非独立 Mesh
- 无 requestAnimationFrame 泄漏

## 4. 非功能需求

- 单文件 `index.html`，零构建工具
- 从 CDN 加载 Three.js（unpkg 或 cdnjs）
- 首屏加载 < 3s（良好网络条件下）

## 5. 验收标准

- [ ] 3D 螺旋星系正确渲染
- [ ] 粒子自转动画平滑（> 30fps）
- [ ] 鼠标拖拽旋转 + 滚轮缩放正常工作
- [ ] 移动端 touch 交互正常
- [ ] UI 信息层正确显示
- [ ] 响应式全屏适配
- [ ] 无控制台错误
- [ ] 单文件 `index.html`，可直接在浏览器打开

## 6. 技术选型

| 项目 | 选择 |
|------|------|
| 渲染引擎 | Three.js (CDN) |
| 交互控制 | OrbitControls (CDN) |
| 页面 | 单 HTML 内联所有 CSS/JS |
| 部署 | `python3 -m http.server 8080` |
| 性能 | BufferGeometry + Points |

## 7. 任务分解

### Task 1: HTML 框架 + Three.js 场景初始化
- 创建 `index.html` 单文件
- 从 CDN 加载 Three.js 和 OrbitControls
- 初始化场景、相机、渲染器
- 设置全屏黑色背景

### Task 2: 粒子星系生成
- 创建粒子 BufferGeometry
- 实现螺旋星系算法（对数螺旋分布）
- 颜色渐变（中心暖 → 边缘冷）
- 光晕中心效果
- 粒子大小随机分布

### Task 3: 动画循环 + 交互控制
- requestAnimationFrame 自转动画
- OrbitControls 拖拽/缩放
- FPS 计数器 UI
- 自适应粒子数量
- 响应式 resize

### Task 4: 质量门禁 + 测试
- HTML 结构检查
- 控制台无错误测试（Playwright 或 puppeteer）
- 页面截图验收
