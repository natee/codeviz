# Codeviz 发布指南

本项目使用 [release-it](https://github.com/release-it/release-it) 来自动化版本管理和发布流程。

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 发布新版本

```bash
# 交互式发布（推荐）
pnpm run release

# 发布补丁版本 (0.0.x)
pnpm run release:patch

# 发布次版本 (0.x.0)
pnpm run release:minor

# 发布主版本 (x.0.0)
pnpm run release:major

# 干运行（预览）
pnpm run release:dry
```

## 发布流程

### 1. 准备工作

```bash
# 确保所有更改已提交
git status

# 运行测试
pnpm test

# 编译代码
pnpm run build
```

### 2. 发布版本

```bash
# 交互式发布
pnpm run release
```

release-it 会自动：
- ✅ 检查工作区是否干净
- ✅ 运行前置钩子（测试、构建）
- ✅ 根据 Git 提交消息自动检测版本类型
- ✅ 更新 package.json 版本号
- ✅ 生成 CHANGELOG.md
- ✅ 创建 Git 提交
- ✅ 创建 Git 标签 (v1.0.0)
- ✅ 推送到远程
- ✅ 运行后置钩子

### 3. 发布到 npm（可选）

```bash
# 手动发布到 npm
pnpm publish

# 或使用 release-it 的 npm 插件
# 需要先配置 .release-it.json 中的 npm.publish: true
```

## 配置说明

### .release-it.json

```json
{
  "git": {
    "commitMessage": "release: v${version}",
    "requireCleanWorkingDir": true,
    "requireBranch": "",
    "requireUpstream": true,
    "push": true,
    "tag": true,
    "tagName": "v${version}",
    "tagAnnotation": "Release v${version}"
  },
  "npm": {
    "publish": false
  },
  "github": {
    "release": false
  },
  "plugins": {
    "@release-it/conventional-changelog": {
      "preset": "angular",
      "infile": "CHANGELOG.md"
    }
  },
  "hooks": {
    "before:init": ["pnpm test", "pnpm run build"],
    "after:release": "echo '🎉 Successfully released v${version}!'"
  }
}
```

### 配置项说明

#### Git 配置
- **commitMessage**: 提交消息模板
- **requireCleanWorkingDir**: 是否要求工作区干净
- **push**: 是否推送提交和标签
- **tag**: 是否创建标签
- **tagName**: 标签名称模板

#### NPM 配置
- **publish**: 是否自动发布到 npm（默认 false）

#### GitHub 配置
- **release**: 是否创建 GitHub Release（默认 false）

#### 插件配置
- **@release-it/conventional-changelog**: 自动生成 CHANGELOG.md
  - **preset**: 使用 Angular 提交规范
  - **infile**: 输出文件路径

#### 钩子配置
- **before:init**: 发布前执行的命令
- **after:release**: 发布后执行的命令

## 版本类型

### 自动检测

release-it 会根据 Git 提交消息自动检测版本类型：

- **Major (x.0.0)**: 包含 `BREAKING CHANGE` 或 `!` 标记
- **Minor (0.x.0)**: 包含 `feat:` 或 `feature:`
- **Patch (0.0.x)**: 包含 `fix:` 或 `bugfix:`

### 手动指定

```bash
# 指定版本类型
pnpm run release:patch    # 0.0.x
pnpm run release:minor    # 0.x.0
pnpm run release:major    # x.0.0

# 交互式选择
pnpm run release
```

## 提交消息规范

使用 Angular 提交规范：

```
feat: 添加新功能
fix: 修复 bug
docs: 更新文档
style: 代码格式调整
refactor: 重构代码
test: 添加测试
chore: 构建/工具变动

# 重大变更
feat!: 重大变更
BREAKING CHANGE: API 重构
```

## 高级用法

### 自定义配置文件

```bash
# 使用自定义配置
release-it --config ./custom-release.json
```

### 跳过某些步骤

```bash
# 跳过 Git 推送
release-it --no-git.push

# 跳过标签创建
release-it --no-git.tag

# 跳过所有 Git 操作
release-it --no-git
```

### 干运行模式

```bash
# 预览发布操作
release-it --dry-run

# 或使用脚本
pnpm run release:dry
```

### 详细日志

```bash
# 显示详细日志
release-it --verbose
```

## 常见问题

### Q: 如何回滚发布？

A: 
```bash
# 删除标签
git tag -d v1.0.0

# 回滚提交
git reset --hard HEAD~1

# 删除远程标签（如果已推送）
git push origin --delete v1.0.0
```

### Q: 如何修改版本号？

A: 
```bash
# 手动修改 package.json
# 然后提交
git add package.json
git commit -m "chore: 手动更新版本号"
```

### Q: 如何生成预发布版本？

A: 
```bash
# 在版本号中添加预发布标识
# 手动修改 package.json 为 1.0.0-alpha.0
# 然后发布
pnpm run release:patch
```

### Q: 如何跳过测试？

A: 
```json
// 在 .release-it.json 中移除测试钩子
"hooks": {
  "before:init": ["pnpm run build"]
}
```

### Q: 如何添加更多钩子？

A: 
```json
"hooks": {
  "before:init": ["pnpm test", "pnpm run build", "pnpm run lint"],
  "after:release": "echo '发布成功！' && npm publish"
}
```

## 最佳实践

### 1. 提交规范

保持清晰的提交历史：
```
feat: 添加用户登录功能
fix: 修复内存泄漏问题
docs: 更新 API 文档
```

### 2. 发布频率

- **Patch**: Bug 修复后立即发布
- **Minor**: 新功能完成后发布
- **Major**: 重大变更后发布

### 3. 测试覆盖

确保发布前所有测试通过：
```bash
pnpm test
```

### 4. 代码质量

```bash
# 运行代码检查
pnpm run lint

# 格式化代码
pnpm run format
```

### 5. 版本号管理

遵循 [语义化版本](https://semver.org/)：
- **Major**: 破坏性变更
- **Minor**: 向后兼容的新功能
- **Patch**: 向后兼容的 bug 修复

## 与 CI/CD 集成

### GitHub Actions

```yaml
name: Release

on:
  push:
    branches:
      - main

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - run: pnpm install
      
      - name: Release
        run: pnpm run release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## 总结

release-it 提供了：
- ✅ 自动版本管理
- ✅ Git 标签和提交
- ✅ CHANGELOG 生成
- ✅ 钩子系统
- ✅ 交互式确认
- ✅ 干运行模式
- ✅ 插件系统

使用 `pnpm run release` 即可完成整个发布流程！
