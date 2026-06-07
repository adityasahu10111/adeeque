import { Worker, Job } from "bullmq";
import { redisConnection } from "../queues";

export type AutoReplyJob = {
  ruleId: string;
  triggerType: "mention" | "comment" | "dm";
  platformPostId: string;
  inboundText: string;
  platform: string;
  connectedAccountId: string;
};

export function createAutoReplyWorker() {
  return new Worker<AutoReplyJob>(
    "auto-reply",
    async (job: Job<AutoReplyJob>) => {
      // TODO: call Groq to generate reply, then post via platform API
      console.log("[auto-reply] processing job", job.id, job.data);
    },
    { connection: redisConnection }
  );
}
