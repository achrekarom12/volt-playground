import { readFile } from 'fs/promises';
import { join } from 'path';
import { AgentConfig } from './types';


export async function loadConfig(): Promise<AgentConfig> {
    try {
        const configPath = join(process.cwd(), 'agent_config.json');
        const configData = await readFile(configPath, 'utf-8');
        const config: AgentConfig = JSON.parse(configData);

        if (!config.name || !config.provider || !config.model) {
            throw new Error('Invalid config: name, provider, and model are required');
        }

        return config;
    } catch (error) {
        throw new Error(`Failed to load agent config: ${(error as Error).message}`);
    }
}
