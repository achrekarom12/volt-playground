function generateUUID(): string {
    return crypto.randomUUID();
}

export function generatePrefixedUUID(prefix: string): string {
    return `${prefix}${generateUUID()}`;
}

export const generateChatId = () => generatePrefixedUUID("chat_");
export const generateUserId = () => generatePrefixedUUID("user_");
