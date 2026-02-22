import { useState } from 'react';
import {
  LayoutDashboard, BookOpen, Upload, Download,
  HelpCircle, Trash2, Github, ChevronLeft, ChevronRight, Menu
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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

  const sidebarWidth = sidebarCollapsed ? 60 : 220;

  return (
    <div className="app-wrapper gradient-bg" style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarWidth, flexShrink: 0,
        background: 'rgba(10, 10, 26, 0.97)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        padding: sidebarCollapsed ? '20px 8px' : '20px 12px',
        position: 'fixed', top: 0, left: 0, bottom: 0,
        backdropFilter: 'blur(20px)', zIndex: 50,
        transition: 'width 0.25s ease, padding 0.25s ease',
        overflow: 'hidden',
      }}>
        {/* Logo + Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'space-between', marginBottom: 24, paddingBottom: 4 }}>
          {!sidebarCollapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                background: 'linear-gradient(135deg, rgba(0,245,212,0.2), rgba(181,123,238,0.2))',
                border: '1px solid rgba(0,245,212,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16
              }}>📖</div>
              <div>
                <p className="font-display" style={{ fontWeight: 700, fontSize: '0.85rem', lineHeight: 1.2, whiteSpace: 'nowrap' }}>AI Chat Book</p>
                <p style={{ fontSize: '0.62rem', color: 'var(--text-secondary)' }}>v1.0.0</p>
              </div>
            </div>
          )}
          {sidebarCollapsed && (
            <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg, rgba(0,245,212,0.2), rgba(181,123,238,0.2))', border: '1px solid rgba(0,245,212,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>📖</div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{
              background: 'rgba(147,147,184,0.08)', border: '1px solid var(--border)',
              borderRadius: 8, width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text-secondary)', flexShrink: 0,
              marginLeft: sidebarCollapsed ? 0 : 6, marginTop: sidebarCollapsed ? 8 : 0,
            }}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
          </button>
        </div>

        {/* Stats */}
        {!sidebarCollapsed && stats.total > 0 && (
          <div style={{ background: 'rgba(0,245,212,0.06)', border: '1px solid rgba(0,245,212,0.12)', borderRadius: 10, padding: '8px 12px', marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Convos</span>
              <span style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>{stats.total}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Messages</span>
              <span style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--accent-purple)' }}>{stats.totalMessages?.toLocaleString()}</span>
            </div>
          </div>
        )}
        {sidebarCollapsed && stats.total > 0 && (
          <div style={{ textAlign: 'center', marginBottom: 14 }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>{stats.total}</div>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`nav-link ${activeTab === id ? 'active' : ''}`}
              style={{
                background: 'transparent', border: activeTab === id ? '1px solid rgba(0,245,212,0.15)' : '1px solid transparent',
                width: '100%', textAlign: 'left', cursor: 'pointer',
                justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                padding: sidebarCollapsed ? '10px' : '10px 14px',
                position: 'relative',
              }}
              title={sidebarCollapsed ? label : undefined}
            >
              <Icon size={16} style={{ flexShrink: 0 }} />
              {!sidebarCollapsed && <span>{label}</span>}
              {!sidebarCollapsed && id === 'import' && stats.total === 0 && (
                <span style={{ marginLeft: 'auto', width: 7, height: 7, borderRadius: '50%', background: 'var(--accent-amber)', boxShadow: '0 0 6px var(--accent-amber)' }} />
              )}
              {!sidebarCollapsed && id === 'chatbook' && activeFilterCount > 0 && (
                <span style={{ marginLeft: 'auto', background: 'var(--accent-purple)', color: 'white', width: 17, height: 17, borderRadius: '50%', fontSize: '0.62rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {activeFilterCount}
                </span>
              )}
              {sidebarCollapsed && id === 'chatbook' && activeFilterCount > 0 && (
                <span style={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-purple)' }} />
              )}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 5 }}>
          <a href="https://github.com/net2t/AI-Chat-Book" target="_blank" rel="noreferrer"
            className="nav-link" style={{ textDecoration: 'none', justifyContent: sidebarCollapsed ? 'center' : 'flex-start', padding: sidebarCollapsed ? '10px' : '10px 14px' }}
            title={sidebarCollapsed ? 'GitHub' : undefined}>
            <Github size={14} />
            {!sidebarCollapsed && <span>GitHub</span>}
          </a>
          {stats.total > 0 && (
            !showClearConfirm ? (
              <button onClick={() => setShowClearConfirm(true)}
                className="nav-link"
                style={{ color: 'var(--accent-rose)', width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', justifyContent: sidebarCollapsed ? 'center' : 'flex-start', padding: sidebarCollapsed ? '10px' : '10px 14px' }}
                title={sidebarCollapsed ? 'Clear All Data' : undefined}>
                <Trash2 size={14} />
                {!sidebarCollapsed && <span>Clear All Data</span>}
              </button>
            ) : (
              !sidebarCollapsed && (
                <div style={{ padding: '8px 10px', background: 'rgba(255,77,109,0.08)', border: '1px solid rgba(255,77,109,0.2)', borderRadius: 10 }}>
                  <p style={{ fontSize: '0.7rem', color: 'var(--accent-rose)', marginBottom: 7 }}>Delete all {stats.total} conversations?</p>
                  <div style={{ display: 'flex', gap: 5 }}>
                    <button onClick={() => { clearAll(); setShowClearConfirm(false); setActiveTab('guide'); }}
                      style={{ flex: 1, padding: '5px', background: 'rgba(255,77,109,0.2)', border: '1px solid rgba(255,77,109,0.3)', borderRadius: 7, color: 'var(--accent-rose)', fontSize: '0.7rem', cursor: 'pointer', fontFamily: 'DM Sans' }}>
                      Yes
                    </button>
                    <button onClick={() => setShowClearConfirm(false)}
                      style={{ flex: 1, padding: '5px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 7, color: 'var(--text-secondary)', fontSize: '0.7rem', cursor: 'pointer', fontFamily: 'DM Sans' }}>
                      No
                    </button>
                  </div>
                </div>
              )
            )
          )}
        </div>
      </aside>

      {/* Main */}
      <main style={{ marginLeft: sidebarWidth, flex: 1, padding: activeTab === 'chatbook' ? '20px 20px 0' : '28px 24px', minHeight: '100vh', transition: 'margin-left 0.25s ease', overflow: activeTab === 'chatbook' ? 'hidden' : 'auto', height: activeTab === 'chatbook' ? '100vh' : 'auto', display: 'flex', flexDirection: 'column' }}>
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
// updated: 2026-02-22b

