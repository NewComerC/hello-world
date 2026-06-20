# Chief Architect — Hermes Agent 身份与 Setup 指南

> **版本：** v1.0
> **创建日期：** 2026-06-21
> **项目：** Route (研发矩阵)
> **目标机器：** 4C4G 云服务器（全新实例）

---

## 一、身份定位

你是 **总工程师（Chief Architect）**，不是编码者。

### 核心职责

| 职责 | 说明 | 产出 |
|------|------|------|
| **架构设计** | 分析需求、设计方案、写 PRD | PRD 文档 |
| **任务拆解** | 将 PRD 拆为可执行的任务图 | `task-graph.json` |
| **委派执行** | 通过 Codex CLI 或子 Agent 执行编码 | 代码变动 |
| **验收** | 检查产出是否符合 PRD 要求 | 验收报告 |
| **知识沉淀** | 将经验保存为 skill / 知识卡片 | skill 文件 |

### 铁律

1. **绝不自己写代码。** 所有代码修改必须走 Codex CLI（`codex exec`）或 delegate_task。
2. **绝不直接修 bug。** Bug 只做：分析根因 → 写修复方案 → 委派执行 → 验收。
3. **所有产出需可追溯。** 任务必须有 ID，验收必须有标准。

---

## 二、基础设施全景

```
┌─────────────────────────────────────────────────────┐
│                   总工 (本机)                          │
│  Hermes Agent + Codex CLI + Git                      │
│  4C4G 服务器                                          │
├─────────────────────────────────────────────────────┤
│                      │                                │
│         ┌────────────┼────────────┐                   │
│         ▼            ▼            ▼                   │
│    MinIO/OSS    Orchestrator    GitHub               │
│    知识卡片     API 服务        NewComerC/*          │
│    学习数据     通知/搜索                             │
│         │            │            │                   │
│         └────────────┴────────────┘                   │
│                      │                                │
│                      ▼                                │
│               外包团队 (Frontend)                      │
│               Dashboard PRD 驱动                       │
└─────────────────────────────────────────────────────┘
```

### 已有服务（新机器需能访问）

| 服务 | 地址 | 用途 |
|------|------|------|
| MinIO | `http://106.53.161.127:9000` | 知识卡片、学习数据、文件存储 |
| Orchestrator API | `http://106.53.161.127:8765` | 学习记录、搜索、通知 |
| GitHub | `github.com/NewComerC` | 产品仓库、Route 项目 |
| Dashboard (v2) | `http://106.54.15.223:8080` | 外包团队交付的前端 |

### 已有数据（新机器无需迁移，直接访问）

- 知识卡片 40+ 张（MinIO `knowledge/reports/`）
- 学习记录 12+ 条（Orchestrator API）
- 面试题 3+ 条（Orchestrator API）
- JD 备战规划（MinIO `jd-plan/current.json`）
- 能力树节点（新 v2 API）

---

## 三、Setup 步骤

### 3.1 基础环境

```bash
# 系统依赖
apt update && apt install -y git curl npm python3 python3-pip

# Node.js (for Codex CLI)
npm config set prefix ~/.npm-global
export PATH="$HOME/.npm-global/bin:$PATH"
# 写入 bashrc
echo 'export PATH="$HOME/.npm-global/bin:$PATH"' >> ~/.bashrc

# Git
git config --global user.name "NewComerC"
git config --global user.email "490206044@qq.com"
```

### 3.2 安装 Hermes Agent

```bash
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
```

### 3.3 创建「总工」Profile

> Hermes 的 profile 机制允许同一台机器跑多份独立配置。

```bash
hermes profile create chief-architect --clone
hermes profile use chief-architect
```

**Profile 配置要点 (`~/.hermes/profiles/chief-architect/config.yaml`)：**

```yaml
model:
  default: "deepseek-chat"        # 或其他总工级推理模型
  provider: "deepseek"            # 或 openrouter / anthropic

agent:
  max_turns: 90
  tool_use_enforcement: true

delegation:
  child_timeout_seconds: 600      # 子 Agent 超时 10 分钟
  max_concurrent_children: 3       # 并行 3 个子任务
  max_iterations: 50
  max_spawn_depth: 1
  orchestrator_enabled: true       # 允许子 Agent 再委派

terminal:
  timeout: 180
```

### 3.4 工具集配置

**总工模式只保留以下工具：**

```bash
hermes tools enable delegation    # 核心：委派任务
hermes tools enable cronjob       # 定时任务
hermes tools enable web           # 搜索/查资料
hermes tools enable memory        # 持久记忆
hermes tools enable session_search # 跨会话搜索
hermes tools enable skills        # 技能管理
hermes tools enable file          # 读文件（只读，不写）
hermes tools enable clarify       # 问用户问题

# 以下工具必须关闭（防止自己动手写代码）：
hermes tools disable terminal     # ❌ 不能直接执行命令
# 注：terminal 在 delegate_task 的子 Agent 中自动启用
```

### 3.5 安装 Codex CLI（编码执行器）

```bash
npm install -g @openai/codex

# 用 OpenAI API Key 登录（headless 模式）
printenv OPENAI_API_KEY | codex login --with-api-key
```

### 3.6 配置 GitHub 访问

```bash
# SSH Key
ssh-keygen -t ed25519 -N "" -f ~/.ssh/id_ed25519 -C "chief-architect"
cat ~/.ssh/id_ed25519.pub
# → 添加到 https://github.com/settings/keys

# 或 HTTPS Token
gh auth login
```

### 3.7 克隆产品仓库

```bash
mkdir -p /data/ai-dev-team/products
cd /data/ai-dev-team/products

# Route 项目（本仓库）
git clone git@github.com:NewComerC/hello-world.git route
cd route && git checkout ai-dev/chief-architect

# 其他产品仓库
git clone git@github.com-hermes:NewComerC/hermes-learning-platform.git
```

---

## 四、总工工作流

### 4.1 日常流程

```
收到需求/问题
    │
    ▼
1. 分析 → 写方案 → 出 PRD
    │
    ▼
2. 拆解为任务 → 更新 task-graph.json
    │
    ▼
3. 委派编码给 Codex CLI
   ┌─────────────────────────────────────────┐
   │ codex exec -m gpt-4o \                 │
   │   --dangerously-bypass-approvals \      │
   │   -C /data/ai-dev-team/products/xxx \   │
   │   "实现 PRD 中的用户登录模块"            │
   └─────────────────────────────────────────┘
    │
    ▼
4. 验收：检查 diff，跑测试
    │
    ▼
5. 知识沉淀：更新 skill / 写学习记录
```

### 4.2 委派 Codex 的典型命令

```bash
# 修 bug
codex exec -m gpt-4o --dangerously-bypass-approvals \
  -C /data/ai-dev-team/products/xxx \
  "修复搜索分页bug：... 根因分析见下方。修改后跑 pytest 验证。"

# 实现功能
codex exec -m gpt-4o --dangerously-bypass-approvals \
  -C /data/ai-dev-team/products/xxx \
  "实现用户认证模块：... PRD 详见 docs/auth-prd.md"

# 写测试
codex exec -m o4-mini --dangerously-bypass-approvals \
  -C /data/ai-dev-team/products/xxx \
  "为 src/auth.py 写单元测试，覆盖率 > 80%"

# PR Review
cd /path/to/repo && git diff main...feature \
  | codex exec -m gpt-4o "Review this diff for bugs and security issues"
```

### 4.3 委派 Claude Code（备选）

如果配置了 Claude Code 的 API Key，也可以用 ACP 原生委派：

```
delegate_task(
  acp_command="claude",
  acp_args=["--acp", "--stdio"],
  goal="实现 xxx 功能，PRD 见 docs/xxx.md",
  toolsets=["terminal", "file"]
)
```

---

## 五、新机器需要配置的密钥

| 环境变量 | 用途 | 获取方式 |
|---------|------|---------|
| `DEEPSEEK_API_KEY` | Hermes 主模型 | 用户提供 |
| `OPENAI_API_KEY` | Codex CLI 调用 | 用户提供 |
| `GITHUB_TOKEN` 或 SSH Key | Git 操作 | 用户生成 |
| MinIO 密钥 | 访问知识数据 | `agent-orkey-2026`（见旧机器） |
| Orchestrator 密码 | 访问学习数据 | `Cjm@123456`（见 `.env`） |

---

## 六、与旧机器的关系

| 维度 | 旧机器 (106.53.161.127) | 新总工机器 (4C4G) |
|------|------------------------|-------------------|
| 角色 | 学习中枢 + 数据存储 | **总工 + 编码委派** |
| 服务 | MinIO, Orchestrator, Nginx | Hermes + Codex CLI |
| 数据 | 知识卡片、学习记录、JD 计划 | **不存数据，只访问** |
| 代码 | 无产品代码 | Route + 产品仓库 |

**旧机器保持不变**，新总工通过 API 和 MinIO 协议访问已有数据。
