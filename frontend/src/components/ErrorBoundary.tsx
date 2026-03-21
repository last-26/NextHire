"use client";

import React from "react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Error boundary that catches DOM manipulation errors caused by
 * browser extensions (Grammarly, translate, etc.) injecting/removing
 * nodes from the React-managed DOM tree.
 *
 * On error it forces a clean re-render instead of showing a crash screen.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    // Only auto-recover from DOM manipulation errors (browser extension interference)
    const isDomError =
      error.name === "NotFoundError" ||
      error.message.includes("insertBefore") ||
      error.message.includes("removeChild") ||
      error.message.includes("is not a child of this node");

    if (isDomError) {
      // Schedule a re-render to recover
      requestAnimationFrame(() => {
        this.setState({ hasError: false });
      });
    }
  }

  render() {
    if (this.state.hasError) {
      // Brief flash — will auto-recover on next frame
      return null;
    }
    return this.props.children;
  }
}
