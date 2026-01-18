# Chat History Feature

## Overview
The VoltAgent playground now includes comprehensive chat history functionality that allows you to:
- View all your past conversations
- Load and continue previous chats
- Start new chat sessions
- View the current chat history

## How It Works

### User ID
- Your user ID is automatically generated based on your system username
- This ensures you always have the same user ID across sessions
- Format: `user_<your_system_username>`

### Storage
- All chat histories are stored in the VoltAgent memory database (`.voltagent/memory.db`)
- Uses LibSQL (SQLite) for reliable, local storage
- No external services required - everything is stored locally

### Database Schema
The system uses VoltAgent's built-in memory tables:

**voltagent_memory_conversations**
- `id`: Conversation ID (chat_xxx)
- `user_id`: Your user ID
- `title`: Auto-generated from first message
- `created_at`, `updated_at`: Timestamps

**voltagent_memory_messages**
- `conversation_id`: Links to conversation
- `message_id`: Unique message ID
- `role`: 'user' or 'assistant'
- `parts`: Message content (JSON format)
- `created_at`: Timestamp

## Available Commands

### `/help`
Display all available commands

### `/new`
Start a new chat session with a fresh conversation ID

### `/history`
List all your past conversations with:
- Conversation title
- Message count
- Last updated timestamp
- Conversation ID

### `/load <chat_id>`
Load a specific conversation by its ID
- Displays the full chat history
- Allows you to continue the conversation

### `/view`
View the current chat's history
- Shows all messages in the current session
- Includes timestamps

### `exit`, `bye`, `quit`
Exit the application

## Usage Example

```bash
# Start the application
npm start

# View your chat history
/history

# Load a specific chat
/load chat_abc123...

# Start a new chat
/new

# View current chat
/view

# Get help
/help
```

## Features

- **Automatic Saving**: All messages are automatically saved to the database
- **Persistent History**: Your chat history persists across sessions
- **User Isolation**: Each user only sees their own chats
- **Timestamps**: All messages include creation timestamps
- **Smart Titles**: Chat titles are auto-generated from the first message

## Technical Details

### ChatHistoryService
Located in `src/services/chat-history.service.ts`, this service:
- Connects to the LibSQL database
- Queries conversation and message data
- Provides methods for listing, loading, and managing chats
- Parses message content from JSON format

### Integration
The chat history is integrated into the main TUI (`src/index.ts`):
- Initializes on startup
- Provides interactive commands
- Displays formatted chat histories
- Seamlessly works with VoltAgent's memory system
