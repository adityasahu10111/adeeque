import { Worker, Job } from "bullmq";
import { redisConnection } from "../queues";

export type MediaProcessorJob = {
  postId: string;
  fileKeys: string[];
};

export function createMediaProcessorWorker() {
  return new Worker<MediaProcessorJob>(
    "media-processor",
    async (job: Job<MediaProcessorJob>) => {
      // TODO: process/optimize uploaded media via ImageKit before publishing
      console.log("[media-processor] processing job", job.id, job.data);
    },
    { connection: redisConnection }
  );
}
