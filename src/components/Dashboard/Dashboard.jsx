import { useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  MessageSquare, Hash, FileText, Calendar, TrendingUp,
  Cpu, Clock, Award
} from 'lucide-react';

const COLORS = ['#00f5d4', '#b57bee', '#ffbe0b', '#ff4d6d', '#06d6a0', '#4cc9f0'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <p style={{ fontWeight: 600, marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: <span style={{ color: 'var(--text-primary)' }}>{p.value}</span>
        </p>
      ))}
    </div>
  );
};

export default function Dashboard({ stats, chats }) {
  const recentChats = useMemo(() =>
    [...chats]
      .sort((a, b) => new Date(b.created || 0) - new Date(a.created || 0))
      .slice(0, 5),
    [chats]
  );

  const avgMessages = stats.total ? Math.round(stats.totalMessages / stats.total) : 0;
  const avgWords = stats.total ? Math.round(stats.totalWords / stats.total) : 0;

  // Heatmap data — last 52 weeks
  const heatmapData = useMemo(() => buildHeatmap(stats.byDay || {}), [stats.byDay]);

  if (stats.total === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>📖</div>
        <h3 className="font-display text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
          Your Chat Book is Empty
        </h3>
        <p style={{ color: 'var(--text-secondary)' }}>
          Import your AI conversation exports to see your dashboard come to life.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 anim-fade-up">
        <h2 className="font-display text-3xl font-bold mb-1">
          <span className="gradient-text-cyan">Dashboard</span>
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Your complete AI conversation analytics
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <MetricCard
          icon={<MessageSquare size={20} />}
          label="Conversations"
          value={stats.total.toLocaleString()}
          sub={`${stats.chatgpt} ChatGPT · ${stats.claude} Claude`}
          color="var(--accent-cyan)"
          delay={1}
        />
        <MetricCard
          icon={<Hash size={20} />}
          label="Total Messages"
          value={stats.totalMessages.toLocaleString()}
          sub={`~${avgMessages} per chat`}
          color="var(--accent-purple)"
          delay={2}
        />
        <MetricCard
          icon={<FileText size={20} />}
          label="Total Words"
          value={formatNumber(stats.totalWords)}
          sub={`~${avgWords} per chat`}
          color="var(--accent-amber)"
          delay={3}
        />
        <MetricCard
          icon={<Calendar size={20} />}
          label="Date Range"
          value={stats.dateRange.min ? formatDateShort(stats.dateRange.min) : '—'}
          sub={stats.dateRange.max ? `to ${formatDateShort(stats.dateRange.max)}` : ''}
          color="var(--accent-green)"
          delay={4}
        />
      </div>

      {/* Secondary row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <MetricCard icon={<Cpu size={20} />} label="Models Used" value={stats.allModels.length} sub="unique AI models" color="var(--accent-cyan)" delay={1} />
        <MetricCard icon={<Award size={20} />} label="Tagged Chats" value={chats.filter(c => c.tags?.length > 0).length} sub={`${stats.allTags.length} unique tags`} color="var(--accent-purple)" delay={2} />
        <MetricCard icon={<Clock size={20} />} label="Avg. Chat Length" value={avgMessages} sub="messages per conversation" color="var(--accent-amber)" delay={3} />
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 mb-6" style={{ gridTemplateColumns: '2fr 1fr' }}>
        {/* Activity Timeline */}
        <div className="glass-card p-6 anim-fade-up anim-delay-2">
          <h3 className="font-display font-semibold mb-5" style={{ fontSize: '0.95rem' }}>
            📈 Monthly Activity
          </h3>
          {stats.byMonth.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={stats.byMonth}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f5d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00f5d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone" dataKey="count" name="Conversations"
                  stroke="#00f5d4" strokeWidth={2}
                  fill="url(#colorCount)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <NoData />
          )}
        </div>

        {/* Platform Breakdown */}
        <div className="glass-card p-6 anim-fade-up anim-delay-3">
          <h3 className="font-display font-semibold mb-5" style={{ fontSize: '0.95rem' }}>
            🤖 Platform Split
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={[
                  { name: 'ChatGPT', value: stats.chatgpt },
                  { name: 'Claude', value: stats.claude },
                ].filter(d => d.value > 0)}
                cx="50%" cy="50%"
                innerRadius={55} outerRadius={85}
                paddingAngle={4}
                dataKey="value"
              >
                <Cell fill="#10a37f" />
                <Cell fill="#cd853f" />
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Model breakdown */}
      {stats.byModel.length > 0 && (
        <div className="glass-card p-6 mb-6 anim-fade-up anim-delay-3">
          <h3 className="font-display font-semibold mb-5" style={{ fontSize: '0.95rem' }}>
            🧠 Model Usage
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={stats.byModel.slice(0, 10)} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={140} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Chats" radius={[0, 6, 6, 0]}>
                {stats.byModel.slice(0, 10).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Activity Heatmap */}
      {heatmapData.length > 0 && (
        <div className="glass-card p-6 mb-6 anim-fade-up anim-delay-4">
          <h3 className="font-display font-semibold mb-5" style={{ fontSize: '0.95rem' }}>
            🗓️ Activity Heatmap — Last Year
          </h3>
          <ActivityHeatmap data={heatmapData} />
        </div>
      )}

      {/* Recent conversations */}
      <div className="glass-card p-6 anim-fade-up anim-delay-4">
        <h3 className="font-display font-semibold mb-4" style={{ fontSize: '0.95rem' }}>
          🕐 Recent Conversations
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {recentChats.map((chat) => (
            <div key={chat.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 12px', borderRadius: 10,
              transition: 'background 0.2s',
              cursor: 'default',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(147,147,184,0.06)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ fontSize: 20 }}>{chat.platform === 'chatgpt' ? '🟢' : '🟠'}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 500, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {chat.title || 'Untitled'}
                </p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                  {chat.messageCount} messages · {chat.created ? formatDateFull(new Date(chat.created)) : 'No date'}
                </p>
              </div>
              <div className={`badge badge-${chat.platform}`}>{chat.platform}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, sub, color, delay }) {
  return (
    <div className={`metric-card anim-fade-up anim-delay-${delay}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: `${color}18`,
          border: `1px solid ${color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color
        }}>
          {icon}
        </div>
      </div>
      <p style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'Syne', marginBottom: 2, color: 'var(--text-primary)' }}>
        {value}
      </p>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 2 }}>{label}</p>
      {sub && <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', opacity: 0.7 }}>{sub}</p>}
    </div>
  );
}

function ActivityHeatmap({ data }) {
  const weeks = [];
  for (let i = 0; i < data.length; i += 7) {
    weeks.push(data.slice(i, i + 7));
  }

  const max = Math.max(...data.map(d => d.count));

  const getColor = (count) => {
    if (!count) return 'rgba(147,147,184,0.08)';
    const intensity = count / max;
    if (intensity < 0.25) return 'rgba(0,245,212,0.2)';
    if (intensity < 0.5) return 'rgba(0,245,212,0.45)';
    if (intensity < 0.75) return 'rgba(0,245,212,0.7)';
    return 'rgba(0,245,212,0.95)';
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 3, overflowX: 'auto', paddingBottom: 8 }}>
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {week.map((day, di) => (
              <div
                key={di}
                className="heatmap-cell"
                title={`${day.date}: ${day.count} conversations`}
                style={{ background: getColor(day.count) }}
              />
            ))}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Less</span>
        {[0, 0.25, 0.5, 0.75, 1].map((v, i) => (
          <div key={i} className="heatmap-cell" style={{ background: getColor(v * max) }} />
        ))}
        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>More</span>
      </div>
    </div>
  );
}

function NoData() {
  return (
    <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
      Not enough data to display
    </div>
  );
}

function buildHeatmap(byDay) {
  const result = [];
  const today = new Date();
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    result.push({ date: key, count: byDay[key] || 0 });
  }
  return result;
}

function formatNumber(n) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

function formatDateShort(d) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function formatDateFull(d) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
