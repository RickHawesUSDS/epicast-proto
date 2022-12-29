import { FeedStorage, StorageObject } from "@/epicast/FeedStorage"
import { existsSync } from "fs"
import { readdir, readFile, unlink, writeFile, stat, mkdir, rm } from "fs/promises"
import { getLogger } from "log4js"
import path from "path"

const logger = getLogger('LOCAL_STORAGE')

// Use a local folder for feed storage. Good for testing and demos. Configured by environment variables.
// Assume a posix os
export class LocalFeedStorage implements FeedStorage {
  uri: string
  folderBase: string

  constructor() {
    const storageFolder = process.env.LOCAL_STORAGE ?? './storage'
    const cwd = process.cwd()
    this.folderBase = path.join(cwd, storageFolder)
    this.uri = `file://${this.folderBase}`
  }

  async checkConnection(): Promise<void> {
  }

  async listObjects(prefix: string, onlyOneLevel?: boolean): Promise<StorageObject[]> {
    const [fileNames, _] = await this.listFileAndDirNames(prefix, onlyOneLevel !== true)
    let storageObjects: StorageObject[] = []
    for (const fileName of fileNames) {
      const stats = await stat(path.join(this.folderBase, fileName), {})
      storageObjects.push({ key: fileName, lastModified: stats.mtime, size: stats.size, versionId: '1'})
    }
    return storageObjects
  }

  async listFolders(prefix: string): Promise<string[]> {
    const [_, dirNames] = await this.listFileAndDirNames(prefix, false)
    return dirNames
  }

  async listFileAndDirNames(prefix: string, deep: boolean): Promise<[string[], string[]]> {
    const fullPath = path.join(this.folderBase, prefix)
    logger.debug(`List path: ${fullPath}`)
    if (!existsSync(fullPath)) return [[], []]
    const dirEntries = await readdir(fullPath, { withFileTypes: true})
    let dirNames = dirEntries.filter(dirent => dirent.isDirectory()).map(dirent => path.join(prefix, dirent.name))
    let fileNames = dirEntries.filter(dirent => dirent.isFile()).map(dirent => path.join(prefix, dirent.name))

    // work through sub-directories
    let subNames = [...dirNames]
    while (deep && subNames.length > 0) {
      const folderName = subNames[0]
      subNames.shift()
      const dirEntries = await readdir(path.join(this.folderBase, folderName), { withFileTypes: true})
      for (const dirEntry of dirEntries) {
        if (dirEntry.isDirectory()) {
          const dirName = path.join(folderName, dirEntry.name)
          subNames.push(dirName)
          dirNames.push(dirName)
        } else if (dirEntry.isFile()) {
          fileNames.push(path.join(folderName, dirEntry.name))
        }
      }
    }
    return [fileNames, dirNames]
  }

  async putObject(name: string, body: string): Promise<StorageObject> {
    const fullPath = path.join(this.folderBase, name)
    logger.debug(`Put object path: ${fullPath}`)
    const dirPath = path.dirname(fullPath)
    if (!existsSync(dirPath)){
      await mkdir(dirPath, { recursive: true });
    }
    await writeFile(fullPath, body)
    return { key: name, lastModified: new Date(), versionId: '1' }
  }

  async doesObjectExist(name: string): Promise<boolean> {
    const fullPath = path.join(this.folderBase, name)
    return existsSync(fullPath)
  }

  async getObject(name: string, versionId?: string | undefined) {
    const fullPath = path.join(this.folderBase, name)
    logger.debug(`Get object path: ${fullPath}`)
    const file = await readFile(fullPath)
    return file.toString('utf-8')
  }

  async deleteObject(name: string) {
    const fullPath = path.join(this.folderBase, name)
    logger.debug(`delete object path: ${fullPath}`)
    await rm(fullPath, { force: true, recursive: true })
  }

  async clearAll (): Promise<void> {
    logger.debug(`clear all`)
    const [fileNames, dirNames] = await this.listFileAndDirNames('/', false)
    for (const name of fileNames) {
      await rm(path.join(this.folderBase, name), { force: true, recursive: true })
    }
    for (const name of dirNames) {
      await rm(path.join(this.folderBase, name), { force: true, recursive: true })
    }
  }
}
