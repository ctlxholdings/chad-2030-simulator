import { StrictMode, Component, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { SimulationProvider } from './context/SimulationContext';
import './index.css';

// Error boundary to catch runtime errors
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('React Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', fontFamily: 'monospace' }}>
          <h1 style={{ color: '#C1272D' }}>Something went wrong</h1>
          <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
            {this.state.error?.message}
            {'\n\n'}
            {this.state.error?.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <SimulationProvider>
        <App />
      </SimulationProvider>
    </ErrorBoundary>
  </StrictMode>
);
