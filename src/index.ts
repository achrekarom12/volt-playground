import { agent } from './services/ai.service';
import * as readline from 'node:readline';
import { stdin as input, stdout as output } from 'node:process';
import { generateChatId, generateUserId } from './utils/uuid';
import chalk from 'chalk';
import boxen from 'boxen';

async function main() {
    const rl = readline.createInterface({
        input,
        output,
        prompt: chalk.bold.blue('You: ')
    });

    const threadId = generateChatId();
    const userId = generateUserId();

    process.stdout.write('\x1Bc');

    console.log(boxen(
        chalk.dim('Fully configurable AI Agent in your terminal powered by VoltAgent'),
        {
            padding: 1,
            margin: 1,
            borderStyle: 'double',
            borderColor: 'cyan',
            title: '⚡ Volt Playground Agent ⚡',
            titleAlignment: 'center'
        }
    ));

    console.log(chalk.gray(`Session: ${threadId}`));
    console.log(chalk.gray(`User: ${userId}`))
    console.log("\n")
    console.log(chalk.yellow("Type 'exit' or 'bye' to quit.\n"));

    const askQuestion = () => {
        return new Promise<string>((resolve) => {
            rl.question(chalk.bold.blue('You: '), (answer) => {
                resolve(answer);
            });
        });
    };

    while (true) {
        const userInputRaw = await askQuestion();
        const userInput = userInputRaw.trim();

        if (!userInput) continue;

        if (['exit', 'bye', 'quit', 'q'].includes(userInput.toLowerCase())) {
            console.log(chalk.green('\n👋 See you later! Have a great day!\n'));
            rl.close();
            process.exit(0);
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
