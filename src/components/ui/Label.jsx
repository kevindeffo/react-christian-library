import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cn } from '../../lib/utils';

const Label = forwardRef(({ className, children, required, ...rest }, ref) => {
  return (
    <LabelPrimitive.Root
      ref={ref}
      className={cn('text-sm font-semibold text-gray-700', className)}
      {...rest}
    >
      {children}
      {required && <span className="text-danger ml-1">*</span>}
    </LabelPrimitive.Root>
  );
});

Label.displayName = 'Label';

Label.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  required: PropTypes.bool,
};

export default Label;
