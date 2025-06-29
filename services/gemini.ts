import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const generatePromptFromImage = async (imageFile: File, apiKey: string): Promise<string> => {
  if (!apiKey) {
    throw new Error("Gemini API key is missing. Please add it in the settings.");
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const imagePart = await fileToGenerativePart(imageFile);
    const textPart = {
      text: "Analyze this image in detail. Generate a rich, artistic, and descriptive prompt for an AI image generator. The prompt should capture the main subject, the environment/background, the atmosphere and mood, the lighting conditions, and the artistic style (e.g., photorealistic, watercolor, fantasy art). The output must be ONLY the prompt itself, without any extra text, labels, or explanations. For example: 'Photorealistic shot of a majestic lion with a glowing mane, standing on a skyscraper in a futuristic neon-lit city at night, cinematic lighting, dramatic atmosphere, ultra-detailed.'",
    };

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-04-17',
      contents: { parts: [imagePart, textPart] },
    });
    
    const text = response.text;

    if (!text) {
        throw new Error("The model did not return a prompt. The image might be unsupported or the content policy was triggered.");
    }
    
    return text.trim().replace(/^"|"$/g, '');

  } catch (error) {
    console.error("Error generating prompt from image:", error);
    if (error instanceof Error) {
        if (error.message.includes('API key not valid')) {
            throw new Error('Your Gemini API key is not valid. Please check it in the settings.');
        }
        throw new Error(`Failed to generate prompt: ${error.message}`);
    }
    throw new Error("An unknown error occurred while communicating with the Gemini API.");
  }
};