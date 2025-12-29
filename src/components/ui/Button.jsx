import { colors, borderRadius } from '../../config/theme';

/**
 * Reusable Button component
 * @param {object} props - Component props
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon = null,
  onClick,
  type = 'button',
  className = '',
  style = {},
  ...rest
}) => {
  const variants = {
    primary: {
      backgroundColor: colors.primary,
      color: 'white',
      border: 'none',
    },
    secondary: {
      backgroundColor: colors.secondary,
      color: 'white',
      border: 'none',
    },
    success: {
      backgroundColor: colors.success,
      color: 'white',
      border: 'none',
    },
    danger: {
      backgroundColor: colors.danger,
      color: 'white',
      border: 'none',
    },
    outline: {
      backgroundColor: 'transparent',
      color: colors.primary,
      border: `1px solid ${colors.primary}`,
    },
    ghost: {
      backgroundColor: colors.backgroundDark,
      color: colors.text,
      border: 'none',
    },
  };

  const sizes = {
    sm: {
      padding: '8px 16px',
      fontSize: '0.875rem',
    },
    md: {
      padding: '12px 24px',
      fontSize: '1rem',
    },
    lg: {
      padding: '16px 32px',
      fontSize: '1.125rem',
    },
  };

  const buttonStyle = {
    ...variants[variant],
    ...sizes[size],
    borderRadius: borderRadius.xl,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.6 : 1,
    transition: 'all 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontWeight: '500',
    width: fullWidth ? '100%' : 'auto',
    ...style,
  };

  return (
    <button
      type={type}
      className={`btn ${className}`}
      style={buttonStyle}
      onClick={onClick}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <>
          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          <span>Chargement...</span>
        </>
      ) : (
        <>
          {icon && <span>{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};


export default Button;
