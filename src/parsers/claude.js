/**
 * Claude.ai Export Parser
 * Handles: conversations.json from Claude data export
 */

export function parseClaude(data) {
  // Claude exports as array of conversations
  const conversations = Array.isArray(data) ? data : [];

  return conversations.map((convo) => {
    const messages = extractClaudeMessages(convo.chat_messages || []);
    const firstMsg = messages[0];
    const lastMsg = messages[messages.length - 1];

    return {
      id: convo.uuid || generateId(),
      title: convo.name || 'Untitled Conversation',
      platform: 'claude',
      model: extractClaudeModel(convo),
      created: convo.created_at || null,
      updated: convo.updated_at || null,
      messages,
      messageCount: messages.length,
      wordCount: messages.reduce((acc, m) => acc + wordCount(m.content), 0),
      tags: [],
      links: [],
      notes: '',
      firstMessage: firstMsg?.content?.slice(0, 120) || '',
      lastActivity: lastMsg?.timestamp || null,
      project: convo.project?.name || null,
    };
  });
}

function extractClaudeMessages(chatMessages) {
  return chatMessages
    .map((msg) => {
      // Claude messages have sender: 'human' | 'assistant'
      const content = extractClaudeContent(msg.content || msg.text || '');
      if (!content) return null;

      return {
        id: msg.uuid || generateId(),
        role: msg.sender === 'human' ? 'user' : 'assistant',
        content,
        timestamp: msg.created_at || null,
        model: msg.model || null,
        attachments: msg.attachments || [],
        files: msg.files || [],
      };
    })
    .filter(Boolean);
}

function extractClaudeContent(content) {
  if (typeof content === 'string') return content.trim();

  if (Array.isArray(content)) {
    return content
      .map((block) => {
        if (typeof block === 'string') return block;
        if (block.type === 'text') return block.text || '';
        if (block.type === 'tool_result') return `[Tool Result: ${block.content || ''}]`;
        return '';
      })
      .join('\n')
      .trim();
  }

  return '';
}

function extractClaudeModel(convo) {
  // Try to find model from messages
  const messages = convo.chat_messages || [];
  for (const msg of messages) {
    if (msg.model) return msg.model;
  }
  // Try from project or settings
  return convo.model || 'claude';
}

function wordCount(text) {
  if (!text) return 0;
  return text.trim().split(/\s+/).length;
}

function generateId() {
  return Math.random().toString(36).slice(2, 11);
}
