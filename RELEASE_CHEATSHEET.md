# 发布速查表

## 🚀 快速发布

```bash
# 交互式发布（推荐）
pnpm run release

# 快速发布
pnpm run release:patch  # 0.0.x
pnpm run release:minor  # 0.x.0
pnpm run release:major  # x.0.0

# 预览
pnpm run release:dry
```

## 📋 提交消息规范

| 类型 | 命令 | 版本 | 示例 |
|------|------|------|------|
| 新功能 | `feat: xxx` | 次版本 | 0.1.0 |
| Bug 修复 | `fix: xxx` | 补丁 | 0.0.2 |
| 重大变更 | `feat!: xxx` | 主版本 | 1.0.0 |
| BREAKING | `BREAKING: xxx` | 主版本 | 1.0.0 |
| 其他 | `docs/chore/...` | 不升级 | - |

## 📦 版本类型

- **Patch (0.0.x)**: Bug 修复
- **Minor (0.x.0)**: 新功能
- **Major (x.0.0)**: 重大变更

## 🔧 常用命令

```bash
# 开发
pnpm install
pnpm run dev

# 测试
pnpm test

# 构建
pnpm run build

# 发布
pnpm run release
```

## 📄 文件说明

- `.release-it.json` - 配置文件
- `RELEASE_GUIDE.md` - 完整指南
- `PUBLISH_SUMMARY.md` - 实现总结
- `CHANGELOG.md` - 自动生成（首次发布后）

## ✅ 发布前检查

1. ✅ 所有测试通过
2. ✅ 代码已提交
3. ✅ 工作区干净
4. ✅ 远程分支同步

## 🎯 一键命令

```bash
# 完整流程
git add . && git commit -m "feat: xxx" && pnpm run release
```

---

**详细文档**: `RELEASE_GUIDE.md`  
**实现总结**: `PUBLISH_SUMMARY.md`
