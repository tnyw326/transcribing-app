# API Structure

This directory contains the API routes for the transcribing app, organized by functionality.

## API Endpoints

### `/api/transcribe`

**Purpose**: Handles video/audio file transcription and translation

- **Method**: POST
- **Input**: FormData with file, inputLanguage, outputLanguage, resultMode, resultLang
- **Output**: Transcription and translation in the selected output language
- **Features**:
  - File validation (type, size)
  - OpenAI Whisper transcription
  - GPT-4o translation to selected language
  - Logging and error handling

### `/api/summary`

**Purpose**: Generates summaries from transcription text

- **Method**: POST
- **Input**: FormData with file (optional), inputLanguage, outputLanguage, resultMode, resultLang, transcriptionText
- **Output**: Summary in the selected output language
- **Features**:
  - Works with both user-uploaded files and YouTube videos
  - GPT-4o summary generation
  - Logging and error handling

### `/api/youtube-captions`

**Purpose**: Handles YouTube video transcription and summary generation

- **Method**: GET - Fetches YouTube captions
- **Method**: POST - Generates summaries for YouTube content
- **Features**:
  - YouTube caption extraction via Supadata API
  - Delegates summary generation to `/api/summary`
  - Supports multiple languages

## File Structure

```
app/api/
├── transcribe/
│   └── route.ts          # Transcription and translation logic
├── summary/
│   └── route.ts          # Summary generation logic
├── youtube-captions/
│   └── route.ts          # YouTube-specific functionality
├── prompt-templates/
│   ├── summary.ts        # Summary prompt templates
│   └── translation.ts    # Translation prompt templates
├── utils/
│   └── logger.ts         # Logging utilities
└── README.md             # This file
```

## Benefits of Separation

1. **Single Responsibility**: Each API handles one specific functionality
2. **Maintainability**: Easier to update and debug individual features
3. **Scalability**: Can optimize each endpoint independently
4. **Reusability**: Summary API can be used by both transcribe and YouTube APIs
5. **Testing**: Easier to write unit tests for specific functionality 