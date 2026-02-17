import { useState } from 'react';
import { Download, FileText, FileJson, CheckCircle, Filter } from 'lucide-react';

export default function ExportPanel({ chats, filtered, stats }) {
  const [exported, setExported] = useState(null);

  const exportCSV = (data, filename) => {
    const headers = ['id', 'title', 'platform', 'model', 'created', 'updated', 'messageCount', 'wordCount', 'tags', 'notes', 'firstMessage'];
    const rows = data.map((c) => headers.map((h) => {
      const v = c[h];
      if (Array.isArray(v)) return `"${v.join(', ')}"`;
      if (typeof v === 'string' && (v.includes(',') || v.includes('"') || v.includes('\n'))) {
        return `"${v.replace(/"/g, '""')}"`;
      }
      return v ?? '';
    }));
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadFile(csv, filename, 'text/csv');
    setExported('csv');
    setTimeout(() => setExported(null), 2000);
  };

  const exportJSON = (data, filename) => {
    const json = JSON.stringify(data, null, 2);
    downloadFile(json, filename, 'application/json');
    setExported('json');
    setTimeout(() => setExported(null), 2000);
  };

  const exportMessagesCSV = (data, filename) => {
    const headers = ['conversation_id', 'title', 'platform', 'model', 'created', 'role', 'message', 'timestamp'];
    const rows = [];
    data.forEach((c) => {
      (c.messages || []).forEach((m) => {
        rows.push([
          c.id, `"${(c.title || '').replace(/"/g, '""')}"`, c.platform, c.model || '', c.created || '',
          m.role, `"${(m.content || '').replace(/"/g, '""').slice(0, 500)}"`, m.timestamp || ''
        ]);
      });
    });
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadFile(csv, filename, 'text/csv');
    setExported('messages');
    setTimeout(() => setExported(null), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 anim-fade-up">
        <h2 className="font-display text-3xl font-bold mb-2">
          <span className="gradient-text-cyan">Export</span> Your Data
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Download your conversations in multiple formats. All exports include your tags, notes and links.
        </p>
      </div>

      {/* Summary */}
      <div className="glass-card p-5 mb-6 anim-fade-up anim-delay-1" style={{ borderColor: 'rgba(0,245,212,0.15)' }}>
        <div style={{ display: 'flex', gap: 24 }}>
          <StatItem label="Total Conversations" value={stats.total} />
          <StatItem label="Filtered (Current View)" value={filtered.length} accent />
          <StatItem label="Total Messages" value={stats.totalMessages} />
          <StatItem label="Total Words" value={stats.totalWords?.toLocaleString()} />
        </div>
      </div>

      {/* Export all */}
      <div className="anim-fade-up anim-delay-2">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <div style={{ width: 24, height: 1, background: 'var(--border)' }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
            Export All Conversations ({stats.total})
          </p>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <ExportCard
            icon={<FileText size={24} />}
            title="Conversations CSV"
            description="One row per conversation with metadata, tags, and notes"
            format="CSV"
            color="var(--accent-cyan)"
            isExported={exported === 'csv'}
            onClick={() => exportCSV(chats, `ai-chat-book-conversations-${dateStamp()}.csv`)}
          />
          <ExportCard
            icon={<FileJson size={24} />}
            title="Full JSON Export"
            description="Complete data with all messages, tags, links, and notes"
            format="JSON"
            color="var(--accent-purple)"
            isExported={exported === 'json'}
            onClick={() => exportJSON(chats, `ai-chat-book-full-${dateStamp()}.json`)}
          />
          <ExportCard
            icon={<FileText size={24} />}
            title="Messages CSV"
            description="Every individual message as a row — great for analysis"
            format="CSV"
            color="var(--accent-amber)"
            isExported={exported === 'messages'}
            onClick={() => exportMessagesCSV(chats, `ai-chat-book-messages-${dateStamp()}.csv`)}
          />
          <ExportCard
            icon={<FileJson size={24} />}
            title="Stats JSON"
            description="Dashboard metrics and summary statistics only"
            format="JSON"
            color="var(--accent-green)"
            isExported={exported === 'stats'}
            onClick={() => {
              exportJSON({ generated: new Date().toISOString(), stats, modelBreakdown: stats.byModel, monthlyActivity: stats.byMonth }, `ai-chat-book-stats-${dateStamp()}.json`);
              setExported('stats');
              setTimeout(() => setExported(null), 2000);
            }}
          />
        </div>

        {/* Export filtered */}
        {filtered.length !== chats.length && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div style={{ width: 24, height: 1, background: 'var(--border)' }} />
              <p style={{ color: 'var(--accent-amber)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 5 }}>
                <Filter size={12} /> Export Filtered View ({filtered.length})
              </p>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <ExportCard
                icon={<FileText size={24} />}
                title="Filtered CSV"
                description={`Export only the ${filtered.length} conversations matching your current filters`}
                format="CSV"
                color="var(--accent-amber)"
                isExported={exported === 'filtered-csv'}
                onClick={() => {
                  exportCSV(filtered, `ai-chat-book-filtered-${dateStamp()}.csv`);
                  setExported('filtered-csv');
                  setTimeout(() => setExported(null), 2000);
                }}
              />
              <ExportCard
                icon={<FileJson size={24} />}
                title="Filtered JSON"
                description={`Export only the ${filtered.length} conversations matching your current filters`}
                format="JSON"
                color="var(--accent-rose)"
                isExported={exported === 'filtered-json'}
                onClick={() => {
                  exportJSON(filtered, `ai-chat-book-filtered-${dateStamp()}.json`);
                  setExported('filtered-json');
                  setTimeout(() => setExported(null), 2000);
                }}
              />
            </div>
          </>
        )}
      </div>

      {/* Privacy note */}
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textAlign: 'center' }} className="anim-fade-up anim-delay-3">
        🔒 All exports happen locally in your browser — your data never leaves your device
      </p>
    </div>
  );
}

function ExportCard({ icon, title, description, format, color, isExported, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'var(--bg-card)',
        border: `1px solid ${isExported ? `${color}50` : 'var(--border)'}`,
        borderRadius: 14, padding: 20,
        textAlign: 'left', cursor: 'pointer',
        transition: 'all 0.25s',
        display: 'flex', flexDirection: 'column', gap: 10,
        boxShadow: isExported ? `0 0 20px ${color}20` : 'none',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = `${color}40`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { if (!isExported) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ color, background: `${color}15`, border: `1px solid ${color}25`, width: 44, height: 44, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {isExported ? <CheckCircle size={24} /> : icon}
        </div>
        <span style={{ background: `${color}15`, color, border: `1px solid ${color}25`, padding: '2px 8px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 600 }}>
          {format}
        </span>
      </div>
      <div>
        <p style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: 4, color: isExported ? color : 'var(--text-primary)' }}>
          {isExported ? '✓ Downloaded!' : title}
        </p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', lineHeight: 1.5 }}>{description}</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color, fontSize: '0.78rem', fontWeight: 500 }}>
        <Download size={13} /> {isExported ? 'Check your Downloads folder' : `Download ${format}`}
      </div>
    </button>
  );
}

function StatItem({ label, value, accent }) {
  return (
    <div>
      <p style={{ fontSize: '1.3rem', fontWeight: 700, fontFamily: 'Syne', color: accent ? 'var(--accent-cyan)' : 'var(--text-primary)' }}>
        {value}
      </p>
      <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{label}</p>
    </div>
  );
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function dateStamp() {
  return new Date().toISOString().split('T')[0];
}
