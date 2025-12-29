import { borderRadius } from '../../config/theme';

/**
 * Reusable Badge component
 * @param {object} props - Component props
 */
const Badge = ({
  children,
  color = '#8b5cf6',
  textColor = 'white',
  size = 'md',
  rounded = true,
  className = '',
  style = {},
  ...rest
}) => {
  const sizes = {
    sm: {
      fontSize: '0.7rem',
      padding: '4px 10px',
    },
    md: {
      fontSize: '0.75rem',
      padding: '6px 12px',
    },
    lg: {
      fontSize: '0.875rem',
      padding: '8px 16px',
    },
  };

  const badgeStyle = {
    backgroundColor: color,
    color: textColor,
    ...sizes[size],
    borderRadius: rounded ? borderRadius.md : borderRadius.sm,
    display: 'inline-block',
    fontWeight: '500',
    ...style,
  };

  return (
    <span className={`badge ${className}`} style={badgeStyle} {...rest}>
      {children}
    </span>
  );
};


export default Badge;
