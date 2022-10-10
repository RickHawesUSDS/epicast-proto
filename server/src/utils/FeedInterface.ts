import { _Object } from "@aws-sdk/client-s3";

export interface FeedInterface {
  checkConnection(): Promise<void>,
  listObjects(prefix: string): Promise<_Object[]>,
  putObject(name: string, body: Blob): Promise<void>,
  getObject(name: string): Promise<Blob>,
  deleteObject(name: string): Promise<void>
}
