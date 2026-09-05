import type { Firestore } from "firebase-admin/firestore";

export type AutomationRule = {
  id: string;
  userId: string;
  name: string;
  enabled: boolean;
  triggerType: "keyword";
  keywords: string[];
  matchMode: "contains" | "exact";
  actionType: "reply_text" | "reply_template";
  replyText: string | null;
  templateName: string | null;
  templateLanguage: string | null;
  addTags: string[];
  createdAt: string;
  updatedAt: string;
  runCount: number;
  lastRunAt: string | null;
};

const RULES = "automationRules";

export async function listAutomationRules(
  db: Firestore,
  userId: string
): Promise<AutomationRule[]> {
  const snap = await db.collection(RULES).where("userId", "==", userId).get();
  const rows = snap.docs.map((d) => d.data() as AutomationRule);
  rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return rows;
}

export async function listEnabledAutomationRules(
  db: Firestore,
  userId: string
): Promise<AutomationRule[]> {
  const rows = await listAutomationRules(db, userId);
  return rows.filter((r) => r.enabled);
}

export async function createAutomationRule(
  db: Firestore,
  data: Omit<AutomationRule, "id" | "createdAt" | "updatedAt" | "runCount" | "lastRunAt">
): Promise<AutomationRule> {
  const ref = db.collection(RULES).doc();
  const now = new Date().toISOString();
  const rule: AutomationRule = {
    ...data,
    id: ref.id,
    createdAt: now,
    updatedAt: now,
    runCount: 0,
    lastRunAt: null,
  };
  await ref.set(rule);
  return rule;
}

export async function updateAutomationRuleForUser(
  db: Firestore,
  userId: string,
  ruleId: string,
  updates: Partial<Omit<AutomationRule, "id" | "userId" | "createdAt">>
): Promise<AutomationRule | null> {
  const ref = db.collection(RULES).doc(ruleId);
  const snap = await ref.get();
  if (!snap.exists) return null;
  const current = snap.data() as AutomationRule;
  if (current.userId !== userId) return null;
  await ref.update({ ...updates, updatedAt: new Date().toISOString() });
  const after = await ref.get();
  return after.data() as AutomationRule;
}

export async function markAutomationRun(
  db: Firestore,
  rule: AutomationRule
): Promise<void> {
  await db.collection(RULES).doc(rule.id).update({
    runCount: (rule.runCount || 0) + 1,
    lastRunAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}
