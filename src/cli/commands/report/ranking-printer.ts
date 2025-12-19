import chalk from 'chalk'
import Table from 'cli-table3'
import { RankingResult, RankingItem } from '../../../types/git-types'

/**
 * 卷王排行打印器
 * 负责格式化并输出卷王排行结果
 */
export class RankingPrinter {
  /**
   * 打印完整的排行结果
   */
  print(result: RankingResult): void {
    this.printHeader()
    this.printRankingTable(result.items)
    this.printSummary(result)
    this.printMetadata(result.metadata)
  }

  /**
   * 打印头部
   */
  private printHeader(): void {
    console.log()
    console.log(chalk.hex('#D72654').bold('🏆 ============ 卷王排行榜 ============ 🏆'))
    console.log()
  }

  /**
   * 打印排行表格
   */
  private printRankingTable(items: RankingItem[]): void {
    if (items.length === 0) {
      console.log(chalk.yellow('  暂无数据，请确保仓库有足够的提交记录'))
      console.log()
      return
    }

    const table = new Table({
      head: [
        chalk.cyan('排名'),
        chalk.cyan('作者'),
        chalk.cyan('邮箱'),
        chalk.cyan('提交数'),
        chalk.cyan('996指数'),
        chalk.cyan('加班率'),
        chalk.cyan('周末提交'),
        chalk.cyan('代码行数'),
      ],
      colWidths: [8, 15, 25, 10, 12, 12, 12, 15],
      style: {
        head: ['cyan'],
        border: ['gray'],
      },
    })

    items.forEach((item) => {
      const rankEmoji = this.getRankEmoji(item.rank)
      const indexColor = this.getIndexColor(item.index996)
      const intensityBadge = this.getIntensityBadge(item.intensityLevel)

      // 格式化代码行数显示
      const linesText = `${chalk.green('+' + item.linesAdded.toLocaleString())} ${chalk.red('-' + item.linesDeleted.toLocaleString())}\n总:${item.linesTotal.toLocaleString()}`

      table.push([
        `${rankEmoji}${item.rank}`,
        `${item.author} ${intensityBadge}`,
        chalk.gray(item.email),
        item.totalCommits.toString(),
        indexColor(item.index996.toFixed(2)),
        `${item.overtimeRate.toFixed(1)}%`,
        `${item.weekendRatio.toFixed(1)}%`,
        linesText,
      ])
    })

    console.log(table.toString())
    console.log()
  }

  /**
   * 打印摘要信息
   */
  private printSummary(result: RankingResult): void {
    const { summary } = result

    if (summary.totalAuthors === 0) {
      return
    }

    console.log(chalk.bold('📊 统计摘要'))
    console.log(`  总分析人数: ${summary.totalAuthors}`)
    console.log(`  平均996指数: ${chalk.yellow(summary.avgIndex996.toFixed(2))}`)
    console.log(`  中位数996指数: ${chalk.yellow(summary.medianIndex996.toFixed(2))}`)
    console.log(`  最高996指数: ${chalk.red(summary.highestIndex996.toFixed(2))}`)
    console.log(`  最低996指数: ${chalk.green(summary.lowestIndex996.toFixed(2))}`)

    if (summary.topAuthor) {
      console.log()
      console.log(chalk.bold('🥇 卷王之王:'))
      console.log(`  ${chalk.hex('#D72654')(summary.topAuthor)} (${chalk.gray(summary.topEmail)})`)
      console.log(`  996指数: ${chalk.red(summary.highestIndex996.toFixed(2))}`)
    }

    console.log()
  }

  /**
   * 打印元数据
   */
  private printMetadata(metadata: RankingResult['metadata']): void {
    console.log(chalk.gray('────────────────────────────────────────'))
    console.log(chalk.gray(`时间范围: ${metadata.timeRange.since} ~ ${metadata.timeRange.until}`))
    console.log(chalk.gray(`总提交数: ${metadata.totalCommits}`))
    console.log(chalk.gray(`过滤阈值: ${metadata.filterThreshold} (最少提交数)`))
    console.log()
  }

  /**
   * 打印单个作者的详细信息
   */
  printAuthorDetail(item: RankingItem): void {
    console.log()
    console.log(chalk.bold('📊 作者详细信息'))
    console.log('┌──────────────────┬────────────────────────────────┐')

    const lines = [
      ['作者名字', item.author],
      ['邮箱地址', item.email],
      ['总提交数', item.totalCommits.toString()],
      ['996指数', `${item.index996.toFixed(2)} ${this.getIndexDescription(item.index996)}`],
      ['加班率', `${item.overtimeRate.toFixed(1)}%`],
      ['工作时间提交', item.workHours.toString()],
      ['加班时间提交', item.workdayOvertime.toString()],
      ['周末提交', `${item.weekendOvertime} (${item.weekendRatio.toFixed(1)}%)`],
      ['代码行数', `+${item.linesAdded.toLocaleString()} -${item.linesDeleted.toLocaleString()} (总:${item.linesTotal.toLocaleString()})`],
      ['工作强度', this.getIntensityText(item.intensityLevel)],
    ]

    lines.forEach(([label, value]) => {
      console.log(`│ ${label.padEnd(16)} │ ${value.padEnd(30)} │`)
    })

    console.log('└──────────────────┴────────────────────────────────┘')
    console.log()
  }

  /**
   * 获取排名表情符号
   */
  private getRankEmoji(rank: number): string {
    switch (rank) {
      case 1:
        return '🥇 '
      case 2:
        return '🥈 '
      case 3:
        return '🥉 '
      default:
        return ''
    }
  }

  /**
   * 根据996指数获取颜色
   */
  private getIndexColor(index996: number): (text: string) => string {
    if (index996 < 30) {
      return chalk.green
    } else if (index996 < 60) {
      return chalk.yellow
    } else if (index996 < 80) {
      return chalk.red
    } else {
      return chalk.hex('#D72654').bold
    }
  }

  /**
   * 获取工作强度徽章
   */
  private getIntensityBadge(level: string): string {
    switch (level) {
      case 'normal':
        return chalk.green('🟢')
      case 'moderate':
        return chalk.yellow('🟡')
      case 'heavy':
        return chalk.red('🔴')
      default:
        return ''
    }
  }

  /**
   * 获取工作强度文本描述
   */
  private getIntensityText(level: string): string {
    switch (level) {
      case 'normal':
        return chalk.green('正常 (0-30)')
      case 'moderate':
        return chalk.yellow('中度 (30-60)')
      case 'heavy':
        return chalk.red('严重 (60+)')
      default:
        return '未知'
    }
  }

  /**
   * 获取996指数描述
   */
  private getIndexDescription(index996: number): string {
    if (index996 < 30) {
      return chalk.green('(健康)')
    } else if (index996 < 60) {
      return chalk.yellow('(注意)')
    } else if (index996 < 80) {
      return chalk.red('(加班)')
    } else {
      return chalk.hex('#D72654').bold('(996!)')
    }
  }

  /**
   * 打印帮助信息
   */
  static printHelp(): void {
    console.log(`
${chalk.bold('卷王排行命令使用说明:')}

${chalk.cyan('基本用法:')}
  codeviz ranking [选项]

${chalk.cyan('常用选项:')}
  -y, --year <year>           指定年份 (例如: 2025)
  --since <date>              开始日期 (YYYY-MM-DD)
  --until <date>              结束日期 (YYYY-MM-DD)
  --all-time                  分析所有历史数据
  --author <name>             分析特定作者
  --exclude-authors <names>   排除作者 (逗号分隔, 如: bot,CI)
  --merge-authors             合并同名不同邮箱的作者
  --topN <number>             显示前N名 (默认10)
  --min-commits <number>      最少提交数阈值 (默认5)
  --sort-by <type>            排序方式 (index996|commits|lines, 默认index996)
  -f, --format <type>         输出格式 (txt|html, 默认txt)

${chalk.cyan('示例:')}
  codeviz ranking                          # 分析最近一年
  codeviz ranking -y 2024                  # 分析2024年
  codeviz ranking --all-time               # 分析所有历史
  codeviz ranking --exclude-authors bot    # 排除机器人
  codeviz ranking --merge-authors          # 合并同名作者
  codeviz ranking --topN 5                 # 显示前5名
  codeviz ranking --author "张三"          # 分析特定作者
  codeviz ranking --sort-by commits        # 按提交数排序
  codeviz ranking --sort-by lines          # 按代码行数排序
  codeviz ranking -f html                  # 生成HTML报告并在浏览器预览
    `)
  }
}