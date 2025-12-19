import { RankingResult, RankingItem, WorkIntensityLevel, AnalyzeOptions, GitLogOptions } from '../types/git-types'
import { GitCollector } from '../git/git-collector'
import { WorkTimeAnalyzer } from './work-time-analyzer'
import { OvertimeAnalyzer } from './overtime-analyzer'

/**
 * 卷王排行分析器
 * 负责分析每个作者的996指数并生成排行
 */
export class RankingAnalyzer {
  private collector: GitCollector
  private workTimeAnalyzer: WorkTimeAnalyzer
  private overtimeAnalyzer: OvertimeAnalyzer

  constructor() {
    this.collector = new GitCollector()
    this.workTimeAnalyzer = new WorkTimeAnalyzer()
    this.overtimeAnalyzer = new OvertimeAnalyzer()
  }

  /**
   * 分析并生成卷王排行
   * @param options 分析选项
   * @returns 排行结果
   */
  async analyze(options: AnalyzeOptions): Promise<RankingResult> {
    // 1. 收集作者统计数据
    const gitLogOptions: GitLogOptions = {
      path: options.path!,
      since: options.since,
      until: options.until,
    }

    // 处理 --self 选项
    if (options.self) {
      const selfInfo = await this.collector.resolveSelfAuthor(options.path!)
      gitLogOptions.authorPattern = selfInfo.pattern
    }

    // 处理作者排除
    if (options.ignoreAuthor) {
      gitLogOptions.ignoreAuthor = options.ignoreAuthor
    }

    // 处理消息排除
    if (options.ignoreMsg) {
      gitLogOptions.ignoreMsg = options.ignoreMsg
    }

    // 处理时区
    if (options.timezone) {
      gitLogOptions.timezone = options.timezone
    }

    const authorStats = await this.collector.getAuthorStats(gitLogOptions)

    // 2. 处理作者合并（如果启用）
    const mergedStats = await this.mergeAuthorsIfNeeded(authorStats, options.mergeAuthors)

    // 3. 过滤低提交数的作者
    const minCommits = options.minCommits || 5
    const filteredStats = Array.from(mergedStats.entries()).filter(([, stat]) => stat.totalCommits >= minCommits)

    // 4. 分析每个作者的996指数
    const rankingItems: RankingItem[] = []
    for (const [author, stat] of filteredStats) {
      const item = await this.analyzeAuthor(author, stat, gitLogOptions)
      rankingItems.push(item)
    }

    // 5. 生成三种排行榜（深拷贝以保持独立的排名）
    // 按代码量排序
    const byLines = rankingItems.map(item => ({ ...item }))
    this.sortRankingItems(byLines, 'lines')
    this.assignRanks(byLines)

    // 按提交数排序
    const byCommits = rankingItems.map(item => ({ ...item }))
    this.sortRankingItems(byCommits, 'commits')
    this.assignRanks(byCommits)

    // 按996指数排序
    const byIndex996 = rankingItems.map(item => ({ ...item }))
    this.sortRankingItems(byIndex996, 'index996')
    this.assignRanks(byIndex996)

    // 6. 生成摘要（基于996指数排行）
    const summary = this.generateSummary(byIndex996)

    // 7. 获取时间范围
    const timeRange = await this.getTimeRange(options)

    // 返回完整数据（在打印时根据 format 和 topN 决定显示多少）
    return {
      byLines,
      byCommits,
      byIndex996,
      summary,
      metadata: {
        timeRange,
        totalCommits: await this.getTotalCommits(options),
        filterThreshold: minCommits,
        topN: options.topN || 10, // 保存 topN 供打印时使用
      },
    }
  }

  /**
   * 分析单个作者
   */
  private async analyzeAuthor(author: string, stat: any, gitLogOptions: GitLogOptions): Promise<RankingItem> {
    // 计算996指数
    const totalCommits = stat.totalCommits
    const workHours = stat.workHours
    const overtimeHours = stat.overtimeHours
    const workdayCommits = stat.workdayCommits
    const weekendCommits = stat.weekendCommits

    // 996指数计算公式：
    // 基础加班率 = (加班提交数 / 总提交数) * 100
    // 周末权重 = 周末提交数 * 0.8（周末提交权重稍低）
    // 最终指数 = (基础加班率 + 周末权重) * 3
    const overtimeRatio = ((overtimeHours + weekendCommits * 0.8) / totalCommits) * 100
    const index996 = overtimeRatio * 3

    // 加班率
    const overtimeRate = (overtimeHours / totalCommits) * 100

    // 周末提交占比
    const weekendRatio = (weekendCommits / totalCommits) * 100

    // 工作强度等级
    const intensityLevel = this.getIntensityLevel(index996)

    // 解析作者名和邮箱
    const { name, email } = this.parseAuthor(author)

    // 计算周末加班天数（周末有提交的不同日期数）
    const weekendDates = new Set<string>()
    stat.commitDates.forEach((commit: any) => {
      // weekday: 0=周日, 6=周六
      if (commit.weekday === 0 || commit.weekday === 6) {
        weekendDates.add(commit.date)
      }
    })
    const weekendWorkDays = weekendDates.size

    return {
      rank: 0, // 稍后排序后赋值
      author: name,
      email: email,
      totalCommits,
      index996: parseFloat(index996.toFixed(2)),
      overtimeRate: parseFloat(overtimeRate.toFixed(2)),
      weekendRatio: parseFloat(weekendRatio.toFixed(2)),
      workdayOvertime: overtimeHours,
      weekendOvertime: weekendCommits,
      workHours: workHours,
      intensityLevel,
      linesAdded: stat.linesAdded || 0,
      linesDeleted: stat.linesDeleted || 0,
      linesTotal: stat.linesTotal || 0,
      weekendWorkDays,
    }
  }

  /**
   * 排序排行榜
   * @param items 排行榜项目列表
   * @param sortBy 排序方式
   */
  private sortRankingItems(items: RankingItem[], sortBy: 'index996' | 'commits' | 'lines'): void {
    switch (sortBy) {
      case 'commits':
        items.sort((a, b) => b.totalCommits - a.totalCommits)
        break
      case 'lines':
        items.sort((a, b) => b.linesTotal - a.linesTotal)
        break
      case 'index996':
      default:
        items.sort((a, b) => b.index996 - a.index996)
        break
    }
  }

  /**
   * 为排行榜项目分配排名
   * @param items 排行榜项目列表
   */
  private assignRanks(items: RankingItem[]): void {
    items.forEach((item, index) => {
      item.rank = index + 1
    })
  }

  /**
   * 处理作者合并（同名不同邮箱）
   */
  private async mergeAuthorsIfNeeded(stats: Map<string, any>, mergeAuthors?: boolean): Promise<Map<string, any>> {
    if (!mergeAuthors) {
      return stats
    }

    const merged = new Map<string, any>()

    for (const [author, stat] of stats.entries()) {
      const { name } = this.parseAuthor(author)

      // 查找是否已存在同名作者
      let mergedKey: string | null = null
      for (const [mergedAuthor] of merged.entries()) {
        const { name: mergedName } = this.parseAuthor(mergedAuthor)
        if (mergedName === name) {
          mergedKey = mergedAuthor
          break
        }
      }

      if (mergedKey) {
        // 合并数据
        const existing = merged.get(mergedKey)!
        existing.totalCommits += stat.totalCommits
        existing.workHours += stat.workHours
        existing.overtimeHours += stat.overtimeHours
        existing.workdayCommits += stat.workdayCommits
        existing.weekendCommits += stat.weekendCommits

        // 合并时间分布
        for (let i = 0; i < 24; i++) {
          existing.timeDistribution[i] += stat.timeDistribution[i]
        }

        // 合并提交日期
        existing.commitDates.push(...stat.commitDates)

        // 合并代码行数
        existing.linesAdded += stat.linesAdded || 0
        existing.linesDeleted += stat.linesDeleted || 0
        existing.linesTotal += stat.linesTotal || 0

        // 更新邮箱（保留多个邮箱信息）
        if (!existing.emails) {
          existing.emails = []
        }
        const email = this.parseAuthor(author).email
        if (!existing.emails.includes(email)) {
          existing.emails.push(email)
        }
      } else {
        // 新增作者
        const newStat = { 
          ...stat,
          linesAdded: stat.linesAdded || 0,
          linesDeleted: stat.linesDeleted || 0,
          linesTotal: stat.linesTotal || 0,
        }
        const email = this.parseAuthor(author).email
        newStat.emails = [email]
        merged.set(author, newStat)
      }
    }

    return merged
  }

  /**
   * 解析作者名和邮箱
   */
  private parseAuthor(author: string): { name: string; email: string } {
    const match = author.match(/^(.+?)\s*<(.+?)>$/)
    if (match) {
      return { name: match[1].trim(), email: match[2].trim() }
    }
    return { name: author, email: '' }
  }

  /**
   * 根据996指数判断工作强度等级
   */
  private getIntensityLevel(index996: number): WorkIntensityLevel {
    if (index996 < 30) {
      return 'normal'
    } else if (index996 < 60) {
      return 'moderate'
    } else {
      return 'heavy'
    }
  }

  /**
   * 生成排行摘要
   */
  private generateSummary(items: RankingItem[]): RankingResult['summary'] {
    if (items.length === 0) {
      return {
        totalAuthors: 0,
        analyzedAuthors: 0,
        avgIndex996: 0,
        medianIndex996: 0,
        highestIndex996: 0,
        lowestIndex996: 0,
      }
    }

    const indices = items.map(i => i.index996)
    const sum = indices.reduce((a, b) => a + b, 0)
    const avg = sum / items.length
    const sorted = [...indices].sort((a, b) => a - b)
    const median = sorted[Math.floor(sorted.length / 2)]
    const highest = Math.max(...indices)
    const lowest = Math.min(...indices)

    const topItem = items[0]

    return {
      totalAuthors: items.length,
      analyzedAuthors: items.length,
      avgIndex996: parseFloat(avg.toFixed(2)),
      medianIndex996: parseFloat(median.toFixed(2)),
      highestIndex996: parseFloat(highest.toFixed(2)),
      lowestIndex996: parseFloat(lowest.toFixed(2)),
      topAuthor: topItem.author,
      topEmail: topItem.email,
    }
  }

  /**
   * 获取时间范围
   */
  private async getTimeRange(options: AnalyzeOptions): Promise<{ since: string; until: string }> {
    const path = options.path!

    if (options.since && options.until) {
      return { since: options.since, until: options.until }
    }

    // 获取仓库的首末提交日期
    const firstDate = await this.collector.getFirstCommitDate({ path })
    const lastDate = await this.collector.getLastCommitDate({ path })

    if (options.allTime) {
      return { since: firstDate, until: lastDate }
    }

    // 默认最近一年
    if (options.year) {
      const year = options.year
      if (year.includes('-')) {
        const [startYear, endYear] = year.split('-')
        return { since: `${startYear}-01-01`, until: `${endYear}-12-31` }
      } else {
        return { since: `${year}-01-01`, until: `${year}-12-31` }
      }
    }

    // 默认：最近一年
    const lastDateObj = new Date(lastDate)
    const oneYearAgo = new Date(lastDateObj)
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

    return {
      since: oneYearAgo.toISOString().split('T')[0],
      until: lastDate,
    }
  }

  /**
   * 获取总提交数
   */
  private async getTotalCommits(options: AnalyzeOptions): Promise<number> {
    const gitLogOptions: GitLogOptions = {
      path: options.path!,
      since: options.since,
      until: options.until,
    }

    if (options.ignoreAuthor) {
      gitLogOptions.ignoreAuthor = options.ignoreAuthor
    }

    if (options.timezone) {
      gitLogOptions.timezone = options.timezone
    }

    return this.collector.countCommits(gitLogOptions)
  }
}