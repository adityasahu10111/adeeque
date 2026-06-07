import { Worker, Job } from "bullmq";
import { redisConnection } from "../queues";

export type CommentPollerJob = {
  postPlatformResultId: string;
  platform: string;
  platformPostId: string;
};

export function createCommentPollerWorker() {
  return new Worker<CommentPollerJob>(
    "comment-poller",
    async (job: Job<CommentPollerJob>) => {
      // TODO: implement comment polling and metric sync per platform
      console.log("[comment-poller] processing job", job.id, job.data);
    },
    { connection: redisConnection }
  );
}
