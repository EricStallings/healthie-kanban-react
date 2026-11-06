import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useRef } from 'react'
import { useDragSwing } from '../hooks/useDragSwing'
import type { ColumnId, Item } from '../types'
import styles from './ItemCard.module.css'

// What a card looks like: avatar, title, character. Shared by the card in the column and
// the copy that follows the pointer while dragging.
function CardContent({ item }: { item: Item }) {
  return (
    <div className={styles.content}>
      <img
        className={styles.avatar}
        src={item.character.image}
        alt=""
        loading="lazy"
        draggable={false}
      />
      <div className={styles.text}>
        <span className={styles.title}>{item.title}</span>
        <span className={styles.characterName}>{item.character.name}</span>
      </div>
    </div>
  )
}

type SortableItemCardProps = {
  item: Item
  columnId: ColumnId
  onRemove: (itemId: string) => void
}

// A card in a column. useSortable makes it draggable and lets other cards make room.
// The drag handle and the remove button are siblings, not nested, so each is its own
// control for keyboard and screen reader users.
export function SortableItemCard({ item, columnId, onRemove }: SortableItemCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  // The column class colors the avatar ring (and Done's left edge).
  const classNames = [styles.card, styles[columnId]]
  // While dragging, the original stays in place as a faded placeholder.
  if (isDragging) classNames.push(styles.placeholder)

  return (
    <li
      ref={setNodeRef}
      className={classNames.join(' ')}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <div
        ref={setActivatorNodeRef}
        className={styles.handle}
        // Lets the board move focus to this card after a neighbor is removed.
        data-item-id={item.id}
        {...attributes}
        {...listeners}
      >
        <CardContent item={item} />
      </div>
      <button
        type="button"
        className={styles.removeButton}
        aria-label={`Remove "${item.title}"`}
        onClick={() => onRemove(item.id)}
      >
        ×
      </button>
    </li>
  )
}

// The copy of the card that follows the pointer (rendered inside DragOverlay). It's the
// one that swings. dnd-kit measures the outer div to decide where the card is, so the
// tilt and lift go on the inner div. Otherwise the tilted box looks wider than it is,
// and keyboard moves pick the wrong column.
export function DraggingItemCard({ item, columnId }: { item: Item; columnId: ColumnId }) {
  const cardRef = useRef<HTMLDivElement>(null)
  useDragSwing(cardRef)

  return (
    <div>
      <div
        ref={cardRef}
        className={`${styles.card} ${styles[columnId]} ${styles.dragging}`}
      >
        <div className={styles.handle}>
          <CardContent item={item} />
        </div>
      </div>
    </div>
  )
}
