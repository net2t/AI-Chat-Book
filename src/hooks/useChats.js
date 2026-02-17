import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'ai_chat_book_data';

export function useChats() {
  const [chats, setChats] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setChats(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Could not load chats from storage', e);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
    } catch (e) {
      console.warn('Could not save chats to storage', e);
    }
  }, [chats, isLoaded]);

  const addChats = useCallback((newChats) => {
    setChats((prev) => {
      // Deduplicate by id
      const existingIds = new Set(prev.map((c) => c.id));
      const unique = newChats.filter((c) => !existingIds.has(c.id));
      return [...prev, ...unique];
    });
  }, []);

  const updateChat = useCallback((id, updates) => {
    setChats((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  }, []);

  const deleteChat = useCallback((id) => {
    setChats((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setChats([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const addTag = useCallback((chatId, tag) => {
    setChats((prev) =>
      prev.map((c) => {
        if (c.id !== chatId) return c;
        const tags = c.tags || [];
        if (tags.includes(tag)) return c;
        return { ...c, tags: [...tags, tag] };
      })
    );
  }, []);

  const removeTag = useCallback((chatId, tag) => {
    setChats((prev) =>
      prev.map((c) => {
        if (c.id !== chatId) return c;
        return { ...c, tags: (c.tags || []).filter((t) => t !== tag) };
      })
    );
  }, []);

  const addLink = useCallback((chatId, link) => {
    setChats((prev) =>
      prev.map((c) => {
        if (c.id !== chatId) return c;
        const links = c.links || [];
        return { ...c, links: [...links, { id: Date.now(), ...link }] };
      })
    );
  }, []);

  const removeLink = useCallback((chatId, linkId) => {
    setChats((prev) =>
      prev.map((c) => {
        if (c.id !== chatId) return c;
        return { ...c, links: (c.links || []).filter((l) => l.id !== linkId) };
      })
    );
  }, []);

  const updateNotes = useCallback((chatId, notes) => {
    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, notes } : c))
    );
  }, []);

  // Computed stats
  const stats = {
    total: chats.length,
    chatgpt: chats.filter((c) => c.platform === 'chatgpt').length,
    claude: chats.filter((c) => c.platform === 'claude').length,
    totalMessages: chats.reduce((a, c) => a + (c.messageCount || 0), 0),
    totalWords: chats.reduce((a, c) => a + (c.wordCount || 0), 0),
    allTags: [...new Set(chats.flatMap((c) => c.tags || []))],
    allModels: [...new Set(chats.map((c) => c.model).filter(Boolean))],
    dateRange: getDateRange(chats),
    byModel: getModelBreakdown(chats),
    byMonth: getMonthlyActivity(chats),
    byDay: getDailyActivity(chats),
  };

  return {
    chats,
    stats,
    isLoaded,
    addChats,
    updateChat,
    deleteChat,
    clearAll,
    addTag,
    removeTag,
    addLink,
    removeLink,
    updateNotes,
  };
}

function getDateRange(chats) {
  const dates = chats
    .map((c) => c.created)
    .filter(Boolean)
    .map((d) => new Date(d))
    .sort((a, b) => a - b);
  if (!dates.length) return { min: null, max: null };
  return { min: dates[0], max: dates[dates.length - 1] };
}

function getModelBreakdown(chats) {
  const counts = {};
  chats.forEach((c) => {
    const key = c.model || 'Unknown';
    counts[key] = (counts[key] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

function getMonthlyActivity(chats) {
  const counts = {};
  chats.forEach((c) => {
    if (!c.created) return;
    const d = new Date(c.created);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    counts[key] = (counts[key] || 0) + 1;
  });
  return Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({ month, count }));
}

function getDailyActivity(chats) {
  const counts = {};
  chats.forEach((c) => {
    if (!c.created) return;
    const key = new Date(c.created).toISOString().split('T')[0];
    counts[key] = (counts[key] || 0) + 1;
  });
  return counts;
}
