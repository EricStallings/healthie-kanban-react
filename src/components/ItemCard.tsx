import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useRef } from 'react'
import { useDragSwing } from '../hooks/useDragSwing'
import type { ColumnId, Item } from '../types'
import styles from './ItemCard.module.css'

type CardContentProps = {
  item: Item
  onRemove?: (itemId: string) => void
}

// What a card looks like. Shared by the card in the column and the copy that follows
// the pointer while dragging.
function CardContent({ item, onRemove }: CardContentProps) {
  return (
    <>
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
      {onRemove && (
        <button
          type="button"
          className={styles.removeButton}
          aria-label={`Remove "${item.title}"`}
          // Keep a click on the button from starting a drag.
          onPointerDown={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
          onClick={() => onRemove(item.id)}
        >
          ×
        </button>
      )}
    </>
  )
}

type SortableItemCardProps = {
  item: Item
  columnId: ColumnId
  onRemove: (itemId: string) => void
}

// A card in a column. useSortable makes it draggable and lets other cards make room.
export function SortableItemCard({ item, columnId, onRemove }: SortableItemCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id })

  const classNames = [styles.card]
  if (columnId === 'done') classNames.push(styles.done)
  // While dragging, the original stays in place as a faded placeholder.
  if (isDragging) classNames.push(styles.placeholder)

  return (
    <li
      ref={setNodeRef}
      className={classNames.join(' ')}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
    >
      <CardContent item={item} onRemove={onRemove} />
    </li>
  )
}

// The copy of the card that follows the pointer (rendered inside DragOverlay). It's the
// one that swings. dnd-kit measures the outer div to decide where the card is, so the
// tilt and lift go on the inner div. Otherwise the tilted box looks wider than it is,
// and keyboard moves pick the wrong column.
export function DraggingItemCard({ item }: { item: Item }) {
  const cardRef = useRef<HTMLDivElement>(null)
  useDragSwing(cardRef)

  return (
    <div>
      <div ref={cardRef} className={`${styles.card} ${styles.dragging}`}>
        <CardContent item={item} />
      </div>
    </div>
  )
}
