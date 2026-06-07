import "dotenv/config";
import { createPostPublisherWorker } from "./workers/post-publisher";
import { createCommentPollerWorker } from "./workers/comment-poller";
import { createAutoReplyWorker } from "./workers/auto-reply";
import { createMediaProcessorWorker } from "./workers/media-processor";

const workers = [
  createPostPublisherWorker(),
  createCommentPollerWorker(),
  createAutoReplyWorker(),
  createMediaProcessorWorker(),
];

console.log(`[workers] ${workers.length} workers started`);

async function shutdown() {
  console.log("[workers] shutting down…");
  await Promise.all(workers.map((w) => w.close()));
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
