import Badge from '../ui/Badge';
import { useCategories } from '../../hooks/useCategories';

/**
 * Category Badge component
 * Displays a category badge with icon, name and color
 */
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

  if (!category) return null;

  return (
    <Badge
      color={category.color}
      size={size}
      className={className}
      {...rest}
    >
      {showIcon && <span>{category.icon}</span>}
      {showIcon && showName && ' '}
      {showName && category.name}
    </Badge>
  );
};


export default CategoryBadge;
