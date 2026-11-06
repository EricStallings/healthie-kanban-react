import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { COLUMN_TITLES, type ColumnId, type Item } from '../types'
import { SortableItemCard } from './ItemCard'
import styles from './Column.module.css'

type ColumnProps = {
  columnId: ColumnId
  items: Item[]
  onRemove: (itemId: string) => void
}

// One column. useDroppable lets cards land on it even when it's empty, and
// SortableContext lets the cards inside reorder.
export function Column({ columnId, items, onRemove }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: columnId })
  const headingId = `column-${columnId}-heading`

  return (
    <section
      className={`${styles.column} ${isOver ? styles.over : ''}`}
      aria-labelledby={headingId}
    >
      <h2 className={styles.header} id={headingId}>
        <span className={`${styles.dot} ${styles[columnId]}`} aria-hidden="true" />
        {COLUMN_TITLES[columnId]}
        <span className={styles.count} aria-label={`${items.length} items`}>
          {items.length}
        </span>
      </h2>

      <SortableContext
        items={items.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <ul ref={setNodeRef} className={styles.list}>
          {items.map((item) => (
            <SortableItemCard
              key={item.id}
              item={item}
              columnId={columnId}
              onRemove={onRemove}
            />
          ))}
          {items.length === 0 && <li className={styles.empty}>Drop items here</li>}
        </ul>
      </SortableContext>
    </section>
  )
}
