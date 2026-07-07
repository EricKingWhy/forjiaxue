"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface CardState {
  id: number;
  message: string;
  color: string;
  left: number;
  top: number;
  scale: number;
  angle: number;
  maximized: boolean;
  closing: boolean;
  zIndex: number;
}

const MESSAGES = [
  "保持好心情",
  "多喝水哦",
  "今天辛苦啦",
  "早点休息",
  "记得吃水果",
  "加油，你可以的",
  "祝你顺利",
  "保持微笑呀",
  "愿所有烦恼都消失",
  "期待下一次见面",
  "梦想总会实现",
  "天气冷了，多穿衣服",
  "记得给自己放松",
  "每天都要元气满满",
  "今天也要好好爱自己",
  "适当休息一下",
];

const COLORS = [
  "#ffe0e3",
  "#c7f0ff",
  "#ffd8a8",
  "#d9f2d9",
  "#e5d7ff",
  "#f9f7d9",
  "#d2f0f8",
  "#ffd4f5",
];

function randomFrom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => {
      const pointerCoarse = window.matchMedia("(pointer: coarse)").matches;
      setIsMobile(pointerCoarse || window.innerWidth <= 768);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return isMobile;
}

function StickyCard({
  card,
  isMobile,
  onClose,
  onMinimize,
  onToggleMaximize,
  onDragStart,
  onBringToFront,
}: {
  card: CardState;
  isMobile: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
  onDragStart: (e: React.PointerEvent) => void;
  onBringToFront: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  const cardStyle: React.CSSProperties = card.maximized
    ? {
        position: "fixed",
        left: 0,
        top: 0,
        width: "100vw",
        height: "100dvh",
        borderRadius: 0,
        zIndex: card.zIndex,
        opacity: card.closing ? 0 : 1,
        background: card.color,
      }
    : {
        left: `${card.left}px`,
        top: `${card.top}px`,
        zIndex: card.zIndex,
        opacity: card.closing ? 0 : 1,
        background: card.color,
      };

  return (
    <div
      ref={cardRef}
      className={`card ${card.maximized ? "maximized" : ""} ${card.closing ? "closing" : ""}`}
      style={{
        ...cardStyle,
        transform: `scale(${card.scale}) rotate(${card.angle}deg)`,
      }}
      onPointerDown={onBringToFront}
    >
      <div
        className="card-header"
        onPointerDown={(e) => {
          if (card.maximized) return;
          onDragStart(e);
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          onToggleMaximize();
        }}
      >
        <div className="window-controls">
          <button
            className="control close"
            type="button"
            aria-label="关闭"
            onClick={(e) => { e.stopPropagation(); onClose(); }}
          />
          <button
            className="control minimize"
            type="button"
            aria-label="最小化"
            onClick={(e) => { e.stopPropagation(); onMinimize(); }}
          />
          <button
            className="control maximize"
            type="button"
            aria-label="最大化"
            onClick={(e) => { e.stopPropagation(); onToggleMaximize(); }}
          />
        </div>
        <div className="card-title">温馨提示</div>
      </div>
      <div className="card-body">{card.message}</div>
    </div>
  );
}

export function NotesScreen() {
  const isMobile = useIsMobile();
  const [cards, setCards] = useState<CardState[]>([]);
  const idCounter = useRef(0);
  const zCursor = useRef(200);
  const boardRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{
    cardId: number;
    offsetX: number;
    offsetY: number;
    pendingLeft: number;
    pendingTop: number;
    dragFrame: number | null;
  } | null>(null);

  const maxCards = isMobile ? 120 : 180;
  const initialCardCount = isMobile ? 18 : 30;
  const spawnInterval = isMobile ? 700 : 400;

  const createCard = useCallback(() => {
    const id = idCounter.current++;
    const cardWidth = isMobile ? 180 : 220;
    const cardHeight = isMobile ? 130 : 140;
    const horizontalMargin = isMobile ? 12 : 16;
    const verticalMargin = isMobile ? 12 : 20;
    const angleRange = isMobile ? 6 : 10;
    const entryScale = isMobile ? 0.8 : 0.65;

    const left = horizontalMargin + Math.random() * Math.max(window.innerWidth - cardWidth - horizontalMargin * 2, 0);
    const top = verticalMargin + Math.random() * Math.max(window.innerHeight - cardHeight - verticalMargin * 2, 0);

    zCursor.current += 1;

    const newCard: CardState = {
      id,
      message: randomFrom(MESSAGES),
      color: randomFrom(COLORS),
      left,
      top,
      scale: entryScale,
      angle: (Math.random() - 0.5) * angleRange,
      maximized: false,
      closing: false,
      zIndex: zCursor.current,
    };

    setCards((prev) => {
      // Animate to scale 1 on next frame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setCards((curr) =>
            curr.map((c) => (c.id === id ? { ...c, scale: 1 } : c))
          );
        });
      });

      // Remove oldest if over limit
      if (prev.length >= maxCards) {
        return [...prev.slice(1), newCard];
      }
      return [...prev, newCard];
    });
  }, [isMobile, maxCards]);

  // Initial cards
  useEffect(() => {
    const timers: number[] = [];
    for (let i = 0; i < initialCardCount; i++) {
      timers.push(window.setTimeout(() => createCard(), i * (isMobile ? 60 : 40)));
    }
    return () => timers.forEach(clearTimeout);
  }, [createCard, initialCardCount, isMobile]);

  // Spawn loop
  useEffect(() => {
    let timer: number;
    const schedule = () => {
      timer = window.setTimeout(() => {
        if (!document.hidden) createCard();
        schedule();
      }, spawnInterval);
    };
    schedule();
    return () => clearTimeout(timer);
  }, [createCard, spawnInterval]);

  const bringToFront = useCallback((cardId: number) => {
    zCursor.current += 1;
    setCards((prev) =>
      prev.map((c) =>
        c.id === cardId && !c.maximized
          ? { ...c, zIndex: zCursor.current }
          : c
      )
    );
  }, []);

  const closeCard = useCallback((cardId: number) => {
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, closing: true } : c))
    );
    // Remove after animation
    window.setTimeout(() => {
      setCards((prev) => prev.filter((c) => c.id !== cardId));
    }, 400);
  }, []);

  const minimizeCard = useCallback((cardId: number) => {
    setCards((prev) =>
      prev.map((c) => {
        if (c.id !== cardId) return c;
        const bottom = Math.max(window.innerHeight - 24, 0);
        return {
          ...c,
          top: bottom,
          scale: 0.1,
          angle: 0,
          closing: true,
        };
      })
    );
    window.setTimeout(() => {
      setCards((prev) => prev.filter((c) => c.id !== cardId));
    }, 400);
  }, []);

  const toggleMaximize = useCallback((cardId: number) => {
    setCards((prev) => {
      const hasMaximized = prev.some((c) => c.maximized && c.id !== cardId);
      return prev.map((c) => {
        if (c.id === cardId) {
          return { ...c, maximized: !c.maximized };
        }
        if (hasMaximized && c.maximized) {
          return { ...c, maximized: false };
        }
        return c;
      });
    });
  }, []);

  const startDrag = useCallback((e: React.PointerEvent, cardId: number) => {
    const card = cards.find((c) => c.id === cardId);
    if (!card || card.closing || card.maximized) return;

    e.preventDefault();
    bringToFront(cardId);

    dragState.current = {
      cardId,
      offsetX: e.clientX - card.left,
      offsetY: e.clientY - card.top,
      pendingLeft: card.left,
      pendingTop: card.top,
      dragFrame: null,
    };

    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (!dragState.current) return;
      dragState.current.pendingLeft = moveEvent.clientX - dragState.current.offsetX;
      dragState.current.pendingTop = moveEvent.clientY - dragState.current.offsetY;
      if (dragState.current.dragFrame === null) {
        dragState.current.dragFrame = requestAnimationFrame(() => {
          if (!dragState.current) return;
          const cardWidth = isMobile ? 180 : 220;
          const cardHeight = isMobile ? 130 : 140;
          const maxLeft = Math.max(window.innerWidth - cardWidth, 0);
          const maxTop = Math.max(window.innerHeight - cardHeight, 0);
          const clampedLeft = clamp(dragState.current.pendingLeft, -cardWidth * 0.4, maxLeft);
          const clampedTop = clamp(dragState.current.pendingTop, -cardHeight * 0.4, maxTop);

          setCards((prev) =>
            prev.map((c) =>
              c.id === dragState.current!.cardId
                ? { ...c, left: clampedLeft, top: clampedTop }
                : c
            )
          );
          dragState.current.dragFrame = null;
        });
      }
    };

    const handlePointerUp = () => {
      if (dragState.current?.dragFrame !== null) {
        cancelAnimationFrame(dragState.current?.dragFrame ?? 0);
      }
      dragState.current = null;
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
    };

    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp);
  }, [cards, bringToFront, isMobile]);

  return (
    <div
      ref={boardRef}
      className="notes-board"
      style={{
        backgroundImage: `linear-gradient(0deg, #eee 1px, transparent 0), linear-gradient(90deg, #eee 1px, transparent 0)`,
        backgroundSize: "30px 30px",
      }}
    >
      <style>{`
        .notes-board {
          position: relative;
          width: 100vw;
          height: 100dvh;
          overflow: hidden;
          background-color: #fafafa;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        .notes-board .card {
          position: absolute;
          width: ${isMobile ? "180px" : "220px"};
          border-radius: ${isMobile ? "10px" : "12px"};
          box-shadow: 0 16px 35px rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(0, 0, 0, 0.08);
          overflow: hidden;
          transform-origin: center;
          transition: transform 0.35s ease, opacity 0.35s ease, left 0.35s ease,
            top 0.35s ease, width 0.35s ease, height 0.35s ease,
            border-radius 0.35s ease;
        }
        .notes-board .card.maximized {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100dvh;
          border-radius: 0;
          box-shadow: 0 28px 60px rgba(0, 0, 0, 0.4);
          display: flex;
          flex-direction: column;
        }
        .notes-board .card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          background: rgba(255, 255, 255, 0.7);
          cursor: grab;
          user-select: none;
          touch-action: pan-y;
        }
        .notes-board .window-controls {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .notes-board .window-controls .control {
          position: relative;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 1px solid rgba(0, 0, 0, 0.08);
          cursor: pointer;
          outline: none;
          padding: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .notes-board .window-controls .control.close {
          background: #ff5f57;
          border-color: #e0443e;
        }
        .notes-board .window-controls .control.minimize {
          background: #febb2e;
          border-color: #dea123;
        }
        .notes-board .window-controls .control.maximize {
          background: #28c840;
          border-color: #1aab2c;
        }
        .notes-board .card-title {
          font-size: ${isMobile ? "12px" : "13px"};
          font-weight: 600;
          color: rgba(0, 0, 0, 0.55);
          padding-left: 10px;
          flex: 1;
        }
        .notes-board .card.maximized .card-title {
          display: none;
        }
        .notes-board .card-body {
          padding: ${isMobile ? "14px" : "16px"};
          font-size: ${isMobile ? "14px" : "16px"};
          line-height: 1.4;
          font-weight: 600;
          color: rgba(0, 0, 0, 0.72);
          word-break: break-word;
          overflow-wrap: anywhere;
          white-space: normal;
        }
        .notes-board .card.maximized .card-body {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          text-align: center;
          padding: clamp(32px, min(10vw, 10vh), 128px);
          padding-top: clamp(72px, min(14vw, 14vh), 192px);
          font-size: clamp(48px, min(18vw, 18vh), 200px);
          line-height: 1.05;
        }
        .notes-board .window-controls .control::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        .notes-board .card-header:hover .window-controls .control::after {
          opacity: 0.8;
        }
        .notes-board .window-controls .control.close::after {
          content: '×';
          width: auto;
          height: auto;
          background: none;
          font-size: 10px;
          line-height: 1;
          font-weight: 700;
          color: rgba(0, 0, 0, 0.7);
        }
        .notes-board .window-controls .control.minimize::after {
          width: 6px;
          height: 2px;
          background: rgba(0, 0, 0, 0.6);
        }
        .notes-board .window-controls .control.maximize::after {
          width: 6px;
          height: 6px;
          background: linear-gradient(45deg,
            rgba(0, 0, 0, 0.6) 0%,
            rgba(0, 0, 0, 0.6) 45%,
            transparent 45%,
            transparent 55%,
            rgba(0, 0, 0, 0.6) 55%,
            rgba(0, 0, 0, 0.6) 100%);
        }
      `}</style>
      {cards.map((card) => (
        <StickyCard
          key={card.id}
          card={card}
          isMobile={isMobile}
          onClose={() => closeCard(card.id)}
          onMinimize={() => minimizeCard(card.id)}
          onToggleMaximize={() => toggleMaximize(card.id)}
          onDragStart={(e) => startDrag(e, card.id)}
          onBringToFront={() => bringToFront(card.id)}
        />
      ))}
    </div>
  );
}
