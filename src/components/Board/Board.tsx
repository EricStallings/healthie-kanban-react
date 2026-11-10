// Drag and drop: I've used react-beautiful-dnd before, but it's deprecated (Atlassian
// archived it), so this uses dnd-kit, which is actively maintained, supports React 19, and
// has keyboard and screen reader support built in.
import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useRef, useState, type Dispatch } from 'react'
import { findColumn, isNewlyDone, type BoardAction } from '../../board/boardReducer'
import { celebrate } from '../../celebrate'
import { COLUMN_IDS, COLUMN_TITLES, type BoardState, type ColumnId } from '../../types'
import { Column } from '../Column'
import { DraggingItemCard } from '../ItemCard'
import { showItemDoneToast } from '../../toasts'
import styles from './Board.module.css'

type BoardProps = {
  board: BoardState
  dispatch: Dispatch<BoardAction>
}

function isColumnId(id: string): id is ColumnId {
  return (COLUMN_IDS as readonly string[]).includes(id)
}

export function Board({ board, dispatch }: BoardProps) {
  const [activeItemId, setActiveItemId] = useState<string | null>(null)
  // Where the card was when the drag started, so we can tell if it newly reached Done,
  // and put it back if the drag is cancelled. useRef, not useState: we read it in
  // handlers but never render it.
  const dragStart = useRef<{ column: ColumnId; index: number } | null>(null)

  const sensors = useSensors(
    // A small distance before a drag starts, so clicks (like the remove button) still work.
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    // Space to pick up, arrow keys to move, space to drop, Escape to cancel.
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  // An id can be a card or a column (when hovering an empty spot in a column).
  function columnOf(id: string): ColumnId | undefined {
    return isColumnId(id) ? id : findColumn(board, id)
  }

  function titleOf(id: string | number): string {
    return board.items[String(id)]?.title ?? 'item'
  }

  function handleDragStart(event: DragStartEvent) {
    const itemId = String(event.active.id)
    const column = findColumn(board, itemId)
    if (!column) return
    setActiveItemId(itemId)
    dragStart.current = { column, index: board.columns[column].indexOf(itemId) }
  }

  // Fires as the card moves over things. When it crosses into another column, move it
  // there right away so that column opens a gap for it.
  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over) return

    const itemId = String(active.id)
    const overId = String(over.id)
    const fromColumn = findColumn(board, itemId)
    const toColumn = columnOf(overId)
    if (!fromColumn || !toColumn || fromColumn === toColumn) return

    const targetIds = board.columns[toColumn]
    let toIndex = targetIds.length
    if (!isColumnId(overId)) {
      const overIndex = targetIds.indexOf(overId)
      const draggedRect = active.rect.current.translated
      const isBelowOverItem =
        draggedRect !== null && draggedRect.top > over.rect.top + over.rect.height / 2
      toIndex = overIndex + (isBelowOverItem ? 1 : 0)
    }

    dispatch({ type: 'MOVE_ITEM', itemId, toColumn, toIndex })
  }

  // Fires on drop. Handles reordering inside a column, then celebrates if the card just
  // reached Done.
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    const itemId = String(active.id)
    const start = dragStart.current
    setActiveItemId(null)
    dragStart.current = null

    if (!over) {
      // Safety net: closestCorners always picks the nearest column, so in practice there
      // is always a target, and a card dropped off the board lands in the closest column.
      // If there somehow isn't one, put the card back where it started.
      if (start) {
        dispatch({
          type: 'MOVE_ITEM',
          itemId,
          toColumn: start.column,
          toIndex: start.index,
        })
      }
      return
    }

    const column = findColumn(board, itemId)
    if (!column) return

    const overId = String(over.id)
    if (!isColumnId(overId) && columnOf(overId) === column) {
      const fromIndex = board.columns[column].indexOf(itemId)
      const toIndex = board.columns[column].indexOf(overId)
      if (fromIndex !== toIndex) {
        dispatch({ type: 'MOVE_ITEM', itemId, toColumn: column, toIndex })
      }
    }

    if (start && isNewlyDone(start.column, column)) {
      const droppedRect = active.rect.current.translated
      celebrate(
        droppedRect
          ? {
              x: droppedRect.left + droppedRect.width / 2,
              y: droppedRect.top + droppedRect.height / 2,
            }
          : undefined,
      )
      showItemDoneToast(board.items[itemId].title)
    }
  }

  // Removing a card would leave keyboard focus nowhere, so move it to the next card in
  // the column (or the previous one, or the column heading if it was the last card).
  function handleRemove(itemId: string) {
    const column = findColumn(board, itemId)
    if (!column) return
    const columnIds = board.columns[column]
    const index = columnIds.indexOf(itemId)
    const neighborId = columnIds[index + 1] ?? columnIds[index - 1]

    dispatch({ type: 'REMOVE_ITEM', itemId })

    requestAnimationFrame(() => {
      const nextFocus = neighborId
        ? document.querySelector<HTMLElement>(
            `[data-item-id="${CSS.escape(neighborId)}"]`,
          )
        : document.getElementById(`column-${column}-heading`)
      nextFocus?.focus()
    })
  }

  function handleDragCancel() {
    const start = dragStart.current
    if (activeItemId && start) {
      dispatch({
        type: 'MOVE_ITEM',
        itemId: activeItemId,
        toColumn: start.column,
        toIndex: start.index,
      })
    }
    setActiveItemId(null)
    dragStart.current = null
  }

  // What screen readers hear while dragging. The defaults read out raw ids, so these
  // use the item titles and column names instead.
  const announcements: Announcements = {
    onDragStart: ({ active }) => `Picked up ${titleOf(active.id)}.`,
    onDragOver: ({ active, over }) => {
      const column = over ? columnOf(String(over.id)) : undefined
      return column
        ? `${titleOf(active.id)} is over ${COLUMN_TITLES[column]}.`
        : `${titleOf(active.id)} is not over a column.`
    },
    onDragEnd: ({ active, over }) => {
      const column = over ? columnOf(String(over.id)) : undefined
      return column
        ? `Dropped ${titleOf(active.id)} in ${COLUMN_TITLES[column]}.`
        : `Dropped ${titleOf(active.id)}.`
    },
    onDragCancel: ({ active }) =>
      `Cancelled. ${titleOf(active.id)} went back where it was.`,
  }

  const activeItem = activeItemId ? board.items[activeItemId] : null
  const activeColumn = activeItemId ? findColumn(board, activeItemId) : undefined

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      accessibility={{ announcements }}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className={styles.columns}>
        {COLUMN_IDS.map((columnId) => (
          <Column
            key={columnId}
            columnId={columnId}
            items={board.columns[columnId].map((itemId) => board.items[itemId])}
            onRemove={handleRemove}
          />
        ))}
      </div>

      {/* A floating copy that follows the pointer, so the list can reflow underneath. */}
      <DragOverlay>
        {activeItem && activeColumn && (
          <DraggingItemCard item={activeItem} columnId={activeColumn} />
        )}
      </DragOverlay>
    </DndContext>
  )
}
