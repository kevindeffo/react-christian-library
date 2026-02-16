import { Trash2, BookOpen } from 'lucide-react';
import { Card } from '../ui/Card';
import CategoryBadge from './CategoryBadge';
import { formatDate, formatSize } from '../../utils/formatters';
import { cn } from '../../lib/utils';

const BookCard = ({
  book,
  onOpen,
  onDelete = null,
  showActions = true,
  className = '',
}) => {
  const handleClick = (e) => {
    if (e.target.closest('.delete-button')) return;
    if (onOpen) onOpen(book);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) onDelete(book);
  };

  return (
    <Card
      className={cn('h-full', className)}
      hoverable
      onClick={handleClick}
    >
      <div className="p-6 flex flex-col h-full">
        {/* Header with icon and delete button */}
        <div className="flex justify-between items-start mb-3">
          <BookOpen className="w-10 h-10 text-primary" />
          {showActions && onDelete && (
            <button
              className="delete-button p-1.5 rounded-lg text-gray-400 hover:text-danger hover:bg-red-50 transition-colors"
              onClick={handleDelete}
              aria-label="Supprimer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Badge */}
        <div className="mb-2">
          <CategoryBadge categoryId={book.category} size="sm" />
        </div>

        {/* Book Title */}
        <h6 className="text-sm font-medium text-gray-700 line-clamp-2 mb-2">
          {book.name}
        </h6>

        {/* Book Details */}
        <div className="mt-auto space-y-1">
          <p className="text-xs text-gray-500">
            <span className="font-medium">Taille:</span> {formatSize(book.size)}
          </p>
          <p className="text-xs text-gray-500">
            <span className="font-medium">Ajouté:</span> {formatDate(book.addedDate)}
          </p>
          {book.lastRead && (
            <p className="text-xs text-gray-500">
              <span className="font-medium">Dernière lecture:</span> {formatDate(book.lastRead)}
            </p>
          )}
          {book.currentPage && book.currentPage > 1 && (
            <p className="text-xs text-gray-500">
              <span className="font-medium">Page:</span> {book.currentPage}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default BookCard;
