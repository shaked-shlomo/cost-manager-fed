import { Component } from 'react';
import Alert from '@mui/material/Alert';

// Catches a render time crash so the page shows a message rather than
// going blank, which would be the worst possible thing on demo day.
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  // React calls this during the render phase of the next render after a
  // descendant throws, so it must stay a pure state derivation.
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
    // No error yet: render children exactly as passed through.
    return this.props.children;
  }
}

export default ErrorBoundary;
