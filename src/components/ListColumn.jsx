import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import CardItem from "./CardItem.jsx";

export default function ListColumn({
  list,
  onOpenCard,
  onCreateCard,
  onUpdateList,
  onDeleteList,
}) {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [draftTitle, setDraftTitle] = useState(list.title);
  const [newCardTitle, setNewCardTitle] = useState("");

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: list.id,
    data: { type: "list" },
    transition: {
      duration: 260,
      easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
    },
  });
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `list-drop-${list.id}`,
    data: {
      type: "list-drop",
      listId: list.id,
    },
  });

  const handleCreateCard = async (event) => {
    event.preventDefault();
    if (!newCardTitle.trim()) {
      return;
    }

    await onCreateCard(list.id, {
      title: newCardTitle,
      description: "",
      dueDate: null,
      labelIds: [],
      memberIds: [],
      checklistItems: [],
    });
    setNewCardTitle("");
    setIsAddingCard(false);
  };

  return (
    <section
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(
          transform ? { ...transform, scaleX: 1, scaleY: 1 } : null,
        ),
        transition,
      }}
      className={`glass-panel flex h-fit w-[320px] shrink-0 flex-col rounded-[28px] p-4 ${
        isDragging ? "z-10 rotate-1 opacity-60 shadow-2xl" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-1 items-start gap-2">
          <button
            type="button"
            aria-label={`Drag list ${list.title}`}
            className="mt-1 rounded-xl border border-white/10 p-2 text-slate-400 transition hover:border-white/20 hover:text-teal-200"
            {...attributes}
            {...listeners}
          >
            <GripVertical size={16} />
          </button>

          <div className="flex-1">
          <input
            value={draftTitle}
            onChange={(event) => setDraftTitle(event.target.value)}
            onBlur={() => draftTitle.trim() && draftTitle !== list.title && onUpdateList(list.id, draftTitle)}
            className="w-full bg-transparent font-display text-lg text-white outline-none"
          />
          <p className="mt-1 text-xs text-slate-400">{list.cards.length} cards</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onDeleteList(list.id)}
          className="rounded-full border border-white/10 p-2 text-slate-400 transition hover:text-rose-300"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <SortableContext items={list.cards.map((card) => card.id)} strategy={verticalListSortingStrategy}>
        <div
          ref={setDropRef}
          className={`mt-4 min-h-24 space-y-3 rounded-2xl transition ${
            isOver ? "bg-teal-300/6 ring-1 ring-inset ring-teal-300/30" : ""
          }`}
        >
          {list.cards.map((card) => (
            <CardItem key={card.id} card={card} onClick={() => onOpenCard(card.id)} />
          ))}
          {list.cards.length === 0 && !isAddingCard && (
            <button
              type="button"
              onClick={() => setIsAddingCard(true)}
              className="flex min-h-32 w-full flex-col items-start justify-center rounded-2xl border border-dashed border-white/10 bg-slate-950/30 px-4 py-4 text-left transition hover:border-teal-300/40 hover:bg-slate-950/50"
            >
              <span className="text-sm font-semibold text-white">No cards here yet</span>
              <span className="mt-1 text-sm text-slate-400">
                Create your first card in this list to start tracking work.
              </span>
            </button>
          )}
        </div>
      </SortableContext>

      {isAddingCard ? (
        <form onSubmit={handleCreateCard} className="mt-4 space-y-3">
          <textarea
            value={newCardTitle}
            onChange={(event) => setNewCardTitle(event.target.value)}
            placeholder="What needs to get done?"
            className="min-h-24 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none"
          />
          <div className="flex gap-2">
            <button type="submit" className="rounded-2xl bg-teal-400 px-4 py-2 font-semibold text-slate-950">
              Add card
            </button>
            <button
              type="button"
              onClick={() => setIsAddingCard(false)}
              className="rounded-2xl border border-white/10 px-4 py-2 text-slate-300"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setIsAddingCard(true)}
          className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-dashed border-white/15 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:border-teal-300/50 hover:text-teal-100"
        >
          <Plus size={16} />
          Add a card
        </button>
      )}
    </section>
  );
}
