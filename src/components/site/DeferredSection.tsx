import { ReactNode, useEffect, useRef, useState } from "react";

type DeferredSectionProps = {
  children: ReactNode;
  className?: string;
  id?: string;
  minHeight?: number;
};

export function DeferredSection({
  children,
  className = "",
  id,
  minHeight = 640,
}: DeferredSectionProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!ref.current || ready) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setReady(true);
        observer.disconnect();
      },
      { rootMargin: "320px 0px" },
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ready]);

  return (
    <div ref={ref} id={id} className={className} style={{ minHeight }}>
      {ready ? (
        children
      ) : (
        <div className="h-full min-h-full animate-pulse rounded-[2rem] bg-secondary/45" />
      )}
    </div>
  );
}
