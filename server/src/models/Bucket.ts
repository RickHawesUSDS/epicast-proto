export interface Bucket {
  checkConnection: () => Promise<void>
  listObjects: (prefix: string) => Promise<BucketObject[]>
  putObject: (name: string, body: string) => Promise<void>
  doesObjectExist: (name: string) => Promise<boolean>
  getObject: (name: string) => Promise<string>
  deleteObject: (name: string) => Promise<void>
}

export interface BucketObject {
  key: string
  lastModified: Date
}
