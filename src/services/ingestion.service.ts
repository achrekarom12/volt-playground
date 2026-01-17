import { GoogleGenAI } from "@google/genai";
import { GOOGLE_API_KEY } from "../utils/env";
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { getOrCreateCollection, addData, getCollectionDetails } from "./vector.service";


const ai = new GoogleGenAI({
    apiKey: GOOGLE_API_KEY,
});


async function generateEmbeddings(text: string[]) {
    const response = await ai.models.embedContent({
        model: 'gemini-embedding-001',
        contents: text.map(t => ({ parts: [{ text: t }] })),
    });
    return response.embeddings?.map(e => e.values)[0];

}

export async function ingestChatHistory() {
    const chatHistoryDir = path.join(process.cwd(), 'chat_history_separated');

    if (!fs.existsSync(chatHistoryDir)) {
        console.error('Chat history directory not found found:', chatHistoryDir);
        return;
    }

    const collection = await getOrCreateCollection('chat_history', 'Collection of chat history files');
    const files = fs.readdirSync(chatHistoryDir);
    const batchSize = 5;

    for (let i = 0; i < files.length; i += batchSize) {
        const batchFiles = files.slice(i, i + batchSize);
        const batchData = [];

        console.log(`Processing batch ${i / batchSize + 1}...`);

        for (const file of batchFiles) {
            if (file.endsWith('.txt')) {
                const filePath = path.join(chatHistoryDir, file);
                const content = fs.readFileSync(filePath, 'utf-8');

                if (!content.trim()) continue;

                try {
                    const embedding = await generateEmbeddings([content]);
                    if (embedding) {
                        batchData.push({
                            id: crypto.randomUUID(),
                            embedding: embedding,
                            document: content,
                            metadata: {
                                filename: file,
                                processedAt: new Date().toISOString()
                            }
                        });
                    }
                } catch (error) {
                    console.error(`Error generating embedding for ${file}:`, error);
                }
            }
        }

        if (batchData.length > 0) {
            await addData(collection, batchData);
            console.log(`Indexed ${batchData.length} files from batch.`);
        }
    }

    console.log('Ingestion complete.');
}

// ingestChatHistory();
// getCollectionDetails('chat_history');
