/**
 * ChatGPT Export Parser
 * Handles: conversations.json from ChatGPT data export ZIP
 */

export function parseChatGPT(data) {
  // data can be an array of conversations or wrapped object
  const conversations = Array.isArray(data) ? data : data.conversations || [];

  return conversations.map((convo) => {
    const messages = extractMessages(convo.mapping || {});
    const firstMsg = messages[0];
    const lastMsg = messages[messages.length - 1];

    return {
      id: convo.id || generateId(),
      title: convo.title || 'Untitled Conversation',
      platform: 'chatgpt',
      model: extractModel(convo),
      created: convo.create_time
        ? new Date(convo.create_time * 1000).toISOString()
        : null,
      updated: convo.update_time
        ? new Date(convo.update_time * 1000).toISOString()
        : null,
      messages,
      messageCount: messages.length,
      wordCount: messages.reduce((acc, m) => acc + wordCount(m.content), 0),
      tags: [],
      links: [],
      notes: '',
      firstMessage: firstMsg?.content?.slice(0, 120) || '',
      lastActivity: lastMsg?.timestamp || null,
    };
  });
}

function extractMessages(mapping) {
  const messages = [];
  const visited = new Set();

  // Find root nodes (no parent or parent is null/"")
  const rootIds = Object.keys(mapping).filter((id) => {
    const node = mapping[id];
    return !node.parent || !mapping[node.parent];
  });

  function traverse(nodeId) {
    if (!nodeId || visited.has(nodeId)) return;
    visited.add(nodeId);

    const node = mapping[nodeId];
    if (!node) return;

    const msg = node.message;
    if (msg && msg.content && msg.author) {
      const parts = msg.content.parts || [];
      const text = parts
        .filter((p) => typeof p === 'string')
        .join('\n')
        .trim();

      if (text) {
        messages.push({
          id: msg.id || generateId(),
          role: msg.author.role === 'user' ? 'user' : 'assistant',
          content: text,
          timestamp: msg.create_time
            ? new Date(msg.create_time * 1000).toISOString()
            : null,
          model: msg.metadata?.model_slug || null,
        });
      }
    }

    // Traverse children
    if (node.children && node.children.length > 0) {
      // Follow the main branch (last child is usually the accepted response)
      traverse(node.children[node.children.length - 1]);
    }
  }

  rootIds.forEach(traverse);
  return messages.sort((a, b) => {
    if (!a.timestamp || !b.timestamp) return 0;
    return new Date(a.timestamp) - new Date(b.timestamp);
  });
}

function extractModel(convo) {
  if (!convo.mapping) return 'gpt';
  for (const node of Object.values(convo.mapping)) {
    const model = node?.message?.metadata?.model_slug;
    if (model) return model;
  }
  return 'gpt';
}

function wordCount(text) {
  if (!text) return 0;
  return text.trim().split(/\s+/).length;
}

function generateId() {
  return Math.random().toString(36).slice(2, 11);
}
