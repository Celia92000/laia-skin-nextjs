'use client';

import Link from 'next/link';

interface HoverButtonProps {
  href: string;
  accentColor: string;
  children: React.ReactNode;
  className?: string;
}

export function HoverButton({ href, accentColor, children, className = '' }: HoverButtonProps) {
  return (
    <Link
      href={href}
      className={className}
      style={{ borderColor: 'white' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'white';
        e.currentTarget.style.color = accentColor;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
        e.currentTarget.style.color = 'white';
      }}
    >
      {children}
    </Link>
  );
}
