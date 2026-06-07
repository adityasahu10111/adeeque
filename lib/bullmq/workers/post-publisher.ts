import { Worker, Job } from "bullmq";
import { redisConnection } from "../queues";

export type PostPublisherJob = {
  postId: string;
  userId: string;
};

export function createPostPublisherWorker() {
  return new Worker<PostPublisherJob>(
    "post-publisher",
    async (job: Job<PostPublisherJob>) => {
      // TODO: implement publishing logic per platform
      console.log("[post-publisher] processing job", job.id, job.data);
    },
    { connection: redisConnection }
  );
}
