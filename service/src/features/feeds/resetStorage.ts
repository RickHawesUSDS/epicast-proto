import { FeedBucket } from '@/epicast/FeedBucket';
import { logger } from '../system/resetSystem';


export async function resetStorage(feed: FeedBucket): Promise<void> {
    logger.info('Resetting storage');
    const bucketObjects = await feed.listObjects('');
    for (const bucketObject of bucketObjects) {
        await feed.deleteObject(bucketObject.key);
    }
}
