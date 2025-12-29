import { borderRadius, shadows } from '../../config/theme';

/**
 * Reusable Card component
 * @param {object} props - Component props
 */
const Card = ({
  children,
  className = '',
  style = {},
  shadow = 'sm',
  padding = 'md',
  hoverable = false,
  onClick = null,
  ...rest
}) => {
  const paddingValues = {
    none: '0',
    sm: '12px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  };

  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: borderRadius.lg,
    border: 'none',
    boxShadow: shadows[shadow],
    padding: paddingValues[padding],
    transition: 'all 0.3s ease',
    cursor: hoverable || onClick ? 'pointer' : 'default',
    ...style,
  };

  const hoverStyle = hoverable || onClick ? {
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: shadows.lg,
    }
  } : {};

  return (
    <div
      className={`card ${className}`}
      style={cardStyle}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (hoverable || onClick) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = shadows.lg;
        }
      }}
      onMouseLeave={(e) => {
        if (hoverable || onClick) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = shadows[shadow];
        }
      }}
      {...rest}
    >
      {children}
    </div>
  );
};


export default Card;
