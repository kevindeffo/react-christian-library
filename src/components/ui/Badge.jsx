import PropTypes from 'prop-types';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-lg font-medium',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-white',
        secondary: 'bg-secondary text-white',
        success: 'bg-success text-white',
        danger: 'bg-danger text-white',
        warning: 'bg-warning text-white',
        outline: 'border border-current bg-transparent',
        custom: '',
      },
      size: {
        sm: 'text-xs px-2.5 py-0.5',
        md: 'text-xs px-3 py-1',
        lg: 'text-sm px-4 py-1.5',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

const Badge = ({
  children,
  variant = 'primary',
  size = 'md',
  className,
  style,
  ...rest
}) => {
  return (
    <span
      className={cn(badgeVariants({ variant, size }), className)}
      style={style}
      {...rest}
    >
      {children}
    </span>
  );
};

Badge.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger', 'warning', 'outline', 'custom']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
  style: PropTypes.object,
};

export { badgeVariants };
export default Badge;
