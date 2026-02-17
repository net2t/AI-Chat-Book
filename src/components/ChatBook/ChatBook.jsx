import { useState } from 'react';
import { Search, ChevronLeft, Tag, Link2, StickyNote, Copy, Check, User, Bot } from 'lucide-react';
import FilterSidebar from '../Filters/FilterSidebar';

export default function ChatBook({ chats, stats, filters, updateFilter, filtered, activeFilterCount, onUpdateChat, onAddTag, onRemoveTag, onAddLink, onRemoveLink, onUpdateNotes }) {
  const [selectedId, setSelectedId] = useState(null);
  const [sidePanel, setSidePanel] = useState('tags'); // tags | links | notes
  const [newTag, setNewTag] = useState('');
  const [newLink, setNewLink] = useState({ url: '', label: '' });
  const [copied, setCopied] = useState(null);

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

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 120px)', gap: 16 }}>
      {/* Filter Sidebar */}
      <FilterSidebar
        filters={filters}
        updateFilter={updateFilter}
        stats={stats}
        activeFilterCount={activeFilterCount}
      />

      {/* Conversation List */}
      <div className="glass-card" style={{ width: 320, flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <h3 className="font-display font-semibold" style={{ fontSize: '0.9rem' }}>
              Conversations
            </h3>
            <span style={{
              background: 'rgba(0,245,212,0.1)', color: 'var(--accent-cyan)',
              border: '1px solid rgba(0,245,212,0.2)',
              padding: '2px 8px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 600
            }}>
              {filtered.length}
            </span>
          </div>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input
              className="app-input"
              style={{ paddingLeft: 32, fontSize: '0.8rem' }}
              placeholder="Search conversations..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
            />
          </div>
        </div>

        <div className="scroll-panel" style={{ flex: 1, padding: 10 }}>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              No conversations match your filters
            </div>
          )}
          {filtered.map((chat) => (
            <div
              key={chat.id}
              className={`convo-item ${selectedId === chat.id ? 'selected' : ''}`}
              onClick={() => setSelectedId(chat.id)}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <span style={{ fontSize: 16, marginTop: 1, flexShrink: 0 }}>
                  {chat.platform === 'chatgpt' ? '🟢' : '🟠'}
                </span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontWeight: 500, fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 3 }}>
                    {chat.title || 'Untitled'}
                  </p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 5 }}>
                    {chat.firstMessage || 'No messages'}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.68rem' }}>
                      {chat.messageCount} msgs
                    </span>
                    {chat.created && (
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.68rem' }}>
                        · {formatDate(chat.created)}
                      </span>
                    )}
                    {chat.tags?.slice(0, 2).map((t) => (
                      <span key={t} style={{
                        background: 'rgba(181,123,238,0.12)', color: 'var(--accent-purple)',
                        fontSize: '0.65rem', padding: '1px 6px', borderRadius: 10
                      }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Viewer */}
      <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {!selected ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>💬</div>
            <p className="font-display font-semibold" style={{ color: 'var(--text-primary)', marginBottom: 6 }}>Select a Conversation</p>
            <p style={{ fontSize: '0.85rem' }}>Click any conversation from the list to read it</p>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <button onClick={() => setSelectedId(null)} className="btn-ghost" style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <ChevronLeft size={14} />
              </button>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 className="font-display font-semibold" style={{ fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {selected.title}
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.72rem' }}>
                  {selected.messageCount} messages · {selected.wordCount} words
                  {selected.created && ` · ${formatDateFull(selected.created)}`}
                  {selected.model && ` · ${selected.model}`}
                </p>
              </div>
              <div className={`badge badge-${selected.platform}`}>{selected.platform}</div>
              <button
                className="btn-ghost"
                style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem' }}
                onClick={() => handleCopy(selected.messages.map(m => `${m.role}: ${m.content}`).join('\n\n'), 'chat')}
              >
                {copied === 'chat' ? <Check size={14} /> : <Copy size={14} />}
                Copy
              </button>
            </div>

            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
              {/* Messages */}
              <div className="scroll-panel" style={{ flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {selected.messages.map((msg, i) => (
                  <div key={msg.id || i} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {/* Role indicator */}
                    <div style={{
                      display: 'flex',
                      justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                      alignItems: 'center',
                      gap: 6, marginBottom: 2
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        {msg.role === 'user' ? (
                          <>
                            <span style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>YOU</span>
                            <User size={12} style={{ color: 'var(--accent-cyan)' }} />
                          </>
                        ) : (
                          <>
                            <Bot size={12} style={{ color: 'var(--accent-purple)' }} />
                            <span style={{ fontSize: '0.7rem', color: 'var(--accent-purple)', fontWeight: 600 }}>AI</span>
                          </>
                        )}
                        {msg.timestamp && (
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                            {formatTime(msg.timestamp)}
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Bubble */}
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
                          {copied === (msg.id || i) ? <Check size={12} /> : <Copy size={12} />}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Side metadata panel */}
              <div style={{ width: 260, borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
                {/* Panel tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
                  {[
                    { id: 'tags', icon: <Tag size={13} />, label: 'Tags' },
                    { id: 'links', icon: <Link2 size={13} />, label: 'Links' },
                    { id: 'notes', icon: <StickyNote size={13} />, label: 'Notes' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setSidePanel(tab.id)}
                      style={{
                        flex: 1, padding: '10px 4px', background: 'transparent',
                        border: 'none', cursor: 'pointer',
                        color: sidePanel === tab.id ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                        borderBottom: sidePanel === tab.id ? '2px solid var(--accent-cyan)' : '2px solid transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                        fontSize: '0.75rem', fontWeight: 500, fontFamily: 'DM Sans'
                      }}
                    >
                      {tab.icon}{tab.label}
                    </button>
                  ))}
                </div>

                <div className="scroll-panel" style={{ flex: 1, padding: 14 }}>
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
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: 10 }}>
        {(chat.tags || []).length} tags on this conversation
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
        {(chat.tags || []).map((tag) => {
          const c = getColor(tag);
          return (
            <div key={tag} className="tag-chip" style={{ background: c.bg, color: c.color, border: `1px solid ${c.color}30` }}>
              #{tag}
              <button onClick={() => onRemove(tag)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, lineHeight: 1 }}>×</button>
            </div>
          );
        })}
        {!chat.tags?.length && (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>No tags yet</p>
        )}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <input className="app-input" placeholder="Add tag..." value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && onAdd()} style={{ fontSize: '0.78rem' }} />
        <button className="btn-primary" onClick={onAdd} style={{ padding: '8px 12px', whiteSpace: 'nowrap', fontSize: '0.75rem' }}>Add</button>
      </div>
    </div>
  );
}

function LinksPanel({ chat, newLink, setNewLink, onAdd, onRemove }) {
  return (
    <div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: 10 }}>
        Attach file links, docs, or references
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
        {(chat.links || []).map((link) => (
          <div key={link.id} style={{
            background: 'rgba(147,147,184,0.06)', borderRadius: 8, padding: '8px 10px',
            display: 'flex', alignItems: 'center', gap: 6
          }}>
            <Link2 size={12} style={{ color: 'var(--accent-cyan)', flexShrink: 0 }} />
            <a href={link.url} target="_blank" rel="noreferrer" style={{ flex: 1, color: 'var(--accent-cyan)', fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: 'none' }}>
              {link.label || link.url}
            </a>
            <button onClick={() => onRemove(link.id)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', flexShrink: 0 }}>×</button>
          </div>
        ))}
        {!chat.links?.length && <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>No links yet</p>}
      </div>
      <input className="app-input" placeholder="URL..." value={newLink.url} onChange={(e) => setNewLink((p) => ({ ...p, url: e.target.value }))} style={{ marginBottom: 6, fontSize: '0.78rem' }} />
      <input className="app-input" placeholder="Label (optional)..." value={newLink.label} onChange={(e) => setNewLink((p) => ({ ...p, label: e.target.value }))} style={{ marginBottom: 8, fontSize: '0.78rem' }} />
      <button className="btn-primary" onClick={onAdd} style={{ width: '100%', fontSize: '0.78rem' }}>Add Link</button>
    </div>
  );
}

function NotesPanel({ chat, onUpdate }) {
  return (
    <div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: 10 }}>
        Personal notes about this conversation
      </p>
      <textarea
        className="app-input"
        style={{ resize: 'none', minHeight: 200, fontSize: '0.8rem', lineHeight: 1.6 }}
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
