"use client";

import { useEffect, useState } from "react";

interface FlyingDot {
  id: number;
  startX: number;
  startY: number;
  dx: number;
  dy: number;
}

export default function CartFlyAnimation() {
  const [dots, setDots] = useState<FlyingDot[]>([]);

  useEffect(() => {
    function handleAdd(e: Event) {
      const detail = (e as CustomEvent).detail as { x: number; y: number };
      const target = document.getElementById("cart-nav-link");
      if (!target) return;

      const targetRect = target.getBoundingClientRect();
      const dx = targetRect.left + targetRect.width / 2 - detail.x;
      const dy = targetRect.top + targetRect.height / 2 - detail.y;
      const id = Date.now() + Math.random();

      setDots((prev) => [
        ...prev,
        { id, startX: detail.x, startY: detail.y, dx, dy },
      ]);
      setTimeout(() => {
        setDots((prev) => prev.filter((d) => d.id !== id));
      }, 600);
    }

    window.addEventListener("cart:add", handleAdd);
    return () => window.removeEventListener("cart:add", handleAdd);
  }, []);

  return (
    <>
      {dots.map((dot) => (
        <span
          key={dot.id}
          style={
            {
              position: "fixed",
              left: dot.startX,
              top: dot.startY,
              "--dx": `${dot.dx}px`,
              "--dy": `${dot.dy}px`,
            } as React.CSSProperties
          }
          className="fly-to-cart-dot pointer-events-none z-50 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-flame-gradient shadow-md"
        />
      ))}
    </>
  );
}
