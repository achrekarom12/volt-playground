import { MultiAgentService } from './services/multi-agent.service';
import { loadMultiAgentConfig } from './utils/config.service';
import * as readline from 'node:readline';
import { stdin as input, stdout as output } from 'node:process';
import { generateChatId, getUserName } from './utils/uuid';
import chalk from 'chalk';
import boxen from 'boxen';
import { ChatHistoryService } from './services/chat-history.service';

async function main() {
    // Parse command-line arguments
    const args = process.argv.slice(2);
    let configPath: string | undefined;

    // Check for --agent_config argument
    for (let i = 0; i < args.length; i++) {
        if (args[i].startsWith('--agent_config=')) {
            configPath = args[i].split('=')[1];
        } else if (args[i] === '--agent_config' && i + 1 < args.length) {
            configPath = args[i + 1];
        }
    }

    // Try to load configuration
    let multiAgentConfig;
    try {
        multiAgentConfig = await loadMultiAgentConfig(configPath);
    } catch (error) {
        // If config loading fails, prompt user for config path
        console.log(chalk.yellow('⚠️  Could not load agent configuration.'));
        console.log(chalk.gray((error as Error).message));
        console.log('');

        const rl = readline.createInterface({
            input,
            output
        });

        const askConfigPath = (): Promise<string> => {
            return new Promise((resolve) => {
                rl.question(chalk.cyan('Enter the path to your agent_config.json file: '), (answer) => {
                    resolve(answer.trim());
                });
            });
        };

        while (!multiAgentConfig) {
            const userProvidedPath = await askConfigPath();

            if (!userProvidedPath) {
                console.log(chalk.red('No path provided. Exiting...'));
                rl.close();
                process.exit(1);
            }

            try {
                multiAgentConfig = await loadMultiAgentConfig(userProvidedPath);
                configPath = userProvidedPath;
                console.log(chalk.green('✓ Configuration loaded successfully!\n'));
            } catch (err) {
                console.log(chalk.red('✗ Failed to load config: ' + (err as Error).message));
                console.log(chalk.yellow('Please try again.\n'));
            }
        }

        rl.close();
    }

    const multiAgentService = new MultiAgentService(configPath);
    await multiAgentService.initialize();

    const chatHistoryService = new ChatHistoryService();
    await chatHistoryService.initialize();

    let currentAgentConfig = await multiAgentService.getCurrentAgentConfig();

    const rl = readline.createInterface({
        input,
        output,
        prompt: chalk.bold.blue('You: ')
    });

    let threadId = generateChatId();
    const userId = getUserName();

    process.stdout.write('\x1Bc');

    // Display welcome banner with config-based information
    console.log(boxen(
        chalk.dim('Fully configurable Multi-Agent AI in your terminal powered by VoltAgent'),
        {
            padding: 1,
            margin: 1,
            borderStyle: 'double',
            borderColor: 'cyan',
            title: `⚡ ${currentAgentConfig.name} ⚡`,
            titleAlignment: 'center'
        }
    ));

    console.log(chalk.gray(`Current Agent: ${currentAgentConfig.name} (${currentAgentConfig.id})`));
    console.log(chalk.gray(`Role: ${currentAgentConfig.role}`));
    console.log(chalk.gray(`Provider: ${currentAgentConfig.provider} | Model: ${currentAgentConfig.model}`));
    console.log(chalk.gray(`Session: ${threadId}`));
    console.log(chalk.gray(`User: ${userId}`))
    console.log("\n")
    console.log(chalk.yellow("Type '/bye' to quit."));
    console.log(chalk.cyan("Type '/help' for available commands.\n"));

    const askQuestion = () => {
        return new Promise<string>((resolve) => {
            rl.question(chalk.bold.blue('You: '), (answer) => {
                resolve(answer);
            });
        });
    };

    const displayHelp = () => {
        console.log(chalk.bold.cyan('\n📚 Available Commands:'));
        console.log(chalk.gray('─'.repeat(60)));
        console.log(chalk.white('  /help') + chalk.gray('             - Show this help message'));
        console.log(chalk.white('  /new') + chalk.gray('              - Start a new chat session'));
        console.log(chalk.white('  /history') + chalk.gray('          - List all your past chats'));
        console.log(chalk.white('  /load <chat_id>') + chalk.gray('  - Load a specific chat by ID'));
        console.log(chalk.white('  /view') + chalk.gray('             - View current chat history'));
        console.log(chalk.white('  /agents') + chalk.gray('           - List all available agents'));
        console.log(chalk.white('  /switch <agent_id>') + chalk.gray(' - Switch to a different agent'));
        console.log(chalk.white('  /current') + chalk.gray('          - Show current agent info'));
        console.log(chalk.white('  /bye') + chalk.gray('              - Exit the application'));
        console.log(chalk.gray('─'.repeat(60)) + '\n');
    };

    const displayChatHistory = async () => {
        const chats = await chatHistoryService.listConversations(userId);

        if (chats.length === 0) {
            console.log(chalk.yellow('\n📭 No chat history found.\n'));
            return;
        }

        console.log(chalk.bold.cyan('\n💬 Your Chat History:'));
        console.log(chalk.gray('─'.repeat(80)));

        chats.forEach((chat, index) => {
            const date = new Date(chat.updated_at).toLocaleString();
            console.log(
                chalk.white(`${index + 1}. `) +
                chalk.bold.green(chat.title) +
                chalk.gray(` (${chat.messageCount} messages)`)
            );
            console.log(chalk.gray(`   ID: ${chat.id}`));
            console.log(chalk.gray(`   Last updated: ${date}\n`));
        });

        console.log(chalk.gray('─'.repeat(80)));
        console.log(chalk.cyan('💡 Use /load <chat_id> to continue a conversation\n'));
    };

    const loadChatHistory = async (chatId: string) => {
        const { conversation, messages } = await chatHistoryService.getConversation(chatId, userId);

        if (!conversation) {
            console.log(chalk.red(`\n❌ Chat not found: ${chatId}\n`));
            return;
        }

        threadId = chatId;
        console.log(chalk.green(`\n✓ Loaded chat: ${conversation.title}`));
        console.log(chalk.gray(`Messages: ${messages.length}\n`));

        // Display the chat history
        if (messages.length > 0) {
            console.log(chalk.bold.cyan('📜 Chat History:'));
            console.log(chalk.gray('─'.repeat(80)));

            messages.forEach((msg) => {
                const timestamp = new Date(msg.created_at).toLocaleTimeString();
                const content = chatHistoryService.parseMessageContent(msg.parts);
                if (msg.role === 'user') {
                    console.log(chalk.bold.blue(`[${timestamp}] You: `) + chalk.white(content));
                } else {
                    console.log(chalk.bold.magenta(`[${timestamp}] Agent: `) + chalk.white(content));
                }
                console.log('');
            });

            console.log(chalk.gray('─'.repeat(80)) + '\n');
        }
    };

    const viewCurrentChat = async () => {
        const { conversation, messages } = await chatHistoryService.getConversation(threadId, userId);

        if (!conversation || messages.length === 0) {
            console.log(chalk.yellow('\n📭 No messages in current chat yet.\n'));
            return;
        }

        console.log(chalk.bold.cyan(`\n💬 Current Chat: ${conversation.title}`));
        console.log(chalk.gray('─'.repeat(80)));

        messages.forEach((msg) => {
            const timestamp = new Date(msg.created_at).toLocaleTimeString();
            const content = chatHistoryService.parseMessageContent(msg.parts);
            if (msg.role === 'user') {
                console.log(chalk.bold.blue(`[${timestamp}] You: `) + chalk.white(content));
            } else {
                console.log(chalk.bold.magenta(`[${timestamp}] Agent: `) + chalk.white(content));
            }
            console.log('');
        });

        console.log(chalk.gray('─'.repeat(80)) + '\n');
    };

    const displayAgents = async () => {
        const agents = await multiAgentService.listAvailableAgents();
        const currentId = multiAgentService.getCurrentAgentId();

        console.log(chalk.bold.cyan('\n🤖 Available Agents:'));
        console.log(chalk.gray('─'.repeat(80)));

        agents.forEach((agent, index) => {
            const isCurrent = agent.id === currentId;
            const marker = isCurrent ? chalk.green('●') : chalk.gray('○');

            console.log(
                `${marker} ${chalk.white(`${index + 1}. `)}` +
                chalk.bold.cyan(agent.name) +
                chalk.gray(` (${agent.id})`)
            );
            console.log(chalk.gray(`   Role: ${agent.role}`));
            console.log(chalk.gray(`   Persona: ${agent.persona}`));
            console.log(chalk.gray(`   Description: ${agent.description}`));
            console.log(chalk.gray(`   Provider: ${agent.provider} | Model: ${agent.model}\n`));
        });

        console.log(chalk.gray('─'.repeat(80)));
        console.log(chalk.cyan('💡 Use /switch <agent_id> to change agents\n'));
    };

    const switchAgent = async (agentId: string) => {
        try {
            const newConfig = await multiAgentService.switchAgent(agentId);
            currentAgentConfig = newConfig;

            console.log(chalk.green(`\n✓ Switched to agent: ${newConfig.name}`));
            console.log(chalk.gray(`Role: ${newConfig.role}`));
            console.log(chalk.gray(`Persona: ${newConfig.persona}`));
            console.log(chalk.gray(`Description: ${newConfig.description}\n`));
        } catch (error) {
            console.log(chalk.red(`\n❌ Failed to switch agent: ${(error as Error).message}\n`));
        }
    };

    const displayCurrentAgent = async () => {
        const config = await multiAgentService.getCurrentAgentConfig();

        console.log(chalk.bold.cyan('\n🤖 Current Agent:'));
        console.log(chalk.gray('─'.repeat(60)));
        console.log(chalk.white('  Name: ') + chalk.bold.green(config.name));
        console.log(chalk.white('  ID: ') + chalk.gray(config.id));
        console.log(chalk.white('  Role: ') + chalk.cyan(config.role));
        console.log(chalk.white('  Persona: ') + chalk.yellow(config.persona));
        console.log(chalk.white('  Description: ') + chalk.gray(config.description));
        console.log(chalk.white('  Provider: ') + chalk.gray(config.provider));
        console.log(chalk.white('  Model: ') + chalk.gray(config.model));
        console.log(chalk.gray('─'.repeat(60)) + '\n');
    };

    while (true) {
        const userInputRaw = await askQuestion();
        const userInput = userInputRaw.trim();

        if (!userInput) continue;

        // Handle exit commands
        if (['/bye'].includes(userInput.toLowerCase())) {
            console.log(chalk.green('\n👋 See you later! Have a great day!\n'));
            rl.close();
            process.exit(0);
        }

        // Handle special commands
        if (userInput.startsWith('/')) {
            const [command, ...args] = userInput.split(' ');

            switch (command.toLowerCase()) {
                case '/help':
                    displayHelp();
                    continue;

                case '/new':
                    threadId = generateChatId();
                    console.log(chalk.green(`\n✨ Started new chat session: ${threadId}\n`));
                    continue;

                case '/history':
                    await displayChatHistory();
                    continue;

                case '/load':
                    if (args.length === 0) {
                        console.log(chalk.red('\n❌ Please provide a chat ID. Usage: /load <chat_id>\n'));
                    } else {
                        await loadChatHistory(args[0]);
                    }
                    continue;

                case '/view':
                    await viewCurrentChat();
                    continue;

                case '/agents':
                    await displayAgents();
                    continue;

                case '/switch':
                    if (args.length === 0) {
                        console.log(chalk.red('\n❌ Please provide an agent ID. Usage: /switch <agent_id>\n'));
                    } else {
                        await switchAgent(args[0]);
                    }
                    continue;

                case '/current':
                    await displayCurrentAgent();
                    continue;

                default:
                    console.log(chalk.red(`\n❌ Unknown command: ${command}`));
                    console.log(chalk.gray('Type /help for available commands.\n'));
                    continue;
            }
        }

        try {
            const currentAgent = multiAgentService.getCurrentAgent();
            const stream = await currentAgent.streamText(userInput, {
                userId: userId,
                conversationId: threadId,
            });

            // Clear the "thinking" line
            readline.clearLine(process.stdout, 0);
            readline.cursorTo(process.stdout, 0);

            process.stdout.write(chalk.bold.magenta('Agent: '));

            let fullResponse = '';
            for await (const chunk of stream.textStream) {
                process.stdout.write(chalk.white(chunk));
                fullResponse += chunk;
            }

            process.stdout.write('\n\n');

        } catch (error) {
            readline.clearLine(process.stdout, 0);
            readline.cursorTo(process.stdout, 0);
            console.log(chalk.red('Error: ' + (error as Error).message));
            console.log(chalk.red('Failed to get response from agent. Please try again.\n'));
        }
    }
}

process.on('uncaughtException', (err) => {
    console.error(chalk.red('\nUnexpected Error:'), err);
    process.exit(1);
});

main().catch(err => {
    console.error(chalk.red('Fatal Error:'), err);
    process.exit(1);
});
