import { FeedBucket } from '@/models/FeedBucket'
import { formLogKey } from '@/models/feedBucketKeys'
import { compareAsc, formatISO, parseISO } from 'date-fns'

type LogEntryAction = 'ADD' | 'UPDATE' | 'REPLACE' | 'DELETE' | 'NOTE'

function isLogEntryAction (str: string): str is LogEntryAction {
  return ['ADD', 'UPDATE', 'REPLACE', 'DELETE', 'NOTE'].includes(str)
}
interface LogEntry {
  timestamp: Date
  action: LogEntryAction
  message: string
}

export class PublishLog {
  private entries: LogEntry[] = []

  add (fileName: string, message?: string): void {
    this.entries.push({
      timestamp: new Date(),
      action: 'ADD',
      message: message !== undefined ? `${fileName} - ${message}` : fileName
    })
  }

  replace (fileName: string, addNames: string[], message?: string): void {
    this.entries.push({
      timestamp: new Date(),
      action: 'REPLACE',
      message: message !== undefined ? `${fileName} with ${addNames.join(', ')} - ${message}` : `${fileName} with ${addNames.join(', ')}`
    })
  }

  update (fileName: string, message?: string): void {
    this.entries.push({
      timestamp: new Date(),
      action: 'UPDATE',
      message: message !== undefined ? `${fileName}  - ${message}` : `${fileName}`
    })
  }

  delete (fileName: string, message?: string): void {
    this.entries.push({
      timestamp: new Date(),
      action: 'DELETE',
      message: message !== undefined ? `${fileName}  - ${message}` : `${fileName}`
    })
  }

  note (message: string): void {
    this.entries.push({
      timestamp: new Date(),
      action: 'NOTE',
      message
    })
  }

  async publish (feed: FeedBucket): Promise<void> {
    if (this.entries.length === 0) return
    // NOTE: Object locking and thread locking problems ignored
    const oldEntries = await this.readTodaysLog(feed)
    const newEntries = oldEntries.concat(this.entries)
    newEntries.sort((a, b) => compareAsc(a.timestamp, b.timestamp))
    await this.writeTodaysLog(feed, newEntries)
    this.entries = []
  }

  // Follows the Extended Log File Format from the W3C https://www.w3.org/TR/WD-logfile.html
  // but uses ISO timestamps formats
  private async writeTodaysLog (feed: FeedBucket, entries: LogEntry[]): Promise<void> {
    const rawDirectives = '#Version: 1.0\n#Fields: x-iso-timestamp x-action x-message\n'
    const rawEntries = entries.flatMap((entry: LogEntry) => {
      const timestamp = formatISO(entry.timestamp, { format: 'extended', representation: 'complete' })
      return `${timestamp} ${entry.action} "${entry.message}"`
    }).join('\n')
    await feed.putObject(formLogKey(), rawDirectives + rawEntries)
  }

  private async readTodaysLog (feed: FeedBucket): Promise<LogEntry[]> {
    const logName = formLogKey()
    const exists = await feed.doesObjectExist(logName)
    if (exists) {
      const rawLog = await feed.getObject(logName)
      const lines = rawLog.split('\n')
      const entries: LogEntry[] = []
      for (const line of lines) {
        const entry = parseLine(line)
        if (entry !== undefined) {
          entries.push(entry)
        }
      }
      return entries
    } else {
      return []
    }

    function parseLine (line: string): LogEntry | undefined {
      if (line.at(0) === '#') return // ignore directives
      if (line.trim().length === 0) return // empty lines
      const [timePart, actionPart] = line.split(' ', 2)
      // console.log(`timePart: ${timePart}, actionPart: ${actionPart}`)
      const time = parseISO(timePart)

      const action = isLogEntryAction(actionPart) ? actionPart : 'NOTE'
      const messagePart = line.substring(line.indexOf(' ', timePart.length + actionPart.length + 1) + 1)
      const message = messagePart.substring(1, messagePart.length - 2)
      return { timestamp: time, action, message }
    }
  }
}
