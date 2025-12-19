import { GitLogOptions } from '../../types/git-types'
import { BaseCollector } from './base-collector'

/**
 * 作者统计采集器
 * 负责收集每个作者的详细提交数据，用于卷王排行功能
 */
export class AuthorCollector extends BaseCollector {
  /**
   * 获取所有作者的提交统计
   * @param options Git日志选项
   * @returns 作者统计映射，key为"作者名 <邮箱>"
   */
  async getAuthorStats(options: GitLogOptions): Promise<Map<string, AuthorStat>> {
    const { path } = options

    // 格式: "Author Name <email@example.com>|YYYY-MM-DD HH:mm:ss|ISO_TIMESTAMP"
    const args = ['log', '--format=%an <%ae>|%cd|%ai', '--date=format:%Y-%m-%d %H:%M:%S']

    // 应用通用过滤器
    if (options.since) {
      args.push(`--since=${options.since}`)
    }
    if (options.until) {
      args.push(`--until=${options.until}`)
    }
    args.push('--no-merges')

    // 如果指定了作者模式（--self），需要特殊处理
    if (options.authorPattern) {
      args.push('--regexp-ignore-case')
      args.push('--extended-regexp')
      args.push(`--author=${options.authorPattern}`)
    }

    // 排除特定提交消息
    if (options.ignoreMsg) {
      args.push('--regexp-ignore-case')
      args.push('--extended-regexp')
      args.push(`--grep=${options.ignoreMsg}`)
      args.push('--invert-grep')
    }

    const output = await this.execGitCommand(args, path)
    const lines = output.split('\n').filter((line) => line.trim())

    const authorStats = new Map<string, AuthorStat>()

    for (const line of lines) {
      const parts = line.split('|')
      if (parts.length < 3) {
        continue
      }

      const author = parts[0]
      const dateStr = parts[1]
      const isoTimestamp = parts[2]
      
      // 从 ISO timestamp 中解析星期几 (0=周日, 1=周一, ..., 6=周六)
      const date = new Date(isoTimestamp)
      const weekday = date.getDay() // 0=周日, 1=周一, ..., 6=周六

      // 检查作者排除过滤
      if (this.shouldIgnoreAuthor(author, options.ignoreAuthor)) {
        continue
      }

      // 检查时区过滤
      if (options.timezone) {
        const timezoneMatch = isoTimestamp.match(/([+-]\d{4})$/)
        if (!timezoneMatch || timezoneMatch[1] !== options.timezone) {
          continue
        }
      }

      // 解析时间
      const [datePart, timePart] = dateStr.split(' ')
      const [hours, minutes] = timePart.split(':').map(Number)

      // 初始化作者统计
      if (!authorStats.has(author)) {
        authorStats.set(author, {
          author: author,
          totalCommits: 0,
          workHours: 0,
          overtimeHours: 0,
          workdayCommits: 0,
          weekendCommits: 0,
          timeDistribution: new Array(24).fill(0),
          commitDates: [],
          linesAdded: 0,
          linesDeleted: 0,
          linesTotal: 0,
        })
      }

      const stat = authorStats.get(author)!
      stat.totalCommits++

      // 工作时间 vs 加班时间（默认9-18为工作时间）
      const workStart = 9
      const workEnd = 18
      if (hours >= workStart && hours < workEnd) {
        stat.workHours++
      } else {
        stat.overtimeHours++
      }

      // 工作日 vs 周末（1-5为工作日，0和6为周末）
      if (weekday >= 1 && weekday <= 5) {
        stat.workdayCommits++
      } else {
        stat.weekendCommits++
      }

      // 时间分布
      stat.timeDistribution[hours]++
      stat.commitDates.push({ date: datePart, hours, weekday })
    }

    // 获取代码行数统计
    await this.collectCodeStats(options, authorStats)

    return authorStats
  }

  /**
   * 收集所有作者的代码行数统计
   * @param options Git日志选项
   * @param authorStats 已有的作者统计数据
   */
  private async collectCodeStats(options: GitLogOptions, authorStats: Map<string, AuthorStat>): Promise<void> {
    const { path } = options

    // 使用 --numstat 获取每个提交的代码行数变化
    // 格式: "added\tdeleted\tfilename"
    const args = ['log', '--numstat', '--format=%an <%ae>']

    // 应用通用过滤器
    if (options.since) {
      args.push(`--since=${options.since}`)
    }
    if (options.until) {
      args.push(`--until=${options.until}`)
    }
    args.push('--no-merges')

    // 如果指定了作者模式（--self），需要特殊处理
    if (options.authorPattern) {
      args.push('--regexp-ignore-case')
      args.push('--extended-regexp')
      args.push(`--author=${options.authorPattern}`)
    }

    // 排除特定提交消息
    if (options.ignoreMsg) {
      args.push('--regexp-ignore-case')
      args.push('--extended-regexp')
      args.push(`--grep=${options.ignoreMsg}`)
      args.push('--invert-grep')
    }

    const output = await this.execGitCommand(args, path)
    const lines = output.split('\n')

    let currentAuthor: string | null = null

    for (const line of lines) {
      if (!line.trim()) {
        continue
      }

      // 作者行（不包含制表符）
      if (!line.includes('\t')) {
        currentAuthor = line.trim()
        continue
      }

      // 统计行（包含制表符）
      if (currentAuthor && authorStats.has(currentAuthor)) {
        const parts = line.split('\t')
        if (parts.length >= 2) {
          const added = parts[0] === '-' ? 0 : parseInt(parts[0], 10) || 0
          const deleted = parts[1] === '-' ? 0 : parseInt(parts[1], 10) || 0

          const stat = authorStats.get(currentAuthor)!
          stat.linesAdded += added
          stat.linesDeleted += deleted
          stat.linesTotal += added + deleted
        }
      }
    }
  }

  /**
   * 获取作者的详细提交时间列表（用于更精确的分析）
   * @param options Git日志选项
   * @param author 作者名
   * @returns 提交时间列表
   */
  async getAuthorCommits(options: GitLogOptions, author: string): Promise<Array<{ date: string; hours: number; weekday: number }>> {
    const { path } = options

    // 格式: "Author Name <email@example.com>|YYYY-MM-DD HH:mm:ss|ISO_TIMESTAMP"
    const args = ['log', '--format=%an <%ae>|%cd|%ai', '--date=format:%Y-%m-%d %H:%M:%S']

    // 应用通用过滤器
    if (options.since) {
      args.push(`--since=${options.since}`)
    }
    if (options.until) {
      args.push(`--until=${options.until}`)
    }
    args.push('--no-merges')

    // 排除特定提交消息
    if (options.ignoreMsg) {
      args.push('--regexp-ignore-case')
      args.push('--extended-regexp')
      args.push(`--grep=${options.ignoreMsg}`)
      args.push('--invert-grep')
    }

    const output = await this.execGitCommand(args, path)
    const lines = output.split('\n').filter((line) => line.trim())

    const commits: Array<{ date: string; hours: number; weekday: number }> = []

    for (const line of lines) {
      const parts = line.split('|')
      if (parts.length < 3) {
        continue
      }

      const lineAuthor = parts[0]
      const dateStr = parts[1]
      const isoTimestamp = parts[2]
      
      // 从 ISO timestamp 中解析星期几 (0=周日, 1=周一, ..., 6=周六)
      const date = new Date(isoTimestamp)
      const weekday = date.getDay()

      // 只收集指定作者的提交
      if (lineAuthor !== author) {
        continue
      }

      // 检查作者排除过滤
      if (this.shouldIgnoreAuthor(lineAuthor, options.ignoreAuthor)) {
        continue
      }

      // 检查时区过滤
      if (options.timezone) {
        const timezoneMatch = isoTimestamp.match(/([+-]\d{4})$/)
        if (!timezoneMatch || timezoneMatch[1] !== options.timezone) {
          continue
        }
      }

      const [datePart, timePart] = dateStr.split(' ')
      const [hours] = timePart.split(':').map(Number)

      commits.push({ date: datePart, hours, weekday })
    }

    return commits
  }
}

interface AuthorStat {
  author: string
  totalCommits: number
  workHours: number
  overtimeHours: number
  workdayCommits: number
  weekendCommits: number
  timeDistribution: number[]
  commitDates: Array<{ date: string; hours: number; weekday: number }>
  linesAdded: number // 新增代码行数
  linesDeleted: number // 删除代码行数
  linesTotal: number // 总修改行数
}