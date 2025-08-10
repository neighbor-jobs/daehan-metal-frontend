// shared/ErrorBoundary.tsx
import React from 'react';

type Props = {
  children: React.ReactNode;
  onRecover?: () => void | Promise<void>;
  scope?: 'root' | 'page' | 'widget';
};

type State = { hasError: boolean; error?: unknown };

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: unknown) {
    return { hasError: true, error };
  }

  componentDidCatch(error: unknown, errorInfo: unknown) {
    console.error('[ErrorBoundary]', this.props.scope, error, errorInfo);
  }

  private handleReload = () => window.location.reload();
  private handleRecover = () => this.props.onRecover?.();

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24 }}>
          <h2>문제가 발생했습니다.</h2>
          <p>잠시 후 다시 시도해 주세요.</p>
          <div style={{ display: 'flex', gap: 8 }}>
            {this.props.onRecover && (
              <button onClick={this.handleRecover}>홈으로 이동</button>
            )}
            <button onClick={this.handleReload}>새로고침</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}