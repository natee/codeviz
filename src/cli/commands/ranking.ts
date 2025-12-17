import { AnalyzeOptions } from '../../types/git-types'
import { RankingAnalyzer } from '../../core/ranking-analyzer'
import { RankingPrinter } from './report/ranking-printer'
import chalk from 'chalk'
import { printGlobalNotices } from '../common/notices'

/**
 * 卷王排行命令执行器
 */
export class RankingExecutor {
  /**
   * 执行卷王排行分析
   * @param targetPath 目标仓库路径
   * @param options 分析选项
   */
  static async execute(targetPath: string, options: AnalyzeOptions): Promise<void> {
    try {
      // 验证路径
      if (!targetPath) {
        console.error(chalk.red('❌ 错误: 未指定要分析的仓库路径'))
        return
      }

      // 显示分析信息
      console.log(chalk.blue(`📊 正在分析卷王排行: ${targetPath}`))

      // 构建完整选项
      const fullOptions: AnalyzeOptions = {
        ...options,
        path: targetPath,
      }

      // 执行分析
      const analyzer = new RankingAnalyzer()
      const result = await analyzer.analyze(fullOptions)

      // 打印结果
      const printer = new RankingPrinter()
      printer.print(result)

      // 如果指定了特定作者，打印详细信息
      if (options.author) {
        const targetItem = result.items.find(item =>
          item.author.includes(options.author!) || item.email.includes(options.author!)
        )

        if (targetItem) {
          printer.printAuthorDetail(targetItem)
        } else {
          console.log(chalk.yellow(`⚠️  未找到作者: ${options.author}`))
        }
      }

      printGlobalNotices()
    } catch (error) {
      console.error(chalk.red('❌ 分析失败:'), (error as Error).message)
      console.log(chalk.gray('提示: 请确保路径正确且为 Git 仓库'))
    }
  }
}