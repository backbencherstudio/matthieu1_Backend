import { Injectable } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@Injectable()
@WebSocketGateway({ cors: { origin: '*' } })
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  public clients = new Map<string, string>();
  // public adminClients = new Map<string, string>();

  handleConnection(client: Socket) {
    console.log('Client connected: ' + client.id);

    const userId = Array.isArray(client.handshake.query.userId)
      ? client.handshake.query.userId[0]
      : client.handshake.query.userId;

    // const adminId = Array.isArray(client.handshake.query.adminId)
    //   ? client.handshake.query.adminId[0]
    //   : client.handshake.query.adminId;

    if (userId) {
      this.clients.set(userId, client.id);
      console.log(`User ID: ${userId} connected with socket ID: ${client.id}`);
    } else {
      console.log('No userId provided in the WebSocket connection');
    }

  }

  // Handle disconnection
  handleDisconnect(client: Socket) {
    const userId = [...this.clients.entries()].find(
      ([ socketId]) => socketId === client.id,
    )?.[0];

    if (userId) {
      this.clients.delete(userId);
      console.log('Client disconnected: ' + client.id);
    }
  }

  // Emit a notification to the user by their socket ID
  @SubscribeMessage('sendNotification')
  handleNotification(
    @MessageBody() data: { userId: string; message: string, type?: string },
  ) {
    console.log('Received notification request for user:', data.userId);


    // Filter notification types based on user role
    if (data.type === 'admin') {
      // Admin should only receive register, payment, or subscription notifications
      if (['register', 'payment', 'subscription'].includes(data.message)) {
        this.notifyAdmin(data.userId, data.message);
      }
    } else if (data.type === 'user') {
      // User should only receive like, comment, share, etc.
      if (
        [
          'like',
          'comment',
          'share',
          'comment_reply',
          'friend_request',
          'friend_accept',
        ].includes(data.message)
      ) {
        this.notifyUser(data.userId, data.message);
      }
    }


  }

  // Emit the notification to the user
  notifyUser(userId: string, message: string) {
    const clientSocketId = this.clients.get(userId);
    console.log(`Socket ID for user ${userId}: ${clientSocketId}`);

    if (clientSocketId) {
      console.log(`Sending notification to user: ${userId}`);
      this.server.to(clientSocketId).emit('receiveNotification', message);
    } else {
      console.log(`No socket found for user ${userId}`);
    }
  }
  notifyAdmin(adminId: string, message: any) {
    const adminSocketId = this.clients.get(adminId);
    if (adminSocketId) {
      this.server.to(adminSocketId).emit('receiveAdminNotification', message, { adminId });
    } else {
      console.log(`No socket found for admin ${adminId}`);
    }
  }
}