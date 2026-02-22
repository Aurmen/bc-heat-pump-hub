'use client';

interface OutboundLinkProps {
  href: string;
  company: string;
  city: string;
  eventName?: string;
  className?: string;
  children: React.ReactNode;
}

export default function OutboundLink({
  href,
  company,
  city,
  eventName = 'outbound_click',
  className,
  children,
}: OutboundLinkProps) {
  function handleClick() {
    if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', eventName, {
        company_name: company,
        destination_url: href,
        city,
      });
    }
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}
