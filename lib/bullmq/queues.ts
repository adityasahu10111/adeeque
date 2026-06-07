import { Queue } from "bullmq";
import type { ConnectionOptions } from "bullmq";

function parseRedisUrl(url: string): ConnectionOptions {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: parsed.port ? parseInt(parsed.port, 10) : 6379,
    password: parsed.password || undefined,
    username: parsed.username || undefined,
    maxRetriesPerRequest: null,
  };
}

const connection = parseRedisUrl(
  process.env.REDIS_URL ?? "redis://localhost:6379"
);

export const postPublisherQueue = new Queue("post-publisher", { connection });
export const commentPollerQueue = new Queue("comment-poller", { connection });
export const autoReplyQueue = new Queue("auto-reply", { connection });
export const mediaProcessorQueue = new Queue("media-processor", { connection });

export { connection as redisConnection };
