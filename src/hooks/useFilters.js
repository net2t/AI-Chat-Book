import { useState, useMemo } from 'react';

const defaultFilters = {
  search: '',
  platform: 'all',
  model: 'all',
  tags: [],
  dateFrom: '',
  dateTo: '',
  sortBy: 'newest',
  minMessages: '',
};

export function useFilters(chats) {
  const [filters, setFilters] = useState(defaultFilters);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => setFilters(defaultFilters);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.platform !== 'all') count++;
    if (filters.model !== 'all') count++;
    if (filters.tags.length) count++;
    if (filters.dateFrom) count++;
    if (filters.dateTo) count++;
    if (filters.minMessages) count++;
    return count;
  }, [filters]);

  const filtered = useMemo(() => {
    let result = [...chats];

    // Search
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (c) =>
          c.title?.toLowerCase().includes(q) ||
          c.firstMessage?.toLowerCase().includes(q) ||
          c.notes?.toLowerCase().includes(q) ||
          c.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Platform
    if (filters.platform !== 'all') {
      result = result.filter((c) => c.platform === filters.platform);
    }

    // Model
    if (filters.model !== 'all') {
      result = result.filter((c) => c.model === filters.model);
    }

    // Tags (AND logic — must have ALL selected tags)
    if (filters.tags.length > 0) {
      result = result.filter((c) =>
        filters.tags.every((t) => c.tags?.includes(t))
      );
    }

    // Date from
    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom);
      result = result.filter(
        (c) => c.created && new Date(c.created) >= from
      );
    }

    // Date to
    if (filters.dateTo) {
      const to = new Date(filters.dateTo);
      to.setHours(23, 59, 59);
      result = result.filter(
        (c) => c.created && new Date(c.created) <= to
      );
    }

    // Min messages
    if (filters.minMessages) {
      const min = parseInt(filters.minMessages, 10);
      result = result.filter((c) => (c.messageCount || 0) >= min);
    }

    // Sort
    switch (filters.sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.created || 0) - new Date(a.created || 0));
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.created || 0) - new Date(b.created || 0));
        break;
      case 'longest':
        result.sort((a, b) => (b.messageCount || 0) - (a.messageCount || 0));
        break;
      case 'shortest':
        result.sort((a, b) => (a.messageCount || 0) - (b.messageCount || 0));
        break;
      case 'title':
        result.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        break;
      case 'words':
        result.sort((a, b) => (b.wordCount || 0) - (a.wordCount || 0));
        break;
    }

    return result;
  }, [chats, filters]);

  return { filters, filtered, updateFilter, resetFilters, activeFilterCount };
}
