import * as os from 'os';

function generateUUID(): string {
    return crypto.randomUUID();
}

export function generatePrefixedUUID(prefix: string): string {
    return `${prefix}${generateUUID()}`;
}

export const generateChatId = () => generatePrefixedUUID("chat_");

// Generate a constant user ID based on system username
export const getUserName = () => {
    return os.userInfo().username;
};
