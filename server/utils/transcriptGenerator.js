import { GoogleGenerativeAI } from '@google/generative-ai';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateTranscript = async (videoUrl) => {
  try {
    // Initialize Gemini with API key (from .env)
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // Use the Gemini Flash 2.0 model (or another suitable model)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Convert videoUrl to absolute path
    const filePath = path.resolve(__dirname, '..', videoUrl);

    // Read the file as a buffer
    const fileBuffer = await fs.readFile(filePath);

    // Determine MIME type based on file extension
    const ext = path.extname(videoUrl).toLowerCase();
    let mimeType;
    switch (ext) {
      case '.mp4':
        mimeType = 'video/mp4';
        break;
      case '.mov':
        mimeType = 'video/quicktime';
        break;
      case '.avi':
        mimeType = 'video/avi';
        break;
      case '.mkv':
        mimeType = 'video/x-matroska';
        break;
      default:
        throw new Error(`Unsupported video format: ${ext}`);
    }

    // Prepare the request for transcription
    const request = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: 'Transcribe the spoken text from this video. Provide only the text of all words spoken, without timecodes or speaker labels.',
            },
            {
              fileData: {
                mimeType: mimeType,
                fileUri: `file://${filePath}`,
              },
            },
          ],
        },
      ],
    };

    // Generate transcription
    const result = await model.generateContent(request);
    const transcript = result.response.text();

    // Return the transcript or a fallback message
    return transcript || 'No transcription generated';
  } catch (error) {
    console.error('Transcription error:', error);
    throw new Error(`Failed to generate transcript: ${error.message}`);
  }
};