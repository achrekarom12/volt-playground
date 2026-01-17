import { BaseRetriever } from "@voltagent/core";
import { GoogleGenAI } from "@google/genai";
import { GOOGLE_API_KEY } from "../utils/env";
import { client } from "./vector.service";

const ai = new GoogleGenAI({
  apiKey: GOOGLE_API_KEY,
});

export class HistoryRetriever extends BaseRetriever {
  async retrieve(input: any[], options?: any) {
    // 1. Get the user's question
    const question = typeof input === "string" ? input : input[input.length - 1].content;

    // 2. Search ChromaDB
    const results = await this.searchChatHistory(question, options?.topK || 5);

    // 3. Return formatted results
    return results.join("\n\n---\n\n");
  }

  async searchChatHistory(query: string, topK: number = 5) {
    try {
      // Generate embedding for the query
      const queryEmbedding = await this.generateQueryEmbedding(query);

      if (!queryEmbedding) {
        console.error("Failed to generate query embedding");
        return [];
      }

      // Get the chat_history collection
      const collection = await client.getCollection({
        name: "chat_history",
      });

      // Query the collection
      const results = await collection.query({
        queryEmbeddings: [queryEmbedding],
        nResults: topK,
      });

      // Format and return results
      const formattedResults: string[] = [];

      if (results.documents && results.documents[0]) {
        for (let i = 0; i < results.documents[0].length; i++) {
          const document = results.documents[0][i];
          const metadata = results.metadatas?.[0]?.[i];
          const distance = results.distances?.[0]?.[i];

          formattedResults.push(
            `Document: ${metadata?.filename || 'Unknown'}\n` +
            `Relevance Score: ${distance ? (1 - distance).toFixed(4) : 'N/A'}\n` +
            `Content:\n${document}`
          );
        }
      }
      return formattedResults;
    } catch (error) {
      console.error("Error searching chat history:", error);
      return [];
    }
  }

  private async generateQueryEmbedding(text: string): Promise<number[] | null> {
    try {
      const response = await ai.models.embedContent({
        model: "gemini-embedding-001",
        contents: [{ parts: [{ text }] }],
      });
      return response.embeddings?.[0]?.values || null;
    } catch (error) {
      console.error("Error generating query embedding:", error);
      return null;
    }
  }
}