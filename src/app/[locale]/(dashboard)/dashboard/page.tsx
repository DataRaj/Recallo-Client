'use client';

import { useAuth } from '@/hooks/use-auth';
import { useAuthStore } from '@/stores/use-auth-store';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export default function DashboardPage() {
  const user = useAuthStore(s => s.user);
  const { logout } = useAuth();

  return (
    <div className="recallo-dashboard-content">
      {/* Header */}
      <header className="recallo-dashboard-header">
        <div>
          <h1 className="recallo-dashboard-greeting">
            Good to see you,
            {' '}
            <span className="recallo-dashboard-username">{user?.name ?? 'there'}</span>
            👋
          </h1>
          <p className="recallo-dashboard-sub">Here&apos;s your Recallo workspace.</p>
        </div>
        <Button
          id="btn-logout"
          variant="outline"
          onClick={logout}
          className="recallo-logout-btn"
        >
          <LogOut size={14} />
          Sign out
        </Button>
      </header>

      {/* Stats cards */}
      <div className="recallo-stat-grid">
        {[
          { label: 'Saved notes', value: '0', icon: '📝' },
          { label: 'Knowledge nodes', value: '0', icon: '🕸' },
          { label: 'Connections', value: '0', icon: '🔗' },
          { label: 'Streaks', value: '0', icon: '🔥' },
        ].map(stat => (
          <div key={stat.label} className="recallo-stat-card">
            <span className="recallo-stat-icon">{stat.icon}</span>
            <p className="recallo-stat-value">{stat.value}</p>
            <p className="recallo-stat-label">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Empty state */}
      <div className="recallo-empty-state">
        <p className="recallo-empty-icon">🚀</p>
        <h2 className="recallo-empty-title">Your workspace is ready</h2>
        <p className="recallo-empty-desc">
          Start adding notes and building your personal knowledge graph.
        </p>
      </div>
    </div>
  );
}
