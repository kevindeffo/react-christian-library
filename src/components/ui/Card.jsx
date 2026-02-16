import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { cn } from '../../lib/utils';

const Card = forwardRef(
  ({ children, className, hoverable = false, onClick, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl border border-gray-100 bg-white shadow-card',
          hoverable &&
            'hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 cursor-pointer',
          onClick && !hoverable && 'cursor-pointer',
          className
        )}
        onClick={onClick}
        {...rest}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

Card.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  hoverable: PropTypes.bool,
  onClick: PropTypes.func,
};

const CardHeader = ({ children, className, ...rest }) => {
  return (
    <div className={cn('px-6 pt-6 pb-2', className)} {...rest}>
      {children}
    </div>
  );
};

CardHeader.displayName = 'CardHeader';

CardHeader.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

const CardTitle = ({ children, className, ...rest }) => {
  return (
    <h3 className={cn('text-lg font-semibold text-gray-900', className)} {...rest}>
      {children}
    </h3>
  );
};

CardTitle.displayName = 'CardTitle';

CardTitle.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

const CardContent = ({ children, className, ...rest }) => {
  return (
    <div className={cn('px-6 py-4', className)} {...rest}>
      {children}
    </div>
  );
};

CardContent.displayName = 'CardContent';

CardContent.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

const CardFooter = ({ children, className, ...rest }) => {
  return (
    <div className={cn('px-6 pb-6 pt-2', className)} {...rest}>
      {children}
    </div>
  );
};

CardFooter.displayName = 'CardFooter';

CardFooter.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

export { Card, CardHeader, CardTitle, CardContent, CardFooter };
export default Card;
