import { ChatMessage, ConnectionRequest, MeshPacket, NearbyDevice, UserProfile } from '../types';
import { CryptoService } from './crypto';

type PacketHandler = (packet: MeshPacket) => void;

class P2PNetworkService {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<PacketHandler> = new Set();
  private seenPacketIds: Set<string> = new Set();
  private localUserId: string = '';
  private isAdvertising: boolean = false;
  private advertiseTimer: number | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel('global_connect_mesh_v1');
        this.channel.onmessage = (event) => {
          this.handleIncomingRawPacket(event.data);
        };
      } catch {
        // Fallback
      }
    }

    // Storage event fallback for older environments
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === 'gc_mesh_raw_packet' && e.newValue) {
          try {
            const packet = JSON.parse(e.newValue);
            this.handleIncomingRawPacket(packet);
          } catch {
            // Ignore parse errors
          }
        }
      });
    }
  }

  setLocalIdentity(user: UserProfile) {
    this.localUserId = user.id;
  }

  subscribe(handler: PacketHandler): () => void {
    this.listeners.add(handler);
    return () => this.listeners.delete(handler);
  }

  private handleIncomingRawPacket(packet: MeshPacket) {
    if (!packet || !packet.packetId) return;

    // 1. Deduplication check
    if (this.seenPacketIds.has(packet.packetId)) {
      return; // Already processed
    }
    this.seenPacketIds.add(packet.packetId);
    if (this.seenPacketIds.size > 2000) {
      const arr = Array.from(this.seenPacketIds);
      this.seenPacketIds = new Set(arr.slice(1000));
    }

    // 2. Ignore self-originated echo
    if (packet.sourceId === this.localUserId) {
      return;
    }

    // 3. Notify local subscribers
    this.listeners.forEach(handler => handler(packet));

    // 4. Mesh Forwarding / Relay check
    // If packet is not addressed to this user and is not broadcast, and hops < hopLimit
    if (
      packet.destinationId !== '*' &&
      packet.destinationId !== this.localUserId &&
      packet.currentHops < packet.hopLimit
    ) {
      // Forward the packet (Relay)
      this.relayPacket(packet);
    }
  }

  private relayPacket(packet: MeshPacket) {
    // Check if we are already in the traversed list
    if (packet.traversedNodes.includes(this.localUserId)) return;

    const relayed: MeshPacket = {
      ...packet,
      currentHops: packet.currentHops + 1,
      traversedNodes: [...packet.traversedNodes, this.localUserId],
    };

    // Small jitter to simulate real wireless channel forwarding
    setTimeout(() => {
      this.broadcast(relayed);
    }, 40 + Math.random() * 60);
  }

  private broadcast(packet: MeshPacket) {
    if (this.channel) {
      this.channel.postMessage(packet);
    }
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('gc_mesh_raw_packet', JSON.stringify(packet));
      }
    } catch {
      // Ignore storage errors
    }
  }

  /**
   * Send a mesh packet originating from the local user
   */
  async sendPacket(
    type: MeshPacket['type'],
    destinationId: string,
    payload: any,
    hopLimit = 5
  ): Promise<string> {
    const packetId = 'pkt_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
    const packet: MeshPacket = {
      packetId,
      type,
      sourceId: this.localUserId,
      destinationId,
      payload,
      hopLimit,
      currentHops: 0,
      traversedNodes: [this.localUserId],
      timestamp: Date.now(),
      signature: 'SIG_VALID',
    };

    this.seenPacketIds.add(packetId);
    this.broadcast(packet);
    return packetId;
  }

  /**
   * Broadcast BLE discovery presence beacon
   */
  startDiscoveryAdvertising(user: UserProfile) {
    this.localUserId = user.id;
    this.isAdvertising = true;
    if (this.advertiseTimer) clearInterval(this.advertiseTimer);

    const emitBeacon = () => {
      if (!this.isAdvertising || !user.isDiscoverable) return;
      this.sendPacket('DISCOVERY', '*', {
        user: {
          id: user.id,
          username: user.username,
          avatarSeed: user.avatarSeed,
          avatarBg: user.avatarBg,
          fingerprint: user.publicKeyFingerprint,
          meshRelayEnabled: user.meshRelayEnabled,
          protocol: 'BLE_5_2',
        },
      }, 1);
    };

    emitBeacon();
    this.advertiseTimer = window.setInterval(emitBeacon, 4000);
  }

  stopDiscoveryAdvertising() {
    this.isAdvertising = false;
    if (this.advertiseTimer) {
      clearInterval(this.advertiseTimer);
      this.advertiseTimer = null;
    }
  }
}

export const p2pNetwork = new P2PNetworkService();
