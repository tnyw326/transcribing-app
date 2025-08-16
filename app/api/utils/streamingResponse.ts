import { NextRequest } from 'next/server';

export interface StreamMessage {
  type: 'progress' | 'status' | 'result' | 'error';
  message: string;
  data?: any;
  timestamp: number;
}

export class StreamingResponse {
  private messages: StreamMessage[] = [];

  addMessage(type: StreamMessage['type'], message: string, data?: any): void {
    const streamMessage: StreamMessage = {
      type,
      message,
      data,
      timestamp: Date.now()
    };
    
    this.messages.push(streamMessage);
    
    // Log to console for debugging
    const emoji = this.getEmojiForType(type);
    console.log(`${emoji} [${type.toUpperCase()}] ${message}`);
    
    if (data) {
      console.log('   Data:', data);
    }
  }

  private getEmojiForType(type: StreamMessage['type']): string {
    switch (type) {
      case 'progress': return '🔄';
      case 'status': return 'ℹ️';
      case 'result': return '✅';
      case 'error': return '❌';
      default: return '📝';
    }
  }

  getMessages(): StreamMessage[] {
    return this.messages;
  }

  logSummary(): void {
    console.log('📋 Streaming Response Summary:');
    this.messages.forEach((msg, index) => {
      const emoji = this.getEmojiForType(msg.type);
      console.log(`   ${index + 1}. ${emoji} ${msg.message}`);
    });
  }
}

// Simple streaming response for console logging only
export function createConsoleStreamingResponse(callback: (stream: StreamingResponse) => Promise<void>) {
  const streamingResponse = new StreamingResponse();
  
  // Start the async operation
  callback(streamingResponse).then(() => {
    streamingResponse.addMessage('result', 'Operation completed successfully');
    streamingResponse.logSummary();
  }).catch((error) => {
    streamingResponse.addMessage('error', error.message || 'Operation failed');
    streamingResponse.logSummary();
  });
  
  return streamingResponse;
}

// Server-Sent Events streaming function
export function streamSSE(callback: (send: (type: string, data?: any) => void) => Promise<void>) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      const send = (type: string, data?: any) => {
        // Use standard SSE format: event: type\ndata: JSON\n\n
        const message = `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      try {
        await callback(send);
        controller.close();
      } catch (error) {
        console.error('Streaming error:', error);
        send('error', { message: error instanceof Error ? error.message : 'Unknown error' });
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
} 