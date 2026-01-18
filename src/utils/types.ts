export enum Providers {
    GEMINI = 'gemini',
    OPENAI = 'openai',
}

export interface AgentConfig {
    name: string;
    provider: Providers;
    model: string;
    description: string;
    persona: string;
}