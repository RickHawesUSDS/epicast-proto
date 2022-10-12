import { Feed } from '@/utils/Feed'

export class FeedLog {
  items = []

  add (fileName: string, message?: string): void {

  }

  replace (fileName: string, addNames: string[], message?: string): void {

  }

  update (fileName: string, message?: string): void {

  }

  event (date: Date, message?: string): void {

  }

  static async read (feed: Feed): Promise<FeedLog> {
    return new FeedLog()
  }

  async write (feed: Feed): Promise<void> {

  }
}
