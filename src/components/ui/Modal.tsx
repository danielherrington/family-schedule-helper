import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  headerContent?: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string | number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  bodyStyle?: React.CSSProperties;
  bodyClassName?: string;
  className?: string;
  closeOnOverlayClick?: boolean;
  onSubmit?: (e: React.FormEvent) => void;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  badge,
  headerContent,
  footer,
  maxWidth,
  size = 'md',
  children,
  bodyStyle,
  bodyClassName = '',
  className = '',
  closeOnOverlayClick = true,
  onSubmit,
}) => {
  // Lock background body scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;
    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = origOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeMaxWidthMap = {
    sm: '480px',
    md: '600px',
    lg: '760px',
    xl: '860px'
  };

  const calculatedMaxWidth = maxWidth || sizeMaxWidthMap[size];
  const CardComponent = (onSubmit ? 'form' : 'div') as React.ElementType;

  return (
    <div 
      className="modal-overlay" 
      onClick={closeOnOverlayClick ? onClose : undefined}
      role="dialog"
      aria-modal="true"
    >
      <CardComponent 
        className={`modal-card modal-size-${size} ${className}`}
        style={{ maxWidth: calculatedMaxWidth }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        onSubmit={onSubmit}
      >
        {/* Sticky Modal Header */}
        <div className="modal-header">
          <div className="modal-header-top">
            <div className="modal-header-text">
              <div className="modal-title-row">
                {icon && <span className="modal-title-icon">{icon}</span>}
                <div className="modal-title">{title}</div>
                {badge && <span className="modal-title-badge">{badge}</span>}
              </div>
              {subtitle && <div className="modal-subtitle">{subtitle}</div>}
            </div>
            <button 
              type="button" 
              className="nav-btn modal-close-btn" 
              onClick={onClose}
              aria-label="Close modal dialog"
              title="Close"
            >
              <X size={20} />
            </button>
          </div>

          {headerContent && (
            <div className="modal-header-extra">
              {headerContent}
            </div>
          )}
        </div>

        {/* Scrollable Modal Body (Guaranteed iOS WebKit scroll container) */}
        <div className={`modal-body ${bodyClassName}`} style={bodyStyle}>
          {children}
        </div>

        {/* Sticky Modal Footer */}
        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </CardComponent>
    </div>
  );
};
