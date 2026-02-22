import { useState } from 'react';
import {
  Search, Tag, Link2, StickyNote, Copy, Check,
  User, Bot, FileSpreadsheet, Download, X,
  SlidersHorizontal, RotateCcw, ChevronDown, ChevronUp
} from 'lucide-react';

// ─── Markdown/code renderer ───────────────────────────────────────────────────
function renderMessage(text) {
  if (!text) return null;
  const lines = text.split('\n');
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    if (line.startsWith('```')) {
      const lang = line.slice(3).trim();
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <div key={i} style={{ position: 'relative', margin: '10px 0' }}>
          {lang && (
            <div style={{
              background: 'rgba(0,245,212,0.08)', borderRadius: '8px 8px 0 0',
              padding: '4px 12px', fontSize: '0.68rem', color: 'var(--accent-cyan)',
              fontFamily: 'JetBrains Mono, monospace', fontWeight: 600,
              borderBottom: '1px solid rgba(0,245,212,0.15)',
              border: '1px solid rgba(0,245,212,0.15)', borderBottom: 'none',
            }}>{lang}</div>
          )}
          <pre style={{
            background: 'rgba(5,5,13,0.9)', border: '1px solid rgba(0,245,212,0.2)',
            borderRadius: lang ? '0 0 8px 8px' : '8px',
            padding: '12px 14px', margin: 0,
            fontFamily: 'JetBrains Mono, monospace', fontSize: '0.78rem',
            color: '#e0e0eb', overflowX: 'auto', lineHeight: 1.6,
            whiteSpace: 'pre', wordBreak: 'normal',
          }}>
            <code>{codeLines.join('\n')}</code>
          </pre>
        </div>
      );
      i++;
      continue;
    }

    // Inline code, bold, italic in normal lines
    if (line.trim() === '') {
      elements.push(<div key={i} style={{ height: 6 }} />);
    } else {
      elements.push(
        <p key={i} style={{ margin: '3px 0', lineHeight: 1.65 }}
          dangerouslySetInnerHTML={{ __html: renderInline(line) }}
        />
      );
    }
    i++;
  }
  return <div>{elements}</div>;
}

function renderInline(text) {
  // Escape HTML first
  let s = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Bold **text**
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Italic *text*
  s = s.replace(/\*(.+?)\*/g, '<em>$1</em>');
  // Inline code `text`
  s = s.replace(/`([^`]+)`/g, '<code style="background:rgba(0,245,212,0.1);color:#00f5d4;padding:1px 6px;border-radius:4px;font-family:JetBrains Mono,monospace;font-size:0.82em">$1</code>');
  // Headers
  s = s.replace(/^### (.+)/, '<strong style="font-size:0.95em;color:#e0e0eb">$1</strong>');
  s = s.replace(/^## (.+)/, '<strong style="font-size:1em;color:#e0e0eb">$1</strong>');
  s = s.replace(/^# (.+)/, '<strong style="font-size:1.05em;color:#e0e0eb">$1</strong>');
  // Bullet points
  s = s.replace(/^[\-\*] (.+)/, '&nbsp;&nbsp;• $1');
  // Numbered lists
  s = s.replace(/^(\d+)\. (.+)/, '&nbsp;&nbsp;$1. $2');

  return s;
}
// ─────────────────────────────────────────────────────────────────────────────

export default function ChatBook({ chats, stats, filters, updateFilter, filtered, activeFilterCount, onUpdateChat, onAddTag, onRemoveTag, onAddLink, onRemoveLink, onUpdateNotes }) {
  const [selectedId, setSelectedId] = useState(null);
  const [sidePanel, setSidePanel] = useState('tags');
  const [newTag, setNewTag] = useState('');
  const [newLink, setNewLink] = useState({ url: '', label: '' });
  const [copied, setCopied] = useState(null);
  const [sheetExported, setSheetExported] = useState(false);
  const [showSheetModal, setShowSheetModal] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const selected = filtered.find((c) => c.id === selectedId);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  const handleAddTag = () => {
    if (!newTag.trim() || !selected) return;
    onAddTag(selected.id, newTag.trim().toLowerCase());
    setNewTag('');
  };

  const handleAddLink = () => {
    if (!newLink.url.trim() || !selected) return;
    onAddLink(selected.id, { url: newLink.url.trim(), label: newLink.label.trim() || newLink.url.trim() });
    setNewLink({ url: '', label: '' });
  };

  const exportToSheet = (scope) => {
    const data =
      scope === 'selected' && selected ? [selected]
      : scope === 'filtered' ? filtered
      : chats;

    const headers = ['Title', 'Platform', 'Model', 'Created', 'Messages', 'Words', 'Tags', 'Notes', 'First Message'];
    const rows = data.map((c) => [
      c.title || 'Untitled',
      c.platform || '',
      c.model || '',
      c.created ? new Date(c.created).toLocaleDateString() : '',
      c.messageCount || 0,
      c.wordCount || 0,
      (c.tags || []).join('; '),
      (c.notes || '').replace(/\n/g, ' '),
      (c.firstMessage || '').slice(0, 300),
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((cell) => {
          const s = String(cell);
          return s.includes(',') || s.includes('"') || s.includes('\n')
            ? `"${s.replace(/"/g, '""')}"` : s;
        }).join(',')
      ).join('\n');

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-chat-book-${scope}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setSheetExported(true);
    setShowSheetModal(false);
    setTimeout(() => setSheetExported(false), 2500);
  };

  const resetFilters = () => {
    ['platform','model','tags','dateFrom','dateTo','minMessages','search','sortBy'].forEach(k =>
      updateFilter(k, k === 'tags' ? [] : k === 'sortBy' ? 'newest' : k === 'platform' || k === 'model' ? 'all' : '')
    );
  };

  const allModels = stats?.allModels || [];
  const allTags = stats?.allTags || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, gap: 10, paddingBottom: 12 }}>

      {/* ── TOP BAR: Search + Sheet Export + Filter Toggle ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
          <input
            className="app-input"
            style={{ paddingLeft: 34, fontSize: '0.83rem' }}
            placeholder="Search conversations..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
          />
        </div>

        {/* Count badge */}
        <span style={{
          background: 'rgba(0,245,212,0.1)', color: 'var(--accent-cyan)',
          border: '1px solid rgba(0,245,212,0.25)', padding: '7px 13px',
          borderRadius: 10, fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap'
        }}>
          {filtered.length} / {chats.length}
        </span>

        {/* Filter toggle */}
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: filtersOpen ? 'rgba(0,245,212,0.1)' : 'rgba(147,147,184,0.08)',
            border: `1px solid ${filtersOpen ? 'rgba(0,245,212,0.3)' : 'var(--border)'}`,
            color: filtersOpen ? 'var(--accent-cyan)' : 'var(--text-secondary)',
            padding: '7px 13px', borderRadius: 10, cursor: 'pointer',
            fontSize: '0.78rem', fontWeight: 600, fontFamily: 'DM Sans', whiteSpace: 'nowrap',
          }}
        >
          <SlidersHorizontal size={14} />
          Filters
          {activeFilterCount > 0 && (
            <span style={{ background: 'var(--accent-cyan)', color: 'var(--bg-primary)', borderRadius: '50%', width: 17, height: 17, fontSize: '0.62rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {activeFilterCount}
            </span>
          )}
          {filtersOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>

        {/* Sheet Export button */}
        <button
          onClick={() => setShowSheetModal(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            background: sheetExported ? 'rgba(6,214,160,0.15)' : 'rgba(34,197,94,0.12)',
            border: `1px solid ${sheetExported ? 'rgba(6,214,160,0.5)' : 'rgba(34,197,94,0.35)'}`,
            color: sheetExported ? '#06d6a0' : '#4ade80',
            padding: '7px 14px', borderRadius: 10, cursor: 'pointer',
            fontSize: '0.78rem', fontWeight: 700, whiteSpace: 'nowrap', fontFamily: 'DM Sans',
            transition: 'all 0.2s', boxShadow: '0 0 12px rgba(34,197,94,0.1)',
          }}
        >
          <FileSpreadsheet size={15} />
          {sheetExported ? '✓ Exported!' : 'Export to Sheet'}
        </button>
      </div>

      {/* ── FILTER BAR (collapsible) ── */}
      {filtersOpen && (
        <div className="glass-card" style={{ padding: '14px 18px', flexShrink: 0 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-end' }}>

            {/* Sort */}
            <div style={{ minWidth: 140 }}>
              <label style={labelStyle}>Sort By</label>
              <select className="app-select" style={{ fontSize: '0.78rem', padding: '7px 11px' }} value={filters.sortBy} onChange={(e) => updateFilter('sortBy', e.target.value)}>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="longest">Most Messages</option>
                <option value="shortest">Fewest Messages</option>
                <option value="words">Most Words</option>
                <option value="title">Alphabetical</option>
              </select>
            </div>

            {/* Platform */}
            <div style={{ minWidth: 120 }}>
              <label style={labelStyle}>Platform</label>
              <div style={{ display: 'flex', gap: 5 }}>
                {['all','chatgpt','claude'].map((p) => (
                  <button key={p} onClick={() => updateFilter('platform', p)}
                    style={{
                      padding: '5px 10px', borderRadius: 8, cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600, fontFamily: 'DM Sans',
                      background: filters.platform === p ? 'rgba(0,245,212,0.12)' : 'transparent',
                      border: `1px solid ${filters.platform === p ? 'rgba(0,245,212,0.4)' : 'var(--border)'}`,
                      color: filters.platform === p ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                    }}>
                    {p === 'all' ? 'All' : p === 'chatgpt' ? '🟢 GPT' : '🟠 Claude'}
                  </button>
                ))}
              </div>
            </div>

            {/* Date From */}
            <div style={{ minWidth: 130 }}>
              <label style={labelStyle}>From</label>
              <input type="date" className="app-input" style={{ fontSize: '0.75rem', padding: '7px 10px', colorScheme: 'dark' }} value={filters.dateFrom} onChange={(e) => updateFilter('dateFrom', e.target.value)} />
            </div>

            {/* Date To */}
            <div style={{ minWidth: 130 }}>
              <label style={labelStyle}>To</label>
              <input type="date" className="app-input" style={{ fontSize: '0.75rem', padding: '7px 10px', colorScheme: 'dark' }} value={filters.dateTo} onChange={(e) => updateFilter('dateTo', e.target.value)} />
            </div>

            {/* Model */}
            {allModels.length > 0 && (
              <div style={{ minWidth: 140 }}>
                <label style={labelStyle}>Model</label>
                <select className="app-select" style={{ fontSize: '0.78rem', padding: '7px 11px' }} value={filters.model} onChange={(e) => updateFilter('model', e.target.value)}>
                  <option value="all">All Models</option>
                  {allModels.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            )}

            {/* Min Messages */}
            <div style={{ minWidth: 100 }}>
              <label style={labelStyle}>Min Msgs</label>
              <input type="number" className="app-input" style={{ fontSize: '0.78rem', padding: '7px 10px' }} placeholder="e.g. 5" min="1" value={filters.minMessages} onChange={(e) => updateFilter('minMessages', e.target.value)} />
            </div>

            {/* Tags */}
            {allTags.length > 0 && (
              <div style={{ flex: 1, minWidth: 160 }}>
                <label style={labelStyle}>Tags</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {allTags.map((tag) => {
                    const active = (filters.tags || []).includes(tag);
                    return (
                      <button key={tag} onClick={() => {
                        const cur = filters.tags || [];
                        updateFilter('tags', active ? cur.filter(t => t !== tag) : [...cur, tag]);
                      }}
                        className="tag-chip"
                        style={{ background: active ? 'rgba(181,123,238,0.2)' : 'rgba(147,147,184,0.08)', color: active ? 'var(--accent-purple)' : 'var(--text-secondary)', border: `1px solid ${active ? 'rgba(181,123,238,0.4)' : 'transparent'}`, fontSize: '0.7rem' }}>
                        #{tag}{active && <X size={10} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Reset */}
            {activeFilterCount > 0 && (
              <button onClick={resetFilters} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,77,109,0.1)', border: '1px solid rgba(255,77,109,0.3)', color: 'var(--accent-rose)', padding: '7px 12px', borderRadius: 8, cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, fontFamily: 'DM Sans', whiteSpace: 'nowrap' }}>
                <RotateCcw size={12} /> Reset
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── CONVERSATION CARDS (horizontal scroll) ── */}
      <div className="glass-card" style={{ flexShrink: 0 }}>
        <div style={{ padding: '8px 14px 5px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Conversations
          </span>
        </div>
        <div style={{ display: 'flex', overflowX: 'auto', padding: '10px 12px', gap: 10 }}>
          {filtered.length === 0 && (
            <div style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '0.83rem', whiteSpace: 'nowrap' }}>
              No conversations match your filters
            </div>
          )}
          {filtered.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setSelectedId(chat.id)}
              style={{
                minWidth: 210, maxWidth: 230, flexShrink: 0, cursor: 'pointer',
                padding: '10px 12px', borderRadius: 12,
                border: `1px solid ${selectedId === chat.id ? 'var(--accent-cyan)' : 'var(--border)'}`,
                background: selectedId === chat.id ? 'rgba(0,245,212,0.07)' : 'rgba(255,255,255,0.02)',
                transition: 'all 0.18s',
                boxShadow: selectedId === chat.id ? '0 0 16px rgba(0,245,212,0.12)' : 'none',
              }}
              onMouseEnter={e => { if (selectedId !== chat.id) e.currentTarget.style.borderColor = 'rgba(147,147,184,0.25)'; }}
              onMouseLeave={e => { if (selectedId !== chat.id) e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7 }}>
                <span style={{ fontSize: 13, marginTop: 1, flexShrink: 0 }}>
                  {chat.platform === 'chatgpt' ? '🟢' : '🟠'}
                </span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: '0.78rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2, color: 'var(--text-primary)' }}>
                    {chat.title || 'Untitled'}
                  </p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.68rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 5 }}>
                    {chat.firstMessage || 'No messages'}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.63rem' }}>{chat.messageCount} msgs</span>
                    {chat.created && <span style={{ color: 'var(--text-secondary)', fontSize: '0.63rem' }}>· {formatDate(chat.created)}</span>}
                    {chat.tags?.[0] && (
                      <span style={{ background: 'rgba(181,123,238,0.12)', color: 'var(--accent-purple)', fontSize: '0.6rem', padding: '1px 5px', borderRadius: 6 }}>#{chat.tags[0]}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CHAT VIEWER ── */}
      <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
        {!selected ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: 44, marginBottom: 10 }}>💬</div>
            <p className="font-display font-semibold" style={{ color: 'var(--text-primary)', marginBottom: 4, fontSize: '1rem' }}>Select a Conversation</p>
            <p style={{ fontSize: '0.82rem' }}>Click any card above to read it</p>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div style={{ padding: '10px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
              <button onClick={() => setSelectedId(null)} className="btn-ghost" style={{ padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem' }}>
                ✕
              </button>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 className="font-display font-semibold" style={{ fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {selected.title}
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.68rem' }}>
                  {selected.messageCount} msgs · {selected.wordCount} words
                  {selected.created && ` · ${formatDateFull(selected.created)}`}
                  {selected.model && ` · ${selected.model}`}
                </p>
              </div>
              <div className={`badge badge-${selected.platform}`}>{selected.platform}</div>
              <button className="btn-ghost" style={{ padding: '5px 10px', display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.72rem' }}
                onClick={() => handleCopy(selected.messages.map(m => `${m.role}: ${m.content}`).join('\n\n'), 'chat')}>
                {copied === 'chat' ? <Check size={13} /> : <Copy size={13} />} Copy All
              </button>
              {/* Sheet export for this conversation */}
              <button
                onClick={() => exportToSheet('selected')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.35)',
                  color: '#4ade80', padding: '5px 11px', borderRadius: 8, cursor: 'pointer',
                  fontSize: '0.72rem', fontWeight: 700, fontFamily: 'DM Sans',
                }}
                title="Export this chat to spreadsheet"
              >
                <FileSpreadsheet size={13} /> Sheet
              </button>
            </div>

            <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
              {/* Messages */}
              <div className="scroll-panel" style={{ flex: 1, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto' }}>
                {selected.messages.map((msg, i) => (
                  <div key={msg.id || i}>
                    {/* Role label */}
                    <div style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                      {msg.role === 'user' ? (
                        <><span style={{ fontSize: '0.68rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>YOU</span><User size={11} style={{ color: 'var(--accent-cyan)' }} /></>
                      ) : (
                        <><Bot size={11} style={{ color: 'var(--accent-purple)' }} /><span style={{ fontSize: '0.68rem', color: 'var(--accent-purple)', fontWeight: 700 }}>AI</span></>
                      )}
                      {msg.timestamp && <span style={{ fontSize: '0.62rem', color: 'var(--text-secondary)' }}>{formatTime(msg.timestamp)}</span>}
                    </div>
                    {/* Bubble */}
                    <div style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                      <div
                        className={msg.role === 'user' ? 'bubble-user' : 'bubble-ai'}
                        style={{ position: 'relative', wordBreak: 'break-word', maxWidth: msg.role === 'user' ? '78%' : '90%' }}
                      >
                        {renderMessage(msg.content)}
                        <button
                          onClick={() => handleCopy(msg.content, msg.id || i)}
                          style={{
                            position: 'absolute', top: 6, right: 6,
                            background: 'rgba(10,10,26,0.7)', border: '1px solid var(--border)',
                            color: 'var(--text-secondary)', cursor: 'pointer', opacity: 0,
                            transition: 'opacity 0.2s', padding: '2px 5px', borderRadius: 5,
                            fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: 3,
                          }}
                          className="copy-btn"
                        >
                          {copied === (msg.id || i) ? <Check size={11} /> : <Copy size={11} />}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Side metadata panel */}
              <div style={{ width: 230, borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
                  {[
                    { id: 'tags', icon: <Tag size={12} />, label: 'Tags' },
                    { id: 'links', icon: <Link2 size={12} />, label: 'Links' },
                    { id: 'notes', icon: <StickyNote size={12} />, label: 'Notes' },
                  ].map((tab) => (
                    <button key={tab.id} onClick={() => setSidePanel(tab.id)}
                      style={{
                        flex: 1, padding: '9px 4px', background: 'transparent', border: 'none', cursor: 'pointer',
                        color: sidePanel === tab.id ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                        borderBottom: `2px solid ${sidePanel === tab.id ? 'var(--accent-cyan)' : 'transparent'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3,
                        fontSize: '0.72rem', fontWeight: 500, fontFamily: 'DM Sans',
                      }}>
                      {tab.icon}{tab.label}
                    </button>
                  ))}
                </div>
                <div className="scroll-panel" style={{ flex: 1, padding: 12, overflowY: 'auto' }}>
                  {sidePanel === 'tags' && <TagPanel chat={selected} newTag={newTag} setNewTag={setNewTag} onAdd={handleAddTag} onRemove={(t) => onRemoveTag(selected.id, t)} />}
                  {sidePanel === 'links' && <LinksPanel chat={selected} newLink={newLink} setNewLink={setNewLink} onAdd={handleAddLink} onRemove={(id) => onRemoveLink(selected.id, id)} />}
                  {sidePanel === 'notes' && <NotesPanel chat={selected} onUpdate={(n) => onUpdateNotes(selected.id, n)} />}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── SHEET EXPORT MODAL ── */}
      {showSheetModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={(e) => e.target === e.currentTarget && setShowSheetModal(false)}>
          <div className="glass-card" style={{ width: 420, padding: 28, position: 'relative' }}>
            <button onClick={() => setShowSheetModal(false)} style={{ position: 'absolute', top: 14, right: 14, background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <X size={16} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 10, width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileSpreadsheet size={22} style={{ color: '#4ade80' }} />
              </div>
              <div>
                <h3 className="font-display font-semibold" style={{ fontSize: '1rem', marginBottom: 2 }}>Export to Sheet</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.73rem' }}>CSV — opens in Excel or Google Sheets</p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {[
                { id: 'all', label: 'All Conversations', count: chats.length, desc: 'Export everything in your library' },
                { id: 'filtered', label: 'Filtered View', count: filtered.length, desc: 'Only what matches your current filters' },
                ...(selected ? [{ id: 'selected', label: 'This Conversation Only', count: 1, desc: selected.title?.slice(0, 45) + (selected.title?.length > 45 ? '…' : '') }] : []),
              ].map((opt) => (
                <button key={opt.id} onClick={() => exportToSheet(opt.id)}
                  style={{
                    background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)',
                    borderRadius: 12, padding: '12px 16px', cursor: 'pointer', textAlign: 'left',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    transition: 'all 0.15s', fontFamily: 'DM Sans',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(34,197,94,0.4)'; e.currentTarget.style.background = 'rgba(34,197,94,0.06)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                >
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: 2 }}>{opt.label}</p>
                    <p style={{ fontSize: '0.71rem', color: 'var(--text-secondary)' }}>{opt.desc}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginLeft: 12 }}>
                    <span style={{ background: 'rgba(34,197,94,0.12)', color: '#4ade80', padding: '2px 9px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 700 }}>{opt.count}</span>
                    <Download size={14} style={{ color: '#4ade80' }} />
                  </div>
                </button>
              ))}
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.68rem', textAlign: 'center', marginTop: 14 }}>
              🔒 100% local — your data never leaves your browser
            </p>
          </div>
        </div>
      )}

      <style>{`
        .bubble-user:hover .copy-btn,
        .bubble-ai:hover .copy-btn { opacity: 1 !important; }
        .bubble-ai pre { max-width: 100%; }
      `}</style>
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 };

function TagPanel({ chat, newTag, setNewTag, onAdd, onRemove }) {
  const TAG_COLORS = [
    { bg: 'rgba(0,245,212,0.12)', color: '#00f5d4' },
    { bg: 'rgba(181,123,238,0.12)', color: '#b57bee' },
    { bg: 'rgba(255,190,11,0.12)', color: '#ffbe0b' },
    { bg: 'rgba(255,77,109,0.12)', color: '#ff4d6d' },
    { bg: 'rgba(6,214,160,0.12)', color: '#06d6a0' },
  ];
  const getColor = (tag) => TAG_COLORS[tag.charCodeAt(0) % TAG_COLORS.length];
  return (
    <div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', marginBottom: 8 }}>{(chat.tags || []).length} tags</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12 }}>
        {(chat.tags || []).map((tag) => {
          const c = getColor(tag);
          return (
            <div key={tag} className="tag-chip" style={{ background: c.bg, color: c.color, border: `1px solid ${c.color}30` }}>
              #{tag}
              <button onClick={() => onRemove(tag)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0 }}>×</button>
            </div>
          );
        })}
        {!chat.tags?.length && <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>No tags yet</p>}
      </div>
      <div style={{ display: 'flex', gap: 5 }}>
        <input className="app-input" placeholder="Add tag..." value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && onAdd()} style={{ fontSize: '0.75rem' }} />
        <button className="btn-primary" onClick={onAdd} style={{ padding: '7px 10px', fontSize: '0.72rem' }}>Add</button>
      </div>
    </div>
  );
}

function LinksPanel({ chat, newLink, setNewLink, onAdd, onRemove }) {
  return (
    <div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', marginBottom: 8 }}>Attached links</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 12 }}>
        {(chat.links || []).map((link) => (
          <div key={link.id} style={{ background: 'rgba(147,147,184,0.06)', borderRadius: 7, padding: '7px 9px', display: 'flex', alignItems: 'center', gap: 5 }}>
            <Link2 size={11} style={{ color: 'var(--accent-cyan)', flexShrink: 0 }} />
            <a href={link.url} target="_blank" rel="noreferrer" style={{ flex: 1, color: 'var(--accent-cyan)', fontSize: '0.72rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: 'none' }}>{link.label || link.url}</a>
            <button onClick={() => onRemove(link.id)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>×</button>
          </div>
        ))}
        {!chat.links?.length && <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>No links yet</p>}
      </div>
      <input className="app-input" placeholder="URL..." value={newLink.url} onChange={(e) => setNewLink((p) => ({ ...p, url: e.target.value }))} style={{ marginBottom: 5, fontSize: '0.75rem' }} />
      <input className="app-input" placeholder="Label (optional)..." value={newLink.label} onChange={(e) => setNewLink((p) => ({ ...p, label: e.target.value }))} style={{ marginBottom: 7, fontSize: '0.75rem' }} />
      <button className="btn-primary" onClick={onAdd} style={{ width: '100%', fontSize: '0.75rem' }}>Add Link</button>
    </div>
  );
}

function NotesPanel({ chat, onUpdate }) {
  return (
    <div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', marginBottom: 8 }}>Personal notes</p>
      <textarea className="app-input" style={{ resize: 'none', minHeight: 180, fontSize: '0.78rem', lineHeight: 1.6 }} placeholder="Write your notes here..." value={chat.notes || ''} onChange={(e) => onUpdate(e.target.value)} />
    </div>
  );
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function formatDateFull(d) {
  return new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}
function formatTime(d) {
  return new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}
