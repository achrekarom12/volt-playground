import { Agent, Memory } from "@voltagent/core";
import { LibSQLMemoryAdapter } from "@voltagent/libsql";
import { loadConfig } from "../utils/config.service";
import { getProvider } from "./provider.service";

async function buildSystemPrompt(): Promise<string> {
    const config = await loadConfig();

    let prompt = '';

    if (config.description) {
        prompt += `${config.description}\n\n`;
    }

    if (config.persona) {
        prompt += `Persona: ${config.persona}\n`;
        prompt += `You should embody this persona in all your interactions.\n`;
    }

    prompt += `\nKeep your responses short and concise.`;

    return prompt;
}

async function initializeAgent(): Promise<Agent> {
    const config = await loadConfig();
    const systemPrompt = await buildSystemPrompt();
    const client = await getProvider(config.provider);

    return new Agent({
        name: config.name,
        instructions: systemPrompt,
        model: client(config.model),
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
}

export const agentPromise = initializeAgent();

export async function getAgent(): Promise<Agent> {
    return agentPromise;
}
