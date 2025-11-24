'use client';

import Link from 'next/link';

interface PreviewTemplateButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
  openInNewTab?: boolean;
}

export default function PreviewTemplateButton({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  openInNewTab = false
}: PreviewTemplateButtonProps) {

  const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all';

  const variantStyles = {
    primary: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl',
    secondary: 'bg-gray-800 text-white hover:bg-gray-900 shadow-md hover:shadow-lg',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
    ghost: 'text-blue-600 hover:bg-blue-50'
  };

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  const combinedStyles = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`;

  return (
    <Link
      href="/preview-template"
      target={openInNewTab ? '_blank' : undefined}
      rel={openInNewTab ? 'noopener noreferrer' : undefined}
      className={combinedStyles}
    >
      <span className="text-xl">🎨</span>
      <span>Prévisualiser les Templates</span>
      {openInNewTab && <span className="text-sm">↗</span>}
    </Link>
  );
}
