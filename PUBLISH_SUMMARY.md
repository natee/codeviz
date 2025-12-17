# 发布系统实现总结

## ✅ 已完成

已成功为 Codeviz 项目集成了 **release-it** 自动发布系统。

### 安装的依赖
- ✅ `release-it` - 核心发布工具
- ✅ `@release-it/conventional-changelog` - 自动生成 CHANGELOG

### 创建的文件
- ✅ `.release-it.json` - 发布配置文件
- ✅ `RELEASE_GUIDE.md` - 完整使用指南
- ✅ 更新 `package.json` - 添加发布脚本
- ✅ 更新 `README.md` - 添加发布说明

### 配置的 NPM 脚本
```json
{
  "release": "release-it",           // 交互式发布
  "release:patch": "release-it patch", // 补丁版本
  "release:minor": "release-it minor", // 次版本
  "release:major": "release-it major", // 主版本
  "release:dry": "release-it --dry-run" // 干运行
}
```

## 🚀 使用方法

### 基础发布
```bash
# 交互式发布（推荐）
pnpm run release

# 快速发布
pnpm run release:patch  # 0.0.x (Bug 修复)
pnpm run release:minor  # 0.x.0 (新功能)
pnpm run release:major  # x.0.0 (重大变更)

# 预览发布
pnpm run release:dry
```

### 发布流程
1. **自动检测**: 基于 Git 提交消息自动确定版本类型
2. **运行测试**: 执行 `pnpm test`
3. **构建代码**: 执行 `pnpm run build`
4. **更新版本**: 自动更新 package.json
5. **生成 CHANGELOG**: 自动生成变更日志
6. **创建提交**: 提交版本更新
7. **创建标签**: 创建 Git 标签 (v1.0.0)
8. **推送远程**: 推送提交和标签

### 提交消息规范
```
feat: 添加新功能          → 次版本 (0.x.0)
fix: 修复 bug            → 补丁版本 (0.0.x)
docs: 更新文档           → 不升级版本
style: 代码格式          → 不升级版本
refactor: 重构           → 不升级版本
test: 添加测试           → 不升级版本
chore: 构建/工具         → 不升级版本

feat!: 重大变更          → 主版本 (x.0.0)
BREAKING CHANGE: ...     → 主版本 (x.0.0)
```

## 📋 配置说明

### .release-it.json
```json
{
  "git": {
    "commitMessage": "release: v${version}",
    "push": true,
    "tag": true,
    "tagName": "v${version}"
  },
  "npm": {
    "publish": false  // 不自动发布到 npm
  },
  "github": {
    "release": false  // 不创建 GitHub Release
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

## 🎯 版本检测逻辑

release-it 会自动分析 Git 提交历史：

| 提交消息 | 版本类型 | 示例 |
|---------|---------|------|
| `feat: xxx` | Minor (0.x.0) | 0.1.0 |
| `fix: xxx` | Patch (0.0.x) | 0.0.2 |
| `feat!: xxx` | Major (x.0.0) | 1.0.0 |
| `BREAKING CHANGE: xxx` | Major (x.0.0) | 1.0.0 |

## 📊 测试结果

### 干运行测试
```bash
$ pnpm run release:dry

🚀 Let's release codeviz (0.0.1...0.1.0)

Changelog:
# 0.1.0 (2025-12-17)

### Bug Fixes
* ...

### Features
* ...

Changeset:
 M package.json

? Commit (release: v0.1.0)? (Y/n)
```

✅ **测试通过** - 系统正常工作，可以自动检测到次版本升级

## 📝 文件说明

### .release-it.json
发布配置文件，定义了：
- Git 操作策略
- NPM/GitHub 发布选项
- 插件配置（CHANGELOG 生成）
- 钩子命令（测试、构建）

### RELEASE_GUIDE.md
完整的使用文档，包含：
- 快速开始
- 配置说明
- 最佳实践
- 故障排除
- CI/CD 集成

### package.json
添加的脚本：
- `release` - 交互式发布
- `release:patch` - 快速补丁
- `release:minor` - 快速次版本
- `release:major` - 快速主版本
- `release:dry` - 干运行预览

## 🔧 自定义配置

### 修改版本策略
编辑 `.release-it.json`：
```json
{
  "git": {
    "requireCleanWorkingDir": false  // 允许未提交的更改
  }
}
```

### 添加更多钩子
```json
{
  "hooks": {
    "before:init": ["pnpm test", "pnpm run build", "pnpm run lint"],
    "after:release": "npm publish && echo '发布完成！'"
  }
}
```

### 启用 npm 发布
```json
{
  "npm": {
    "publish": true
  }
}
```

### 启用 GitHub Release
```json
{
  "github": {
    "release": true,
    "releaseNotes": null
  }
}
```

## 🚀 优势

### 与手动发布对比

| 操作 | 手动发布 | release-it |
|------|---------|------------|
| 更新版本号 | 手动修改 | ✅ 自动 |
| 生成 CHANGELOG | 手动编写 | ✅ 自动生成 |
| 创建标签 | 手动创建 | ✅ 自动 |
| Git 提交 | 手动提交 | ✅ 自动 |
| 推送远程 | 手动推送 | ✅ 自动 |
| 运行测试 | 手动运行 | ✅ 自动 |
| 构建代码 | 手动运行 | ✅ 自动 |
| 时间成本 | 5-10 分钟 | 30 秒 |
| 出错概率 | 高 | 低 |

### 核心优势
1. **自动化**: 一键完成所有步骤
2. **标准化**: 遵循语义化版本规范
3. **可追溯**: 自动生成 CHANGELOG
4. **安全**: 交互式确认，可预览
5. **灵活**: 高度可配置

## 📚 相关资源

- [release-it 官方文档](https://github.com/release-it/release-it)
- [语义化版本规范](https://semver.org/)
- [Angular 提交规范](https://github.com/angular/angular/blob/HEAD/CONTRIBUTING.md#-commit-message-format)

## ✨ 总结

发布系统已完全集成，提供了：
- ✅ 自动版本管理
- ✅ Git 标签和提交
- ✅ CHANGELOG 生成
- ✅ 测试和构建钩子
- ✅ 交互式确认
- ✅ 干运行模式
- ✅ 完整文档

使用 `pnpm run release` 即可完成整个发布流程！
