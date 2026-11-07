import React, { useState, useEffect, useRef } from 'react';
import {
  Radio,
  Smartphone,
  Columns,
  Code2,
  ShieldCheck,
  AlertTriangle,
  QrCode,
  Wifi,
  ExternalLink,
  Layers,
  Sparkles,
} from 'lucide-react';

import {
  CallSession,
  ChatMessage,
  ConnectionRequest,
  Conversation,
  MeshNodeTopology,
  NearbyDevice,
  ScreenType,
  UserProfile,
} from './types';
import { sound } from './services/sound';
import { CryptoService } from './services/crypto';
import { p2pNetwork } from './services/p2pNetwork';

// UI Components
import { AndroidFrame } from './components/AndroidFrame';
import { BottomNavigation } from './components/Navigation';
import { QrCodeModal } from './components/QrCodeModal';
import { AndroidStudioExportModal } from './components/screens/AndroidStudioExportModal';

// Screens
import { SplashScreen } from './components/screens/SplashScreen';
import { WelcomeScreen } from './components/screens/WelcomeScreen';
import { LoginScreen } from './components/screens/LoginScreen';
import { RegisterScreen } from './components/screens/RegisterScreen';
import { ForgotPasswordScreen } from './components/screens/ForgotPasswordScreen';
import { ProfileSetupScreen } from './components/screens/ProfileSetupScreen';
import { DashboardScreen } from './components/screens/DashboardScreen';
import { NearbyScreen } from './components/screens/NearbyScreen';
import { RequestsScreen } from './components/screens/RequestsScreen';
import { ChatListScreen } from './components/screens/ChatListScreen';
import { IndividualChatScreen } from './components/screens/IndividualChatScreen';
import { GroupChatScreen } from './components/screens/GroupChatScreen';
import { VoiceCallScreen } from './components/screens/VoiceCallScreen';
import { VideoCallScreen } from './components/screens/VideoCallScreen';
import { MeshNetworkScreen } from './components/screens/MeshNetworkScreen';
import { ProfileScreen } from './components/screens/ProfileScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { AuthApiService } from './services/authApi';

// Initial Mock Identities
const DEFAULT_USER_A: UserProfile = {
  id: 'GC-8F92-A3D1',
  username: 'Alex Rivera',
  avatarSeed: 'Alex Rivera',
  avatarBg: '#FF6B00',
  bio: 'Field Operative · Relay Active',
  publicKeyFingerprint: '8F:42:0B:99:A1:77:E2:30',
  publicKeyPem: 'PUB_ED25519_KEY_A',
  createdAt: Date.now() - 3600000,
  isDiscoverable: true,
  meshRelayEnabled: true,
  maxHops: 5,
  batteryLevel: 94,
  signalStrength: -42,
};

const DEFAULT_USER_B: UserProfile = {
  id: 'GC-44C1-90E8',
  username: 'Sam Chen',
  avatarSeed: 'Sam Chen',
  avatarBg: '#2563EB',
  bio: 'Relay Node · Medical Unit',
  publicKeyFingerprint: '44:C1:90:E8:22:91:FA:11',
  publicKeyPem: 'PUB_ED25519_KEY_B',
  createdAt: Date.now() - 7200000,
  isDiscoverable: true,
  meshRelayEnabled: true,
  maxHops: 5,
  batteryLevel: 88,
  signalStrength: -58,
};

const INITIAL_NEARBY_DEVICES: NearbyDevice[] = [
  {
    id: 'GC-44C1-90E8',
    username: 'Sam Chen',
    avatarSeed: 'Sam Chen',
    avatarBg: '#2563EB',
    rssi: -42,
    distanceMeters: 4.2,
    protocol: 'WIFI_DIRECT',
    connectionState: 'connected',
    publicKeyFingerprint: '44:C1:90:E8:22:91:FA:11',
    isRelayNode: true,
    lastSeen: Date.now(),
  },
  {
    id: 'GC-B719-2041',
    username: 'Elena Rostova',
    avatarSeed: 'Elena Rostova',
    avatarBg: '#E11D48',
    rssi: -68,
    distanceMeters: 12.8,
    protocol: 'BLE_5_2',
    connectionState: 'unconnected',
    publicKeyFingerprint: '3C:99:A1:02:88:F4:71:D0',
    isRelayNode: false,
    lastSeen: Date.now() - 15000,
  },
  {
    id: 'GC-30AA-F580',
    username: 'Kaito Tanaka',
    avatarSeed: 'Kaito Tanaka',
    avatarBg: '#059669',
    rssi: -79,
    distanceMeters: 22.5,
    protocol: 'MESH_RELAY',
    connectionState: 'unconnected',
    publicKeyFingerprint: '19:AA:F2:66:30:19:94:02',
    isRelayNode: true,
    lastSeen: Date.now() - 32000,
  },
];

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'convo_sam',
    name: 'Sam Chen',
    isGroup: false,
    participantIds: ['GC-8F92-A3D1', 'GC-44C1-90E8'],
    lastMessage: {
      id: 'm1',
      senderId: 'GC-44C1-90E8',
      senderName: 'Sam Chen',
      recipientId: 'GC-8F92-A3D1',
      content: 'Wi-Fi Direct socket is stable. Audio channel ready.',
      timestamp: Date.now() - 120000,
      status: 'read',
      isEncrypted: true,
      hops: 0,
    },
    unreadCount: 0,
    updatedAt: Date.now() - 120000,
    avatarBg: '#2563EB',
    avatarSeed: 'Sam Chen',
  },
  {
    id: 'convo_mesh_emergency',
    name: 'Emergency Mesh Hub',
    isGroup: true,
    participantIds: ['GC-8F92-A3D1', 'GC-44C1-90E8', 'GC-B719-2041', 'GC-30AA-F580'],
    lastMessage: {
      id: 'm2',
      senderId: 'GC-30AA-F580',
      senderName: 'Kaito Tanaka',
      recipientId: 'convo_mesh_emergency',
      content: 'Local repeater on sector 4 has 5 active relay hops.',
      timestamp: Date.now() - 600000,
      status: 'relayed',
      isEncrypted: true,
      hops: 2,
    },
    unreadCount: 1,
    updatedAt: Date.now() - 600000,
    avatarBg: '#FF6B00',
    avatarSeed: 'Emergency Mesh Hub',
  },
];

const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
  convo_sam: [
    {
      id: 'm0',
      senderId: 'GC-8F92-A3D1',
      senderName: 'Alex Rivera',
      recipientId: 'GC-44C1-90E8',
      content: 'Connected via BLE beacon. Handshake verified.',
      timestamp: Date.now() - 240000,
      status: 'read',
      isEncrypted: true,
      hops: 0,
    },
    {
      id: 'm1',
      senderId: 'GC-44C1-90E8',
      senderName: 'Sam Chen',
      recipientId: 'GC-8F92-A3D1',
      content: 'Wi-Fi Direct socket is stable. Audio channel ready.',
      timestamp: Date.now() - 120000,
      status: 'read',
      isEncrypted: true,
      hops: 0,
    },
  ],
  convo_mesh_emergency: [
    {
      id: 'me1',
      senderId: 'GC-B719-2041',
      senderName: 'Elena Rostova',
      recipientId: 'convo_mesh_emergency',
      content: 'Cellular network is completely down in Sector B. Switching all radios to Global Connect.',
      timestamp: Date.now() - 900000,
      status: 'relayed',
      isEncrypted: true,
      hops: 1,
    },
    {
      id: 'm2',
      senderId: 'GC-30AA-F580',
      senderName: 'Kaito Tanaka',
      recipientId: 'convo_mesh_emergency',
      content: 'Local repeater on sector 4 has 5 active relay hops.',
      timestamp: Date.now() - 600000,
      status: 'relayed',
      isEncrypted: true,
      hops: 2,
    },
  ],
};

const INITIAL_TOPOLOGY_NODES: MeshNodeTopology[] = [
  { id: 'GC-8F92-A3D1', name: 'Alex (You)', x: 20, y: 35, status: 'active', connectedTo: ['GC-44C1-90E8', 'GC-B719-2041'], packetsRelayed: 42 },
  { id: 'GC-44C1-90E8', name: 'Sam Chen', x: 50, y: 22, status: 'active', connectedTo: ['GC-8F92-A3D1', 'GC-NODE-R1'], packetsRelayed: 128 },
  { id: 'GC-B719-2041', name: 'Elena R.', x: 30, y: 75, status: 'active', connectedTo: ['GC-8F92-A3D1', 'GC-NODE-R2'], packetsRelayed: 19 },
  { id: 'GC-NODE-R1', name: 'Relay #1', x: 80, y: 30, status: 'relay_only', connectedTo: ['GC-44C1-90E8', 'GC-30AA-F580'], packetsRelayed: 310 },
  { id: 'GC-NODE-R2', name: 'Relay #2', x: 65, y: 80, status: 'relay_only', connectedTo: ['GC-B719-2041', 'GC-30AA-F580'], packetsRelayed: 204 },
  { id: 'GC-30AA-F580', name: 'Kaito T.', x: 88, y: 65, status: 'active', connectedTo: ['GC-NODE-R1', 'GC-NODE-R2'], packetsRelayed: 67 },
];

export default function App() {
  // Device 1 (Alex Rivera) State
  const [screenA, setScreenA] = useState<ScreenType>('dashboard');
  const [userA, setUserA] = useState<UserProfile>(DEFAULT_USER_A);
  const [conversationsA, setConversationsA] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [messagesA, setMessagesA] = useState<Record<string, ChatMessage[]>>(INITIAL_MESSAGES);
  const [activeConvoIdA, setActiveConvoIdA] = useState<string>('convo_sam');
  const [nearbyDevicesA, setNearbyDevicesA] = useState<NearbyDevice[]>(INITIAL_NEARBY_DEVICES);
  const [requestsA, setRequestsA] = useState<ConnectionRequest[]>([]);
  const [isScanningA, setIsScanningA] = useState(false);

  // Device 2 (Sam Chen) State for Dual-Phone Testing Lab
  const [screenB, setScreenB] = useState<ScreenType>('dashboard');
  const [userB, setUserB] = useState<UserProfile>(DEFAULT_USER_B);
  const [conversationsB, setConversationsB] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [messagesB, setMessagesB] = useState<Record<string, ChatMessage[]>>(INITIAL_MESSAGES);
  const [activeConvoIdB, setActiveConvoIdB] = useState<string>('convo_sam');

  // Shared Call State
  const [callSession, setCallSession] = useState<CallSession | null>(null);

  // Mesh Topology Simulation State
  const [meshNodes, setMeshNodes] = useState<MeshNodeTopology[]>(INITIAL_TOPOLOGY_NODES);
  const [activePacketRoute, setActivePacketRoute] = useState<string[]>([]);

  // Viewport / Lab Mode: 'dual_phone' or 'single_phone'
  const [viewMode, setViewMode] = useState<'single_phone' | 'dual_phone'>('single_phone');
  const [activePhoneIndex, setActivePhoneIndex] = useState<1 | 2>(1);

  // Modals
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isAndroidStudioOpen, setIsAndroidStudioOpen] = useState(false);
  const [sosNotice, setSosNotice] = useState<string | null>(null);

  // Initialize P2P broadcast channel listening
  useEffect(() => {
    p2pNetwork.startDiscoveryAdvertising(userA);

    const unsubscribe = p2pNetwork.subscribe((packet) => {
      if (packet.type === 'MESSAGE') {
        const incomingMsg: ChatMessage = packet.payload;
        sound.playMessageReceived();

        // Update Phone A messages if targeted
        setMessagesA((prev) => {
          const list = prev[incomingMsg.recipientId] || [];
          return {
            ...prev,
            [incomingMsg.recipientId]: [...list, incomingMsg],
          };
        });

        // Update Phone B messages
        setMessagesB((prev) => {
          const list = prev[incomingMsg.recipientId] || [];
          return {
            ...prev,
            [incomingMsg.recipientId]: [...list, incomingMsg],
          };
        });
      } else if (packet.type === 'CALL_SIGNAL') {
        const { action, callType, fromUser } = packet.payload;
        if (action === 'OFFER') {
          sound.startIncomingRingtone();
          setCallSession({
            id: 'call_' + Date.now(),
            type: callType,
            state: 'incoming_ringing',
            remoteUser: fromUser,
            durationSeconds: 0,
            isMuted: false,
            isSpeakerOn: true,
            isCameraOff: false,
            isFrontCamera: true,
            videoQuality: '720p',
          });
        } else if (action === 'ANSWER') {
          sound.stopRingtone();
          sound.playConnected();
          setCallSession((prev) => (prev ? { ...prev, state: 'connected' } : null));
        } else if (action === 'HANGUP') {
          sound.stopRingtone();
          setCallSession(null);
        }
      }
    });

    return () => {
      p2pNetwork.stopDiscoveryAdvertising();
      unsubscribe();
    };
  }, [userA]);

  // Send message from Phone A
  const handleSendMessageA = (content: string, attachment?: ChatMessage['attachment']) => {
    sound.playMessageSent();
    const newMsg: ChatMessage = {
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      senderId: userA.id,
      senderName: userA.username,
      recipientId: activeConvoIdA,
      content,
      timestamp: Date.now(),
      status: 'delivered',
      isEncrypted: true,
      hops: activeConvoIdA.includes('emergency') ? 1 : 0,
      attachment,
    };

    // Append to Phone A
    setMessagesA((prev) => ({
      ...prev,
      [activeConvoIdA]: [...(prev[activeConvoIdA] || []), newMsg],
    }));

    // Broadcast across mesh/cross-tab channel
    p2pNetwork.sendPacket('MESSAGE', activeConvoIdA, newMsg);

    // Also directly update Phone B in Dual Lab
    setMessagesB((prev) => ({
      ...prev,
      [activeConvoIdA]: [...(prev[activeConvoIdA] || []), { ...newMsg, status: 'read' }],
    }));

    // Update conversation previews
    setConversationsA((prev) =>
      prev.map((c) =>
        c.id === activeConvoIdA
          ? { ...c, lastMessage: newMsg, updatedAt: Date.now() }
          : c
      )
    );
    setConversationsB((prev) =>
      prev.map((c) =>
        c.id === activeConvoIdA
          ? { ...c, lastMessage: newMsg, updatedAt: Date.now() }
          : c
      )
    );
  };

  // Call management
  const handleStartCallA = (type: 'voice' | 'video') => {
    sound.startOutgoingDialTone();
    const session: CallSession = {
      id: 'call_' + Date.now(),
      type,
      state: 'outgoing_ringing',
      remoteUser: {
        id: userB.id,
        username: userB.username,
        avatarSeed: userB.avatarSeed,
        avatarBg: userB.avatarBg,
      },
      durationSeconds: 0,
      isMuted: false,
      isSpeakerOn: true,
      isCameraOff: false,
      isFrontCamera: true,
      videoQuality: '720p',
    };
    setCallSession(session);
    setScreenA(type === 'voice' ? 'voice_call' : 'video_call');

    // Notify Peer (Phone B)
    p2pNetwork.sendPacket('CALL_SIGNAL', userB.id, {
      action: 'OFFER',
      callType: type,
      fromUser: {
        id: userA.id,
        username: userA.username,
        avatarSeed: userA.avatarSeed,
        avatarBg: userA.avatarBg,
      },
    });

    // In dual lab or after 2.5 seconds, auto-answer simulation or allow manual answer
    setTimeout(() => {
      sound.stopRingtone();
      sound.playConnected();
      setCallSession((prev) => (prev ? { ...prev, state: 'connected' } : null));
    }, 2800);
  };

  const handleAcceptIncomingCall = () => {
    sound.stopRingtone();
    sound.playConnected();
    setCallSession((prev) => (prev ? { ...prev, state: 'connected' } : null));
    if (callSession) {
      setScreenA(callSession.type === 'voice' ? 'voice_call' : 'video_call');
      p2pNetwork.sendPacket('CALL_SIGNAL', callSession.remoteUser.id, {
        action: 'ANSWER',
      });
    }
  };

  const handleEndCall = () => {
    sound.stopRingtone();
    if (callSession) {
      p2pNetwork.sendPacket('CALL_SIGNAL', callSession.remoteUser.id, {
        action: 'HANGUP',
      });
    }
    setCallSession(null);
    setScreenA('dashboard');
    setScreenB('dashboard');
  };

  // Dispatch Test Mesh Packet with visual hop animation
  const handleDispatchTestPacket = () => {
    const route = ['GC-8F92-A3D1', 'GC-44C1-90E8', 'GC-NODE-R1', 'GC-30AA-F580'];
    setActivePacketRoute([route[0]]);
    sound.playTap();

    let step = 1;
    const interval = setInterval(() => {
      if (step < route.length) {
        setActivePacketRoute((prev) => [...prev, route[step]]);
        sound.playMessageSent();
        step++;
      } else {
        clearInterval(interval);
        setTimeout(() => setActivePacketRoute([]), 2500);
      }
    }, 600);
  };

  // SOS Emergency Mesh Broadcast
  const handleTriggerSos = () => {
    sound.playMessageSent();
    setSosNotice('EMERGENCY BROADCAST ACTIVE: P2P Beacon dispatched across all hops!');
    handleSendMessageA('⚠️ SOS EMERGENCY BROADCAST: Need field assistance at coordinates. Battery 94%.');
    setTimeout(() => setSosNotice(null), 5000);
  };

  // Refresh Nearby Discovery
  const handleRefreshDiscoveryA = () => {
    setIsScanningA(true);
    sound.playTap();
    setTimeout(() => {
      setIsScanningA(false);
      setNearbyDevicesA((prev) =>
        prev.map((d) => ({
          ...d,
          rssi: -35 - Math.floor(Math.random() * 45),
          lastSeen: Date.now(),
        }))
      );
    }, 1500);
  };

  // Connection request handling
  const handleConnectRequestA = (deviceId: string) => {
    sound.playTap();
    setNearbyDevicesA((prev) =>
      prev.map((d) => (d.id === deviceId ? { ...d, connectionState: 'requested' } : d))
    );
    // Simulate peer auto-accepting after 1.5s
    setTimeout(() => {
      sound.playConnected();
      setNearbyDevicesA((prev) =>
        prev.map((d) => (d.id === deviceId ? { ...d, connectionState: 'connected' } : d))
      );
    }, 1500);
  };

  // Screen Router for Phone A
  const renderPhoneScreenA = () => {
    if (callSession && (screenA === 'voice_call' || screenA === 'video_call')) {
      if (screenA === 'voice_call') {
        return (
          <VoiceCallScreen
            session={callSession}
            onAccept={handleAcceptIncomingCall}
            onReject={handleEndCall}
            onEndCall={handleEndCall}
            onToggleMute={() =>
              setCallSession((prev) => (prev ? { ...prev, isMuted: !prev.isMuted } : null))
            }
            onToggleSpeaker={() =>
              setCallSession((prev) =>
                prev ? { ...prev, isSpeakerOn: !prev.isSpeakerOn } : null
              )
            }
            onNavigate={setScreenA}
          />
        );
      } else {
        return (
          <VideoCallScreen
            session={callSession}
            onEndCall={handleEndCall}
            onToggleMute={() =>
              setCallSession((prev) => (prev ? { ...prev, isMuted: !prev.isMuted } : null))
            }
            onToggleCamera={() =>
              setCallSession((prev) =>
                prev ? { ...prev, isCameraOff: !prev.isCameraOff } : null
              )
            }
            onSwitchCameraFacing={() =>
              setCallSession((prev) =>
                prev ? { ...prev, isFrontCamera: !prev.isFrontCamera } : null
              )
            }
            onChangeQuality={(q) =>
              setCallSession((prev) => (prev ? { ...prev, videoQuality: q } : null))
            }
            onNavigate={setScreenA}
          />
        );
      }
    }

    switch (screenA) {
      case 'splash':
        return <SplashScreen onComplete={() => setScreenA('welcome')} />;
      case 'welcome':
        return (
          <WelcomeScreen
            onStartAuth={() => setScreenA('login')}
            onStartOffline={() => setScreenA('profile_setup')}
          />
        );
      case 'login':
        return (
          <LoginScreen
            onLoginSuccess={(u) => {
              setUserA(u);
              setScreenA('dashboard');
            }}
            onNavigate={setScreenA}
            onContinueOfflineGuest={() => setScreenA('dashboard')}
          />
        );
      case 'register':
        return (
          <RegisterScreen
            onRegisterSuccess={(u) => {
              setUserA(u);
              setScreenA('dashboard');
            }}
            onNavigate={setScreenA}
          />
        );
      case 'forgot_password':
        return <ForgotPasswordScreen onNavigate={setScreenA} />;
      case 'profile_setup':
        return (
          <ProfileSetupScreen
            onProfileCreated={(profile) => {
              setUserA(profile);
              setScreenA('dashboard');
            }}
          />
        );
      case 'dashboard':
        return (
          <DashboardScreen
            user={userA}
            nearbyDevices={nearbyDevicesA}
            conversations={conversationsA}
            onNavigate={setScreenA}
            onOpenQr={() => setIsQrOpen(true)}
            onSelectConversation={(id) => {
              setActiveConvoIdA(id);
              const convo = conversationsA.find((c) => c.id === id);
              setScreenA(convo?.isGroup ? 'group_chat' : 'individual_chat');
            }}
            onTriggerSos={handleTriggerSos}
          />
        );
      case 'nearby':
        return (
          <NearbyScreen
            devices={nearbyDevicesA}
            onConnectRequest={handleConnectRequestA}
            onNavigate={setScreenA}
            onRefreshDiscovery={handleRefreshDiscoveryA}
            isScanning={isScanningA}
            pendingRequestsCount={requestsA.length}
          />
        );
      case 'requests':
        return (
          <RequestsScreen
            requests={requestsA}
            onAccept={(id) => {
              setRequestsA((prev) => prev.filter((r) => r.id !== id));
              sound.playConnected();
            }}
            onReject={(id) => setRequestsA((prev) => prev.filter((r) => r.id !== id))}
            onNavigate={setScreenA}
          />
        );
      case 'chat_list':
        return (
          <ChatListScreen
            conversations={conversationsA}
            onSelectConversation={(id) => {
              setActiveConvoIdA(id);
              const convo = conversationsA.find((c) => c.id === id);
              setScreenA(convo?.isGroup ? 'group_chat' : 'individual_chat');
            }}
            onNavigate={setScreenA}
          />
        );
      case 'individual_chat': {
        const convo = conversationsA.find((c) => c.id === activeConvoIdA) || conversationsA[0];
        return (
          <IndividualChatScreen
            conversation={convo}
            messages={messagesA[convo.id] || []}
            currentUser={userA}
            onSendMessage={handleSendMessageA}
            onStartCall={handleStartCallA}
            onNavigate={setScreenA}
          />
        );
      }
      case 'group_chat': {
        const convo =
          conversationsA.find((c) => c.id === 'convo_mesh_emergency') || conversationsA[1];
        return (
          <GroupChatScreen
            conversation={convo}
            messages={messagesA[convo.id] || []}
            currentUser={userA}
            onSendMessage={(text) => handleSendMessageA(text)}
            onNavigate={setScreenA}
          />
        );
      }
      case 'mesh_network':
        return (
          <MeshNetworkScreen
            user={userA}
            nodes={meshNodes}
            onDispatchTestPacket={handleDispatchTestPacket}
            onUpdateMaxHops={(hops) => setUserA((prev) => ({ ...prev, maxHops: hops }))}
            onToggleRelay={(enabled) =>
              setUserA((prev) => ({ ...prev, meshRelayEnabled: enabled }))
            }
            activePacketRoute={activePacketRoute}
          />
        );
      case 'profile':
        return (
          <ProfileScreen
            user={userA}
            onUpdateUser={(updated) => setUserA((prev) => ({ ...prev, ...updated }))}
            onOpenQr={() => setIsQrOpen(true)}
            onOpenAndroidStudio={() => setIsAndroidStudioOpen(true)}
            onLogout={() => {
              AuthApiService.logout();
              setScreenA('login');
            }}
            onNavigate={setScreenA}
          />
        );
      case 'settings':
        return (
          <SettingsScreen
            user={userA}
            onNavigate={setScreenA}
            onResetIdentity={() => setScreenA('profile_setup')}
            onOpenAndroidStudio={() => setIsAndroidStudioOpen(true)}
          />
        );
      default:
        return null;
    }
  };

  const showNavA =
    screenA !== 'splash' &&
    screenA !== 'welcome' &&
    screenA !== 'login' &&
    screenA !== 'register' &&
    screenA !== 'forgot_password' &&
    screenA !== 'profile_setup' &&
    screenA !== 'voice_call' &&
    screenA !== 'video_call';

  return (
    <div className="min-h-screen bg-[#040405] text-zinc-100 flex flex-col font-sans selection:bg-orange-600/30">
      {/* Top Engineering & Testing Control Header */}
      <header className="h-16 px-4 md:px-8 bg-zinc-950/90 border-b border-zinc-900 flex items-center justify-between shrink-0 sticky top-0 z-40 backdrop-blur-md">
        {/* Brand Zone */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center shadow-lg shadow-orange-600/30">
            <Radio className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-white">GLOBAL CONNECT</span>
              <span className="text-[10px] font-mono font-semibold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/20">
                P2P OFFLINE
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 hidden sm:block">
              Zero-Internet BLE 5.2 · Wi-Fi Direct · WebRTC · Room SQLite
            </p>
          </div>
        </div>

        {/* Center Testing Mode Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-900/90 rounded-2xl border border-zinc-800 text-xs">
          <button
            onClick={() => setViewMode('single_phone')}
            className={`px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              viewMode === 'single_phone'
                ? 'bg-zinc-800 text-orange-400 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Single Phone</span>
          </button>

          <button
            onClick={() => setViewMode('dual_phone')}
            className={`px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              viewMode === 'dual_phone'
                ? 'bg-zinc-800 text-orange-400 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Columns className="w-4 h-4" />
            <span>Dual-Phone Mesh Lab</span>
          </button>
        </div>

        {/* Right Action: Android Studio Codebase & APK */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAndroidStudioOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-orange-600/20 transition-all cursor-pointer"
          >
            <Code2 className="w-4 h-4" />
            <span className="hidden md:inline">Android Studio Code & APK</span>
            <span className="md:hidden">Android Code</span>
          </button>
        </div>
      </header>

      {/* SOS Toast notification */}
      {sosNotice && (
        <div className="bg-rose-950 border-b border-rose-600/40 px-4 py-2 text-center text-xs text-rose-300 font-semibold flex items-center justify-center gap-2 animate-bounce">
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          <span>{sosNotice}</span>
        </div>
      )}

      {/* Main Viewport Container */}
      <main className="flex-1 flex items-center justify-center p-3 md:p-6 overflow-x-auto">
        {viewMode === 'single_phone' ? (
          <div className="w-full flex flex-col items-center">
            {/* Quick Screen Switcher Bar for rapid evaluation */}
            <div className="mb-3 flex items-center gap-1 overflow-x-auto max-w-[420px] p-1 bg-zinc-900/60 rounded-xl border border-zinc-800 text-[11px] font-mono">
              <span className="text-zinc-500 px-2 uppercase text-[9px]">Screen:</span>
              {(['dashboard', 'login', 'register', 'nearby', 'chat_list', 'mesh_network', 'profile'] as ScreenType[]).map(
                (s) => (
                  <button
                    key={s}
                    onClick={() => setScreenA(s)}
                    className={`px-2 py-0.5 rounded-lg capitalize transition-colors ${
                      screenA === s
                        ? 'bg-orange-600 text-white font-semibold'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {s.replace('_', ' ')}
                  </button>
                )
              )}
            </div>

            <AndroidFrame
              deviceName="Pixel 8 Pro (Primary Node)"
              batteryLevel={userA.batteryLevel}
            >
              {renderPhoneScreenA()}
              {showNavA && (
                <BottomNavigation
                  currentScreen={screenA}
                  onNavigate={setScreenA}
                  unreadCount={conversationsA.reduce((sum, c) => sum + c.unreadCount, 0)}
                  nearbyCount={nearbyDevicesA.length}
                />
              )}
            </AndroidFrame>
          </div>
        ) : (
          /* Dual Phone Testing Lab: Two Android Phones Interacting in Real-Time Side-by-Side */
          <div className="flex flex-col items-center w-full max-w-5xl">
            <div className="mb-3 px-4 py-1.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-300 flex items-center gap-3">
              <span className="flex items-center gap-1.5 font-semibold text-orange-400">
                <Radio className="w-4 h-4 animate-pulse" />
                <span>Live Physical Link Simulator</span>
              </span>
              <span className="text-zinc-500">·</span>
              <span>Send messages or call from Phone A to observe instant P2P arrival on Phone B</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full items-start justify-center">
              {/* Phone A: Alex Rivera */}
              <div className="flex flex-col items-center">
                <div className="text-xs font-mono text-orange-400 mb-1.5 font-semibold">
                  PHONE A: Pixel 8 Pro (Alex Rivera)
                </div>
                <AndroidFrame deviceName="Phone A · Pixel 8 Pro" batteryLevel={94}>
                  {renderPhoneScreenA()}
                  {showNavA && (
                    <BottomNavigation
                      currentScreen={screenA}
                      onNavigate={setScreenA}
                      unreadCount={conversationsA.reduce((sum, c) => sum + c.unreadCount, 0)}
                      nearbyCount={nearbyDevicesA.length}
                    />
                  )}
                </AndroidFrame>
              </div>

              {/* Phone B: Sam Chen (Nearby Peer) */}
              <div className="flex flex-col items-center">
                <div className="text-xs font-mono text-blue-400 mb-1.5 font-semibold">
                  PHONE B: Galaxy S24 Ultra (Sam Chen)
                </div>
                <AndroidFrame deviceName="Phone B · Galaxy S24" batteryLevel={88}>
                  {callSession ? (
                    <VoiceCallScreen
                      session={{
                        ...callSession,
                        remoteUser: {
                          id: userA.id,
                          username: userA.username,
                          avatarSeed: userA.avatarSeed,
                          avatarBg: userA.avatarBg,
                        },
                      }}
                      onAccept={handleAcceptIncomingCall}
                      onReject={handleEndCall}
                      onEndCall={handleEndCall}
                      onToggleMute={() => {}}
                      onToggleSpeaker={() => {}}
                      onNavigate={setScreenB}
                    />
                  ) : screenB === 'individual_chat' ? (
                    <IndividualChatScreen
                      conversation={{
                        ...conversationsB[0],
                        name: userA.username,
                        avatarBg: userA.avatarBg,
                        avatarSeed: userA.avatarSeed,
                      }}
                      messages={messagesB['convo_sam'] || []}
                      currentUser={userB}
                      onSendMessage={(content) => {
                        sound.playMessageSent();
                        const bMsg: ChatMessage = {
                          id: 'b_msg_' + Date.now(),
                          senderId: userB.id,
                          senderName: userB.username,
                          recipientId: 'convo_sam',
                          content,
                          timestamp: Date.now(),
                          status: 'read',
                          isEncrypted: true,
                          hops: 0,
                        };
                        setMessagesA((prev) => ({
                          ...prev,
                          convo_sam: [...(prev['convo_sam'] || []), bMsg],
                        }));
                        setMessagesB((prev) => ({
                          ...prev,
                          convo_sam: [...(prev['convo_sam'] || []), bMsg],
                        }));
                        sound.playMessageReceived();
                      }}
                      onStartCall={handleStartCallA}
                      onNavigate={setScreenB}
                    />
                  ) : (
                    <DashboardScreen
                      user={userB}
                      nearbyDevices={[
                        {
                          id: userA.id,
                          username: userA.username,
                          avatarSeed: userA.avatarSeed,
                          avatarBg: userA.avatarBg,
                          rssi: -42,
                          distanceMeters: 4.2,
                          protocol: 'WIFI_DIRECT',
                          connectionState: 'connected',
                          publicKeyFingerprint: userA.publicKeyFingerprint,
                          isRelayNode: true,
                          lastSeen: Date.now(),
                        },
                      ]}
                      conversations={conversationsB}
                      onNavigate={setScreenB}
                      onOpenQr={() => setIsQrOpen(true)}
                      onSelectConversation={() => setScreenB('individual_chat')}
                      onTriggerSos={() => {}}
                    />
                  )}
                  <BottomNavigation
                    currentScreen={screenB}
                    onNavigate={setScreenB}
                    unreadCount={0}
                    nearbyCount={1}
                  />
                </AndroidFrame>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* QR Pairing Code Modal */}
      <QrCodeModal
        user={userA}
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        onPairFound={(peer) => {
          sound.playConnected();
          setNearbyDevicesA((prev) => [
            {
              id: peer.id,
              username: peer.username,
              avatarSeed: peer.username,
              avatarBg: '#E11D48',
              rssi: -38,
              distanceMeters: 1.5,
              protocol: 'WIFI_DIRECT',
              connectionState: 'connected',
              publicKeyFingerprint: peer.fingerprint,
              isRelayNode: true,
              lastSeen: Date.now(),
            },
            ...prev.filter((d) => d.id !== peer.id),
          ]);
        }}
      />

      {/* Android Studio Codebase & APK Guide Modal */}
      <AndroidStudioExportModal
        isOpen={isAndroidStudioOpen}
        onClose={() => setIsAndroidStudioOpen(false)}
      />
    </div>
  );
}
