import Badge from '../ui/Badge';
import { useCategories } from '../../hooks/useCategories';

const CategoryBadge = ({
  categoryId,
  showIcon = true,
  showName = true,
  size = 'md',
  className = '',
  ...rest
}) => {
  const { getCategoryById } = useCategories();
  const category = getCategoryById(categoryId);

  if (!category) {
    return (
      <Badge variant="custom" size={size} className={className} style={{ backgroundColor: '#94a3b8', color: 'white' }} {...rest}>
        Inconnu
      </Badge>
    );
  }

  return (
    <Badge
      variant="custom"
      size={size}
      className={className}
      style={{ backgroundColor: category.color, color: 'white' }}
      {...rest}
    >
      {showIcon && <span>{category.icon}</span>}
      {showIcon && showName && ' '}
      {showName && category.name}
    </Badge>
  );
};

export default CategoryBadge;
