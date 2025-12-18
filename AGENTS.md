# AGENTS.md - CodeViz 项目指南

## 📋 项目概述

**CodeViz** 是一个基于 TypeScript 开发的 CLI 工具，用于分析 Git 提交时间分布，计算"996指数" - 帮助用户了解团队工作模式并识别潜在的加班文化。

### 核心目标
- **统计分析**: 分析 Git 提交时间戳，推导工作强度模式
- **文化洞察**: 揭示口头承诺背后的真实工作模式
- **隐私优先**: 所有分析在本地运行，不上传任何数据
- **决策支持**: 帮助用户做出明智的职业决策

### 技术栈
- **语言**: TypeScript 5.x (严格模式)
- **运行时**: Node.js >= 16.0.0
- **CLI 框架**: Commander.js
- **终端 UI**: Chalk (颜色), Ora (加载动画), CLI-Table3 (表格)
- **测试**: Vitest + @vitest/coverage-v8
- **构建**: TypeScript Compiler (tsc)

## 🏗️ 架构与结构

### 项目布局
```
/Users/zk/mi/codeviz/
├── src/
│   ├── cli/                    # CLI 接口层
│   │   ├── index.ts            # CLI 管理器 - 命令注册
│   │   ├── commands/           # 命令实现
│   │   │   ├── analyze.ts      # 单仓库分析
│   │   │   ├── multi.ts        # 多仓库分析
│   │   │   ├── report/         # 报表输出系统
│   │   │   │   ├── printers/   # 打印器模块
│   │   │   │   ├── analysis.ts # 智能分析与建议
│   │   │   │   └── multi-comparison.ts # 多仓库对比
│   │   │   └── help.ts         # 帮助命令
│   │   └── prompts/            # 交互式提示
│   ├── core/                   # 核心算法
│   │   ├── calculator.ts       # 996 指数计算
│   │   ├── end-hour-detector.ts # 下班时间检测
│   │   ├── work-time-analyzer.ts # 工作时间分析
│   │   ├── overtime-analyzer.ts  # 加班分析
│   │   ├── timezone-analyzer.ts  # 跨时区检测
│   │   └── project-classifier.ts # 项目类型分类
│   ├── git/                    # 数据采集层
│   │   ├── collectors/         # Git 采集器
│   │   │   ├── base-collector.ts       # 基础 Git 执行器
│   │   │   ├── time-collector.ts       # 时间分布
│   │   │   ├── commit-collector.ts     # 提交详情
│   │   │   ├── contributor-collector.ts # 贡献者统计
│   │   │   ├── timezone-collector.ts   # 时区数据
│   │   │   └── index.ts                # 统一导出
│   │   ├── git-collector.ts    # 主采集器类
│   │   ├── git-data-merger.ts  # 多仓库数据合并
│   │   └── git-parser.ts       # 数据解析与验证
│   ├── types/                  # 类型定义
│   │   └── git-types.ts        # 所有数据结构
│   ├── utils/                  # 工具函数
│   │   ├── terminal.ts         # 终端宽度检测
│   │   ├── formatter.ts        # 格式化与颜色
│   │   ├── time-aggregator.ts  # 时间粒度转换
│   │   ├── timezone-filter.ts  # 时区过滤
│   │   ├── workday-checker.ts  # 节假日逻辑
│   │   └── version.ts          # 版本信息
│   └── index.ts                # 入口点
├── bin/
│   └── codeviz                 # CLI 入口 (可执行)
├── dist/                       # 编译输出 (生成)
├── public/images/              # 演示图片
├── .docs/                      # 文档
│   ├── README.md               # 协作规则
│   ├── codebaseSummary.md      # 架构概览
│   ├── techStack.md            # 技术细节
│   └── projectRoadmap.md       # 未来计划
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

### 数据流架构

```
用户命令 → CLI 解析器 → Git 采集器 → 数据解析器 → 核心分析器 → 报表打印器 → 终端输出
   ↓         ↓            ↓            ↓            ↓            ↓            ↓
Commander  参数验证     git log      解析验证     计算996指数  生成表格     显示结果
.js        执行         执行
```

## 🚀 构建与运行

### 开发环境设置

```bash
# 安装依赖
pnpm install

# 构建 TypeScript
pnpm run build

# 开发模式运行 (监听)
pnpm run dev

# 运行测试
pnpm test

# 测试 UI (浏览器界面)
pnpm run test:ui

# 测试覆盖率
pnpm run test:coverage

# 手动 CLI 测试
pnpm start -- [options]
```

### 生产环境使用

```bash
# 全局安装
pnpm i -g codeviz
codeviz [options]

# 或直接使用 npx
npx codeviz [options]
```

### 关键命令与选项

#### 卷王排行（团队成员分析）
```bash
# 基础排行分析 (最近一年)
codeviz ranking

# 指定年份或范围
codeviz ranking -y 2025
codeviz ranking -y 2023-2025

# 显示前N名
codeviz ranking --topN 5

# 全量历史
codeviz ranking --all-time

# 仅分析个人提交
codeviz ranking --self

# 分析特定作者
codeviz ranking --author "张三"

# 排除机器人账号
codeviz ranking --exclude-authors bot,CI,github-actions

# 合并同名不同邮箱的作者
codeviz ranking --merge-authors

# 设置最少提交数阈值
codeviz ranking --min-commits 10

# 自定义工作时间
codeviz ranking --hours 9.5-18.5

# 时区过滤
codeviz ranking --timezone "+0800"
```

#### 单仓库分析
```bash
# 基础分析 (最近一年)
codeviz

# 指定年份或范围
codeviz -y 2025
codeviz -y 2023-2025

# 自定义日期范围
codeviz --since 2025-01-01 --until 2025-06-30

# 全量历史
codeviz --all-time

# 仅分析个人提交
codeviz --self

# 指定工作时间 (推荐，提高准确性)
codeviz --hours 9.5-18.5

# 半小时粒度展示
codeviz --half-hour

# 时区过滤
codeviz --timezone "+0800"

# 中国节假日模式
codeviz --cn

# 过滤噪音 (机器人、合并提交等)
codeviz --ignore-author "bot|jenkins" --ignore-msg "^Merge"
```

#### 多仓库分析
```bash
# 自动检测并分析多个仓库
codeviz /workspace

# 指定多个路径
codeviz /path/proj1 /path/proj2

# 多仓库带过滤
codeviz /workspace --self --year 2025
```

### 测试命令

```bash
# 单元测试
pnpm test

# 测试监听模式
pnpm run test:watch

# 测试 UI (浏览器界面)
pnpm run test:ui

# 测试覆盖率
pnpm run test:coverage

# 类型检查
npx tsc --noEmit

# 代码格式检查
npx prettier --check src/

# 完整验证
pnpm run build && pnpm test
```

## 📊 核心算法与逻辑

### 996 指数计算

```typescript
// 公式: (加班提交数 / 总提交数) × 100 × 3
const overtimeRatio = ((workHourPl[1].count * 1.5 + workWeekPl[1].count * 2) / totalCommits) * 100;
const index996 = overtimeRatio * 3;
```

**指数解读**:
- 0-30: 健康的工作文化
- 30-60: 中度加班
- 60-100: 严重加班
- 100+: 极端加班 (996文化)

### 工作时间检测算法

1. **数据采集**: 分钟级提交时间 → 48个半小时点
2. **开始时间**: 每日首提的 10-20% 分位数 (过滤噪音)
3. **结束时间**: 小时分布中的晚间拐点检测
4. **标准工时**: 开始时间后的前9小时 = 正常工作时间
5. **加班**: 超过9小时的所有时间 = 加班

### 项目类型分类

**维度**:
- 工作时间规律性 (核心指标)
- 周末活动模式
- 晚间活动模式

**类别**:
- **公司项目**: 工作时间规律，周末活动少
- **开源项目**: 工作时间不规律，周末活动多
- **不确定**: 混合模式

**影响**: 开源项目会隐藏996指数和详细分析 (不适用)

### 跨时区检测

**双管齐下方法**:
1. **时区离散度**: 非主导时区 > 1% = 跨时区项目
2. **睡眠时段分析**: 5小时最少提交窗口的提交 > 10% = 跨时区项目

**用户体验**:
- 趋势分析后显示警告
- 建议使用 `--timezone` 参数进行过滤
- 仅在未指定 `--timezone` 时显示

### 节假日逻辑 (中国)

**自动启用条件**:
- 主要时区 = +0800
- 占比 > 50% 的提交

**手动覆盖**: `--cn` 参数

**影响**: 工作日/周末判断会考虑法定节假日和调休工作日

## 🛠️ 开发规范

### 代码质量标准

#### TypeScript 配置
- **严格模式**: 启用所有严格检查
- **类型安全**: 需要完整的类型定义
- **无隐式 Any**: 每个变量必须有显式类型
- **严格空检查**: 必须处理 null/undefined

#### 代码风格
- **格式化**: Prettier 3.x
- **行宽**: 120 字符
- **引号**: 单引号
- **尾逗号**: ES5 风格
- **分号**: 总是使用 (TypeScript 标准)

#### 命名规范
- **变量**: camelCase (描述性，无缩写)
- **函数**: camelCase (动词-名词模式)
- **类**: PascalCase
- **接口**: PascalCase (可选 `I` 前缀)
- **常量**: UPPER_SNAKE_CASE
- **文件**: kebab-case (TypeScript 文件除外)

#### 文件组织
- **单一职责**: 一个文件 = 一个主要关注点
- **最大大小**: ~200 行/文件 (超过则重构)
- **导出**: 优先使用命名导出而非默认导出
- **索引文件**: 用于清晰的模块导出

### 测试标准

#### 测试结构
```typescript
// 单元测试示例 (Vitest)
import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('FunctionName', () => {
  describe('Edge Cases', () => {
    it('should handle empty input', () => {
      // 测试实现
    });
  });

  describe('Normal Cases', () => {
    it('should calculate correctly', () => {
      // 测试实现
    });
  });

  describe('Mocking', () => {
    beforeEach(() => {
      vi.mock('module-name', () => ({
        functionName: vi.fn(() => 'mocked')
      }))
    })
  })
});
```

#### 覆盖率要求
- **核心算法**: 95%+ 覆盖率
- **工具函数**: 90%+ 覆盖率
- **CLI 命令**: 80%+ 覆盖率
- **集成测试**: 仅关键路径

#### 测试数据
- **Mock Git 命令**: 使用受控测试数据
- **边界情况**: 空仓库、单提交、大数据集
- **错误场景**: 无效路径、权限错误

### 文档标准

#### 代码注释
- **复杂逻辑**: 超过5行的算法必须注释
- **公共 API**: 导出函数使用 JSDoc 风格
- **行内注释**: 解释"为什么"，而非"做什么"
- **TODO 注释**: 使用 `// TODO: ` 标记计划改进

#### 提交消息
```
type(scope): 简短描述

详细说明变更和原因。

BREAKING CHANGE: (如适用)
- 变更内容
- 迁移指南

Fixes #123 (如适用)
```

**类型**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## 🔧 关键开发模式

### CLI 命令结构

```typescript
// 新命令模式
export class NewCommand {
  constructor(private collector: GitCollector) {}

  async execute(options: CommandOptions): Promise<void> {
    // 1. 验证输入
    // 2. 采集数据
    // 3. 分析
    // 4. 打印结果
  }
}
```

### 数据采集模式

```typescript
// Git 采集器模式
export class SpecificCollector extends BaseCollector {
  async collect(): Promise<DataType> {
    const command = this.buildGitCommand();
    const raw = await this.executeGit(command);
    return this.parseOutput(raw);
  }
}
```

### 报表打印模式

```typescript
// 报表打印器模式
export class ReportPrinter {
  print(data: AnalysisResult): void {
    // 1. 格式化数据
    // 2. 应用颜色
    // 3. 创建表格
    // 4. 输出到终端
  }
}
```

### 错误处理模式

```typescript
// 错误处理模式
try {
  const result = await operation();
  return result;
} catch (error) {
  if (error instanceof GitError) {
    logger.error(`Git 操作失败: ${error.message}`);
    throw new UserFriendlyError('无法读取 git 仓库');
  }
  throw error;
}
```

## 🎯 质量保证清单

### 提交前验证

- [ ] **类型检查**: `npx tsc --noEmit` 通过
- [ ] **格式检查**: `npx prettier --check src/` 通过
- [ ] **单元测试**: `pnpm test` 通过
- [ ] **测试覆盖率**: `pnpm run test:coverage` 检查
- [ ] **构建**: `pnpm run build` 成功
- [ ] **手动 CLI 测试**: 使用真实仓库测试关键命令

### 代码审查要点

- [ ] **类型安全**: 无 `any` 类型，完整的类型定义
- [ ] **错误处理**: 正确的错误消息和恢复机制
- [ ] **性能**: 无不必要的循环或昂贵操作
- [ ] **可读性**: 清晰的命名、逻辑流程、充分的注释
- [ ] **测试覆盖**: 新代码有对应的测试
- [ ] **文档**: 如需要，更新 README

### 集成测试

```bash
# 测试单仓库分析
cd /path/to/test/repo
codeviz -y 2025 --hours 9-18

# 测试多仓库分析
codeviz /workspace --self --half-hour

# 测试边界情况
codeviz --all-time --ignore-author "bot"
codeviz --timezone "+0800" --cn
```

## 📚 常见开发场景

### 添加新分析维度

1. **定义类型**: 添加到 `types/git-types.ts`
2. **采集数据**: 在 `git/collectors/` 创建采集器
3. **实现逻辑**: 在 `core/` 添加分析器
4. **更新解析器**: 修改 `git-parser.ts` 包含新数据
5. **创建打印器**: 添加到 `report/printers/`
6. **更新 CLI**: 在 `cli/commands/analyze.ts` 添加选项
7. **添加测试**: 新逻辑的单元测试
8. **更新文档**: 在 README 和 AGENTS.md 中记录

### 修复 Bug

1. **复现**: 创建最小测试用例
2. **定位**: 在架构层中找到根本原因
3. **修复**: 应用最小变更
4. **测试**: 添加回归测试
5. **验证**: 运行完整测试套件
6. **文档**: 添加注释说明修复

### 性能优化

1. **分析**: 识别瓶颈
2. **基准测试**: 测量当前性能
3. **优化**: 应用算法改进
4. **验证**: 确保无回归
5. **文档**: 记录性能特征

## 🚨 AI 代理重要注意事项

### 关键规则

1. **用户意图优先**: 始终优先考虑用户的明确指令而非现有模式
2. **基于证据**: 基于实际代码和文档做决策，而非假设
3. **状态化执行**: 为复杂任务记录计划和推理过程
4. **验证**: 提供清晰的测试步骤供用户验证变更
5. **主动学习**: 识别潜在问题并提出改进建议
6. **情景感知**: 区分小修复和主要功能
7. 完成任务后永远不要主动生成总结文档

### Git 分析特定要求

- **数据准确性**: Git 日志解析必须处理边界情况 (空仓库、格式错误数据)
- **性能**: 大型仓库 (>10万提交) 应在30秒内完成
- **隐私**: 永不上传或传输用户 Git 数据
- **跨平台**: 必须在 Windows、macOS、Linux 上工作
- **时区处理**: 计算中始终考虑时区偏移

### 终端输出标准

- **颜色使用**: 使用 chalk 进行语义着色 (错误=红色, 警告=黄色, 成功=绿色)
- **表格格式**: 使用 cli-table3 和自动宽度检测
- **进度指示**: 长时间操作使用 ora
- **错误消息**: 清晰、可操作、用户友好
- **帮助文本**: 全面但简洁

### 测试理念

- **用户验证**: 主要验证方式是用户手动测试
- **清晰指令**: 提供要运行的确切命令
- **预期输出**: 描述成功时的样子
- **边界情况**: 测试空仓库、单提交、大数据集
- **跨平台**: 至少在2个平台上验证

## 🔄 持续改进

### 定期任务

- **更新依赖**: 每月安全更新
- **审查架构**: 季度设计审查
- **性能审计**: 监控和优化瓶颈
- **文档**: 保持 AGENTS.md 和 README 最新
- **测试覆盖**: 维持 80%+ 覆盖率

### 学习循环

完成任何重要任务后:

1. **有效的方法**: 记录成功模式
2. **无效的方法**: 记录挑战和解决方案
3. **新见解**: 捕获发现的知识
4. **更新规则**: 如需要，完善 AGENTS.md

### 社区参与

- **问题跟踪**: 监控 GitHub 问题
- **功能请求**: 根据路线图评估
- **Bug 报告**: 按影响优先处理
- **贡献**: 审查和指导贡献者

---

**最后更新**: 2025-12-17
**版本**: 1.0.0
**维护者**: CodeViz 开发团队

此 AGENTS.md 作为所有开发活动的唯一真实来源。所有 AI 代理和人类开发者都应定期参考并更新此文档。