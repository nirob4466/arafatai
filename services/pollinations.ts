import { PollinationsModels } from '../types';

const API_BASE_URL = 'https://image.pollinations.ai';
const TEXT_API_BASE_URL = 'https://text.pollinations.ai';

// Some models on Pollinations.ai require the model name in the path, not as a query parameter.
const PATH_BASED_MODELS = new Set(['gptimage', 'dall-e-3']);

export const fetchImageModels = async (): Promise<PollinationsModels> => {
    try {
        const response = await fetch(`${API_BASE_URL}/models`);
        if (!response.ok) {
            throw new Error(`Failed to fetch image models with status: ${response.status}`);
        }
        return response.json();
    } catch (error) {
        console.error("Error fetching models:", error);
        throw new Error("Network error or invalid response when fetching models.");
    }
};

export const enhancePrompt = async (prompt: string): Promise<string> => {
    if (!prompt.trim()) {
        return '';
    }
    const enhancementInstruction = `You are a creative assistant for an AI image generator. Your task is to take a user's simple idea and expand it into a rich, detailed, and artistic prompt. Focus on visual details, atmosphere, lighting, artistic style, and composition. The output must be only the prompt itself, without any extra text or explanation. Here is the user's idea: "${prompt}"`;
    
    try {
        const response = await fetch(`${TEXT_API_BASE_URL}/${encodeURIComponent(enhancementInstruction)}`);
        if (!response.ok) {
            throw new Error(`Failed to enhance prompt with status: ${response.status}`);
        }
        const enhancedText = await response.text();
        return enhancedText.replace(/^"|"$/g, '').trim();
    } catch (error) {
        console.error("Error enhancing prompt:", error);
        throw new Error("Network error or invalid response when enhancing prompt.");
    }
};

export const generateImageUrl = (prompt: string, model: string, width: number, height: number): string => {
    const encodedPrompt = encodeURIComponent(prompt);
    let urlString: string;

    if (PATH_BASED_MODELS.has(model)) {
        // Construct URL with model name in the path
        urlString = `${API_BASE_URL}/prompt/${model}/${encodedPrompt}`;
    } else {
        // Construct URL for models that use a query parameter
        urlString = `${API_BASE_URL}/prompt/${encodedPrompt}`;
    }
    
    const url = new URL(urlString);

    // For query-based models, add the 'model' parameter if it's not a path-based one
    if (!PATH_BASED_MODELS.has(model) && model) {
        url.searchParams.append('model', model);
    }
    
    url.searchParams.append('width', String(width));
    url.searchParams.append('height', String(height));
    url.searchParams.append('seed', String(Math.floor(Math.random() * 100000)));
    url.searchParams.append('nofeed', 'true');
    
    return url.toString();
};
