import { Injectable } from '@nestjs/common';
import { CreateApplepayDto } from './dto/create-applepay.dto';
import { UpdateApplepayDto } from './dto/update-applepay.dto';
import axios from 'axios';

@Injectable()
export class ApplepayService {
  


   private readonly appleReceiptVerificationUrl =
    'https://sandbox.itunes.apple.com/verifyReceipt'; // Use the production endpoint in production
       // https://buy.itunes.apple.com/verifyReceipt     real link


  // Verify the receipt sent from the client
  async verifyReceipt(receiptData: string): Promise<any> {
    try {
      const response = await axios.post(this.appleReceiptVerificationUrl, {
        'receipt-data': receiptData,
        'password': 'your-shared-secret', // Shared secret from App Store Connect
      });
       console.log('Apple Receipt Verification Response:', response.data);
      if (response.data.status === 0) {
        // Valid receipt
        return response.data;
      } else {
        // Invalid receipt or other issues
        throw new Error('Invalid receipt');
      }
    } catch (error) {
      throw new Error(`Apple receipt validation failed: ${error.message}`);
    }
  }

  // Method to check if the subscription is active (can be extended based on your business logic)
  isSubscriptionActive(receiptData: any): boolean {
    const latestReceiptInfo = receiptData.latest_receipt_info;
    const expirationDate = latestReceiptInfo[0]?.expires_date_ms; 

    if (!expirationDate) {
      throw new Error('No expiration date found');
    }

    const currentTimestamp = Date.now();
    return currentTimestamp < parseInt(expirationDate, 10);
  }
 
}
