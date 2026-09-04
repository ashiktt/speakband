// SpeakBand — Audio Recording, Volume Analysis & Speech-To-Text Pipeline

export interface AudioRecordingResult {
  transcript: string;
  audioBlob: Blob | null;
  audioBase64: string | null;
  audioMimeType: string;
  durationSeconds: number;
}

export class SpeechRecognitionManager {
  private recognition: any = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private mediaStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyserNode: AnalyserNode | null = null;
  private animFrameId: number | null = null;

  private isRecordingActive = false;
  private startTime: number = 0;
  private accumulatedTranscript = '';
  private interimTranscript = '';

  private onTranscriptUpdate?: (transcript: string, isFinal: boolean) => void;
  private onAudioLevelUpdate?: (level: number) => void;
  private onError?: (errorMessage: string) => void;

  constructor() {
    this.initSpeechRecognition();
  }

  private initSpeechRecognition() {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onresult = (event: any) => {
          let currentInterim = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              this.accumulatedTranscript += ' ' + transcript.trim();
            } else {
              currentInterim += transcript;
            }
          }

          this.interimTranscript = currentInterim;
          const fullText = (this.accumulatedTranscript + ' ' + this.interimTranscript).trim();
          if (this.onTranscriptUpdate) {
            this.onTranscriptUpdate(fullText, false);
          }
        };

        this.recognition.onerror = (event: any) => {
          console.warn('[SpeakBand STT] WebSpeech error:', event.error);
          if (event.error === 'not-allowed') {
            if (this.onError) {
              this.onError('Microphone access is required for speaking practice. Please allow microphone permissions in your browser.');
            }
          }
        };

        this.recognition.onend = () => {
          if (this.isRecordingActive) {
            try {
              this.recognition.start();
            } catch (e) {
              // Ignore restart exceptions
            }
          }
        };
      } catch (err) {
        console.warn('[SpeakBand STT] Could not initialize WebSpeech:', err);
      }
    }
  }

  public async startRecording(options?: {
    onTranscript?: (text: string, isFinal: boolean) => void;
    onAudioLevel?: (level: number) => void;
    onError?: (msg: string) => void;
  }): Promise<boolean> {
    if (this.isRecordingActive) return true;

    this.onTranscriptUpdate = options?.onTranscript;
    this.onAudioLevelUpdate = options?.onAudioLevel;
    this.onError = options?.onError;

    this.accumulatedTranscript = '';
    this.interimTranscript = '';
    this.audioChunks = [];
    this.startTime = Date.now();

    try {
      // 1. Request microphone stream
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // 2. Set up Web Audio Analyser for real-time waveform visualization
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        this.audioContext = new AudioCtx();
        const source = this.audioContext.createMediaStreamSource(this.mediaStream);
        this.analyserNode = this.audioContext.createAnalyser();
        this.analyserNode.fftSize = 256;
        source.connect(this.analyserNode);

        const dataArray = new Uint8Array(this.analyserNode.frequencyBinCount);
        const updateLevel = () => {
          if (!this.isRecordingActive || !this.analyserNode) return;
          this.analyserNode.getByteFrequencyData(dataArray);

          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const average = sum / dataArray.length;
          // Normalize to 0 - 100
          const level = Math.min(100, Math.round((average / 128) * 100));

          if (this.onAudioLevelUpdate) {
            this.onAudioLevelUpdate(level);
          }

          this.animFrameId = requestAnimationFrame(updateLevel);
        };
        updateLevel();
      } catch (audioErr) {
        console.warn('[SpeakBand STT] AudioContext visualizer could not start:', audioErr);
      }

      // 3. Setup MediaRecorder for acoustic audio capture
      const mimeTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg', 'audio/mp4'];
      let selectedMime = '';
      for (const mime of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mime)) {
          selectedMime = mime;
          break;
        }
      }

      this.mediaRecorder = new MediaRecorder(this.mediaStream, {
        mimeType: selectedMime || undefined,
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(250); // Slice every 250ms

      // 4. Start speech recognition
      if (this.recognition) {
        try {
          this.recognition.start();
        } catch (e) {
          // Already active or error
        }
      }

      this.isRecordingActive = true;
      return true;
    } catch (err: any) {
      console.error('[SpeakBand STT] Microphone request denied or failed:', err);
      if (this.onError) {
        this.onError(
          err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError'
            ? 'Microphone access was denied. Please grant microphone permissions in your browser bar.'
            : 'Could not access microphone. Please verify your microphone is connected.'
        );
      }
      return false;
    }
  }

  public async stopRecording(): Promise<AudioRecordingResult> {
    const elapsedSeconds = Math.max(1, Math.round((Date.now() - this.startTime) / 1000));
    this.isRecordingActive = false;

    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    if (this.audioContext) {
      try {
        await this.audioContext.close();
      } catch (e) {}
      this.audioContext = null;
    }

    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }

    // Stop MediaRecorder and assemble Blob
    let audioBlob: Blob | null = null;
    let audioBase64: string | null = null;
    const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      await new Promise<void>((resolve) => {
        if (!this.mediaRecorder) return resolve();
        this.mediaRecorder.onstop = () => resolve();
        this.mediaRecorder.stop();
      });
    }

    if (this.audioChunks.length > 0) {
      audioBlob = new Blob(this.audioChunks, { type: mimeType });
      try {
        audioBase64 = await this.blobToBase64(audioBlob);
      } catch (e) {
        console.warn('[SpeakBand STT] Failed to convert audio blob to base64:', e);
      }
    }

    // Release microphone tracks
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    const finalTranscript = (this.accumulatedTranscript + ' ' + this.interimTranscript).trim();

    return {
      transcript: finalTranscript,
      audioBlob,
      audioBase64,
      audioMimeType: mimeType,
      durationSeconds: elapsedSeconds,
    };
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // Strip data URL prefix (e.g., "data:audio/webm;base64,")
        const base64 = result.includes(',') ? result.split(',')[1] : result;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  public isRecording(): boolean {
    return this.isRecordingActive;
  }
}
