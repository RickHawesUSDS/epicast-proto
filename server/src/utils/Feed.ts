import { _Object } from '@aws-sdk/client-s3'

export interface Feed {
  checkConnection(): Promise<void>
  listObjects(prefix: string): Promise<_Object[]>
  putObject(name: string, body: string): Promise<void>
  getObject(name: string): Promise<string>
  doesObjectExist(name: string): Promise<boolean>
  deleteObject(name: string): Promise<void>
}
