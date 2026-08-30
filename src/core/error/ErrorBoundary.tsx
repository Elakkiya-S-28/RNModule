import React, { Component, ErrorInfo, ReactNode } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { logger } from '../logger';
import { useThemeStore } from '../theme/themeStore';

interface Props {
  children: ReactNode;
  /** Fallback render for production (custom). */
  renderFallback?: (retry: () => void, error: Error) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Global error boundary. Catches render-time errors anywhere in the tree below
 * it, logs them via the logger (feeding crash-report abstraction), and shows a
 * friendly fallback with a "Try again" action instead of a blank screen.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    logger.error('Unhandled UI error', {
      message: error.message,
      stack: error.stack,
      componentStack: info.componentStack,
    });
    // Crash-reporting abstraction hook would be invoked here.
  }

  private retry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.renderFallback) {
        return this.props.renderFallback(this.retry, this.state.error as Error);
      }
      return <ErrorFallback retry={this.retry} />;
    }
    return this.props.children;
  }
}

function ErrorFallback({ retry }: { retry: () => void }) {
  const theme = useThemeStore(s => s.theme);
  const c = theme.colors;
  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <Text style={[styles.title, { color: c.text }]}>Something went wrong</Text>
      <Text style={[styles.subtitle, { color: c.textSecondary }]}>
        An unexpected error occurred. You can try again below.
      </Text>
      <Pressable
        onPress={retry}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: c.primary, opacity: pressed ? 0.85 : 1 },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Retry"
      >
        <Text style={styles.buttonText}>Try again</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  button: {
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 999,
  },
  buttonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
});

export default ErrorBoundary;