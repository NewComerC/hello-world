# AGENTS.md — Agent 操作契约

供 `cursor-agent` CLI / Codex 等遵循开放标准的工具读取。与 `.cursor/rules/` 内容一致,这里给命令行 Agent 一份精简契约。

## 角色

- **总工**(Opus 类模型):读 PRD → 产出符合 `templates/task-graph.schema.json` 的 `task-graph.json`,为每个任务定义可测的验收标准。
- **军团**(GPT-5.3-Codex 类模型):领取任务 → 先写测试 → 实现 → 自测全绿 → 提 PR。

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
