import { agent } from './services/ai.service';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { generateChatId, generateUserId } from './utils/uuid';

async function main() {
    const rl = readline.createInterface({ input, output });

    const threadId = generateChatId();
    const userId = generateUserId();
    console.log(`Chat started with threadId: ${threadId} and userId: ${userId}`);
    console.log("Type 'exit' or 'bye' to quit.");

    while (true) {
        const userInput = await rl.question('\nYou: ');

        if (userInput.trim().toLowerCase() === 'exit' || userInput.trim().toLowerCase() === 'bye') {
            console.log('See you later!');
            rl.close();
            break;
        }

        const stream = await agent.streamText(userInput,
            {
                userId: userId,
                conversationId: threadId,
            }
        );

        process.stdout.write('Agent: ');
        for await (const chunk of stream.textStream) {
            process.stdout.write(chunk);
        }
        process.stdout.write('\n');
    }
}

main();
