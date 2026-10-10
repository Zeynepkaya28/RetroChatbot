import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles.css'

class AppErrorBoundary extends React.Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error) {
    console.error('Arayüz oluşturulamadı:', error)
  }

  render() {
    if (this.state.error) {
      return <div style={{ minHeight: '100vh', padding: '3rem', color: '#ffb4a8', background: '#0b0b0e', font: '14px monospace', whiteSpace: 'pre-wrap' }}><h1>ARAYÜZ HATASI</h1>{String(this.state.error?.stack || this.state.error)}</div>
    }
    return this.props.children
  }
}

createRoot(document.getElementById('root')).render(<React.StrictMode><AppErrorBoundary><App/></AppErrorBoundary></React.StrictMode>)
