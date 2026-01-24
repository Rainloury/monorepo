# NAS Monorepo 的 Copilot 指南

## 项目概述

这是一个 pnpm monorepo，包含多个应用（主要是 **builder**，一个 Vue 3 + TypeScript + Vite 应用）。该项目通过自动化检查、测试和 commit 约定来强制执行严格的代码质量标准。

## 架构和关键模式

### Monorepo 结构

- **apps/**: 自包含的应用（例如 `builder/`）
- **packages/**: 共享库（规划中的结构）
- **pnpm-workspace.yaml**: 将工作空间定义为 `apps/*` 和 `packages/*`
- 使用 `pnpm --filter <app>` 运行特定应用的命令（例如 `pnpm --filter builder run dev`）

### Vue 3 + Composition API + TypeScript

- **SFC（单文件组件）**: 使用 `<script setup lang="ts">` 语法的文件；Vue 编译器自动公开 Composition API 函数（ref、computed、watch 等），无需导入
- **Pinia Store 模式**: 使用 `defineStore()` 和 composition API 函数（参见 [apps/builder/src/stores/counter.ts](apps/builder/src/stores/counter.ts)）- store 逻辑必须返回暴露的状态/方法
- **Vue Router**: 配置在 [apps/builder/src/router/index.ts](apps/builder/src/router/index.ts) 中，建议使用懒加载路由
- **路径别名**: `@` 在所有应用配置中解析为 `src/` 目录

### 使用 vue-tsc 的类型安全

- 构建使用 `vue-tsc --build`（而不是标准的 `tsc`）来处理 `.vue` 文件的类型检查
- 类型错误会阻止构建；提交前始终运行 `pnpm run type-check`
- `.vue` 导入必须通过 `vue-tsc` 获得适当的 TypeScript 支持

## 关键开发工作流程

### 开发和测试

- **开发服务器**: `pnpm --filter builder run dev`（端口 5173）
- **单元测试**: `pnpm --filter builder run test:unit`（vitest 使用 jsdom 环境）
- **E2E 测试**: `pnpm --filter builder run test:e2e`（Playwright，baseURL 为 http://localhost:5173 或 CI 上的 4173）
- **类型检查**: `pnpm --filter builder run type-check`（提交前必须通过）
- **构建**: `pnpm --filter builder run build`（并行运行类型检查和 vite 构建）

### 代码质量

- **检查链**: ESLint → oxlint → prettier 格式化
    - `pnpm --filter builder run lint` 运行所有带 --fix 的检查工具
    - ESLint（vue/setup 作用域）预定义 Vue Composition API 函数为全局变量（ref、computed、watch 等）
    - oxlint 提供快速的基于 Rust 的检查，用于正确性检查
    - simple-import-sort 强制一致的导入组织
- **样式检查**: stylelint（标准 + SCSS + Vue 覆盖）
- **拼写检查**: cspell，自定义字典位于 `.cspell/custom-words.txt`
- **Commit 检查**: commitlint 强制执行约定式提交（类型：feat、fix、docs、style、refactor、test、chore、revert）

### Git 工作流程

- 使用 `pnpm commit` 运行 commitizen 进行引导式约定式提交
- Pre-commit 钩子（husky + lint-staged）在暂存时自动修复代码：
    - JS/TS 文件: prettier → eslint --fix
    - CSS/SCSS: prettier → stylelint --fix
    - Vue 文件: prettier → stylelint → eslint
    - JSON: prettier
- Commits 必须遵循约定式格式（由 commitlint 强制执行）

## 项目特定约定

### 导入组织（ESLint simple-import-sort）

- 组会自动排序：builtins → externals → internals → 相对导入
- 示例：`import { ref } from 'vue'` 出现在 `import { useStore } from '@/stores'` 之前

### Vue 全局变量

在 `.vue` 文件中，由于 ESLint 配置，这些变量自动可用，无需导入：

```
ref, computed, reactive, shallowRef, shallowReactive, toRef, toRefs, watch, watchEffect, defineProps, defineEmits, defineExpose, onMounted, onUnmounted
```

### 生产代码中禁用 Console

- `no-console` ESLint 规则强制执行；仅在测试/开发文件中允许
- 使用适当的日志模式或存储调试日志

### 配置文件位置

- **ESLint**: [eslint.config.js](eslint.config.js)（flat config 格式）
- **Vite**: [apps/builder/vite.config.ts](apps/builder/vite.config.ts)
- **TypeScript**: [apps/builder/tsconfig.json](apps/builder/tsconfig.json)（扩展 @vue/tsconfig）
- **Vitest**: [apps/builder/vitest.config.ts](apps/builder/vitest.config.ts)（与 vite config 合并）
- **Playwright**: [apps/builder/playwright.config.ts](apps/builder/playwright.config.ts)（baseURL 取决于上下文）

## 命令速查表

```bash
# 开发
pnpm dev:builder              # 启动 builder 开发服务器
pnpm --filter builder run dev # 备选范围语法

# 测试
pnpm --filter builder run test:unit     # 运行单元测试
pnpm --filter builder run test:e2e      # 运行 E2E 测试

# 代码质量
pnpm lint:vue                 # 对所有应用/包执行 ESLint
pnpm lint:style               # 对所有应用/包执行 Stylelint
pnpm spellcheck               # 使用 cspell 进行拼写检查
pnpm --filter builder run lint # 为 builder 运行所有检查工具

# 类型检查和构建
pnpm --filter builder run type-check # 对 builder 进行类型检查
pnpm --filter builder run build      # 完整的生产构建

# Commits
pnpm commit  # Commitizen 引导式提交
```

## 在此代码库中工作时

1. **编写代码前**: 运行 `pnpm --filter builder run dev` 以启动带 HMR 的开发服务器
2. **提交前**: 运行 `pnpm --filter builder run lint && pnpm --filter builder run type-check` 以确保质量门禁通过
3. **功能测试**: 在 `__tests__/`（单元测试）或 `e2e/`（集成测试）中添加 `.spec.ts`
4. **Vue 组件编辑**: 组件使用 `<script setup>` - 无需导出默认值或显式导入 composition API 函数
5. **Store 创建**: 使用 Pinia 的 composition API 风格，`defineStore()` 返回暴露的状态/方法（参见 counter.ts 模式）
