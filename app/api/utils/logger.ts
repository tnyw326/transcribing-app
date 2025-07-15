import fs from 'fs';
import path from 'path';

interface LogEntry {
  timestamp: string;
  requestId: string;
  fileName: string;
  fileSize: number;
  inputLanguage: string;
  outputLanguage: string;
  resultMode: string;
  resultLang: string;
  transcription: {
    original: string;
    english?: string;
    chinese?: string;
    japanese?: string;
  };
  summary: {
    english?: string;
    chinese?: string;
    japanese?: string;
  };
  apiResponses: {
    whisper?: any;
    translation?: any;
    summary?: any;
  };
  processingTime: number;
  status: 'success' | 'error';
  error?: string;
}

export class Logger {
  private logDir: string;

  constructor() {
    this.logDir = path.join(process.cwd(), 'logs');
    this.ensureLogDirectory();
  }

  private ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async logTranscription(entry: Omit<LogEntry, 'timestamp' | 'requestId'>): Promise<string> {
    const requestId = this.generateRequestId();
    const logEntry: LogEntry = {
      ...entry,
      timestamp: new Date().toISOString(),
      requestId
    };

    const logFileName = `transcription_${new Date().toISOString().split('T')[0]}.json`;
    const logFilePath = path.join(this.logDir, logFileName);

    try {
      let logs: LogEntry[] = [];
      
      // Read existing logs if file exists
      if (fs.existsSync(logFilePath)) {
        const existingData = fs.readFileSync(logFilePath, 'utf-8');
        logs = JSON.parse(existingData);
      }

      // Add new log entry
      logs.push(logEntry);

      // Write back to file
      fs.writeFileSync(logFilePath, JSON.stringify(logs, null, 2));

      console.log(`📝 Logged transcription request: ${requestId}`);
      return requestId;
    } catch (error) {
      console.error('Failed to write log:', error);
      return requestId;
    }
  }

  async logError(requestId: string, error: any, context: any): Promise<void> {
    const errorLog = {
      timestamp: new Date().toISOString(),
      requestId,
      error: error.message || error.toString(),
      context,
      stack: error.stack
    };

    const errorFileName = `errors_${new Date().toISOString().split('T')[0]}.json`;
    const errorFilePath = path.join(this.logDir, errorFileName);

    try {
      let errorLogs: any[] = [];
      
      if (fs.existsSync(errorFilePath)) {
        const existingData = fs.readFileSync(errorFilePath, 'utf-8');
        errorLogs = JSON.parse(existingData);
      }

      errorLogs.push(errorLog);
      fs.writeFileSync(errorFilePath, JSON.stringify(errorLogs, null, 2));

      console.log(`❌ Logged error for request: ${requestId}`);
    } catch (writeError) {
      console.error('Failed to write error log:', writeError);
    }
  }
}

export const logger = new Logger(); 