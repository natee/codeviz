# npm 到 pnpm 迁移总结

## 迁移日期
2025-12-17

## 迁移内容

### ✅ 已删除的 npm 相关文件
- `package-lock.json` - npm 的锁定文件
- `.npmignore` - npm 发布忽略配置

### ✅ 已更新的文件

#### 1. package.json
- 更新 `prepublishOnly` 脚本：`npm run build` → `pnpm run build`

#### 2. .gitignore
- 添加 pnpm 缓存目录忽略：`.pnpm-store`

#### 3. 中文 README.md
- 全局安装命令：`npm i -g code996` → `pnpm i -g code996`

#### 4. 英文 README_en.md
- 全局安装命令：`npm i -g code996` → `pnpm i -g code996`

#### 5. .docs/README.md
- 测试命令：`npm test` → `pnpm test`

#### 6. .docs/techStack.md
- 依赖安装：`npm install` → `pnpm install`
- 测试命令：`npm test` → `pnpm test`
- 构建命令：`npm run build` → `pnpm run build`
- 发布命令：`npm publish` → `pnpm publish`

#### 7. AGENTS.md
- 所有开发环境设置命令
- 所有测试命令
- 所有构建命令
- 所有质量保证清单项

### ✅ 保留的文件
- `pnpm-lock.yaml` - pnpm 的锁定文件（已存在）
- `package.json` - 包配置文件（已更新）
- `.gitignore` - Git 忽略文件（已更新）

## 迁移后验证

### 项目结构验证
```
✅ package.json - 已更新
✅ pnpm-lock.yaml - 存在
✅ .gitignore - 已更新
✅ 所有文档 - 已更新
❌ package-lock.json - 已删除
❌ .npmignore - 已删除
```

### 命令验证
```bash
# 以下命令现在使用 pnpm
pnpm install      # 安装依赖
pnpm run build    # 构建项目
pnpm test         # 运行测试
pnpm run dev      # 开发模式
pnpm start        # 运行程序
pnpm i -g code996 # 全局安装
```

## 使用说明

### 新用户安装
```bash
# 1. 安装 pnpm（如果未安装）
npm install -g pnpm

# 2. 安装项目依赖
pnpm install

# 3. 构建项目
pnpm run build

# 4. 运行测试
pnpm test
```

### 开发工作流
```bash
# 开发模式（监听文件变化）
pnpm run dev

# 手动测试 CLI
pnpm start -- [options]

# 完整验证
pnpm run build && pnpm test
```

### 发布流程
```bash
# 1. 更新版本号
npm version patch  # 或 minor/major

# 2. 构建并发布
pnpm publish
```

## 迁移优势

1. **更快的安装速度**：使用硬链接和符号链接
2. **更少的磁盘空间**：全局存储共享依赖
3. **更严格的依赖管理**：避免幽灵依赖
4. **更好的 monorepo 支持**：为未来扩展做准备
5. **更清晰的 node_modules 结构**：易于调试

## 注意事项

- 确保团队成员都安装了 pnpm：`npm install -g pnpm`
- 首次使用需要运行 `pnpm install` 安装依赖
- CI/CD 流水线需要更新为使用 pnpm
- 所有文档中的命令已更新，无需额外操作

## 回滚方案

如果需要回滚到 npm：

1. 恢复 `package-lock.json`：`git checkout HEAD~1 -- package-lock.json`
2. 恢复 `.npmignore`：`git checkout HEAD~1 -- .npmignore`
3. 恢复所有文档中的 pnpm 引用
4. 运行 `npm install`

---

**迁移完成** ✅  
所有 npm 引用已替换为 pnpm，项目已完全迁移到 pnpm 生态系统。