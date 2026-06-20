# AGENTS.md — Agent 操作契约

供 `cursor-agent` CLI / Codex 等遵循开放标准的工具读取。与 `.cursor/rules/` 内容一致,这里给命令行 Agent 一份精简契约。

## 总工角色 (Chief Architect)

> **运行环境：** 独立 4C4G 服务器，Hermes Agent
> **参考文档：** `CHIEF-ARCHITECT.md`

总工是研发矩阵的决策层，负责：

| 职责 | 工具 | 说明 |
|------|------|------|
| 架构设计 | Hermes Agent | 分析需求、写 PRD、出方案 |
| 任务拆解 | task-graph.json | 将 PRD 拆为可执行的任务图 |
| 委派执行 | `codex exec` / delegate_task | 通过 Codex CLI 或 ACP 子 Agent 编码 |
| 验收 | Codex exec / git diff | 检查产出、跑测试 |
| 知识沉淀 | skill / 知识卡片 | 将经验保存复用 |

## 军团角色 (Coding Agent)

> **运行环境：** Codex CLI / cursor-agent
> **启动方式：** 总工通过 `codex exec` 委派

军团是研发矩阵的执行层：

- 领取任务 → 先写测试 → 实现 → 自测全绿 → 提 PR

## 硬规则

1. 门禁不可绕过:验收标准必须有测试覆盖且通过;不许弱化/删除测试来过关。
2. 范围锚定:只做任务要求的事;超范围改动需停下标注,交总工。
3. 一任务一 PR,描述列出任务 id 与验收勾选。
4. 不臆造依赖/接口;信息不足先查或回问。

## 常用命令(按实际项目填写)

```bash
# 安装依赖
# <fill: npm ci / pip install -r requirements.txt>

# 跑测试(门禁依据)
# <fill: npm test / pytest -q>

# lint
# <fill: npm run lint / ruff check>
```

> 接入具体产品仓库后,把上面命令替换成真实命令,CI 门禁与本地自测都依赖它们。
