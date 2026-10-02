// Global setup for Vitest unit tests (jsdom environment).

// jsdom does not implement ResizeObserver, which is used by some widgets
// (e.g. charts and Material components).
if (typeof (globalThis as any).ResizeObserver === 'undefined') {
  (globalThis as any).ResizeObserver = class {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  };
}
