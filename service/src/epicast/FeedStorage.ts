export interface FeedStorage {
  checkConnection: () => Promise<void>
  listObjects: (prefix: string) => Promise<StorageObject[]>
  putObject: (name: string, body: string) => Promise<StorageObject>
  doesObjectExist: (name: string) => Promise<boolean>
  getObject: (name: string, versionId?: string) => Promise<string>
  deleteObject: (name: string) => Promise<void>
  formUrl: (name: string) => string
}

export interface StorageObject {
  key: string
  lastModified: Date
  versionId?: string
}
