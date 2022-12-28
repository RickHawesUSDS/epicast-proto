import { FeedStorage, StorageObject } from "@/epicast/FeedStorage";

// Use a local folder for feed storage. Good for testing and demos. Configured by environment variables.
export class LocalFeedStorage implements FeedStorage {
  uri: string = ''

  async checkConnection(): Promise<void> {

  }

  async listObjects(prefix: string, onlyOneLevel?: boolean): Promise<StorageObject[]> {
    return []
  }

  async listFolders(prefix: string): Promise<string[]> {
    return []
  }

  async putObject(name: string, body: string): Promise<StorageObject> {
    return { key: '', lastModified: new Date() }
  }

  async doesObjectExist(name: string): Promise<boolean> {
    return false
  }

  async getObject(name: string, versionId?: string | undefined) {
    return ''
  }

  async deleteObject(name: string) {

  }
}
