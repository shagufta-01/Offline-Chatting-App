import mongoose, { Schema, Document } from 'mongoose';

// 1. Conversation Model
export interface IConversation extends Document {
  name: string;
  isGroup: boolean;
  participantIds: string[];
  lastMessageId?: string;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    name: { type: String, required: true },
    isGroup: { type: Boolean, default: false },
    participantIds: [{ type: String, required: true }],
    lastMessageId: { type: String },
  },
  { timestamps: true, collection: 'conversations' }
);
ConversationSchema.index({ participantIds: 1 });
ConversationSchema.index({ updatedAt: -1 });

export const Conversation =
  mongoose.models.Conversation || mongoose.model<IConversation>('Conversation', ConversationSchema);

// 2. Message Model
export interface IMessage extends Document {
  conversationId: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  content: string;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'relayed';
  isEncrypted: boolean;
  hops: number;
  relayPath?: string[];
  attachmentUrl?: string;
  attachmentType?: string;
  timestamp: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: { type: String, required: true, index: true },
    senderId: { type: String, required: true, index: true },
    senderName: { type: String, required: true },
    recipientId: { type: String, required: true, index: true },
    content: { type: String, required: true },
    status: {
      type: String,
      enum: ['sending', 'sent', 'delivered', 'read', 'relayed'],
      default: 'sent',
    },
    isEncrypted: { type: Boolean, default: true },
    hops: { type: Number, default: 0 },
    relayPath: [{ type: String }],
    attachmentUrl: { type: String },
    attachmentType: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true, collection: 'messages' }
);
MessageSchema.index({ conversationId: 1, timestamp: -1 });

export const Message = mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);

// 3. Call Model
export interface ICall extends Document {
  callerId: string;
  receiverId: string;
  callType: 'voice' | 'video';
  status: 'initiated' | 'connected' | 'completed' | 'missed' | 'rejected';
  durationSeconds: number;
  quality: string;
  createdAt: Date;
}

const CallSchema = new Schema<ICall>(
  {
    callerId: { type: String, required: true, index: true },
    receiverId: { type: String, required: true, index: true },
    callType: { type: String, enum: ['voice', 'video'], required: true },
    status: {
      type: String,
      enum: ['initiated', 'connected', 'completed', 'missed', 'rejected'],
      default: 'initiated',
    },
    durationSeconds: { type: Number, default: 0 },
    quality: { type: String, default: '720p' },
  },
  { timestamps: true, collection: 'calls' }
);

export const Call = mongoose.models.Call || mongoose.model<ICall>('Call', CallSchema);

// 4. Trusted Contact Model
export interface ITrustedContact extends Document {
  userId: string;
  contactUserId: string;
  alias?: string;
  fingerprint: string;
  pairedVia: 'QR_CODE' | 'BLE_BEACON' | 'MANUAL';
  createdAt: Date;
}

const TrustedContactSchema = new Schema<ITrustedContact>(
  {
    userId: { type: String, required: true, index: true },
    contactUserId: { type: String, required: true },
    alias: { type: String },
    fingerprint: { type: String, required: true },
    pairedVia: {
      type: String,
      enum: ['QR_CODE', 'BLE_BEACON', 'MANUAL'],
      default: 'QR_CODE',
    },
  },
  { timestamps: true, collection: 'trusted_contacts' }
);
TrustedContactSchema.index({ userId: 1, contactUserId: 1 }, { unique: true });

export const TrustedContact =
  mongoose.models.TrustedContact ||
  mongoose.model<ITrustedContact>('TrustedContact', TrustedContactSchema);

// 5. Network Peer Model
export interface INetworkPeer extends Document {
  nodeId: string;
  username: string;
  publicKeyFingerprint: string;
  rssi: number;
  distanceMeters: number;
  protocol: 'BLE_5_2' | 'WIFI_DIRECT' | 'MESH_RELAY';
  isRelayNode: boolean;
  lastSeen: Date;
}

const NetworkPeerSchema = new Schema<INetworkPeer>(
  {
    nodeId: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    publicKeyFingerprint: { type: String, required: true },
    rssi: { type: Number, default: -60 },
    distanceMeters: { type: Number, default: 10 },
    protocol: {
      type: String,
      enum: ['BLE_5_2', 'WIFI_DIRECT', 'MESH_RELAY'],
      default: 'BLE_5_2',
    },
    isRelayNode: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now },
  },
  { timestamps: true, collection: 'network_peers' }
);

export const NetworkPeer =
  mongoose.models.NetworkPeer ||
  mongoose.model<INetworkPeer>('NetworkPeer', NetworkPeerSchema);
