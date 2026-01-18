import { Providers } from "../utils/types";
import { createOpenAI, OpenAIProvider } from '@ai-sdk/openai';
import { createGoogleGenerativeAI, GoogleGenerativeAIProvider } from '@ai-sdk/google';
import { GEMINI_API_KEY, OPENAI_API_KEY } from "../utils/env";

type IProvider = GoogleGenerativeAIProvider | OpenAIProvider;

export async function getProvider(providerName: Providers): Promise<IProvider> {
    switch (providerName) {
        case Providers.GEMINI:
            if (!GEMINI_API_KEY) {
                throw new Error("GEMINI_API_KEY is not set");
            }
            return createGoogleGenerativeAI({
                apiKey: GEMINI_API_KEY,
            });
        case Providers.OPENAI:
            if (!OPENAI_API_KEY) {
                throw new Error("OPENAI_API_KEY is not set");
            }
            return createOpenAI({
                apiKey: OPENAI_API_KEY,
            });
        default:
            throw new Error(`Unsupported provider: ${providerName}`);
    }
}