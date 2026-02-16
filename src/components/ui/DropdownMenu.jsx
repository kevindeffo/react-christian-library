import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { cn } from '../../lib/utils';

const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

const DropdownMenuContent = forwardRef(
  ({ className, sideOffset = 8, ...rest }, ref) => (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
          'z-50 min-w-48 rounded-xl border border-gray-100 bg-white p-1 shadow-lg animate-in',
          className
        )}
        {...rest}
      />
    </DropdownMenuPrimitive.Portal>
  )
);
DropdownMenuContent.displayName = 'DropdownMenuContent';

const DropdownMenuItem = forwardRef(({ className, ...rest }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      'flex items-center gap-2 rounded-lg px-3 py-2 text-sm cursor-pointer outline-none transition-colors hover:bg-gray-100 data-[highlighted]:bg-gray-100',
      className
    )}
    {...rest}
  />
));
DropdownMenuItem.displayName = 'DropdownMenuItem';

const DropdownMenuSeparator = forwardRef(({ className, ...rest }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn('h-px bg-gray-100 my-1', className)}
    {...rest}
  />
));
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator';

const DropdownMenuLabel = forwardRef(({ className, ...rest }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn('px-3 py-2 text-xs font-semibold text-gray-500', className)}
    {...rest}
  />
));
DropdownMenuLabel.displayName = 'DropdownMenuLabel';

DropdownMenuContent.propTypes = { className: PropTypes.string, sideOffset: PropTypes.number };
DropdownMenuItem.propTypes = { className: PropTypes.string };
DropdownMenuSeparator.propTypes = { className: PropTypes.string };
DropdownMenuLabel.propTypes = { className: PropTypes.string };

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
};
