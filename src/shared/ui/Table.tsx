// src/shared/ui/Table.tsx - Design System v2.0
import React from 'react';

// =============================================================================
// TYPES
// =============================================================================

export interface TableRootProps extends React.HTMLAttributes<HTMLTableElement> {
  /** Size of the table */
  size?: 'sm' | 'md' | 'lg';
  /** Visual variant */
  variant?: 'line' | 'outline' | 'simple';
  /** Show column borders */
  showColumnBorder?: boolean;
  /** Striped rows */
  striped?: boolean;
  /** Interactive hover effects */
  interactive?: boolean;
  /** Sticky header */
  stickyHeader?: boolean;
  /** Color palette */
  colorPalette?: 'gray' | 'brand' | 'success' | 'warning' | 'error';
  children: React.ReactNode;
}

export interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

export interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

export interface TableFooterProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode;
}

export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
  /** Numeric alignment for numbers */
  numeric?: boolean;
}

export interface TableColumnHeaderProps extends React.ThHTMLAttributes<HTMLTableHeaderCellElement> {
  children: React.ReactNode;
  /** Numeric alignment for numbers */
  numeric?: boolean;
}

export interface TableCaptionProps extends React.HTMLAttributes<HTMLTableCaptionElement> {
  children: React.ReactNode;
  /** Position of caption */
  side?: 'top' | 'bottom';
}

// =============================================================================
// STYLES
// =============================================================================

const getTableStyles = (props: TableRootProps): React.CSSProperties & Record<string, string> => {
  const {
    size = 'md',
    variant = 'line',
    showColumnBorder = false
  } = props;

  const sizeStyles = {
    sm: {
      '--table-cell-padding': '0.5rem',
      '--table-font-size': '0.875rem',
      '--table-line-height': '1.25rem'
    },
    md: {
      '--table-cell-padding': '0.75rem',
      '--table-font-size': '1rem',
      '--table-line-height': '1.5rem'
    },
    lg: {
      '--table-cell-padding': '1rem',
      '--table-font-size': '1.125rem',
      '--table-line-height': '1.75rem'
    }
  };

  const variantStyles = {
    line: {
      '--table-border': 'none',
      '--table-border-bottom': '1px solid var(--border-subtle)',
      '--table-header-border': '1px solid var(--border-subtle)'
    },
    outline: {
      '--table-border': '1px solid var(--border-subtle)',
      '--table-border-bottom': '1px solid var(--border-subtle)',
      '--table-header-border': '1px solid var(--border-subtle)'
    },
    simple: {
      '--table-border': 'none',
      '--table-border-bottom': 'none',
      '--table-header-border': 'none'
    }
  };

  return {
    width: '100%',
    borderCollapse: 'collapse',
    border: variantStyles[variant]['--table-border'],
    borderRadius: '0.375rem',
    overflow: 'hidden',
    fontSize: sizeStyles[size]['--table-font-size'],
    lineHeight: sizeStyles[size]['--table-line-height'],
    ...sizeStyles[size],
    ...variantStyles[variant],
    '--table-stripe-bg': 'var(--bg-subtle)',
    '--table-hover-bg': 'var(--bg-subtle)',
    '--table-column-border': showColumnBorder ? '1px solid var(--border-subtle)' : 'none'
  } as React.CSSProperties & Record<string, string>;
};

const getHeaderStyles = (stickyHeader?: boolean): React.CSSProperties => ({
  backgroundColor: 'var(--bg-surface)',
  borderBottom: 'var(--table-header-border)',
  position: stickyHeader ? 'sticky' : 'static',
  top: stickyHeader ? 0 : 'auto',
  zIndex: stickyHeader ? 10 : 'auto'
});

const getRowStyles = (isStriped?: boolean, isInteractive?: boolean): React.CSSProperties => ({
  borderBottom: 'var(--table-border-bottom)',
  backgroundColor: isStriped ? 'var(--table-stripe-bg)' : 'transparent',
  transition: isInteractive ? 'background-color 0.2s' : 'none'
  // Note: hover effects should be handled via CSS classes, not inline styles
});

const getCellStyles = (numeric?: boolean): React.CSSProperties => ({
  padding: 'var(--table-cell-padding)',
  textAlign: numeric ? 'right' : 'left',
  verticalAlign: 'middle',
  borderRight: 'var(--table-column-border)'
});

const getHeaderCellStyles = (numeric?: boolean): React.CSSProperties => ({
  padding: 'var(--table-cell-padding)',
  textAlign: numeric ? 'right' : 'left',
  verticalAlign: 'middle',
  fontWeight: '600',
  color: 'var(--text-subtle)',
  borderRight: 'var(--table-column-border)'
});

// =============================================================================
// COMPONENTS
// =============================================================================

const TableRoot: React.FC<TableRootProps> = ({
  children,
  className = '',
  style,
  size,
  variant,
  showColumnBorder,
  ...htmlProps
}) => {
  const tableStyles = getTableStyles({ size, variant, showColumnBorder, children });

  return (
    <div style={{ overflowX: 'auto', borderRadius: '0.375rem' }}>
      <table
        className={`table ${className}`}
        style={{ ...tableStyles, ...style }}
        {...htmlProps}
      >
        {children}
      </table>
    </div>
  );
};

const TableHeader: React.FC<TableHeaderProps> = ({ 
  children, 
  className = '', 
  style,
  ...props 
}) => {
  return (
    <thead
      className={`table-header ${className}`}
      style={{ ...getHeaderStyles(), ...style }}
      {...props}
    >
      {children}
    </thead>
  );
};

const TableBody: React.FC<TableBodyProps> = ({ 
  children, 
  className = '', 
  ...props 
}) => (
  <tbody className={`table-body ${className}`} {...props}>
    {children}
  </tbody>
);

const TableFooter: React.FC<TableFooterProps> = ({ 
  children, 
  className = '', 
  ...props 
}) => (
  <tfoot className={`table-footer ${className}`} {...props}>
    {children}
  </tfoot>
);

const TableRow: React.FC<TableRowProps> = ({ 
  children, 
  className = '', 
  style,
  ...props 
}) => {
  return (
    <tr
      className={`table-row ${className}`}
      style={{ ...getRowStyles(), ...style }}
      {...props}
    >
      {children}
    </tr>
  );
};

const TableCell: React.FC<TableCellProps> = ({ 
  children, 
  className = '', 
  style,
  numeric,
  ...props 
}) => (
  <td
    className={`table-cell ${className}`}
    style={{ ...getCellStyles(numeric), ...style }}
    {...props}
  >
    {children}
  </td>
);

const TableColumnHeader: React.FC<TableColumnHeaderProps> = ({ 
  children, 
  className = '', 
  style,
  numeric,
  ...props 
}) => (
  <th
    className={`table-column-header ${className}`}
    style={{ ...getHeaderCellStyles(numeric), ...style }}
    {...props}
  >
    {children}
  </th>
);

const TableCaption: React.FC<TableCaptionProps> = ({ 
  children, 
  className = '', 
  side = 'bottom',
  style,
  ...props 
}) => (
  <caption
    className={`table-caption ${className}`}
    style={{ 
      captionSide: side,
      padding: 'var(--table-cell-padding)',
      fontSize: '0.875rem',
      color: 'var(--text-subtle)',
      ...style 
    }}
    {...props}
  >
    {children}
  </caption>
);

// =============================================================================
// COMPOUND COMPONENT
// =============================================================================

export const Table = {
  Root: TableRoot,
  Header: TableHeader,
  Body: TableBody,
  Footer: TableFooter,
  Row: TableRow,
  Cell: TableCell,
  ColumnHeader: TableColumnHeader,
  Caption: TableCaption
};

export default Table;
