import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: string;
  trendPositive?: boolean;
  color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendPositive = true,
  color = '#4f46e5',
}) => {
  return (
    <div
      className="card"
      style={{
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>{title}</div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: 'var(--text-main)',
              marginTop: 6,
              letterSpacing: '-0.03em',
            }}
          >
            {value}
          </div>
        </div>

        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 'var(--radius-md)',
            backgroundColor: `${color}15`,
            color: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
      </div>

      {(subtitle || trend) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, fontSize: 12.5 }}>
          {trend && (
            <span
              style={{
                color: trendPositive ? '#059669' : '#dc2626',
                fontWeight: 700,
                backgroundColor: trendPositive ? '#ecfdf5' : '#fef2f2',
                padding: '2px 6px',
                borderRadius: 4,
              }}
            >
              {trend}
            </span>
          )}
          {subtitle && <span style={{ color: 'var(--text-muted)' }}>{subtitle}</span>}
        </div>
      )}

      {/* Decorative top border glow */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          backgroundColor: color,
        }}
      />
    </div>
  );
};
