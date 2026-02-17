import { useState, useRef, useCallback } from 'react';
import JSZip from 'jszip';
import { Upload, FileJson, Archive, CheckCircle, AlertCircle, X, ChevronRight } from 'lucide-react';
import { parseChatGPT } from '../../parsers/chatgpt';
import { parseClaude } from '../../parsers/claude';

export default function UploadPanel({ onImport, existingCount }) {
  const [isDragging, setIsDragging] = useState(false);
  const [stage, setStage] = useState('idle'); // idle | processing | done | error
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileRef = useRef();

  const processFile = useCallback(async (file) => {
    setStage('processing');
    setProgress(0);
    setError(null);

    try {
      let parsed = [];

      if (file.name.endsWith('.zip')) {
        setProgressLabel('Extracting ZIP archive...');
        setProgress(10);

        const zip = await JSZip.loadAsync(file);
        setProgress(30);

        // Find conversations.json inside zip
        const jsonFile = Object.keys(zip.files).find(
          (name) =>
            name.includes('conversations.json') ||
            name.endsWith('conversations.json')
        );

        if (!jsonFile) {
          throw new Error('No conversations.json found inside ZIP. Please export from ChatGPT Settings → Data Controls → Export Data.');
        }

        setProgressLabel('Reading conversation data...');
        setProgress(50);

        const content = await zip.files[jsonFile].async('string');
        setProgress(70);

        const data = JSON.parse(content);
        setProgressLabel('Parsing ChatGPT conversations...');
        setProgress(80);
        parsed = parseChatGPT(data);

      } else if (file.name.endsWith('.json')) {
        setProgressLabel('Reading JSON file...');
        setProgress(20);

        const text = await file.text();
        const data = JSON.parse(text);
        setProgress(50);

        // Auto-detect format
        const format = detectFormat(data);
        setProgressLabel(`Detected: ${format === 'chatgpt' ? 'ChatGPT' : 'Claude.ai'} export. Parsing...`);
        setProgress(70);

        if (format === 'chatgpt') {
          parsed = parseChatGPT(data);
        } else {
          parsed = parseClaude(data);
        }
      } else {
        throw new Error('Unsupported file type. Please upload a .json file or a .zip export from ChatGPT.');
      }

      setProgress(90);
      setProgressLabel('Finalizing...');

      await delay(300);
      setProgress(100);

      setResult({ count: parsed.length, data: parsed });
      setStage('done');
      onImport(parsed);

    } catch (err) {
      setError(err.message || 'Failed to parse file');
      setStage('error');
    }
  }, [onImport]);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file) processFile(file);
  };

  const reset = () => {
    setStage('idle');
    setProgress(0);
    setResult(null);
    setError(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8 anim-fade-up">
        <h2 className="font-display text-3xl font-bold mb-2">
          <span className="gradient-text-cyan">Import</span> Your AI History
        </h2>
        <p style={{ color: 'var(--text-secondary)' }} className="text-sm">
          Upload your ChatGPT ZIP export or Claude JSON export to get started.
          {existingCount > 0 && (
            <span style={{ color: 'var(--accent-amber)' }}> ({existingCount} conversations already loaded)</span>
          )}
        </p>
      </div>

      {/* Supported formats info */}
      <div className="grid grid-cols-2 gap-4 mb-6 anim-fade-up anim-delay-1">
        <div className="glass-card p-4" style={{ borderColor: 'rgba(16,163,127,0.2)' }}>
          <div className="flex items-center gap-3 mb-2">
            <div style={{ width: 32, height: 32, background: 'rgba(16,163,127,0.15)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Archive size={16} style={{ color: '#10a37f' }} />
            </div>
            <span className="font-semibold text-sm">ChatGPT Export</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
            Settings → Data Controls → Export Data → Upload the .zip file
          </p>
          <div className="badge badge-chatgpt mt-2">ZIP or JSON</div>
        </div>

        <div className="glass-card p-4" style={{ borderColor: 'rgba(205,133,63,0.2)' }}>
          <div className="flex items-center gap-3 mb-2">
            <div style={{ width: 32, height: 32, background: 'rgba(205,133,63,0.15)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileJson size={16} style={{ color: '#cd853f' }} />
            </div>
            <span className="font-semibold text-sm">Claude.ai Export</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
            Settings → Privacy → Export Data → Upload the conversations.json file
          </p>
          <div className="badge badge-claude mt-2">JSON only</div>
        </div>
      </div>

      {/* Drop zone */}
      {stage === 'idle' && (
        <div
          className={`dropzone anim-fade-up anim-delay-2 ${isDragging ? 'drag-over' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".json,.zip"
            onChange={onFileChange}
            style={{ display: 'none' }}
          />

          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'rgba(0,245,212,0.08)',
              border: '1px solid rgba(0,245,212,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.3s',
              boxShadow: isDragging ? '0 0 40px rgba(0,245,212,0.2)' : 'none'
            }}>
              <Upload size={28} style={{ color: 'var(--accent-cyan)', strokeWidth: 1.5 }} />
            </div>
          </div>

          <p className="font-display font-semibold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>
            {isDragging ? 'Drop it here!' : 'Drag & drop your export file'}
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 16 }}>
            or click to browse your computer
          </p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            {['.zip', '.json'].map((ext) => (
              <span key={ext} style={{
                background: 'rgba(147,147,184,0.1)',
                border: '1px solid var(--border)',
                borderRadius: 6, padding: '3px 10px',
                fontSize: '0.75rem', color: 'var(--text-secondary)'
              }}>{ext}</span>
            ))}
          </div>
        </div>
      )}

      {/* Processing */}
      {stage === 'processing' && (
        <div className="glass-card p-8 anim-fade-up" style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(0,245,212,0.08)',
              border: '2px solid rgba(0,245,212,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
              animation: 'spin 1s linear infinite'
            }}>
              <Archive size={24} style={{ color: 'var(--accent-cyan)' }} />
            </div>
            <p className="font-display font-semibold text-lg" style={{ marginBottom: 8 }}>Processing Your Data</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{progressLabel}</p>
          </div>

          <div className="progress-track" style={{ marginBottom: 8 }}>
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <p style={{ color: 'var(--accent-cyan)', fontSize: '0.8rem', fontWeight: 600 }}>{progress}%</p>
        </div>
      )}

      {/* Done */}
      {stage === 'done' && result && (
        <div className="glass-card p-8 anim-fade-up" style={{ textAlign: 'center', borderColor: 'rgba(6,214,160,0.3)' }}>
          <CheckCircle size={48} style={{ color: 'var(--accent-green)', margin: '0 auto 16px' }} />
          <p className="font-display font-bold text-2xl mb-2" style={{ color: 'var(--accent-green)' }}>
            Import Successful!
          </p>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{result.count}</span> conversations imported successfully
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn-primary" onClick={reset} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              Import More <ChevronRight size={16} />
            </button>
            <button className="btn-ghost" onClick={reset}>
              Done
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {stage === 'error' && (
        <div className="glass-card p-8 anim-fade-up" style={{ textAlign: 'center', borderColor: 'rgba(255,77,109,0.3)' }}>
          <AlertCircle size={48} style={{ color: 'var(--accent-rose)', margin: '0 auto 16px' }} />
          <p className="font-display font-bold text-xl mb-3" style={{ color: 'var(--accent-rose)' }}>Import Failed</p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 24, maxWidth: 400, margin: '0 auto 24px' }}>
            {error}
          </p>
          <button className="btn-ghost" onClick={reset} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <X size={16} /> Try Again
          </button>
        </div>
      )}

      {/* Tips */}
      <div className="anim-fade-up anim-delay-3" style={{ marginTop: 32 }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textAlign: 'center' }}>
          🔒 All data stays in your browser — nothing is uploaded to any server
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function detectFormat(data) {
  // ChatGPT: array of objects with 'mapping' field
  if (Array.isArray(data) && data[0]?.mapping) return 'chatgpt';
  if (Array.isArray(data) && data[0]?.chat_messages) return 'claude';
  if (data.conversations) return 'chatgpt';
  // Default: try claude
  return 'claude';
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
