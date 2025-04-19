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

    // Use the Gemini Flash 2.0 model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Convert videoUrl to absolute path
    const filePath = path.resolve(__dirname, '..', videoUrl);
    
    // Read the file as a buffer
    const fileBuffer = await fs.readFile(filePath);
    
    // Determine MIME type
    const ext = path.extname(videoUrl).toLowerCase();
    const mimeType = ext === '.mp4' ? 'video/mp4' : 'video/quicktime';

    // Prepare the request
    const request = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: 'Transcribe this video with timecodes and speaker labels. Format as: [MM:SS] Speaker: Text',
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
      generationConfig: {
        audioTimestamp: true,
      },
    };

    // Generate transcription
    const result = await model.generateContent(request);
    const transcript = result.response.text();

    return transcript || 'No transcription generated';
  } catch (error) {
    console.error('Transcription error:', error);
    throw new Error(`Failed to generate transcript: ${error.message}`);
  }
};