import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME, verifySession } from "@/lib/auth";
import { findUser, getDb } from "@/lib/db";
import { accessState, paidFeatureError } from "@/lib/entitlements";
import {
  createAutomationRule,
  listAutomationRules,
  updateAutomationRuleForUser,
} from "@/lib/automation-db";

export const runtime = "nodejs";

async function context(requireActive = false) {
  const jar = await cookies();
  const session = await verifySession(jar.get(COOKIE_NAME)?.value);
  if (!session) return { error: NextResponse.json({ error: "not_authenticated" }, { status: 401 }) };
  const db = getDb();
  if (!db) return { error: NextResponse.json({ error: "database_not_configured" }, { status: 503 }) };
  const user = await findUser(db, session.sub);
  if (!user) return { error: NextResponse.json({ error: "user_not_found" }, { status: 404 }) };
  const access = accessState(user);
  if (requireActive && !access.active) {
    const denied = paidFeatureError(access);
    return { error: NextResponse.json({ error: denied.error, message: denied.message }, { status: denied.status }) };
  }
  return { session, db, user, access };
}

export async function GET() {
  const ctx = await context(false);
  if (ctx.error) return ctx.error;
  try {
    return NextResponse.json({
      rules: await listAutomationRules(ctx.db!, ctx.session!.sub),
      readOnly: ctx.access!.readOnly,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const ctx = await context(true);
  if (ctx.error) return ctx.error;
  const body = await req.json().catch(() => ({}));

  const name = String(body.name || "").trim().slice(0, 120);
  const matchMode = body.matchMode === "exact" ? "exact" : "contains";
  const keywords = Array.isArray(body.keywords)
    ? body.keywords.map((v: unknown) => String(v).trim().slice(0, 80)).filter(Boolean).slice(0, 20)
    : [];
  const replyText = String(body.replyText || "").trim().slice(0, 4096);
  const addTags = Array.isArray(body.addTags)
    ? body.addTags.map((v: unknown) => String(v).trim().slice(0, 40)).filter(Boolean).slice(0, 10)
    : [];

  if (!name || !keywords.length || !replyText) {
    return NextResponse.json(
      { error: "missing_fields", message: "Rule name, at least one keyword and reply text are required." },
      { status: 400 }
    );
  }

  try {
    const rule = await createAutomationRule(ctx.db!, {
      userId: ctx.session!.sub,
      name,
      enabled: body.enabled !== false,
      triggerType: "keyword",
      keywords,
      matchMode,
      actionType: "reply_text",
      replyText,
      templateName: null,
      templateLanguage: null,
      addTags,
    });
    return NextResponse.json({ rule }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "failed" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const ctx = await context(true);
  if (ctx.error) return ctx.error;
  const body = await req.json().catch(() => ({}));
  const ruleId = String(body.ruleId || "");
  if (!ruleId) return NextResponse.json({ error: "rule_id_required" }, { status: 400 });

  const updates: Record<string, any> = {};
  if (typeof body.enabled === "boolean") updates.enabled = body.enabled;
  if (typeof body.name === "string") updates.name = body.name.trim().slice(0, 120);
  if (typeof body.replyText === "string") updates.replyText = body.replyText.trim().slice(0, 4096);
  if (body.matchMode === "exact" || body.matchMode === "contains") updates.matchMode = body.matchMode;
  if (Array.isArray(body.keywords)) {
    updates.keywords = body.keywords.map((v: unknown) => String(v).trim().slice(0, 80)).filter(Boolean).slice(0, 20);
  }
  if (Array.isArray(body.addTags)) {
    updates.addTags = body.addTags.map((v: unknown) => String(v).trim().slice(0, 40)).filter(Boolean).slice(0, 10);
  }

  if (!Object.keys(updates).length) return NextResponse.json({ error: "nothing_to_update" }, { status: 400 });

  try {
    const rule = await updateAutomationRuleForUser(ctx.db!, ctx.session!.sub, ruleId, updates);
    if (!rule) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json({ rule });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "failed" }, { status: 500 });
  }
}
