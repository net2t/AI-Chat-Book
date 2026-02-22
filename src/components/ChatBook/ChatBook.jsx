import { useState } from 'react';
import { Search, ChevronLeft, Tag, Link2, StickyNote, Copy, Check, User, Bot, FileSpreadsheet, Download, X } from 'lucide-react';
import FilterSidebar from '../Filters/FilterSidebar';

export default function ChatBook({ chats, stats, filters, updateFilter, filtered, activeFilterCount, onUpdateChat, onAddTag, onRemoveTag, onAddLink, onRemoveLink, onUpdateNotes }) {
  const [selectedId, setSelectedId] = useState(null);
  const [sidePanel, setSidePanel] = useState('tags');
  const [newTag, setNewTag] = useState('');
  const [newLink, setNewLink] = useState({ url: '', label: '' });
  const [copied, setCopied] = useState(null);
  const [sheetExported, setSheetExported] = useState(false);
  const [showSheetModal, setShowSheetModal] = useState(false);
  const [sheetScope, setSheetScope] = useState('all'); // 'all' | 'filtered' | 'selected'

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
      scope === 'selected' && selected
        ? [selected]
        : scope === 'filtered'
        ? filtered
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
            ? `"${s.replace(/"/g, '""')}"`
            : s;
        }).join(',')
      )
      .join('\n');

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-chat-book-sheet-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    setSheetExported(true);
    setShowSheetModal(false);
    setTimeout(() => setSheetExported(false), 2500);
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 80px)', gap: 14 }}>
      {/* Filter Sidebar */}
      <FilterSidebar
        filters={filters}
        updateFilter={updateFilter}
        stats={stats}
        activeFilterCount={activeFilterCount}
      />

      {/* Main Column: List + Viewer stacked vertically */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0, overflow: 'hidden' }}>

        {/* Top bar: search + sheet export button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input
              className="app-input"
              style={{ paddingLeft: 32, fontSize: '0.82rem' }}
              placeholder="Search conversations..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
            />
          </div>
          <span style={{
            background: 'rgba(0,245,212,0.1)', color: 'var(--accent-cyan)',
            border: '1px solid rgba(0,245,212,0.2)',
            padding: '5px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap'
          }}>
            {filtered.length} convos
          </span>
          <button
            onClick={() => setShowSheetModal(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              background: sheetExported ? 'rgba(6,214,160,0.15)' : 'rgba(34,197,94,0.12)',
              border: `1px solid ${sheetExported ? 'rgba(6,214,160,0.5)' : 'rgba(34,197,94,0.35)'}`,
              color: sheetExported ? '#06d6a0' : '#4ade80',
              padding: '7px 14px', borderRadius: 10, cursor: 'pointer',
              fontSize: '0.78rem', fontWeight: 600, whiteSpace: 'nowrap',
              transition: 'all 0.2s', fontFamily: 'DM Sans',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.2)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = sheetExported ? 'rgba(6,214,160,0.15)' : 'rgba(34,197,94,0.12)'; e.currentTarget.style.transform = 'none'; }}
          >
            <FileSpreadsheet size={15} />
            {sheetExported ? '✓ Exported!' : 'Export to Sheet'}
          </button>
        </div>

        {/* Conversation List — horizontal scrollable row */}
        <div className="glass-card" style={{ flexShrink: 0, overflow: 'hidden' }}>
          <div style={{ padding: '10px 16px 6px', borderBottom: '1px solid var(--border)' }}>
            <h3 className="font-display font-semibold" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              CONVERSATIONS
            </h3>
          </div>
          <div style={{ display: 'flex', overflowX: 'auto', padding: '10px 12px', gap: 10 }} className="scroll-panel">
            {filtered.length === 0 && (
              <div style={{ padding: '20px 16px', color: 'var(--text-secondary)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                No conversations match your filters
              </div>
            )}
            {filtered.map((chat) => (
              <div
                key={chat.id}
                className={`convo-item ${selectedId === chat.id ? 'selected' : ''}`}
                onClick={() => setSelectedId(chat.id)}
                style={{
                  minWidth: 220, maxWidth: 240, flexShrink: 0,
                  cursor: 'pointer', padding: '10px 12px', borderRadius: 12,
                  border: selectedId === chat.id ? '1px solid var(--accent-cyan)' : '1px solid var(--border)',
                  background: selectedId === chat.id ? 'rgba(0,245,212,0.06)' : 'rgba(255,255,255,0.02)',
                  transition: 'all 0.18s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <span style={{ fontSize: 14, marginTop: 1, flexShrink: 0 }}>
                    {chat.platform === 'chatgpt' ? '🟢' : '🟠'}
                  </span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>
                      {chat.title || 'Untitled'}
                    </p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 5 }}>
                      {chat.firstMessage || 'No messages'}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'nowrap' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.65rem' }}>{chat.messageCount} msgs</span>
                      {chat.created && (
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.65rem' }}>· {formatDate(chat.created)}</span>
                      )}
                      {chat.tags?.slice(0, 1).map((t) => (
                        <span key={t} style={{
                          background: 'rgba(181,123,238,0.12)', color: 'var(--accent-purple)',
                          fontSize: '0.62rem', padding: '1px 5px', borderRadius: 8
                        }}>#{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Viewer — takes remaining space */}
        <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {!selected ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
              <p className="font-display font-semibold" style={{ color: 'var(--text-primary)', marginBottom: 4 }}>Select a Conversation</p>
              <p style={{ fontSize: '0.82rem' }}>Click any card above to read it</p>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <button onClick={() => setSelectedId(null)} className="btn-ghost" style={{ padding: '5px 8px', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <ChevronLeft size={14} />
                </button>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h2 className="font-display font-semibold" style={{ fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {selected.title}
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
                    {selected.messageCount} messages · {selected.wordCount} words
                    {selected.created && ` · ${formatDateFull(selected.created)}`}
                    {selected.model && ` · ${selected.model}`}
                  </p>
                </div>
                <div className={`badge badge-${selected.platform}`}>{selected.platform}</div>
                <button
                  className="btn-ghost"
                  style={{ padding: '5px 10px', display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.72rem' }}
                  onClick={() => handleCopy(selected.messages.map(m => `${m.role}: ${m.content}`).join('\n\n'), 'chat')}
                >
                  {copied === 'chat' ? <Check size={13} /> : <Copy size={13} />}
                  Copy
                </button>
                {/* Per-chat Sheet Export */}
                <button
                  onClick={() => exportToSheet('selected')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
                    color: '#4ade80', padding: '5px 10px', borderRadius: 8, cursor: 'pointer',
                    fontSize: '0.72rem', fontWeight: 600, fontFamily: 'DM Sans',
                  }}
                  title="Export this conversation to spreadsheet"
                >
                  <FileSpreadsheet size={13} /> Sheet
                </button>
              </div>

              <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* Messages */}
                <div className="scroll-panel" style={{ flex: 1, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {selected.messages.map((msg, i) => (
                    <div key={msg.id || i} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        alignItems: 'center', gap: 5, marginBottom: 1
                      }}>
                        {msg.role === 'user' ? (
                          <>
                            <span style={{ fontSize: '0.68rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>YOU</span>
                            <User size={11} style={{ color: 'var(--accent-cyan)' }} />
                          </>
                        ) : (
                          <>
                            <Bot size={11} style={{ color: 'var(--accent-purple)' }} />
                            <span style={{ fontSize: '0.68rem', color: 'var(--accent-purple)', fontWeight: 600 }}>AI</span>
                          </>
                        )}
                        {msg.timestamp && (
                          <span style={{ fontSize: '0.63rem', color: 'var(--text-secondary)' }}>{formatTime(msg.timestamp)}</span>
                        )}
                      </div>
                      <div style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                        <div className={msg.role === 'user' ? 'bubble-user' : 'bubble-ai'}
                          style={{ position: 'relative', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                          {msg.content}
                          <button
                            onClick={() => handleCopy(msg.content, msg.id || i)}
                            style={{
                              position: 'absolute', top: 6, right: 6,
                              background: 'transparent', border: 'none',
                              color: 'var(--text-secondary)', cursor: 'pointer', opacity: 0,
                              transition: 'opacity 0.2s', padding: 2
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
                <div style={{ width: 240, borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
                    {[
                      { id: 'tags', icon: <Tag size={12} />, label: 'Tags' },
                      { id: 'links', icon: <Link2 size={12} />, label: 'Links' },
                      { id: 'notes', icon: <StickyNote size={12} />, label: 'Notes' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setSidePanel(tab.id)}
                        style={{
                          flex: 1, padding: '9px 4px', background: 'transparent',
                          border: 'none', cursor: 'pointer',
                          color: sidePanel === tab.id ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                          borderBottom: sidePanel === tab.id ? '2px solid var(--accent-cyan)' : '2px solid transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3,
                          fontSize: '0.72rem', fontWeight: 500, fontFamily: 'DM Sans'
                        }}
                      >
                        {tab.icon}{tab.label}
                      </button>
                    ))}
                  </div>
                  <div className="scroll-panel" style={{ flex: 1, padding: 12 }}>
                    {sidePanel === 'tags' && (
                      <TagPanel chat={selected} newTag={newTag} setNewTag={setNewTag} onAdd={handleAddTag} onRemove={(t) => onRemoveTag(selected.id, t)} />
                    )}
                    {sidePanel === 'links' && (
                      <LinksPanel chat={selected} newLink={newLink} setNewLink={setNewLink} onAdd={handleAddLink} onRemove={(id) => onRemoveLink(selected.id, id)} />
                    )}
                    {sidePanel === 'notes' && (
                      <NotesPanel chat={selected} onUpdate={(n) => onUpdateNotes(selected.id, n)} />
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Sheet Export Modal */}
      {showSheetModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
          zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="glass-card" style={{ width: 400, padding: 28, position: 'relative' }}>
            <button
              onClick={() => setShowSheetModal(false)}
              style={{ position: 'absolute', top: 14, right: 14, background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <div style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 10, width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileSpreadsheet size={22} style={{ color: '#4ade80' }} />
              </div>
              <div>
                <h3 className="font-display font-semibold" style={{ fontSize: '1rem' }}>Export to Sheet</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Download as CSV — open in Excel or Google Sheets</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { id: 'all', label: `All Conversations`, count: chats.length, desc: 'Export everything' },
                { id: 'filtered', label: `Filtered View`, count: filtered.length, desc: 'Only matching your current filters' },
                ...(selected ? [{ id: 'selected', label: `This Conversation`, count: 1, desc: selected.title }] : []),
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => exportToSheet(opt.id)}
                  style={{
                    background: sheetScope === opt.id ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${sheetScope === opt.id ? 'rgba(34,197,94,0.4)' : 'var(--border)'}`,
                    borderRadius: 12, padding: '12px 16px', cursor: 'pointer', textAlign: 'left',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    transition: 'all 0.15s', fontFamily: 'DM Sans',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(34,197,94,0.4)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = sheetScope === opt.id ? 'rgba(34,197,94,0.4)' : 'var(--border)'}
                >
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: 2 }}>{opt.label}</p>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{opt.desc}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ background: 'rgba(34,197,94,0.12)', color: '#4ade80', padding: '2px 9px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 600 }}>
                      {opt.count}
                    </span>
                    <Download size={14} style={{ color: '#4ade80' }} />
                  </div>
                </button>
              ))}
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', textAlign: 'center', marginTop: 14 }}>
              🔒 CSV with UTF-8 encoding — opens in Excel & Google Sheets
            </p>
          </div>
        </div>
      )}

      <style>{`
        .bubble-user:hover .copy-btn, .bubble-ai:hover .copy-btn { opacity: 1 !important; }
      `}</style>
    </div>
  );
}

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
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', marginBottom: 8 }}>
        {(chat.tags || []).length} tags on this conversation
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12 }}>
        {(chat.tags || []).map((tag) => {
          const c = getColor(tag);
          return (
            <div key={tag} className="tag-chip" style={{ background: c.bg, color: c.color, border: `1px solid ${c.color}30` }}>
              #{tag}
              <button onClick={() => onRemove(tag)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, lineHeight: 1 }}>×</button>
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
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', marginBottom: 8 }}>Attach links, docs, or references</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 12 }}>
        {(chat.links || []).map((link) => (
          <div key={link.id} style={{ background: 'rgba(147,147,184,0.06)', borderRadius: 7, padding: '7px 9px', display: 'flex', alignItems: 'center', gap: 5 }}>
            <Link2 size={11} style={{ color: 'var(--accent-cyan)', flexShrink: 0 }} />
            <a href={link.url} target="_blank" rel="noreferrer" style={{ flex: 1, color: 'var(--accent-cyan)', fontSize: '0.72rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: 'none' }}>
              {link.label || link.url}
            </a>
            <button onClick={() => onRemove(link.id)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', flexShrink: 0 }}>×</button>
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
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', marginBottom: 8 }}>Personal notes</p>
      <textarea
        className="app-input"
        style={{ resize: 'none', minHeight: 180, fontSize: '0.78rem', lineHeight: 1.6 }}
        placeholder="Write your notes here..."
        value={chat.notes || ''}
        onChange={(e) => onUpdate(e.target.value)}
      />
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
