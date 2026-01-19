import { Agent, Memory } from "@voltagent/core";
import { LibSQLMemoryAdapter } from "@voltagent/libsql";
import { AgentConfig } from "../utils/types";
import { getProvider } from "./provider.service";
import { listAgents, getAgentById, getDefaultAgent } from "../utils/config.service";

async function buildSystemPrompt(name: string, role: string, persona: string): Promise<string> {
    const prompt = `# System Instructions: Agent Protocol

## 1. Identity & Role
- **Name:** ${name}
- **Primary Role:** ${role}
- **Core Persona:** ${persona}

## 2. Mission Objective
Your mission is to serve as a highly specialized agent. You must leverage your identity as **${name}** to provide responses that are not only accurate but also deeply reflective of the **${persona}** personality. Every interaction should reinforce the authority and perspective of a **${role}**.

## 3. Communication Style & Voice
- **Tone:** Consistently embody **${persona}**. (e.g., If the persona is "Minimalist," be brief; if "Enthusiastic," use expressive language).
- **Perspective:** Approach all queries through the professional lens of a **${role}**.
- **Vocabulary:** Use industry-standard terminology appropriate for your role, but ensure it aligns with your persona's voice.

## 4. Operational Constraints
- **Character Integrity:** Never break character. Do not refer to yourself as an AI or a language model.
- **Scope:** If a request falls outside the expertise of a **${role}**, acknowledge it gracefully while staying in character.
- **Negative Constraints:** - Avoid generic, robotic introductions (e.g., "As an AI...").
    - Do not be overly repetitive.

## 5. Execution Steps
1. **Contextualize:** Review the user's input through the mindset of **${name}**.
2. **Filter:** Determine if the persona (**${persona}**) would find the information relevant or how they would phrase the advice.
3. **Respond:** Deliver the output in a [Specify format, e.g., bulleted list/conversational prose] that reflects the **${role}**'s expertise.`;
    return prompt;
}

async function createAgent(config: AgentConfig): Promise<Agent> {
    const systemPrompt = await buildSystemPrompt(config.name, config.role, config.persona);
    const client = await getProvider(config.provider);

    return new Agent({
        name: config.name,
        instructions: systemPrompt,
        model: client(config.model),
        memory: new Memory({
            storage: new LibSQLMemoryAdapter({
                url: `file:./.voltagent/memory.db`,
            }),
            workingMemory: {
                enabled: true,
                scope: "user",
            },
        }),
    });
}

export class MultiAgentService {
    private agents: Map<string, Agent> = new Map();
    private currentAgentId: string | null = null;
    private configPath?: string;

    constructor(configPath?: string) {
        this.configPath = configPath;
    }

    async initialize(): Promise<void> {
        const defaultAgent = await getDefaultAgent(this.configPath);
        this.currentAgentId = defaultAgent.id;

        // Pre-load the default agent
        await this.loadAgent(defaultAgent.id);
    }

    async loadAgent(agentId: string): Promise<Agent> {
        // Check if agent is already loaded
        if (this.agents.has(agentId)) {
            return this.agents.get(agentId)!;
        }

        // Load agent configuration
        const config = await getAgentById(agentId, this.configPath);
        if (!config) {
            throw new Error(`Agent with ID "${agentId}" not found`);
        }

        // Create and cache the agent
        const agent = await createAgent(config);
        this.agents.set(agentId, agent);

        return agent;
    }

    async switchAgent(agentId: string): Promise<AgentConfig> {
        const config = await getAgentById(agentId, this.configPath);
        if (!config) {
            throw new Error(`Agent with ID "${agentId}" not found`);
        }

        // Load the agent if not already loaded
        await this.loadAgent(agentId);

        this.currentAgentId = agentId;
        return config;
    }

    getCurrentAgent(): Agent {
        if (!this.currentAgentId || !this.agents.has(this.currentAgentId)) {
            throw new Error('No agent is currently active');
        }
        return this.agents.get(this.currentAgentId)!;
    }

    async getCurrentAgentConfig(): Promise<AgentConfig> {
        if (!this.currentAgentId) {
            throw new Error('No agent is currently active');
        }

        const config = await getAgentById(this.currentAgentId, this.configPath);
        if (!config) {
            throw new Error(`Current agent "${this.currentAgentId}" configuration not found`);
        }

        return config;
    }

    async listAvailableAgents(): Promise<AgentConfig[]> {
        return listAgents(this.configPath);
    }

    getCurrentAgentId(): string | null {
        return this.currentAgentId;
    }
}
