import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseAdminService {
  private readonly logger = new Logger(FirebaseAdminService.name);

  constructor() {
    try {
      if (!admin.apps.length) {
        if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
          this.logger.error('Firebase configuration is missing. Please check your environment variables.');
          return;
        }

        // Ensure proper formatting of the private key
        const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
        
        this.logger.log('Initializing Firebase Admin SDK with project ID: ' + process.env.FIREBASE_PROJECT_ID);
        
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: privateKey,
          }),
        });
        this.logger.log('Firebase Admin SDK initialized successfully');
      }
    } catch (error) {
      this.logger.error(`Failed to initialize Firebase Admin SDK: ${error.message}`, error.stack);
    }
  }

  async verifyIdToken(idToken: string) {
    try {
      if (!idToken) {
        throw new Error('ID token is required');
      }
      
      // Clean the token if it contains quotes or spaces
      idToken = idToken.trim().replace(/["'`\s]/g, '');
      
      this.logger.log(`Attempting to verify token (length: ${idToken.length})`);
      
      // Check if Firebase Admin SDK is initialized
      if (!admin.apps.length) {
        throw new Error('Firebase Admin SDK is not initialized');
      }
      
      // Log the token issuer for debugging
      this.logger.log(`Token verification for project: ${process.env.FIREBASE_PROJECT_ID}`);
      
      return await admin.auth().verifyIdToken(idToken);
    } catch (error) {
      this.logger.error(`Error verifying Firebase ID token: ${error.message}`, error.stack);
      
      // Add more specific error information
      if (error.message.includes('invalid signature')) {
        this.logger.error('This may be caused by mismatched project credentials or malformed token');
        this.logger.error('Please check if the token is properly formatted and not wrapped in quotes');
      }
      
      throw error;
    }
  }
}
