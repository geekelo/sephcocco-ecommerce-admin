
import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render shows fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    
    // Optional: send error to logging service
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      // Use fallback UI from props or default to generic error message
      if (this.props.fallback) {
        return this.props.fallback(this.state.error);
      }
      
      return (
        <div style={{ 
          color: 'red', 
          padding: '2rem', 
          border: '1px solid #ffcccc', 
          borderRadius: '4px',
          backgroundColor: '#fff5f5',
          margin: '1rem 0'
        }}>
          <h2>Something went wrong.</h2>
          <p>We're sorry, but there was an error loading this component.</p>
          {this.props.showError && (
            <div>
              <h3>Error Details:</h3>
              <pre style={{ 
                backgroundColor: '#f8f8f8', 
                padding: '1rem',
                borderRadius: '4px',
                fontSize: '0.85rem',
                overflow: 'auto'
              }}>
                {this.state.error?.toString()}
              </pre>
            </div>
          )}
          {this.props.resetButton && (
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginTop: '1rem'
              }}
            >
              Try Again
            </button>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}