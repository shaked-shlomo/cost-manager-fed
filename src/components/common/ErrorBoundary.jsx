import { Component } from 'react';
import Alert from '@mui/material/Alert';

// Catches a render crash so the page shows a message, not a blank.
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  // Called during render, so it must stay a pure state derivation.
  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed === true) {
      return (
        <Alert severity="error">
          Something went wrong while drawing this screen. Reload the page to continue.
        </Alert>
      );
    }
    // No error: pass the children straight through.
    return this.props.children;
  }
}

export default ErrorBoundary;
