import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = forwardRef(({ className, ...rest }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in',
      className
    )}
    {...rest}
  />
));
DialogOverlay.displayName = 'DialogOverlay';

const DialogContent = forwardRef(({ className, children, ...rest }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-xl animate-in',
        className
      )}
      {...rest}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
        <X className="h-4 w-4" />
        <span className="sr-only">Fermer</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = 'DialogContent';

const DialogHeader = ({ className, children, ...rest }) => (
  <div className={cn('flex flex-col gap-1.5 mb-4', className)} {...rest}>
    {children}
  </div>
);

const DialogTitle = forwardRef(({ className, ...rest }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-lg font-semibold text-gray-900', className)}
    {...rest}
  />
));
DialogTitle.displayName = 'DialogTitle';

const DialogDescription = forwardRef(({ className, ...rest }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-gray-500', className)}
    {...rest}
  />
));
DialogDescription.displayName = 'DialogDescription';

const DialogFooter = ({ className, children, ...rest }) => (
  <div className={cn('flex justify-end gap-3 mt-6', className)} {...rest}>
    {children}
  </div>
);

DialogContent.propTypes = { className: PropTypes.string, children: PropTypes.node };
DialogHeader.propTypes = { className: PropTypes.string, children: PropTypes.node };
DialogTitle.propTypes = { className: PropTypes.string };
DialogDescription.propTypes = { className: PropTypes.string };
DialogFooter.propTypes = { className: PropTypes.string, children: PropTypes.node };

export {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogClose,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
};
