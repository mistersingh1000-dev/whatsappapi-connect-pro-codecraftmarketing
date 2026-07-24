// Firebase Firestore data layer for chat/inbox (using Admin SDK)
import { Firestore } from "firebase-admin/firestore";

export type Contact = {
  id: string;
  userId: string;
  phone: string;
  name: string | null;
  profileImage: string | null;
  lastMessageTime: string;
};

export type Message = {
  id: string;
  conversationId: string;
  sender: "user" | "contact";
  content: string;
  timestamp: string;
  status: "sent" | "delivered" | "read";
  waMessageId: string | null;
};

export type Conversation = {
  id: string;
  userId: string;
  phoneNumberId: string;
  wabaId: string | null;
  contactPhone: string;
  contactName: string | null;
  lastMessage: string | null;
  lastMessageTime: string | null;
  unreadCount: number;
  createdAt: string;
};

const CONVERSATIONS = "conversations";
const MESSAGES = "messages";
const CONTACTS = "contacts";

export async function createConversation(
  db: Firestore,
  userId: string,
  phoneNumberId: string,
  wabaId: string | null,
  contactPhone: string,
  contactName: string | null
): Promise<Conversation> {
  const id = `${userId}_${contactPhone}`;
  const now = new Date().toISOString();
  const conv: Conversation = {
    id,
    userId,
    phoneNumberId,
    wabaId,
    contactPhone,
    contactName,
    lastMessage: null,
    lastMessageTime: null,
    unreadCount: 0,
    createdAt: now,
  };
  await db.collection(CONVERSATIONS).doc(id).set(conv);
  return conv;
}

export async function getConversation(
  db: Firestore,
  conversationId: string
): Promise<Conversation | null> {
  const snap = await db.collection(CONVERSATIONS).doc(conversationId).get();
  return snap.exists ? (snap.data() as Conversation) : null;
}

export async function listConversations(db: Firestore, userId: string): Promise<Conversation[]> {
  const snap = await db
    .collection(CONVERSATIONS)
    .where("userId", "==", userId)
    .orderBy("lastMessageTime", "desc")
    .get();
  return snap.docs.map((d) => d.data() as Conversation);
}

export async function addMessage(
  db: Firestore,
  conversationId: string,
  sender: "user" | "contact",
  content: string,
  waMessageId: string | null = null
): Promise<Message> {
  const now = new Date().toISOString();
  const msg: Message = {
    id: "",
    conversationId,
    sender,
    content,
    timestamp: now,
    status: "sent",
    waMessageId,
  };
  const ref = await db.collection(MESSAGES).add(msg);
  msg.id = ref.id;

  await db.collection(CONVERSATIONS).doc(conversationId).update({
    lastMessage: content.substring(0, 100),
    lastMessageTime: now,
  });

  return msg;
}

export async function getMessages(
  db: Firestore,
  conversationId: string,
  limitTo: number = 50
): Promise<Message[]> {
  const snap = await db
    .collection(MESSAGES)
    .where("conversationId", "==", conversationId)
    .orderBy("timestamp", "desc")
    .limit(limitTo)
    .get();
  return snap.docs.map((d) => ({ ...(d.data() as Message), id: d.id })).reverse();
}

export async function createContact(
  db: Firestore,
  userId: string,
  phone: string,
  name: string | null = null
): Promise<Contact> {
  const id = `${userId}_${phone}`;
  const contact: Contact = {
    id,
    userId,
    phone,
    name,
    profileImage: null,
    lastMessageTime: new Date().toISOString(),
  };
  await db.collection(CONTACTS).doc(id).set(contact);
  return contact;
}

export async function listContacts(db: Firestore, userId: string): Promise<Contact[]> {
  const snap = await db
    .collection(CONTACTS)
    .where("userId", "==", userId)
    .orderBy("lastMessageTime", "desc")
    .get();
  return snap.docs.map((d) => d.data() as Contact);
}

export async function updateConversationUnread(
  db: Firestore,
  conversationId: string,
  unreadCount: number
): Promise<void> {
  await db.collection(CONVERSATIONS).doc(conversationId).update({ unreadCount });
}
