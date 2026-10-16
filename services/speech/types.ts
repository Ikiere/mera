/**
 * MERA Speech Recognition Service Abstraction & Types
 */

export type SpeechServiceStatus = 'idle' | 'starting' | 'listening' | 'stopping' | 'error' | 'unavailable';

export interface SpeechCapabilities {
  isSupported: boolean;
  isOnDeviceAvailable: boolean;
  supportedLocales: string[];
  permissionGranted: boolean;
  offlineCapable: boolean;
  status: SpeechServiceStatus;
  statusMessage?: string;
}

export interface SpeechRecognitionOptions {
  locale?: string;
  continuous?: boolean;
  interimResults?: boolean;
  preferOffline?: boolean;
}

export interface SpeechRecognitionResult {
  transcript: string;
  isFinal: boolean;
  confidence: number;
  timestamp: number;
}

export interface SpeechRecognitionError {
  code: string;
  message: string;
  isRecoverable: boolean;
}

export interface ISpeechRecognitionService {
  isAvailable(): Promise<boolean>;
  getCapabilities(): Promise<SpeechCapabilities>;
  requestPermissions(): Promise<boolean>;
  start(options?: SpeechRecognitionOptions): Promise<void>;
  stop(): Promise<void>;
  subscribeToResults(listener: (result: SpeechRecognitionResult) => void): () => void;
  subscribeToErrors(listener: (error: SpeechRecognitionError) => void): () => void;
  subscribeToStatus(listener: (status: SpeechServiceStatus) => void): () => void;
  dispose(): void;
}
