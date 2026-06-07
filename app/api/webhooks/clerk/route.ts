import { headers } from "next/headers";
import { Webhook } from "svix";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

type ClerkUserEvent = {
  data: {
    id: string;
    email_addresses: Array<{ email_address: string; id: string }>;
    primary_email_address_id: string;
    first_name: string | null;
    last_name: string | null;
    image_url: string | null;
  };
  type: "user.created" | "user.updated" | "user.deleted";
};

export async function POST(req: Request) {
  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
  let event: ClerkUserEvent;

  try {
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkUserEvent;
  } catch {
    return new Response("Invalid webhook signature", { status: 400 });
  }

  const { type, data } = event;

  if (type === "user.created") {
    const primaryEmail = data.email_addresses.find(
      (e) => e.id === data.primary_email_address_id
    );
    if (!primaryEmail) {
      return new Response("No primary email found", { status: 400 });
    }

    const name = [data.first_name, data.last_name].filter(Boolean).join(" ") || null;

    await db.insert(users).values({
      id: data.id,
      clerkId: data.id,
      email: primaryEmail.email_address,
      name,
      imageUrl: data.image_url,
      plan: "free",
    });
  }

  if (type === "user.updated") {
    const primaryEmail = data.email_addresses.find(
      (e) => e.id === data.primary_email_address_id
    );
    if (!primaryEmail) {
      return new Response("No primary email found", { status: 400 });
    }

    const name = [data.first_name, data.last_name].filter(Boolean).join(" ") || null;

    await db
      .update(users)
      .set({
        email: primaryEmail.email_address,
        name,
        imageUrl: data.image_url,
        updatedAt: new Date(),
      })
      .where(eq(users.clerkId, data.id));
  }

  if (type === "user.deleted") {
    await db
      .update(users)
      .set({ deletedAt: new Date() })
      .where(eq(users.clerkId, data.id));
  }

  return new Response("OK", { status: 200 });
}
