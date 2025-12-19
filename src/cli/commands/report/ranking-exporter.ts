import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import { RankingResult } from '../../../types/git-types'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

/**
 * 导出卷王排行报告
 * @param format 导出格式
 * @param result 排行结果
 */
export async function exportRankingReport(format: 'txt' | 'html', result: RankingResult): Promise<void> {
  const outputPath = resolveOutputPath(format)

  try {
    if (format === 'txt') {
      const content = buildTextReport(result)
      await fs.promises.writeFile(outputPath, content, 'utf8')
      console.log(chalk.green('💾 报告已生成:'), outputPath)
    } else if (format === 'html') {
      const content = buildHtmlReport(result)
      await fs.promises.writeFile(outputPath, content, 'utf8')
      console.log(chalk.green('💾 报告已生成:'), outputPath)
      
      // 自动在浏览器中打开
      await previewHtml(outputPath)
    }
  } catch (error) {
    console.error(chalk.red('❌ 报告导出失败:'), (error as Error).message)
  }
}

/**
 * 解析输出路径
 */
function resolveOutputPath(format: 'txt' | 'html'): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
  const filename = `codeviz-ranking-${timestamp}.${format}`
  return path.resolve(process.cwd(), filename)
}

/**
 * 构建文本报告
 */
function buildTextReport(result: RankingResult): string {
  const lines: string[] = []
  
  lines.push('=' .repeat(80))
  lines.push('🏆 代码工作强度排行榜')
  lines.push('=' .repeat(80))
  lines.push('')
  
  lines.push(`生成时间: ${new Date().toLocaleString('zh-CN')}`)
  lines.push(`分析时段: ${result.metadata.timeRange.since} ~ ${result.metadata.timeRange.until}`)
  lines.push('')
  
  // 打印代码量排行榜
  lines.push('─'.repeat(80))
  lines.push('📊 代码量排行榜')
  lines.push('─'.repeat(80))
  lines.push('')
  lines.push(
    `${'排名'.padEnd(6)}` +
    `${'作者'.padEnd(15)}` +
    `${'邮箱'.padEnd(30)}` +
    `${'提交数'.padEnd(10)}` +
    `${'996指数'.padEnd(10)}` +
    `${'代码行数'.padEnd(12)}`
  )
  lines.push('─'.repeat(80))
  result.byLines.forEach((item) => {
    const rankEmoji = item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : item.rank === 3 ? '🥉' : '  '
    lines.push(
      `${(rankEmoji + item.rank).padEnd(8)}` +
      `${item.author.substring(0, 14).padEnd(15)}` +
      `${item.email.substring(0, 28).padEnd(30)}` +
      `${item.totalCommits.toString().padEnd(10)}` +
      `${item.index996.toFixed(2).padEnd(10)}` +
      `${item.linesTotal.toLocaleString().padEnd(12)}`
    )
  })
  
  lines.push('')
  
  // 打印提交数排行榜
  lines.push('─'.repeat(80))
  lines.push('📈 提交数排行榜')
  lines.push('─'.repeat(80))
  lines.push('')
  lines.push(
    `${'排名'.padEnd(6)}` +
    `${'作者'.padEnd(15)}` +
    `${'邮箱'.padEnd(30)}` +
    `${'提交数'.padEnd(10)}` +
    `${'996指数'.padEnd(10)}` +
    `${'代码行数'.padEnd(12)}`
  )
  lines.push('─'.repeat(80))
  result.byCommits.forEach((item) => {
    const rankEmoji = item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : item.rank === 3 ? '🥉' : '  '
    lines.push(
      `${(rankEmoji + item.rank).padEnd(8)}` +
      `${item.author.substring(0, 14).padEnd(15)}` +
      `${item.email.substring(0, 28).padEnd(30)}` +
      `${item.totalCommits.toString().padEnd(10)}` +
      `${item.index996.toFixed(2).padEnd(10)}` +
      `${item.linesTotal.toLocaleString().padEnd(12)}`
    )
  })
  
  lines.push('')
  
  // 打印996指数排行榜
  lines.push('─'.repeat(80))
  lines.push('🔥 996指数排行榜')
  lines.push('─'.repeat(80))
  lines.push('')
  lines.push(
    `${'排名'.padEnd(6)}` +
    `${'作者'.padEnd(15)}` +
    `${'邮箱'.padEnd(30)}` +
    `${'提交数'.padEnd(10)}` +
    `${'996指数'.padEnd(10)}` +
    `${'代码行数'.padEnd(12)}`
  )
  lines.push('─'.repeat(80))
  result.byIndex996.forEach((item) => {
    const rankEmoji = item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : item.rank === 3 ? '🥉' : '  '
    lines.push(
      `${(rankEmoji + item.rank).padEnd(8)}` +
      `${item.author.substring(0, 14).padEnd(15)}` +
      `${item.email.substring(0, 28).padEnd(30)}` +
      `${item.totalCommits.toString().padEnd(10)}` +
      `${item.index996.toFixed(2).padEnd(10)}` +
      `${item.linesTotal.toLocaleString().padEnd(12)}`
    )
  })
  
  lines.push('')
  lines.push('─'.repeat(80))
  lines.push('📈 统计摘要')
  lines.push('─'.repeat(80))
  lines.push('')
  lines.push(`总分析人数: ${result.summary.totalAuthors}`)
  lines.push(`平均996指数: ${result.summary.avgIndex996.toFixed(2)}`)
  lines.push(`中位数996指数: ${result.summary.medianIndex996.toFixed(2)}`)
  lines.push(`最高996指数: ${result.summary.highestIndex996.toFixed(2)}`)
  lines.push(`最低996指数: ${result.summary.lowestIndex996.toFixed(2)}`)
  
  if (result.summary.topAuthor) {
    lines.push('')
    lines.push(`🥇 卷王之王: ${result.summary.topAuthor} (${result.summary.topEmail})`)
  }
  
  lines.push('')
  lines.push('─'.repeat(80))
  lines.push(`总提交数: ${result.metadata.totalCommits}`)
  lines.push(`过滤阈值: ${result.metadata.filterThreshold} (最少提交数)`)
  lines.push('')
  
  return lines.join('\n')
}

/**
 * 构建HTML报告
 */
function buildHtmlReport(result: RankingResult): string {
  const getIndexColor = (index: number): string => {
    if (index < 30) return '#10b981'
    if (index < 60) return '#fbbf24'
    if (index < 80) return '#f87171'
    return '#dc2626'
  }

  const getIntensityBadge = (level: string): string => {
    switch (level) {
      case 'normal':
        return '<span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px;">正常</span>'
      case 'moderate':
        return '<span style="background: #fbbf24; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px;">中度</span>'
      case 'heavy':
        return '<span style="background: #dc2626; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px;">严重</span>'
      default:
        return ''
    }
  }

  const escapeHtml = (text: string): string => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }

  const buildTableRows = (items: typeof result.byLines) => {
    return items
      .map((item) => {
        const rankEmoji = item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : item.rank === 3 ? '🥉' : ''
        const indexColor = getIndexColor(item.index996)
        const intensityBadge = getIntensityBadge(item.intensityLevel)

        return `
          <tr>
            <td style="text-align: center; font-weight: 700;">${rankEmoji} ${item.rank}</td>
            <td>
              <div style="font-weight: 600; color: #1f2937;">${escapeHtml(item.author)}</div>
              <div style="font-size: 12px; color: #9ca3af;">${escapeHtml(item.email)}</div>
            </td>
            <td style="text-align: center;">${item.totalCommits.toLocaleString()}</td>
            <td style="text-align: center;">
              <div style="font-weight: 700; color: ${indexColor}; font-size: 18px;">${item.index996.toFixed(2)}</div>
            </td>
            <td style="text-align: center;">${item.overtimeRate.toFixed(1)}%</td>
            <td style="text-align: center;">${item.weekendRatio.toFixed(1)}%</td>
            <td style="text-align: right;">
              <div style="font-weight: 600; color: #10b981;">+${item.linesAdded.toLocaleString()}</div>
              <div style="font-weight: 600; color: #dc2626;">-${item.linesDeleted.toLocaleString()}</div>
              <div style="font-size: 12px; color: #6b7280;">总: ${item.linesTotal.toLocaleString()}</div>
            </td>
            <td style="text-align: center;">${intensityBadge}</td>
          </tr>
        `
      })
      .join('')
  }

  const tableRowsByLines = buildTableRows(result.byLines)
  const tableRowsByCommits = buildTableRows(result.byCommits)
  const tableRowsByIndex996 = buildTableRows(result.byIndex996)

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>代码工作强度排行榜</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #1f2937;
      padding: 40px 20px;
      min-height: 100vh;
    }
    .container { max-width: 1400px; margin: 0 auto; }
    .header {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 40px;
      margin-bottom: 30px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
      text-align: center;
    }
    .header h1 {
      font-size: 42px;
      font-weight: 800;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 16px;
    }
    .header .meta {
      color: #6b7280;
      font-size: 14px;
      display: flex;
      gap: 20px;
      justify-content: center;
      flex-wrap: wrap;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .stat-card {
      background: white;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
      text-align: center;
    }
    .stat-card .label {
      font-size: 14px;
      color: #9ca3af;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }
    .stat-card .value {
      font-size: 32px;
      font-weight: 700;
      color: #1f2937;
    }
    .ranking-table-container {
      background: white;
      border-radius: 20px;
      padding: 32px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
      overflow-x: auto;
      margin-bottom: 50px;
    }
    .ranking-table-container:not(:first-of-type) {
      margin-top: 50px;
    }
    .ranking-table-container h2 {
      font-size: 24px;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th {
      background: #f9fafb;
      padding: 12px 16px;
      text-align: left;
      font-size: 14px;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 2px solid #e5e7eb;
    }
    td {
      padding: 16px;
      border-bottom: 1px solid #f3f4f6;
    }
    tr:hover {
      background: #f9fafb;
    }
    .footer {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      padding: 24px;
      margin-top: 30px;
      text-align: center;
      color: #6b7280;
      font-size: 14px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
    }
    @media (max-width: 768px) {
      .header h1 { font-size: 32px; }
      .ranking-table-container { padding: 20px; }
      table { font-size: 14px; }
      th, td { padding: 8px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏆 代码工作强度排行榜</h1>
      <div class="meta">
        <span>📅 生成时间：${new Date().toLocaleString('zh-CN')}</span>
        <span>⏰ 分析时段：${result.metadata.timeRange.since} ~ ${result.metadata.timeRange.until}</span>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="label">分析人数</div>
        <div class="value">${result.summary.totalAuthors}</div>
      </div>
      <div class="stat-card">
        <div class="label">平均996指数</div>
        <div class="value" style="color: #fbbf24;">${result.summary.avgIndex996.toFixed(2)}</div>
      </div>
      <div class="stat-card">
        <div class="label">最高996指数</div>
        <div class="value" style="color: #dc2626;">${result.summary.highestIndex996.toFixed(2)}</div>
      </div>
      <div class="stat-card">
        <div class="label">总提交数</div>
        <div class="value">${result.metadata.totalCommits.toLocaleString()}</div>
      </div>
    </div>

    <div class="ranking-table-container">
      <h2 style="color: #10b981;">📊 代码量排行榜</h2>
      <table>
        <thead>
          <tr>
            <th style="text-align: center;">排名</th>
            <th>作者</th>
            <th style="text-align: center;">提交数</th>
            <th style="text-align: center;">996指数</th>
            <th style="text-align: center;">加班率</th>
            <th style="text-align: center;">周末提交</th>
            <th style="text-align: right;">代码行数</th>
            <th style="text-align: center;">工作强度</th>
          </tr>
        </thead>
        <tbody>
          ${tableRowsByLines}
        </tbody>
      </table>
    </div>

    <div class="ranking-table-container">
      <h2 style="color: #3b82f6;">📈 提交数排行榜</h2>
      <table>
        <thead>
          <tr>
            <th style="text-align: center;">排名</th>
            <th>作者</th>
            <th style="text-align: center;">提交数</th>
            <th style="text-align: center;">996指数</th>
            <th style="text-align: center;">加班率</th>
            <th style="text-align: center;">周末提交</th>
            <th style="text-align: right;">代码行数</th>
            <th style="text-align: center;">工作强度</th>
          </tr>
        </thead>
        <tbody>
          ${tableRowsByCommits}
        </tbody>
      </table>
    </div>

    <div class="ranking-table-container">
      <h2 style="color: #ef4444;">🔥 996指数排行榜</h2>
      <table>
        <thead>
          <tr>
            <th style="text-align: center;">排名</th>
            <th>作者</th>
            <th style="text-align: center;">提交数</th>
            <th style="text-align: center;">996指数</th>
            <th style="text-align: center;">加班率</th>
            <th style="text-align: center;">周末提交</th>
            <th style="text-align: right;">代码行数</th>
            <th style="text-align: center;">工作强度</th>
          </tr>
        </thead>
        <tbody>
          ${tableRowsByIndex996}
        </tbody>
      </table>
    </div>

    <div class="footer">
      <p><strong>💡 提示：</strong> 996指数仅供参考，请结合团队实际情况综合判断。</p>
      <p style="margin-top: 8px; color: #9ca3af;">由 <strong>真诚热爱度分析报告</strong> 生成 · 关注团队健康 · 拒绝996</p>
    </div>
  </div>
</body>
</html>`
}

/**
 * 在浏览器中预览HTML
 */
async function previewHtml(filePath: string): Promise<void> {
  try {
    console.log(chalk.green('🌐 正在浏览器中打开预览...'))
    
    const platform = process.platform
    let command: string
    
    if (platform === 'darwin') {
      command = `open "${filePath}"`
    } else if (platform === 'win32') {
      command = `start "" "${filePath}"`
    } else {
      command = `xdg-open "${filePath}"`
    }
    
    await execAsync(command)
  } catch (error) {
    console.warn(chalk.yellow('⚠️  自动预览失败，请手动打开文件:'), filePath)
    if (error instanceof Error) {
      console.warn(chalk.gray(`   错误: ${error.message}`))
    }
  }
}

