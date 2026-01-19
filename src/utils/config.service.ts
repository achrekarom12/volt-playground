import { readFile } from 'fs/promises';
import { join } from 'path';
import { AgentConfig, MultiAgentConfig } from './types';


export async function loadMultiAgentConfig(customConfigPath?: string): Promise<MultiAgentConfig> {
    try {
        const configPath = customConfigPath || join(process.cwd(), 'agent_config.json');
        const configData = await readFile(configPath, 'utf-8');
        const config: MultiAgentConfig = JSON.parse(configData);

        if (!config.agents || !Array.isArray(config.agents) || config.agents.length === 0) {
            throw new Error('Invalid config: agents array is required and must contain at least one agent');
        }

        if (!config.defaultAgent) {
            throw new Error('Invalid config: defaultAgent is required');
        }

        // Validate each agent
        for (const agent of config.agents) {
            if (!agent.id || !agent.name || !agent.provider || !agent.model) {
                throw new Error(`Invalid agent config: id, name, provider, and model are required for all agents`);
            }
        }

        // Validate that defaultAgent exists
        const defaultAgentExists = config.agents.some(agent => agent.id === config.defaultAgent);
        if (!defaultAgentExists) {
            throw new Error(`Invalid config: defaultAgent "${config.defaultAgent}" not found in agents list`);
        }

        return config;
    } catch (error) {
        throw new Error(`Failed to load agent config from "${customConfigPath || join(process.cwd(), 'agent_config.json')}": ${(error as Error).message}`);
    }
}

export async function getAgentById(agentId: string, customConfigPath?: string): Promise<AgentConfig | null> {
    const config = await loadMultiAgentConfig(customConfigPath);
    return config.agents.find(agent => agent.id === agentId) || null;
}

export async function getDefaultAgent(customConfigPath?: string): Promise<AgentConfig> {
    const config = await loadMultiAgentConfig(customConfigPath);
    const defaultAgent = config.agents.find(agent => agent.id === config.defaultAgent);

    if (!defaultAgent) {
        throw new Error(`Default agent "${config.defaultAgent}" not found`);
    }

    return defaultAgent;
}

export async function listAgents(customConfigPath?: string): Promise<AgentConfig[]> {
    const config = await loadMultiAgentConfig(customConfigPath);
    return config.agents;
}

// Legacy function for backward compatibility
export async function loadConfig(customConfigPath?: string): Promise<AgentConfig> {
    return getDefaultAgent(customConfigPath);
}
