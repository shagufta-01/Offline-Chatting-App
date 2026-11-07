export type ScreenType =
  | 'splash'
  | 'welcome'
  | 'login'
  | 'register'
  | 'forgot_password'
  | 'profile_setup'
  | 'dashboard'
  | 'nearby'
  | 'requests'
  | 'chat_list'
  | 'individual_chat'
  | 'group_chat'
  | 'voice_call'
  | 'video_call'
  | 'mesh_network'
  | 'profile'
  | 'settings';

export type ConnectionProtocol = 'BLE_5_2' | 'WIFI_DIRECT' | 'MESH_RELAY';

export type UserStatus = 'online' | 'offline' | 'relaying' | 'busy';

export interface UserProfile {
  id: string; // e.g. GC-9042-881E
  username: string;
  fullName?: string;
  email?: string;
  profilePicture?: string;
  token?: string;
  isAuthenticated?: boolean;
  isOfflineSession?: boolean;
  avatarSeed: string;
  avatarBg: string;
  bio: string;
  publicKeyFingerprint: string;
  publicKeyPem: string;
  createdAt: number;
  isDiscoverable: boolean;
  meshRelayEnabled: boolean;
  maxHops: number;
  batteryLevel: number;
  signalStrength: number; // -100 to -30 dBm
}

export interface NearbyDevice {
  id: string;
  username: string;
  avatarSeed: string;
  avatarBg: string;
  rssi: number; // e.g. -45 dBm
  distanceMeters: number; // approximate
  protocol: ConnectionProtocol;
  connectionState: 'unconnected' | 'requested' | 'incoming' | 'connected' | 'blocked';
  publicKeyFingerprint: string;
  isRelayNode: boolean;
  lastSeen: number;
}

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'relayed';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  recipientId: string; // user ID or group ID
  content: string;
  timestamp: number;
  status: MessageStatus;
  isEncrypted: boolean;
  hops: number;
  relayPath?: string[]; // IDs of nodes traversed
  attachment?: {
    type: 'image' | 'voice' | 'file';
    name: string;
    url: string;
    size?: string;
    duration?: number; // for voice
  };
}

export interface Conversation {
  id: string;
  name: string;
  isGroup: boolean;
  participantIds: string[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  updatedAt: number;
  avatarBg: string;
  avatarSeed: string;
}

export interface ConnectionRequest {
  id: string;
  fromUser: {
    id: string;
    username: string;
    avatarSeed: string;
    avatarBg: string;
    fingerprint: string;
    rssi: number;
  };
  timestamp: number;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface CallSession {
  id: string;
  type: 'voice' | 'video';
  state: 'idle' | 'outgoing_ringing' | 'incoming_ringing' | 'connected' | 'ended';
  remoteUser: {
    id: string;
    username: string;
    avatarSeed: string;
    avatarBg: string;
  };
  startTime?: number;
  durationSeconds: number;
  isMuted: boolean;
  isSpeakerOn: boolean;
  isCameraOff: boolean;
  isFrontCamera: boolean;
  videoQuality: '480p' | '720p' | '1080p';
}

export interface MeshPacket {
  packetId: string;
  type: 'DISCOVERY' | 'PAIR_REQ' | 'PAIR_ACK' | 'MESSAGE' | 'CALL_SIGNAL' | 'STORE_FORWARD';
  sourceId: string;
  destinationId: string;
  payload: any;
  hopLimit: number;
  currentHops: number;
  traversedNodes: string[];
  timestamp: number;
  signature: string;
}

export interface MeshNodeTopology {
  id: string;
  name: string;
  x: number;
  y: number;
  status: 'active' | 'relay_only' | 'offline';
  connectedTo: string[];
  packetsRelayed: number;
}
