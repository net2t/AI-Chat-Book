import { CheckCircle, ChevronRight, ExternalLink } from 'lucide-react';

const steps = [
  {
    step: '01',
    title: 'Export from ChatGPT',
    color: 'var(--accent-green)',
    badge: 'ChatGPT',
    badgeColor: '#10a37f',
    instructions: [
      'Go to chat.openai.com and log in',
      'Click your profile icon → Settings',
      'Go to Data Controls tab',
      'Click "Export Data" button',
      'Wait for the email with your download link (usually minutes to hours)',
      'Download the .zip file — keep it as-is, don\'t extract it',
    ],
    tip: '💡 The ZIP file contains conversations.json — our tool reads it directly without extracting.',
    link: { label: 'Open ChatGPT Settings', url: 'https://chat.openai.com/#settings' }
  },
  {
    step: '02',
    title: 'Export from Claude',
    color: 'var(--accent-amber)',
    badge: 'Claude',
    badgeColor: '#cd853f',
    instructions: [
      'Go to claude.ai and log in',
      'Click your name/avatar → Settings',
      'Find the Privacy section',
      'Click "Export Data"',
      'Download the conversations.json file',
    ],
    tip: '💡 Claude exports a .json file directly — just upload it as-is.',
    link: { label: 'Open Claude Settings', url: 'https://claude.ai/settings/account' }
  },
  {
    step: '03',
    title: 'Import into AI Chat Book',
    color: 'var(--accent-cyan)',
    badge: 'Import',
    badgeColor: '#00f5d4',
    instructions: [
      'Click "Import" in the left sidebar',
      'Drag & drop your file OR click to browse',
      'For ChatGPT: upload the .zip file directly',
      'For Claude: upload the conversations.json file',
      'Wait for the progress bar to complete',
      'Your conversations will appear immediately!',
    ],
    tip: '💡 You can import from both platforms — they\'ll be merged together with a platform label.',
  },
  {
    step: '04',
    title: 'Organize & Explore',
    color: 'var(--accent-purple)',
    badge: 'Organize',
    badgeColor: '#b57bee',
    instructions: [
      'Visit Dashboard to see your analytics and activity charts',
      'Click Chat Book to browse and read conversations',
      'Click any conversation to open the full chat viewer',
      'Use the right panel to add tags, links, and notes',
      'Use the Filter sidebar to narrow down conversations',
      'Export your data anytime from the Export tab',
    ],
    tip: '💡 All data is saved in your browser automatically — no account needed!',
  },
];

const features = [
  { icon: '💬', title: 'Chat Viewer', desc: 'Read full conversations with message bubbles' },
  { icon: '📊', title: 'Analytics', desc: 'Activity heatmaps, model usage, monthly charts' },
  { icon: '🔍', title: 'Smart Filters', desc: 'Filter by date, platform, model, tags, length' },
  { icon: '🏷️', title: 'Tagging', desc: 'Add custom tags to organize conversations' },
  { icon: '🔗', title: 'Links', desc: 'Attach file links and references to any chat' },
  { icon: '📝', title: 'Notes', desc: 'Write personal notes on any conversation' },
  { icon: '📤', title: 'Export', desc: 'Download as CSV or JSON, filtered or full' },
  { icon: '🔒', title: 'Private', desc: '100% local — data never leaves your browser' },
];

export default function Guide() {
  return (
    <div className="max-w-3xl mx-auto">
      {/* Hero */}
      <div className="mb-12 anim-fade-up" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>📖</div>
        <h1 className="font-display text-4xl font-bold mb-4">
          Welcome to <span className="gradient-text-cyan">AI Chat Book</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: 500, margin: '0 auto' }}>
          Your personal archive and analytics dashboard for all your AI conversations.
          Import from ChatGPT and Claude, then explore, filter, and organize everything.
        </p>
      </div>

      {/* Feature grid */}
      <div className="grid grid-cols-4 gap-3 mb-12 anim-fade-up anim-delay-1">
        {features.map((f) => (
          <div key={f.title} className="glass-card" style={{ padding: '14px 12px', textAlign: 'center' }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{f.icon}</div>
            <p style={{ fontWeight: 600, fontSize: '0.8rem', marginBottom: 3 }}>{f.title}</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', lineHeight: 1.4 }}>{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Steps */}
      <h2 className="font-display text-2xl font-bold mb-6 anim-fade-up anim-delay-2">
        🚀 Getting Started — Step by Step
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {steps.map((s, i) => (
          <div
            key={i}
            className={`glass-card p-6 anim-fade-up anim-delay-${i + 1}`}
            style={{ borderLeft: `3px solid ${s.color}` }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <div style={{
                fontFamily: 'Syne', fontWeight: 800, fontSize: '1.8rem',
                color: s.color, opacity: 0.4, lineHeight: 1, flexShrink: 0, width: 40
              }}>
                {s.step}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <h3 className="font-display font-bold" style={{ fontSize: '1.1rem' }}>{s.title}</h3>
                  <span className="badge" style={{ background: `${s.badgeColor}15`, color: s.badgeColor, border: `1px solid ${s.badgeColor}30` }}>
                    {s.badge}
                  </span>
                </div>

                <ol style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14, paddingLeft: 0, listStyle: 'none' }}>
                  {s.instructions.map((inst, ii) => (
                    <li key={ii} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <span style={{
                        width: 20, height: 20, borderRadius: '50%',
                        background: `${s.color}15`, border: `1px solid ${s.color}30`,
                        color: s.color, fontSize: '0.65rem', fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, marginTop: 1
                      }}>
                        {ii + 1}
                      </span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>{inst}</span>
                    </li>
                  ))}
                </ol>

                <div style={{ background: `${s.color}08`, border: `1px solid ${s.color}20`, borderRadius: 10, padding: '10px 14px', marginBottom: s.link ? 12 : 0 }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{s.tip}</p>
                </div>

                {s.link && (
                  <a
                    href={s.link.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      color: s.color, fontSize: '0.8rem', textDecoration: 'none',
                      fontWeight: 500, marginTop: 8,
                      transition: 'opacity 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = 0.7}
                    onMouseLeave={e => e.currentTarget.style.opacity = 1}
                  >
                    <ExternalLink size={13} /> {s.link.label}
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className="glass-card p-6 mt-8 anim-fade-up">
        <h3 className="font-display font-bold text-xl mb-6">❓ Frequently Asked Questions</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {[
            { q: 'Is my data safe?', a: 'Yes! All data is stored in your browser\'s localStorage. It never leaves your device and is never uploaded to any server.' },
            { q: 'What if I lose my data?', a: 'Export your full JSON regularly from the Export tab. You can re-import it anytime to restore everything, including your tags, notes, and links.' },
            { q: 'Can I import multiple times?', a: 'Yes! Duplicate conversations (same ID) are automatically skipped, so you can safely re-import without worrying about duplicates.' },
            { q: 'Does this work offline?', a: 'Yes! Once loaded, the app works completely offline. Your data is in your browser.' },
            { q: 'Can I add conversations manually?', a: 'Not yet — but you can add tags, notes, and links to any imported conversation from the Chat Book view.' },
          ].map((faq, i) => (
            <div key={i} style={{ borderBottom: '1px solid var(--border)', paddingBottom: 18 }}>
              <p style={{ fontWeight: 600, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle size={14} style={{ color: 'var(--accent-cyan)', flexShrink: 0 }} />
                {faq.q}
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6, paddingLeft: 20 }}>{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="glass-card p-8 mt-6 anim-fade-up" style={{ textAlign: 'center', borderColor: 'rgba(0,245,212,0.2)' }}>
        <p className="font-display font-bold text-xl mb-3">Ready to dive in?</p>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 16, fontSize: '0.875rem' }}>
          Click <strong style={{ color: 'var(--accent-cyan)' }}>Import</strong> in the sidebar to upload your first export file.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
          <span>Takes less than 30 seconds</span>
          <ChevronRight size={14} />
          <span>No account needed</span>
          <ChevronRight size={14} />
          <span>Free forever</span>
        </div>
      </div>
    </div>
  );
}
