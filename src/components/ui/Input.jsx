import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { cn } from '../../lib/utils';

const Input = forwardRef(({ className, error, type = 'text', ...rest }, ref) => {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        'flex h-10 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50',
        error && 'border-danger focus-visible:ring-danger',
        className
      )}
      {...rest}
    />
  );
});

Input.displayName = 'Input';

Input.propTypes = {
  className: PropTypes.string,
  error: PropTypes.bool,
  type: PropTypes.string,
};

export default Input;
