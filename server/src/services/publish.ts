import { FeedInterface } from "@/utils/FeedInterface"
import * as fs from "fs"

const SCHEMA_TYPE = "application/x-yaml"
const SCHEMA_NAME = "epicast-demoserver-feed1-schema.yaml"
const SCHEMA_TEMPLATE_PATH = "./src/public/epicast-demoserver-feed1-schema.yaml"

export async function publishStateCaseTables(feed: FeedInterface) {
  await publishSchema(feed)
}

export async function publishSchema(feed: FeedInterface) {
  const stream = fs.createReadStream(SCHEMA_TEMPLATE_PATH, 'utf8')
  await feed.putObject(SCHEMA_NAME, stream)
}

export function getLastPublishedDate(feed: FeedInterface) {

}

export function getStateCaseTables(feed: FeedInterface) {

}
