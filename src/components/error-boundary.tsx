/**
 * Error boundary for graceful error handling
 */
'use client';

import { ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import React from 'react'

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: (error: Error) => ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

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

    override render() {
        if (this.state.hasError) {
            return this.props.fallback?.(this.state.error!) ?? (
                <div
                    className="min-h-screen flex items-center justify-center p-4"
                    style={{ background: '#E6F2DD' }}
                >
                    <div
                        className="max-w-md w-full p-6 rounded-[16px]"
                        style={{ background: '#273338' }}
                    >
                        <div className="flex gap-3">
                            <AlertCircle
                                size={24}
                                style={{ color: '#BA5A5A' }}
                                className="flex-shrink-0 mt-0.5"
                            />
                            <div>
                                <h2 className="font-semibold mb-2" style={{ color: '#FBF5DD' }}>
                                    Something went wrong
                                </h2>
                                <p className="text-sm mb-4" style={{ color: 'rgba(251,245,221,0.6)' }}>
                                    {this.state.error?.message || 'An unexpected error occurred'}
                                </p>
                                <button
                                    onClick={() => {
                                        this.setState({ hasError: false, error: null });
                                        window.location.reload();
                                    }}
                                    className="px-4 py-2 rounded-[8px] font-medium text-sm transition-all duration-200"
                                    style={{
                                        background: '#BA5A5A',
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
