"use client";

import { useEffect } from "react";

import { getMusic, resolveApiUrl } from "../lib/api-client.ts";
import { calculateAudioBands, createAnalyser } from "../lib/audio-analyser.ts";
import { useAudioStore } from "../stores/audioStore.ts";
import type { MusicResponse } from "../types/index.ts";

export interface ResumableAudioContext {
  state: string;
  resume: () => Promise<void>;
}

type AudioContextConstructor<T extends ResumableAudioContext> = new () => T;

export function createAudioContext<T extends ResumableAudioContext>(
  Constructor?: AudioContextConstructor<T>,
): T | AudioContext {
  const Context = Constructor ?? window.AudioContext;
  return new Context();
}

export async function resumeAudioContext(context: ResumableAudioContext) {
  if (context.state === "suspended") await context.resume();
}

interface MediaContextLike<
  TElement extends object,
  TSource extends object,
> {
  destination: object;
  createMediaElementSource: (element: TElement) => TSource;
}

const connectedSources = new WeakMap<object, object>();

export function connectMusicElement<
  TElement extends object,
  TSource extends object,
>(
  context: MediaContextLike<TElement, TSource>,
  element: TElement,
  destination: object = context.destination,
): TSource {
  const existing = connectedSources.get(element);
  if (existing) return existing as TSource;
  const source = context.createMediaElementSource(element);
  (source as unknown as { connect: (target: object) => unknown }).connect(destination);
  connectedSources.set(element, source);
  return source;
}

interface AudioEngine {
  context: AudioContext;
  analyser: AnalyserNode;
  data: Uint8Array<ArrayBuffer>;
  frameId: number;
}

const audioEngines = new WeakMap<HTMLAudioElement, AudioEngine>();

function ensureAudioEngine(element: HTMLAudioElement): AudioEngine {
  const existing = audioEngines.get(element);
  if (existing) return existing;
  const context = createAudioContext() as AudioContext;
  const analyser = createAnalyser(context);
  connectMusicElement(context, element, analyser);
  analyser.connect(context.destination);
  const engine: AudioEngine = {
    context,
    analyser,
    data: new Uint8Array(analyser.frequencyBinCount),
    frameId: 0,
  };
  audioEngines.set(element, engine);
  return engine;
}

function sampleAudio(element: HTMLAudioElement, engine: AudioEngine) {
  if (element.paused) return;
  engine.analyser.getByteFrequencyData(engine.data);
  useAudioStore.getState().setBands(
    calculateAudioBands(engine.data, engine.context.sampleRate, engine.analyser.fftSize),
  );
  engine.frameId = requestAnimationFrame(() => sampleAudio(element, engine));
}

export async function toggleAudioPlayback(element: HTMLAudioElement) {
  if (!element.paused) {
    element.pause();
    useAudioStore.getState().setIsPlaying(false);
    return;
  }
  const engine = ensureAudioEngine(element);
  await resumeAudioContext(engine.context);
  await element.play();
  useAudioStore.getState().setIsPlaying(true);
  cancelAnimationFrame(engine.frameId);
  sampleAudio(element, engine);
}

interface MusicElementLike {
  src: string;
  preload: string;
  loop: boolean;
}

export function createMusicElement(track: MusicResponse): HTMLAudioElement;
export function createMusicElement<T extends MusicElementLike>(
  track: MusicResponse,
  factory: (source: string) => T,
): T;
export function createMusicElement(
  track: MusicResponse,
  factory: (source: string) => MusicElementLike = (source) => new Audio(source),
): MusicElementLike {
  const element = factory(resolveApiUrl(track.music_url));
  element.preload = "auto";
  element.loop = true;
  return element;
}

export function useAudio() {
  const setAudioElement = useAudioStore((state) => state.setAudioElement);
  useEffect(() => {
    let cancelled = false;
    let cleanupElement: (() => void) | undefined;
    getMusic().then((track) => {
      if (cancelled || !track) return;
      const element = createMusicElement(track);
      const syncProgress = () => {
        useAudioStore.getState().setProgress(
          Number.isFinite(element.currentTime) ? element.currentTime : 0,
          Number.isFinite(element.duration) ? element.duration : 0,
        );
      };
      const syncPlaying = () => useAudioStore.getState().setIsPlaying(!element.paused);
      element.addEventListener("timeupdate", syncProgress);
      element.addEventListener("loadedmetadata", syncProgress);
      element.addEventListener("play", syncPlaying);
      element.addEventListener("pause", syncPlaying);
      element.addEventListener("ended", syncPlaying);
      cleanupElement = () => {
        element.removeEventListener("timeupdate", syncProgress);
        element.removeEventListener("loadedmetadata", syncProgress);
        element.removeEventListener("play", syncPlaying);
        element.removeEventListener("pause", syncPlaying);
        element.removeEventListener("ended", syncPlaying);
      };
      setAudioElement(element);
    }).catch(() => undefined);
    return () => {
      cancelled = true;
      cleanupElement?.();
    };
  }, [setAudioElement]);
}
