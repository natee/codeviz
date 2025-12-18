# codeviz

[![npm version](https://badge.fury.io/js/codeviz.svg)](https://badge.fury.io/js/codeviz)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

codeviz 是一个基于 Git 提交时间分析的 CLI 工具，用于识别项目的真实工作强度和加班文化。

**快速开始**：`npx codeviz`

## 🎯 核心价值

**用数据说话，打破信息不对称。**

面试时的口头承诺 vs 代码提交的真实时间 —— 哪个更可信？

codeviz 通过分析 Git 提交时间戳，帮你：
- 🔍 **入职前背调**：让内推朋友帮忙跑一下，了解真实工作模式
- ⚖️ **试用期验证**：入职后快速验证公司文化，及时止损
- 📊 **决策支持**：已有确凿证据，作为转岗或离职的依据

## ✨ 核心功能

| 功能 | 说明 |
|------|------|
| **📊 996 指数** | 将加班情况转化为 0-100+ 的直观数值 |
| **🏆 卷王排行** | 分析团队成员，识别"卷王"（可选） |
| **🕰️ 智能工时** | 分位数+拐点算法，精准推算真实上下班时间 |
| **📈 月度趋势** | 识别项目是"越来越卷"还是"趋于平稳" |
| **📦 多仓库对比** | 一键扫描分析多个仓库，自动生成对比报告 |
| **🌍 跨时区检测** | 自动识别时区分布，支持时区过滤 |
| **🇨🇳 节假日调休** | 内置国内节假日逻辑，精准剔除调休干扰 |
| **🔒 隐私安全** | 纯本地运行，数据不上云

## 预览

#### 查看核心结果

<img src="public/images/demo1.png" alt="核心结果预览" style="width:600px; max-width:100%; height:auto;"/>

<details>
<summary>

### 其他模块预览 点此展开→

</summary>

#### 查看提交时间分布

<img src="public/images/demo2.png" alt="提交时间分布图" style="width:400px; max-width:100%; height:auto;"/>

#### 加班情况分析

<img src="public/images/demo3.png" alt="加班情况分析图" style="width:600px; max-width:100%; height:auto;"/>

#### 月度趋势分析

<img src="public/images/demo4.png" alt="月度趋势分析图" style="width:600px; max-width:100%; height:auto;"/>

#### 团队工作模式分析

<img src="public/images/demo5.png" alt="团队工作模式分析图" style="width:600px; max-width:100%; height:auto;"/>

</details>

## 🚀 快速开始

### 安装方式

**方式一：npx（无需安装）**
```bash
npx codeviz
```

**方式二：全局安装**
```bash
pnpm i -g codeviz
codeviz
```

### 基础使用

```bash
# 在 Git 仓库中运行（自动分析）
codeviz

# 指定仓库路径
codeviz /path/to/repo

# 多仓库对比
codeviz /path/to/workspace
codeviz /path/proj1 /path/proj2
```

## 🔧 开发指南

### 环境准备

```bash
git clone https://github.com/natee/codeviz.git
cd codeviz
pnpm install
pnpm run build
```

### 开发工作流

```bash
# 监听文件变化自动编译
pnpm run dev

# 在另一个终端测试
node dist/index.js [options]

# 或使用 npm link 全局测试
pnpm link
codeviz [options]  # 在任意目录测试
pnpm unlink
```

### 测试示例

```bash
# 运行单元测试
pnpm test

# 测试 UI (浏览器界面)
pnpm run test:ui

# 测试覆盖率
pnpm run test:coverage

# 测试单仓库
cd /path/to/test/repo
codeviz -y 2025 --hours 9-18

# 测试多仓库
codeviz /path/to/workspace

# 测试卷王排行
codeviz ranking -y 2025 --topN 5
```

**详见**：[开发和发布](#🚀-开发和发布)

## 🤖 智能模式

codeviz 自动检测环境并选择分析模式：

- **Git 仓库中** → 单仓库深度分析
- **多仓库目录** → 自动多仓库对比

```bash
codeviz                    # 智能检测
codeviz /path/to/repo      # 指定仓库
codeviz /workspace         # 扫描子目录
```

## 📖 使用指南

### 常用选项

| 选项 | 简写 | 说明 |
|------|------|------|
| `--year <year>` | `-y` | 年份或范围：`2025` 或 `2023-2025` |
| `--hours <range>` | `-H` | **推荐**：工作时间，如 `9-18` 或 `9.5-18.5` |
| `--half-hour` | - | 半小时粒度（默认小时） |
| `--timezone <offset>` | - | 时区过滤，如 `+0800` |
| `--cn` | - | 强制中国节假日模式 |
| `--self` | - | 只分析当前用户 |
| `--ignore-author <regex>` | - | 排除作者，如 `bot\|jenkins` |
| `--ignore-msg <regex>` | - | 排除提交信息，如 `^Merge` |

### 典型场景

```bash
# 基础分析（推荐带工时参数）
codeviz -y 2025 --hours 9-18

# 卷王排行
codeviz ranking -y 2025 --topN 5

# 多仓库对比
codeviz /workspace -y 2025

# 个人分析
codeviz --self -y 2025 --hours 9-18

# 跨时区项目
codeviz -y 2025 --timezone "+0800"

# 过滤噪音
codeviz -y 2025 --ignore-author "bot|jenkins" --ignore-msg "^Merge"
```

### 完整参数表

<details>
<summary>展开查看所有参数</summary>

#### 时间范围
- `--year <year>` / `-y`: 年份或范围（`2025` 或 `2023-2025`）
- `--since <date>` / `-s`: 开始日期（`YYYY-MM-DD`）
- `--until <date>` / `-u`: 结束日期（`YYYY-MM-DD`）
- `--all-time`: 全部历史

#### 分析选项
- `--hours <range>` / `-H`: 标准工作时间（`9-18` 或 `9.5-18.5`）⭐ **推荐**
- `--half-hour`: 半小时粒度展示
- `--timezone <offset>`: 时区过滤（`+0800`、`-0700`）
- `--cn`: 强制中国节假日模式
- `--self`: 仅当前用户

#### 过滤选项
- `--ignore-author <regex>`: 排除作者（`bot|jenkins`）
- `--ignore-msg <regex>`: 排除提交信息（`^Merge`）

#### 卷王排行专用
- `--topN <number>`: 显示前N名
- `--author <name>`: 分析特定作者
- `--exclude-authors <list>`: 排除多个作者（逗号分隔）
- `--merge-authors`: 合并同名不同邮箱
- `--min-commits <number>`: 最少提交数阈值

</details>

## 🔍 工作原理

### 数据流程

```
Git 仓库 → git log 采集 → 时间分布分析 → 分位数算法 → 996 指数计算 → 结果输出
```

### 核心算法

1. **时间分布**：分钟级采集 → 48个半小时点 → 24小时聚合
2. **工时识别**：10-20% 分位数 + 晚间拐点检测
3. **996 指数**：加班比例 × 3（0-30健康，30-60中度，60-100严重，100+极端）
4. **项目分类**：工作规律性 + 周末/晚间活跃度 → 公司/开源项目
5. **跨时区检测**：非主导时区 >1% 或睡眠时段提交 >10%
6. **节假日调休**：+0800 时区占比 >50% 自动启用

### 隐私与局限

- ✅ **纯本地运行**：数据不上云，基于 git log 离线分析
- ⚠️ **统计局限**：仅分析 commit 时间，不包含会议、文档、调试等活动
- 📊 **参考价值**：结果仅供个人决策参考，不应用于绩效考核

## 🛡️ 常见疑问

### 💡 入职后使用是否太晚？

不晚。三个场景：
1. **试用期验证**：入职即"验货"，发现天坑及时止损
2. **内推背调**：找朋友帮忙分析，硬核背调
3. **决策依据**：已有证据支持转岗或离职

### 📉 Squash 提交会影响准确性吗？

不会。统计学规律下，大量样本会过滤掉个别噪声。


### 🚀 未来规划？

沿着 WLB 路线：更精细的加班分析 + 代码复杂度（屎山指数）分析。

## 🚀 开发和发布

```bash
# 开发
pnpm install
pnpm run dev

# 测试
pnpm test              # 运行测试
pnpm run test:watch    # 监听模式
pnpm run test:ui       # 浏览器 UI 界面
pnpm run test:coverage # 测试覆盖率

# 发布
pnpm run release          # 自动测试、构建、版本更新、打标签
pnpm run release:patch    # Bug 修复 (0.0.x)
pnpm run release:minor    # 新功能 (0.x.0)
pnpm run release:major    # 重大变更 (x.0.0)
```

**提交规范**：`feat:` → 次版本 | `fix:` → 补丁 | `feat!:` → 主版本

**详见**：[RELEASE_GUIDE.md](RELEASE_GUIDE.md)

## 🤖 AI 协作

本项目采用标准化 AI 协作流程，详见 [.docs/README.md](.docs/README.md)

## 📄 许可证

MIT License
