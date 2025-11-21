import { GoogleGenAI } from "@google/genai";
import { AspectRatio } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateBannerImage = async (
  prompt: string, 
  aspectRatio: AspectRatio
): Promise<string> => {
  try {
    // Enhance the prompt to ensure high quality ad backgrounds
    const enhancedPrompt = `Professional advertising photography background, ${prompt}, high quality, commercial lighting, photorealistic, minimalist composition suitable for text overlay, 4k resolution, trending on behance.`;

    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: enhancedPrompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: aspectRatio,
      },
    });

    if (!response.generatedImages || response.generatedImages.length === 0) {
      throw new Error("No image was generated.");
    }

    const base64ImageBytes = response.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${base64ImageBytes}`;

  } catch (error: any) {
    console.error("Gemini Image Generation Error:", error);
    throw new Error(error.message || "Failed to generate image");
  }
};

export const getPythonCode = (prompt: string, aspectRatio: string): string => {
  // Escape quotes in prompt for Python string
  const safePrompt = prompt.replace(/"/g, '\\"').replace(/\n/g, ' ');
  
  return `from google import genai
from google.genai import types
import base64

client = genai.Client(api_key="YOUR_API_KEY")

# Generate the ad background
response = client.models.generate_images(
    model='imagen-4.0-generate-001',
    prompt='${safePrompt}',
    config=types.GenerateImagesConfig(
        number_of_images=1,
        aspect_ratio='${aspectRatio}',
        output_mime_type='image/jpeg',
    )
)

for generated_image in response.generated_images:
    image = generated_image.image
    # Save the image
    with open("ad_background.jpeg", "wb") as f:
        f.write(image.image_bytes)
        print("Image saved to ad_background.jpeg")`;
};