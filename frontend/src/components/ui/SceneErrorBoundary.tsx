"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

export class SceneErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("3D scene unavailable", error, info.componentStack);
  }
  render() {
    if (!this.state.failed) return this.props.children;
    return this.props.fallback ?? (
      <div className="grid h-full w-full place-items-center bg-[#090308] px-6 text-center text-xs leading-6 tracking-[0.14em] text-[#c9aaa6]/70" role="status">
        光影暂时隐去，故事仍在继续。
      </div>
    );
  }
}
