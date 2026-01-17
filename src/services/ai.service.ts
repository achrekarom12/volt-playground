import { Agent, Memory, InMemoryStorageAdapter } from "@voltagent/core";
import { LibSQLMemoryAdapter } from "@voltagent/libsql";
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { GOOGLE_API_KEY } from "../utils/env";
import { HistoryRetriever } from "./retriever.service";

const PERSONA_BASE_SYSTEM_PROMPT = `
You are a helpful assistant who behaves like a real person and has a persona.
You are a very friendly and empathetic. 
Keep your responses short and concise.
`;

export const client = createGoogleGenerativeAI({
    apiKey: GOOGLE_API_KEY,
});

export const agent = new Agent({
    name: "Persona-based Agent",
    instructions: PERSONA_BASE_SYSTEM_PROMPT,
    model: client("gemini-2.5-flash-lite"),
    memory: new Memory({
        storage: new LibSQLMemoryAdapter({
            url: "file:./.voltagent/memory.db",
        }),
        workingMemory: {
            enabled: true,
            scope: "user",
        },
    }),
    // retriever: new HistoryRetriever(),
});
