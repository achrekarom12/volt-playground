import { getAgent } from './services/ai.service';
import { loadConfig } from './utils/config.service';
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
    let config;
    try {
        config = await loadConfig(configPath);
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

        while (!config) {
            const userProvidedPath = await askConfigPath();

            if (!userProvidedPath) {
                console.log(chalk.red('No path provided. Exiting...'));
                rl.close();
                process.exit(1);
            }

            try {
                config = await loadConfig(userProvidedPath);
                console.log(chalk.green('✓ Configuration loaded successfully!\n'));
            } catch (err) {
                console.log(chalk.red('✗ Failed to load config: ' + (err as Error).message));
                console.log(chalk.yellow('Please try again.\n'));
            }
        }

        rl.close();
    }

    const agent = await getAgent();
    const chatHistoryService = new ChatHistoryService();
    await chatHistoryService.initialize();

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
        chalk.dim('Fully configurable AI Agent in your terminal powered by VoltAgent'),
        {
            padding: 1,
            margin: 1,
            borderStyle: 'double',
            borderColor: 'cyan',
            title: `⚡ ${config.name} ⚡`,
            titleAlignment: 'center'
        }
    ));

    console.log(chalk.gray(`Provider: ${config.provider}`));
    console.log(chalk.gray(`Model: ${config.model}`));
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
        console.log(chalk.gray('─'.repeat(50)));
        console.log(chalk.white('  /help') + chalk.gray('          - Show this help message'));
        console.log(chalk.white('  /new') + chalk.gray('           - Start a new chat session'));
        console.log(chalk.white('  /history') + chalk.gray('       - List all your past chats'));
        console.log(chalk.white('  /load <chat_id>') + chalk.gray(' - Load a specific chat by ID'));
        console.log(chalk.white('  /view') + chalk.gray('          - View current chat history'));
        console.log(chalk.white('  /bye') + chalk.gray(' - Exit the application'));
        console.log(chalk.gray('─'.repeat(50)) + '\n');
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

                default:
                    console.log(chalk.red(`\n❌ Unknown command: ${command}`));
                    console.log(chalk.gray('Type /help for available commands.\n'));
                    continue;
            }
        }

        try {
            const stream = await agent.streamText(userInput, {
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
