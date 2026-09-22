import * as React from 'react';
import { ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

function Breadcrumb({ className, ...props }) {
  return <nav aria-label="breadcrumb" data-slot="breadcrumb" className={className} {...props} />;
}

function BreadcrumbList({ className, ...props }) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn('text-muted-foreground flex flex-wrap items-center gap-1.5 text-xs sm:text-sm sm:gap-2', className)}
      {...props}
    />
  );
}

function BreadcrumbItem({ className, ...props }) {
  return <li data-slot="breadcrumb-item" className={cn('inline-flex items-center gap-1.5', className)} {...props} />;
}

function BreadcrumbLink({ className, href, onClick, children, ...props }) {
  if (!href && !onClick) {
    return (
      <span
        data-slot="breadcrumb-link"
        className={cn('text-muted-foreground select-none font-normal', className)}
        {...props}
      >
        {children}
      </span>
    );
  }

  if (href) {
    return (
      <a
        data-slot="breadcrumb-link"
        href={href}
        onClick={onClick}
        className={cn('hover:text-foreground transition-colors cursor-pointer', className)}
        {...props}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type="button"
      data-slot="breadcrumb-link"
      onClick={onClick}
      className={cn('hover:text-foreground transition-colors cursor-pointer bg-transparent border-0 p-0 font-inherit text-inherit inline-flex items-center', className)}
      {...props}
    >
      {children}
    </button>
  );
}

function BreadcrumbPage({ className, ...props }) {
  return (
    <span
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn('text-foreground font-medium', className)}
      {...props}
    />
  );
}

function BreadcrumbSeparator({ children, className, ...props }) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn('[&>svg]:size-3.5 text-muted-foreground/60', className)}
      {...props}
    >
      {children ?? <ChevronRight />}
    </li>
  );
}

function BreadcrumbEllipsis({ className, ...props }) {
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cn('flex size-9 items-center justify-center', className)}
      {...props}
    >
      <MoreHorizontal className="size-4" />
      <span className="sr-only">More</span>
    </span>
  );
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};
export default Breadcrumb;
