import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled UI Crash caught by GlobalErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/dashboard/agency/tasks';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-background flex items-center justify-center p-6 select-none font-sans text-foreground">
          <div className="max-w-lg w-full bg-card border border-border p-8 rounded-2xl shadow-2xl space-y-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-500 text-[10px] font-bold uppercase tracking-wider border border-rose-500/20">
                Application Runtime Guard
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Something went wrong
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                An unexpected component rendering error occurred. The application has safely caught the issue to prevent a blank screen.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-muted/60 border border-border rounded-xl text-left overflow-hidden">
                <p className="text-[11px] font-mono text-rose-500 font-bold truncate">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-foreground bg-secondary hover:bg-secondary/80 border border-border transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reload Application
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 shadow-md transition-all cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                Go to Safe Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
