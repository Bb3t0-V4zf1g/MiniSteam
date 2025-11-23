import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary capturó un error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '20px',
          margin: '20px',
          backgroundColor: '#2a2a2a',
          color: '#e0e0e0',
          borderRadius: '8px',
          border: '2px solid #ff4444'
        }}>
          <h1 style={{ color: '#ff4444' }}>😕 Algo salió mal</h1>
          <p>La aplicación encontró un error inesperado.</p>
          <details style={{ marginTop: '20px', cursor: 'pointer' }}>
            <summary>Detalles del error</summary>
            <pre style={{ 
              marginTop: '10px', 
              padding: '10px', 
              backgroundColor: '#1a1a1a',
              borderRadius: '4px',
              overflow: 'auto'
            }}>
              {this.state.error && this.state.error.toString()}
              {'\n'}
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </pre>
          </details>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#4a9eff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            🔄 Recargar página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
