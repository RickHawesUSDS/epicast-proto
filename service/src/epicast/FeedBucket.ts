export interface FeedBucket {
  readonly bucket: string
  checkConnection: () => Promise<void>
  listObjects: (prefix: string) => Promise<BucketObject[]>
  putObject: (name: string, body: string) => Promise<BucketObject>
  doesObjectExist: (name: string) => Promise<boolean>
  getObject: (name: string, versionId?: string) => Promise<string>
  deleteObject: (name: string) => Promise<void>
}

export interface BucketObject {
  key: string
  lastModified: Date
  versionId?: string
}
