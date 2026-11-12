import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles.css'
import './landing.css'
import './error.css'

class AppBoundary extends React.Component {
  state = { error: null }
  static getDerivedStateFromError(error) { return { error } }
  componentDidCatch(error, info) { console.error('Career workspace failed to render', error, info) }
  render() {
    if (this.state.error) return <main className="app-error"><div><span>NS</span><h1>We hit a snag loading your workspace.</h1><p>{this.state.error.message || 'An unexpected rendering error occurred.'}</p><button onClick={() => window.location.reload()}>Reload workspace</button></div></main>
    return this.props.children
  }
}

createRoot(document.getElementById('root')).render(<AppBoundary><React.StrictMode><App /></React.StrictMode></AppBoundary>)
