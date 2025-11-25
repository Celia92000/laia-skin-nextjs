'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Menu } from 'lucide-react';

interface MenuItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface MobileMenuProps {
  organization: {
    name: string;
    logoUrl?: string;
    primaryColor: string;
    secondaryColor?: string;
  };
  menuItems?: MenuItem[];
  ctaLabel?: string;
  ctaHref?: string;
  theme?: 'dark' | 'light';
  // External state control (optional)
  isOpen?: boolean;
  onClose?: () => void;
  bookingLabel?: string;
}

export default function MobileMenu({
  organization,
  menuItems = [],
  ctaLabel = 'Réserver',
  ctaHref = '/booking',
  theme = 'dark',
  isOpen: externalIsOpen,
  onClose: externalOnClose,
  bookingLabel
}: MobileMenuProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  // Use external state if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = externalOnClose ? (value: boolean) => {
    if (!value) externalOnClose();
  } : setInternalIsOpen;

  // Use bookingLabel if provided, otherwise use ctaLabel
  const finalCtaLabel = bookingLabel || ctaLabel;

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-black' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-white/70' : 'text-gray-600';
  const borderColor = isDark ? 'border-white/10' : 'border-gray-200';

  return (
    <>
      {/* Hamburger Button - only show if not using external state */}
      {externalIsOpen === undefined && (
        <button
          onClick={() => setIsOpen(true)}
          className={`md:hidden p-2 rounded-lg transition-colors ${textColor} hover:bg-white/10`}
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      )}

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-[85%] max-w-sm ${bgColor} z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${borderColor}`}>
          {/* Logo or Name */}
          {organization.logoUrl ? (
            <Image
              src={organization.logoUrl}
              alt={organization.name}
              width={120}
              height={40}
              className="h-10 w-auto object-contain"
            />
          ) : (
            <h2 className={`text-xl font-bold ${textColor}`} style={{ color: organization.primaryColor }}>
              {organization.name}
            </h2>
          )}

          {/* Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className={`p-2 rounded-lg transition-colors ${textColor} hover:bg-white/10`}
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex flex-col p-6 space-y-2">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${textSecondary} hover:bg-white/10 ${
                isDark ? 'hover:text-white' : 'hover:text-gray-900'
              }`}
            >
              {item.icon && <span className="w-5 h-5">{item.icon}</span>}
              <span className="text-lg font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* CTA Button */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <Link
            href={ctaHref}
            onClick={() => setIsOpen(false)}
            className="block w-full py-4 rounded-lg font-bold text-center text-white transition-all hover:shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${organization.primaryColor}, ${organization.secondaryColor || organization.primaryColor})`
            }}
          >
            {finalCtaLabel}
          </Link>
        </div>
      </div>
    </>
  );
}
