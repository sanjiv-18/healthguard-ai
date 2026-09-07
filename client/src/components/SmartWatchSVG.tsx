interface SmartWatchSVGProps {
  connected: boolean;
  syncing?: boolean;
  className?: string;
}

export function SmartWatchSVG({ connected, syncing, className = '' }: SmartWatchSVGProps) {
  const bodyColor = connected ? '#1e293b' : '#64748b';
  const screenBg = connected ? '#0f172a' : '#334155';
  const heartColor = connected ? '#ef4444' : '#475569';
  const waveColor = connected ? '#22d3ee' : '#475569';
  const batteryColor = connected ? '#22c55e' : '#475569';
  const strapColor = connected ? '#1e293b' : '#475569';
  const glowColor = connected ? 'rgba(34, 211, 238, 0.15)' : 'transparent';

  return (
    <svg viewBox="0 0 200 280" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Glow when connected */}
      {connected && (
        <ellipse cx="100" cy="140" rx="85" ry="105" fill={glowColor} />
      )}

      {/* Top strap */}
      <rect x="68" y="0" width="64" height="60" rx="8" fill={strapColor} />
      <rect x="72" y="0" width="56" height="60" rx="6" fill={connected ? '#334155' : '#475569'} />
      {/* Strap holes */}
      <rect x="92" y="12" width="16" height="4" rx="2" fill={connected ? '#1e293b' : '#334155'} />
      <rect x="92" y="24" width="16" height="4" rx="2" fill={connected ? '#1e293b' : '#334155'} />
      <rect x="92" y="36" width="16" height="4" rx="2" fill={connected ? '#1e293b' : '#334155'} />

      {/* Bottom strap */}
      <rect x="68" y="220" width="64" height="60" rx="8" fill={strapColor} />
      <rect x="72" y="220" width="56" height="60" rx="6" fill={connected ? '#334155' : '#475569'} />
      {/* Strap holes */}
      <rect x="92" y="236" width="16" height="4" rx="2" fill={connected ? '#1e293b' : '#334155'} />
      <rect x="92" y="248" width="16" height="4" rx="2" fill={connected ? '#1e293b' : '#334155'} />
      <rect x="92" y="260" width="16" height="4" rx="2" fill={connected ? '#1e293b' : '#334155'} />

      {/* Watch body */}
      <rect x="48" y="55" width="104" height="170" rx="24" fill={bodyColor} />
      <rect x="52" y="59" width="96" height="162" rx="20" fill={connected ? '#334155' : '#475569'} />

      {/* Side button (crown) */}
      <rect x="150" y="110" width="8" height="24" rx="4" fill={connected ? '#22d3ee' : '#475569'} />

      {/* Screen bezel */}
      <rect x="60" y="70" width="80" height="140" rx="16" fill={screenBg} />

      {/* Screen content */}
      {connected ? (
        <>
          {/* Time */}
          <text x="100" y="100" textAnchor="middle" fill="#f8fafc" fontSize="18" fontWeight="bold" fontFamily="monospace">9:41</text>

          {/* Heart icon */}
          <path d="M88 118 C88 114, 92 110, 96 114 L100 118 L104 114 C108 110, 112 114, 112 118 C112 124, 100 132, 100 132 C100 132, 88 124, 88 118Z"
            fill={heartColor} />

          {/* Heart rate text */}
          <text x="100" y="146" textAnchor="middle" fill={heartColor} fontSize="11" fontWeight="bold" fontFamily="sans-serif">72 bpm</text>

          {/* SpO2 */}
          <text x="100" y="164" textAnchor="middle" fill={waveColor} fontSize="10" fontWeight="600" fontFamily="sans-serif">SpO2 97%</text>

          {/* Activity wave */}
          <path d="M72 180 Q82 170 92 180 Q102 190 112 180 Q122 170 128 180" stroke={waveColor} strokeWidth="2" fill="none" opacity="0.6" />

          {/* Battery icon */}
          <rect x="86" y="192" width="22" height="10" rx="2" stroke={batteryColor} strokeWidth="1.5" fill="none" />
          <rect x="108" y="195" width="3" height="4" rx="1" fill={batteryColor} />
          <rect x="88" y="194" width="16" height="6" rx="1" fill={batteryColor} />

          {/* Signal dots */}
          {syncing ? (
            <>
              <circle cx="80" cy="208" r="2" fill="#22d3ee">
                <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" />
              </circle>
              <circle cx="88" cy="208" r="2" fill="#22d3ee">
                <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" repeatCount="indefinite" />
              </circle>
              <circle cx="96" cy="208" r="2" fill="#22d3ee">
                <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" />
              </circle>
            </>
          ) : (
            <>
              <circle cx="80" cy="208" r="2" fill="#22c55e" />
              <circle cx="88" cy="208" r="2" fill="#22c55e" />
              <circle cx="96" cy="208" r="2" fill="#22c55e" />
            </>
          )}
        </>
      ) : (
        <>
          {/* Disconnected screen - X icon */}
          <line x1="88" y1="120" x2="112" y2="148" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
          <line x1="112" y1="120" x2="88" y2="148" stroke="#475569" strokeWidth="3" strokeLinecap="round" />

          <text x="100" y="172" textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="500" fontFamily="sans-serif">OFFLINE</text>

          {/* Gray signal dots */}
          <circle cx="84" cy="190" r="2" fill="#475569" opacity="0.5" />
          <circle cx="92" cy="190" r="2" fill="#475569" opacity="0.4" />
          <circle cx="100" cy="190" r="2" fill="#475569" opacity="0.3" />
        </>
      )}
    </svg>
  );
}
