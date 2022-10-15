import { _Object } from '@aws-sdk/client-s3'

export interface Feed {
  checkConnection: () => Promise<void>
  listObjects: (prefix: string) => Promise<_Object[]>
  putObject: (name: string, body: string) => Promise<void>
  doesObjectExist: (name: string) => Promise<boolean>
  getObject: (name: string) => Promise<string>
  deleteObject: (name: string) => Promise<void>
}
