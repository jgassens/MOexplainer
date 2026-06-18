import { ExternalLink as ExternalLinkIcon } from 'lucide-react';
import type { AnchorHTMLAttributes, ReactNode } from 'react';

interface ExternalLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  children: ReactNode;
}

export function ExternalLink({ children, ...props }: ExternalLinkProps) {
  return (
    <a {...props} target="_blank" rel="noreferrer">
      {children}
      <ExternalLinkIcon aria-hidden="true" size={16} />
    </a>
  );
}
