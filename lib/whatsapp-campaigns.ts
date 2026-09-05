import type { Firestore } from "firebase-admin/firestore";
import { decryptCredential } from "@/lib/credential-crypto";
import { findUser } from "@/lib/db";
import {
  getCampaign,
  nextQueuedRecipients,
  refreshCampaignCounts,
  updateCampaign,
  updateRecipient,
} from "@/lib/marketing-db";

function renderValue(value: string, contact: { name: string | null; phone: string }): string {
  return String(value)
    .replace(/\{\{name\}\}/gi, contact.name || "there")
    .replace(/\{\{phone\}\}/gi, contact.phone);
}

async function sendOne(args: {
  phoneNumberId: string;
  token: string;
  to: string;
  templateName: string;
  templateLanguage: string;
  variableValues: string[];
  contactName: string | null;
}) {
  const version = process.env.WHATSAPP_API_VERSION || "v26.0";
  const values = args.variableValues.map((value) =>
    renderValue(value, { name: args.contactName, phone: args.to })
  );

  const template: Record<string, any> = {
    name: args.templateName,
    language: { code: args.templateLanguage },
  };
  if (values.length) {
    template.components = [
      {
        type: "body",
        parameters: values.map((text) => ({ type: "text", text })),
      },
    ];
  }

  const res = await fetch(
    `https://graph.facebook.com/${version}/${encodeURIComponent(args.phoneNumberId)}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${args.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: args.to.replace(/\D/g, ""),
        type: "template",
        template,
      }),
      cache: "no-store",
    }
  );
  const data = await res.json().catch(() => ({}));
  return { res, data };
}

export async function processCampaignBatch(
  db: Firestore,
  userId: string,
  campaignId: string,
  batchSize = 20
) {
  const campaign = await getCampaign(db, campaignId);
  if (!campaign || campaign.userId !== userId) {
    throw new Error("campaign_not_found");
  }
  if (["completed", "completed_with_errors", "cancelled"].includes(campaign.status)) {
    return campaign;
  }

  const user = await findUser(db, userId);
  if (!user?.phone_number_id || !user?.wa_token || user.wa_registered === false) {
    throw new Error("whatsapp_not_ready");
  }
  const token = decryptCredential(user.wa_token);
  if (!token) throw new Error("credential_error");

  const recipients = await nextQueuedRecipients(db, campaignId, batchSize);
  if (!recipients.length) return refreshCampaignCounts(db, campaignId);

  await updateCampaign(db, campaignId, { status: "sending" });

  // Small concurrency groups reduce server time without firing an uncontrolled
  // burst at Meta. Campaign recipients are already restricted to explicit opt-in.
  for (let i = 0; i < recipients.length; i += 5) {
    const group = recipients.slice(i, i + 5);
    await Promise.all(
      group.map(async (recipient) => {
        try {
          const { res, data } = await sendOne({
            phoneNumberId: user.phone_number_id!,
            token,
            to: recipient.phone,
            templateName: campaign.templateName,
            templateLanguage: campaign.templateLanguage,
            variableValues: campaign.variableValues,
            contactName: recipient.contactName,
          });
          if (!res.ok) {
            await updateRecipient(db, recipient.id, {
              status: "failed",
              error: String(data?.error?.message || "Meta rejected the template message.").slice(0, 500),
            });
            return;
          }
          await updateRecipient(db, recipient.id, {
            status: "sent",
            waMessageId: data?.messages?.[0]?.id || null,
            error: null,
          });
        } catch (e: any) {
          await updateRecipient(db, recipient.id, {
            status: "failed",
            error: String(e?.message || "Send failed").slice(0, 500),
          });
        }
      })
    );
  }

  return refreshCampaignCounts(db, campaignId);
}
