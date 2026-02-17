import { useState } from 'react';
import {
  LayoutDashboard, BookOpen, Upload, Download,
  HelpCircle, Trash2, Github
} from 'lucide-react';
import { useChats } from './hooks/useChats';
import { useFilters } from './hooks/useFilters';
import Dashboard from './components/Dashboard/Dashboard';
import ChatBook from './components/ChatBook/ChatBook';
import UploadPanel from './components/Upload/UploadPanel';
import ExportPanel from './components/Export/ExportPanel';
import Guide from './components/Shared/Guide';

const NAV_ITEMS = [
  { id: 'guide', label: 'Getting Started', icon: HelpCircle },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'chatbook', label: 'Chat Book', icon: BookOpen },
  { id: 'import', label: 'Import', icon: Upload },
  { id: 'export', label: 'Export', icon: Download },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('guide');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const {
    chats, stats, isLoaded,
    addChats, updateChat, clearAll,
    addTag, removeTag, addLink, removeLink, updateNotes
  } = useChats();

  const { filters, filtered, updateFilter, activeFilterCount } = useFilters(chats);

  const handleImport = (newChats) => {
    addChats(newChats);
    if (newChats.length > 0) setTimeout(() => setActiveTab('chatbook'), 1200);
  };

  return (
    <div className="app-wrapper gradient-bg" style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{
        width: 220, flexShrink: 0, background: 'rgba(10, 10, 26, 0.95)',
        borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column',
        padding: '20px 12px', position: 'fixed', top: 0, left: 0, bottom: 0,
        backdropFilter: 'blur(20px)', zIndex: 50,
      }}>
        <div style={{ padding: '4px 6px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, rgba(0,245,212,0.2), rgba(181,123,238,0.2))',
              border: '1px solid rgba(0,245,212,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18
            }}>📖</div>
            <div>
              <p className="font-display" style={{ fontWeight: 700, fontSize: '0.9rem', lineHeight: 1.2 }}>AI Chat Book</p>
              <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>v1.0.0</p>
            </div>
          </div>
        </div>

        {stats.total > 0 && (
          <div style={{ background: 'rgba(0,245,212,0.06)', border: '1px solid rgba(0,245,212,0.12)', borderRadius: 10, padding: '8px 12px', marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Conversations</span>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>{stats.total}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Messages</span>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--accent-purple)' }}>{stats.totalMessages.toLocaleString()}</span>
            </div>
          </div>
        )}

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`nav-link ${activeTab === id ? 'active' : ''}`}
              style={{ background: 'transparent', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}
            >
              <Icon size={16} />
              <span>{label}</span>
              {id === 'import' && stats.total === 0 && (
                <span style={{ marginLeft: 'auto', width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-amber)', boxShadow: '0 0 6px var(--accent-amber)' }} />
              )}
              {id === 'chatbook' && activeFilterCount > 0 && (
                <span style={{ marginLeft: 'auto', background: 'var(--accent-purple)', color: 'white', width: 18, height: 18, borderRadius: '50%', fontSize: '0.65rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {activeFilterCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <a href="https://github.com/yourusername/ai-chat-book" target="_blank" rel="noreferrer"
            className="nav-link" style={{ textDecoration: 'none' }}>
            <Github size={15} /><span>GitHub</span>
          </a>
          {stats.total > 0 && (
            !showClearConfirm ? (
              <button onClick={() => setShowClearConfirm(true)}
                className="nav-link"
                style={{ color: 'var(--accent-rose)', width: '100%', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <Trash2 size={15} /><span>Clear All Data</span>
              </button>
            ) : (
              <div style={{ padding: '8px 10px', background: 'rgba(255,77,109,0.08)', border: '1px solid rgba(255,77,109,0.2)', borderRadius: 10 }}>
                <p style={{ fontSize: '0.72rem', color: 'var(--accent-rose)', marginBottom: 8 }}>Delete all {stats.total} conversations?</p>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => { clearAll(); setShowClearConfirm(false); setActiveTab('guide'); }}
                    style={{ flex: 1, padding: '5px', background: 'rgba(255,77,109,0.2)', border: '1px solid rgba(255,77,109,0.3)', borderRadius: 7, color: 'var(--accent-rose)', fontSize: '0.72rem', cursor: 'pointer', fontFamily: 'DM Sans' }}>
                    Yes, delete
                  </button>
                  <button onClick={() => setShowClearConfirm(false)}
                    style={{ flex: 1, padding: '5px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 7, color: 'var(--text-secondary)', fontSize: '0.72rem', cursor: 'pointer', fontFamily: 'DM Sans' }}>
                    Cancel
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      </aside>

      <main style={{ marginLeft: 220, flex: 1, padding: '32px 28px', minHeight: '100vh' }}>
        {!isLoaded ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[1,2,3].map(i => <div key={i} className="shimmer" style={{ height: 80, borderRadius: 14 }} />)}
          </div>
        ) : (
          <>
            {activeTab === 'guide' && <Guide />}
            {activeTab === 'dashboard' && <Dashboard stats={stats} chats={chats} />}
            {activeTab === 'chatbook' && (
              <ChatBook
                chats={chats} stats={stats} filters={filters}
                updateFilter={updateFilter} filtered={filtered}
                activeFilterCount={activeFilterCount}
                onUpdateChat={updateChat}
                onAddTag={addTag} onRemoveTag={removeTag}
                onAddLink={addLink} onRemoveLink={removeLink}
                onUpdateNotes={updateNotes}
              />
            )}
            {activeTab === 'import' && <UploadPanel onImport={handleImport} existingCount={stats.total} />}
            {activeTab === 'export' && <ExportPanel chats={chats} filtered={filtered} stats={stats} />}
          </>
        )}
      </main>
    </div>
  );
}
