import Card from '../ui/Card';
import CategoryBadge from './CategoryBadge';
import { formatDate, formatSize } from '../../utils/formatters';
import { colors } from '../../config/theme';

/**
 * Book Card component
 * Displays a book with its information
 */
const BookCard = ({
  book,
  onOpen,
  onDelete = null,
  showActions = true,
  className = '',
}) => {
  const handleClick = (e) => {
    // Don't trigger card click if clicking on delete button
    if (e.target.closest('.delete-button')) return;
    if (onOpen) onOpen(book);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) onDelete(book);
  };

  return (
    <Card
      className={className}
      padding="lg"
      shadow="sm"
      hoverable
      onClick={handleClick}
      style={{ height: '100%' }}
    >
      <div className="d-flex flex-column h-100">
        {/* Header with icon and delete button */}
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div className="flex-grow-1">
            <svg
              width="50"
              height="50"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mb-3"
            >
              <path
                d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
                stroke={colors.primary}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
                stroke={colors.primary}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          {showActions && onDelete && (
            <button
              className="btn btn-sm p-0 delete-button"
              onClick={handleDelete}
              style={{ color: colors.danger }}
              title="Supprimer"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Category Badge */}
        <div className="mb-2">
          <CategoryBadge categoryId={book.category} size="sm" />
        </div>

        {/* Book Title */}
        <h6
          className="card-title mb-2"
          style={{
            color: colors.text,
            fontSize: '0.95rem',
            fontWeight: '500',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {book.name}
        </h6>

        {/* Book Details */}
        <div className="mt-auto">
          <p className="text-muted small mb-1">
            <strong>Taille:</strong> {formatSize(book.size)}
          </p>
          <p className="text-muted small mb-1">
            <strong>Ajouté:</strong> {formatDate(book.addedDate)}
          </p>
          {book.lastRead && (
            <p className="text-muted small mb-0">
              <strong>Dernière lecture:</strong> {formatDate(book.lastRead)}
            </p>
          )}
          {book.currentPage && book.currentPage > 1 && (
            <p className="text-muted small mb-0">
              <strong>Page:</strong> {book.currentPage}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};


export default BookCard;
