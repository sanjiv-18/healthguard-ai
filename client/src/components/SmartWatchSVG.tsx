import { useEffect, useState } from 'react';

interface SmartWatchSVGProps {
  connected: boolean;
  syncing?: boolean;
  heartRate?: number;
  spo2?: number;
  temperature?: number;
  steps?: number;
  battery?: number;
  className?: string;
  compact?: boolean;
}

function formatTime() {
  const now = new Date();
  return `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
}

function ECGWaveform({ color, bpm }: { color: string; bpm: number }) {
  const speed = Math.max(0.8, 3 - (bpm / 80));
  return (
    <svg viewBox="0 0 120 24" className="w-full" style={{ height: 18 }}>
      <path
        d="M0,12 L10,12 L14,12 L18,4 L22,20 L26,8 L30,14 L34,12 L44,12 L48,12 L52,4 L56,20 L60,8 L64,14 L68,12 L78,12 L82,12 L86,4 L90,20 L94,8 L98,14 L102,12 L120,12"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      >
        <animate
          attributeName="stroke-dashoffset"
          from="360"
          to="0"
          dur={`${speed}s`}
          repeatCount="indefinite"
        />
      </path>
      <path
        d="M0,12 L10,12 L14,12 L18,4 L22,20 L26,8 L30,14 L34,12 L44,12 L48,12 L52,4 L56,20 L60,8 L64,14 L68,12 L78,12 L82,12 L86,4 L90,20 L94,8 L98,14 L102,12 L120,12"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="360"
        opacity="0.9"
      >
        <animate
          attributeName="stroke-dashoffset"
          from="360"
          to="0"
          dur={`${speed}s`}
          repeatCount="indefinite"
        />
      </path>
    </svg>
  );
}

export function SmartWatchSVG({
  connected,
  syncing,
  heartRate = 0,
  spo2 = 0,
  temperature = 0,
  steps = 0,
  battery = 100,
  className = '',
  compact = false,
}: SmartWatchSVGProps) {
  const [time, setTime] = useState(formatTime());

  useEffect(() => {
    const interval = setInterval(() => setTime(formatTime()), 10000);
    return () => clearInterval(interval);
  }, []);

  const bodyColor = connected ? '#1e293b' : '#475569';
  const screenBg = connected ? '#0f172a' : '#1e293b';
  const heartColor = connected ? '#ef4444' : '#475569';
  const accentColor = connected ? '#22d3ee' : '#475569';
  const batteryColor = battery > 50 ? '#22c55e' : battery > 20 ? '#eab308' : '#ef4444';
  const strapColor = connected ? '#1e293b' : '#334155';
  const textColor = connected ? '#f8fafc' : '#64748b';
  const dimTextColor = connected ? '#94a3b8' : '#475569';
  const liveColor = connected ? '#22c55e' : '#475569';

  if (compact) {
    return (
      <svg viewBox="0 0 200 280" className={className} xmlns="http://www.w3.org/2000/svg">
        <defs>
          {connected && (
            <filter id="glow-compact">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          )}
        </defs>

        {connected && <ellipse cx="100" cy="140" rx="80" ry="100" fill="rgba(34,211,238,0.08)" />}

        <rect x="68" y="0" width="64" height="55" rx="8" fill={strapColor} />
        <rect x="72" y="0" width="56" height="55" rx="6" fill={connected ? '#334155' : '#3b4a5c'} />
        <rect x="68" y="225" width="64" height="55" rx="8" fill={strapColor} />
        <rect x="72" y="225" width="56" height="55" rx="6" fill={connected ? '#334155' : '#3b4a5c'} />

        <rect x="48" y="50" width="104" height="180" rx="24" fill={bodyColor} />
        <rect x="52" y="54" width="96" height="172" rx="20" fill={connected ? '#2d3a4a' : '#3b4a5c'} />
        <rect x="150" y="110" width="7" height="22" rx="3.5" fill={connected ? '#22d3ee' : '#475569'} />

        <rect x="60" y="65" width="80" height="150" rx="16" fill={screenBg} />

        {syncing ? (
          <>
            <text x="100" y="110" textAnchor="middle" fill={dimTextColor} fontSize="12" fontWeight="600" fontFamily="sans-serif">SYNCING</text>
            <text x="100" y="130" textAnchor="middle" fill={dimTextColor} fontSize="16">↻</text>
            <animateTransform attributeName="transform" type="rotate" from="0 100 130" to="360 100 130" dur="2s" repeatCount="indefinite" />
          </>
        ) : connected ? (
          <>
            <text x="100" y="85" textAnchor="middle" fill={dimTextColor} fontSize="9" fontFamily="monospace">{time}</text>

            <path d="M84,105 C84,101 88,97 92,101 L96,105 L100,101 C104,97 108,101 108,105 C108,111 96,119 96,119 C96,119 84,111 84,105Z" fill={heartColor}>
              <animate attributeName="opacity" values="1;0.6;1" dur={`${60 / Math.max(heartRate, 60)}s`} repeatCount="indefinite" />
            </path>
            <text x="100" y="132" textAnchor="middle" fill={textColor} fontSize="11" fontWeight="bold" fontFamily="sans-serif">{heartRate || '--'} bpm</text>

            <text x="100" y="148" textAnchor="middle" fill={accentColor} fontSize="9" fontWeight="600" fontFamily="sans-serif">SpO₂ {spo2 || '--'}%</text>

            <ECGWaveform color={accentColor} bpm={heartRate || 72} />

            <rect x="82" y="185" width="20" height="9" rx="2" stroke={batteryColor} strokeWidth="1.2" fill="none" />
            <rect x="102" y="187.5" width="2.5" height="4" rx="1" fill={batteryColor} />
            <rect x="83.5" y="186.5" width={Math.max(1, (battery / 100) * 17)} height="6" rx="1" fill={batteryColor} />

            <circle cx="90" cy="200" r="2" fill={liveColor}>
              <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
            </circle>
            <text x="100" y="203" textAnchor="middle" fill={liveColor} fontSize="8" fontWeight="bold" fontFamily="sans-serif">LIVE</text>
          </>
        ) : (
          <>
            <text x="100" y="100" textAnchor="middle" fill={dimTextColor} fontSize="10" fontWeight="500" fontFamily="sans-serif">NOT CONNECTED</text>
            <line x1="88" y1="118" x2="108" y2="138" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="108" y1="118" x2="88" y2="138" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
            <text x="100" y="160" textAnchor="middle" fill={dimTextColor} fontSize="9" fontFamily="sans-serif">OFFLINE</text>
          </>
        )}
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 200 280" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        {connected && (
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        )}
      </defs>

      {connected && <ellipse cx="100" cy="140" rx="85" ry="105" fill="rgba(34,211,238,0.06)" />}

      {/* Straps */}
      <rect x="68" y="0" width="64" height="58" rx="8" fill={strapColor} />
      <rect x="72" y="0" width="56" height="58" rx="6" fill={connected ? '#334155' : '#3b4a5c'} />
      <rect x="92" y="10" width="16" height="4" rx="2" fill={connected ? '#1e293b' : '#2d3a4a'} />
      <rect x="92" y="22" width="16" height="4" rx="2" fill={connected ? '#1e293b' : '#2d3a4a'} />
      <rect x="92" y="34" width="16" height="4" rx="2" fill={connected ? '#1e293b' : '#2d3a4a'} />

      <rect x="68" y="222" width="64" height="58" rx="8" fill={strapColor} />
      <rect x="72" y="222" width="56" height="58" rx="6" fill={connected ? '#334155' : '#3b4a5c'} />
      <rect x="92" y="238" width="16" height="4" rx="2" fill={connected ? '#1e293b' : '#2d3a4a'} />
      <rect x="92" y="250" width="16" height="4" rx="2" fill={connected ? '#1e293b' : '#2d3a4a'} />
      <rect x="92" y="262" width="16" height="4" rx="2" fill={connected ? '#1e293b' : '#2d3a4a'} />

      {/* Watch body */}
      <rect x="48" y="53" width="104" height="174" rx="24" fill={bodyColor} />
      <rect x="52" y="57" width="96" height="166" rx="20" fill={connected ? '#2d3a4a' : '#3b4a5c'} />
      <rect x="150" y="110" width="8" height="24" rx="4" fill={connected ? '#22d3ee' : '#475569'} />

      {/* Screen */}
      <rect x="60" y="68" width="80" height="144" rx="16" fill={screenBg} />

      {syncing ? (
        <>
          <text x="100" y="100" textAnchor="middle" fill={dimTextColor} fontSize="10" fontFamily="sans-serif">SYNCING</text>
          <text x="100" y="130" textAnchor="middle" fill={dimTextColor} fontSize="22">
            ↻
            <animateTransform attributeName="transform" type="rotate" from="0 100 125" to="360 100 125" dur="2s" repeatCount="indefinite" />
          </text>
          <rect x="78" y="148" width="44" height="4" rx="2" fill="#1e293b" />
          <rect x="78" y="148" width="22" height="4" rx="2" fill={accentColor}>
            <animate attributeName="width" values="0;44;0" dur="2s" repeatCount="indefinite" />
          </rect>
        </>
      ) : connected ? (
        <>
          {/* Time + Battery */}
          <text x="74" y="87" textAnchor="start" fill={textColor} fontSize="13" fontWeight="bold" fontFamily="monospace">{time}</text>
          <rect x="120" y="78" width="16" height="8" rx="2" stroke={batteryColor} strokeWidth="1" fill="none" />
          <rect x="136" y="80" width="2" height="4" rx="1" fill={batteryColor} />
          <rect x="121" y="79" width={Math.max(1, (battery / 100) * 14)} height="6" rx="1" fill={batteryColor} />
          <text x="128" y="85" textAnchor="middle" fill={dimTextColor} fontSize="5" fontFamily="sans-serif">{battery}</text>

          {/* Heart icon + Rate */}
          <path d="M82,108 C82,103 87,98 92,103 L96,108 L100,103 C105,98 110,103 110,108 C110,115 96,125 96,125 C96,125 82,115 82,108Z" fill={heartColor}>
            <animate attributeName="opacity" values="1;0.5;1" dur={`${60 / Math.max(heartRate, 60)}s`} repeatCount="indefinite" />
          </path>
          <text x="115" y="117" textAnchor="start" fill={textColor} fontSize="12" fontWeight="bold" fontFamily="sans-serif">{heartRate || '--'}</text>
          <text x="115" y="125" textAnchor="start" fill={dimTextColor} fontSize="7" fontFamily="sans-serif">bpm</text>

          {/* SpO2 */}
          <text x="74" y="142" textAnchor="start" fill={accentColor} fontSize="9" fontWeight="600" fontFamily="sans-serif">SpO₂</text>
          <text x="115" y="142" textAnchor="start" fill={textColor} fontSize="10" fontWeight="bold" fontFamily="sans-serif">{spo2 || '--'}%</text>

          {/* Temperature */}
          <text x="74" y="156" textAnchor="start" fill="#f59e0b" fontSize="8" fontWeight="600" fontFamily="sans-serif">TEMP</text>
          <text x="115" y="156" textAnchor="start" fill={textColor} fontSize="10" fontWeight="bold" fontFamily="sans-serif">{temperature ? `${temperature.toFixed(1)}°` : '--'}</text>

          {/* ECG Waveform */}
          <ECGWaveform color={accentColor} bpm={heartRate || 72} />

          {/* LIVE indicator */}
          <circle cx="82" cy="200" r="3" fill={liveColor}>
            <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
          </circle>
          <text x="92" y="203" textAnchor="start" fill={liveColor} fontSize="9" fontWeight="bold" fontFamily="sans-serif">LIVE</text>
        </>
      ) : (
        <>
          <text x="100" y="90" textAnchor="middle" fill={dimTextColor} fontSize="10" fontWeight="500" fontFamily="sans-serif">NOT CONNECTED</text>

          <line x1="86" y1="112" x2="106" y2="136" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="106" y1="112" x2="86" y2="136" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />

          <text x="100" y="158" textAnchor="middle" fill={dimTextColor} fontSize="9" fontFamily="sans-serif">OFFLINE</text>

          {heartRate > 0 && (
            <>
              <text x="100" y="175" textAnchor="middle" fill="#475569" fontSize="7" fontFamily="sans-serif">LAST READING</text>
              <text x="100" y="188" textAnchor="middle" fill="#64748b" fontSize="9" fontWeight="600" fontFamily="sans-serif">❤ {heartRate} bpm</text>
              <text x="100" y="198" textAnchor="middle" fill="#64748b" fontSize="8" fontFamily="sans-serif">SpO₂ {spo2}%</text>
            </>
          )}
        </>
      )}
    </svg>
  );
}
