import { WebClient } from '@slack/web-api';
import dotenv from 'dotenv';

dotenv.config();

export class SlackService {
  private client: WebClient;

  constructor() {
    this.client = new WebClient(process.env.SLACK_BOT_TOKEN);
  }

  async sendMessage(message: string): Promise<void> {
    try {
      await this.client.chat.postMessage({
        channel: process.env.SLACK_CHANNEL_ID!,
        text: message,
      });
    } catch (error) {
      console.error('Error sending Slack message:', error);
      throw error;
    }
  }
} 