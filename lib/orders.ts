// Manual UPI orders: customer pays by QR, you approve in the admin panel.
import type { Firestore } from "firebase-admin/firestore";

export type OrderStatus = "pending" | "approved" | "rejected";

export type Order = {
  id: string;
  userId: string;        // customer email
  userName: string | null;
  planId: string;
  planName: string;
  amount: number;        // rupees
  months: number;        // how long it extends access
  reference: string;     // UPI transaction / UTR number the customer typed
  payerNote: string | null;
  status: OrderStatus;
  createdAt: string;
  decidedAt: string | null;
  decidedBy: string | null;
};

const ORDERS = "orders";

export async function createOrder(
  db: Firestore,
  data: Omit<Order, "id" | "status" | "createdAt" | "decidedAt" | "decidedBy">
): Promise<Order> {
  const ref = db.collection(ORDERS).doc();
  const order: Order = {
    ...data,
    id: ref.id,
    status: "pending",
    createdAt: new Date().toISOString(),
    decidedAt: null,
    decidedBy: null,
  };
  await ref.set(order);
  return order;
}

export async function getOrder(db: Firestore, id: string): Promise<Order | null> {
  const snap = await db.collection(ORDERS).doc(id).get();
  return snap.exists ? (snap.data() as Order) : null;
}

// Most recent pending order for a customer — drives the "under process" banner.
export async function pendingOrderFor(db: Firestore, userId: string): Promise<Order | null> {
  const snap = await db
    .collection(ORDERS)
    .where("userId", "==", userId)
    .where("status", "==", "pending")
    .get();
  if (snap.empty) return null;
  const rows = snap.docs.map((d) => d.data() as Order);
  rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return rows[0];
}

export async function listOrders(db: Firestore): Promise<Order[]> {
  const snap = await db.collection(ORDERS).get();
  const rows = snap.docs.map((d) => d.data() as Order);
  // Pending first, then newest.
  rows.sort((a, b) => {
    if (a.status === "pending" && b.status !== "pending") return -1;
    if (b.status === "pending" && a.status !== "pending") return 1;
    return b.createdAt.localeCompare(a.createdAt);
  });
  return rows;
}

export async function decideOrder(
  db: Firestore,
  id: string,
  status: "approved" | "rejected",
  decidedBy: string
): Promise<Order | null> {
  const ref = db.collection(ORDERS).doc(id);
  const snap = await ref.get();
  if (!snap.exists) return null;
  await ref.update({ status, decidedAt: new Date().toISOString(), decidedBy });
  const after = await ref.get();
  return after.data() as Order;
}
