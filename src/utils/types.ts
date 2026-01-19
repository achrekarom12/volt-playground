export enum Providers {
    GEMINI = 'gemini',
    OPENAI = 'openai',
}

export interface AgentConfig {
    id: string;
    name: string;
    provider: Providers;
    model: string;
    role: string;
    persona: string;
    description: string;
}

export interface MultiAgentConfig {
    defaultAgent: string;
    agents: AgentConfig[];
}