import type { Client } from '@libsql/client';

export interface ChatMessage {
    message_id: string;
    role: string;
    parts: string;
    created_at: string;
}

export interface ChatConversation {
    id: string;
    user_id: string;
    title: string;
    created_at: string;
    updated_at: string;
    messageCount?: number;
}

export class ChatHistoryService {
    private dbPath: string;
    private client: Client | null = null;

    constructor() {
        this.dbPath = 'file:./.voltagent/memory.db';
    }

    /**
     * Initialize the database client
     */
    async initialize(): Promise<void> {
        // Import dynamically to avoid issues
        const { createClient } = await import('@libsql/client');
        this.client = createClient({
            url: this.dbPath,
        });
    }

    /**
     * List all conversations for a user
     */
    async listConversations(userId: string): Promise<ChatConversation[]> {
        if (!this.client) {
            throw new Error('ChatHistoryService not initialized');
        }

        try {
            const result = await this.client.execute({
                sql: `
                    SELECT 
                        c.id,
                        c.user_id,
                        c.title,
                        c.created_at,
                        c.updated_at,
                        COUNT(m.message_id) as messageCount
                    FROM voltagent_memory_conversations c
                    LEFT JOIN voltagent_memory_messages m ON c.id = m.conversation_id
                    WHERE c.user_id = ?
                    GROUP BY c.id, c.user_id, c.title, c.created_at, c.updated_at
                    ORDER BY c.updated_at DESC
                `,
                args: [userId]
            });

            return result.rows.map((row: any) => ({
                id: row.id as string,
                user_id: row.user_id as string,
                title: row.title as string,
                created_at: row.created_at as string,
                updated_at: row.updated_at as string,
                messageCount: Number(row.messageCount) || 0,
            }));
        } catch (error) {
            console.error('Error listing conversations:', error);
            return [];
        }
    }

    /**
     * Get a specific conversation with its messages
     */
    async getConversation(conversationId: string, userId: string): Promise<{
        conversation: ChatConversation | null;
        messages: ChatMessage[];
    }> {
        if (!this.client) {
            throw new Error('ChatHistoryService not initialized');
        }

        try {
            // Get conversation details
            const convResult = await this.client.execute({
                sql: `
                    SELECT id, user_id, title, created_at, updated_at
                    FROM voltagent_memory_conversations
                    WHERE id = ? AND user_id = ?
                `,
                args: [conversationId, userId]
            });

            if (convResult.rows.length === 0) {
                return { conversation: null, messages: [] };
            }

            const conversation: ChatConversation = {
                id: convResult.rows[0].id as string,
                user_id: convResult.rows[0].user_id as string,
                title: convResult.rows[0].title as string,
                created_at: convResult.rows[0].created_at as string,
                updated_at: convResult.rows[0].updated_at as string,
            };

            // Get messages for this conversation
            const msgResult = await this.client.execute({
                sql: `
                    SELECT message_id, role, parts, created_at
                    FROM voltagent_memory_messages
                    WHERE conversation_id = ?
                    ORDER BY created_at ASC
                `,
                args: [conversationId]
            });

            const messages: ChatMessage[] = msgResult.rows.map((row: any) => ({
                message_id: row.message_id as string,
                role: row.role as string,
                parts: row.parts as string,
                created_at: row.created_at as string,
            }));

            return { conversation, messages };
        } catch (error) {
            console.error('Error getting conversation:', error);
            return { conversation: null, messages: [] };
        }
    }

    /**
     * Delete a conversation and all its messages
     */
    async deleteConversation(conversationId: string, userId: string): Promise<boolean> {
        if (!this.client) {
            throw new Error('ChatHistoryService not initialized');
        }

        try {
            // First verify the conversation belongs to the user
            const convResult = await this.client.execute({
                sql: `SELECT id FROM voltagent_memory_conversations WHERE id = ? AND user_id = ?`,
                args: [conversationId, userId]
            });

            if (convResult.rows.length === 0) {
                return false;
            }

            // Delete messages first (due to foreign key constraints)
            await this.client.execute({
                sql: `DELETE FROM voltagent_memory_messages WHERE conversation_id = ?`,
                args: [conversationId]
            });

            // Delete conversation
            await this.client.execute({
                sql: `DELETE FROM voltagent_memory_conversations WHERE id = ?`,
                args: [conversationId]
            });

            return true;
        } catch (error) {
            console.error('Error deleting conversation:', error);
            return false;
        }
    }

    /**
     * Update conversation title
     */
    async updateConversationTitle(conversationId: string, userId: string, newTitle: string): Promise<boolean> {
        if (!this.client) {
            throw new Error('ChatHistoryService not initialized');
        }

        try {
            const result = await this.client.execute({
                sql: `
                    UPDATE voltagent_memory_conversations 
                    SET title = ?, updated_at = CURRENT_TIMESTAMP
                    WHERE id = ? AND user_id = ?
                `,
                args: [newTitle, conversationId, userId]
            });

            return result.rowsAffected > 0;
        } catch (error) {
            console.error('Error updating conversation title:', error);
            return false;
        }
    }

    /**
     * Parse message parts (they're stored as JSON string)
     */
    parseMessageContent(parts: string): string {
        try {
            const parsed = JSON.parse(parts);
            if (Array.isArray(parsed) && parsed.length > 0) {
                // VoltAgent stores parts as array of objects with 'text' property
                return parsed.map(part => part.text || '').join('');
            }
            return parts;
        } catch (error) {
            return parts;
        }
    }

    /**
     * Close the database connection
     */
    async close(): Promise<void> {
        if (this.client) {
            this.client.close();
        }
    }
}
