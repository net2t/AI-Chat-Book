import { SlidersHorizontal, X, RotateCcw } from 'lucide-react';

export default function FilterSidebar({ filters, updateFilter, stats, activeFilterCount, resetFilters }) {
  const allModels = stats?.allModels || [];
  const allTags = stats?.allTags || [];

  const toggleTag = (tag) => {
    const current = filters.tags || [];
    if (current.includes(tag)) {
      updateFilter('tags', current.filter((t) => t !== tag));
    } else {
      updateFilter('tags', [...current, tag]);
    }
  };

  return (
    <div className="glass-card scroll-panel" style={{ width: 220, flexShrink: 0, padding: '16px 14px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <SlidersHorizontal size={14} style={{ color: 'var(--accent-cyan)' }} />
          <span className="font-display font-semibold" style={{ fontSize: '0.85rem' }}>Filters</span>
          {activeFilterCount > 0 && (
            <span style={{ background: 'var(--accent-cyan)', color: 'var(--bg-primary)', width: 18, height: 18, borderRadius: '50%', fontSize: '0.65rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {activeFilterCount}
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={() => {
              updateFilter('platform', 'all');
              updateFilter('model', 'all');
              updateFilter('tags', []);
              updateFilter('dateFrom', '');
              updateFilter('dateTo', '');
              updateFilter('minMessages', '');
              updateFilter('search', '');
              updateFilter('sortBy', 'newest');
            }}
            style={{ background: 'none', border: 'none', color: 'var(--accent-rose)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.72rem' }}
          >
            <RotateCcw size={11} /> Reset
          </button>
        )}
      </div>

      {/* Sort */}
      <FilterSection label="Sort By">
        <select className="app-select" style={{ fontSize: '0.78rem', padding: '8px 12px' }} value={filters.sortBy} onChange={(e) => updateFilter('sortBy', e.target.value)}>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="longest">Most Messages</option>
          <option value="shortest">Fewest Messages</option>
          <option value="words">Most Words</option>
          <option value="title">Alphabetical</option>
        </select>
      </FilterSection>

      {/* Platform */}
      <FilterSection label="Platform">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {['all', 'chatgpt', 'claude'].map((p) => (
            <label key={p} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '5px 8px', borderRadius: 7, background: filters.platform === p ? 'rgba(0,245,212,0.08)' : 'transparent', transition: 'background 0.2s' }}>
              <input
                type="radio"
                name="platform"
                value={p}
                checked={filters.platform === p}
                onChange={() => updateFilter('platform', p)}
                style={{ accentColor: 'var(--accent-cyan)' }}
              />
              <span style={{ fontSize: '0.78rem', color: filters.platform === p ? 'var(--accent-cyan)' : 'var(--text-secondary)', textTransform: p === 'all' ? 'none' : 'capitalize' }}>
                {p === 'all' ? 'All Platforms' : p === 'chatgpt' ? '🟢 ChatGPT' : '🟠 Claude'}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Date Range */}
      <FilterSection label="Date Range">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div>
            <p style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginBottom: 3 }}>From</p>
            <input
              type="date"
              className="app-input"
              style={{ fontSize: '0.75rem', padding: '7px 10px', colorScheme: 'dark' }}
              value={filters.dateFrom}
              onChange={(e) => updateFilter('dateFrom', e.target.value)}
            />
          </div>
          <div>
            <p style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginBottom: 3 }}>To</p>
            <input
              type="date"
              className="app-input"
              style={{ fontSize: '0.75rem', padding: '7px 10px', colorScheme: 'dark' }}
              value={filters.dateTo}
              onChange={(e) => updateFilter('dateTo', e.target.value)}
            />
          </div>
        </div>
      </FilterSection>

      {/* Model */}
      {allModels.length > 0 && (
        <FilterSection label="Model">
          <select className="app-select" style={{ fontSize: '0.78rem', padding: '8px 12px' }} value={filters.model} onChange={(e) => updateFilter('model', e.target.value)}>
            <option value="all">All Models</option>
            {allModels.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </FilterSection>
      )}

      {/* Min Messages */}
      <FilterSection label="Min Messages">
        <input
          type="number"
          className="app-input"
          style={{ fontSize: '0.78rem', padding: '8px 12px' }}
          placeholder="e.g. 10"
          min="1"
          value={filters.minMessages}
          onChange={(e) => updateFilter('minMessages', e.target.value)}
        />
      </FilterSection>

      {/* Tags */}
      {allTags.length > 0 && (
        <FilterSection label="Tags">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {allTags.map((tag) => {
              const active = (filters.tags || []).includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className="tag-chip"
                  style={{
                    background: active ? 'rgba(181,123,238,0.2)' : 'rgba(147,147,184,0.08)',
                    color: active ? 'var(--accent-purple)' : 'var(--text-secondary)',
                    border: `1px solid ${active ? 'rgba(181,123,238,0.4)' : 'transparent'}`,
                    fontSize: '0.7rem'
                  }}
                >
                  #{tag}
                  {active && <X size={10} />}
                </button>
              );
            })}
          </div>
        </FilterSection>
      )}
    </div>
  );
}

function FilterSection({ label, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <p style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
        {label}
      </p>
      {children}
    </div>
  );
}
