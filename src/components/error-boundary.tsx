/**
 * Error boundary for graceful error handling
 */
'use client';

import type { ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import React from 'react';

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: (error: Error) => ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error) {
    console.error('Error caught by boundary:', error);
  }

  override async render() {
    if (this.state.hasError) {
      return this.props.fallback?.(this.state.error!) ?? (
        <div
          className="flex min-h-screen items-center justify-center p-4"
          style={{ background: 'var(--color-bg)' }}
        >
          <div
            className="w-full max-w-md rounded-[16px] p-6"
            style={{ background: 'var(--color-chat-bg)' }}
          >
            <div className="flex gap-3">
              <AlertCircle
                size={24}
                style={{ color: 'var(--color-text-accent)' }}
                className="mt-0.5 flex-shrink-0"
              />
              <div>
                <h2 className="mb-2 font-semibold" style={{ color: 'var(--color-chat-text)' }}>
                  Something went wrong
                </h2>
                <p className="mb-4 text-sm" style={{ color: 'rgba(251,245,221,0.6)' }}>
                  {this.state.error?.message || 'An unexpected error occurred'}
                </p>
                <button
                  onClick={() => {
                    this.setState({ hasError: false, error: null });
                    window.location.reload();
                  }}
                  className="rounded-[8px] px-4 py-2 text-sm font-medium transition-all duration-200"
                  style={{
                    background: 'var(--color-text-accent)',
                    color: '#fff',
                  }}
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
