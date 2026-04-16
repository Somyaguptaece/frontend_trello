import {
  closestCorners,
  DndContext,
  DragOverlay,
  MouseSensor,
  PointerSensor,
  TouchSensor,
  pointerWithin,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import BoardSkeleton from "../components/BoardSkeleton.jsx";
import CardItem from "../components/CardItem.jsx";
import CardModal from "../components/CardModal.jsx";
import FilterBar from "../components/FilterBar.jsx";
import ListColumn from "../components/ListColumn.jsx";
import Navbar from "../components/Navbar.jsx";
import { useBoardFilters } from "../hooks/useBoardFilters.js";
import { useBoardStore } from "../store/boardStore.js";

const collisionDetection = (args) => {
  const pointerHits = pointerWithin(args);
  if (pointerHits.length > 0) {
    return pointerHits;
  }

  return closestCorners(args);
};

export default function BoardPage() {
  const {
    board,
    boards,
    users,
    filters,
    isLoading,
    error,
    selectedBoardId,
    selectedCardId,
    draggingCardId,
    switchBoard,
    createBoard,
    createList,
    updateList,
    deleteList,
    createCard,
    createLabel,
    updateCard,
    deleteCard,
    addComment,
    updateFilters,
    resetFilters,
    setSelectedCardId,
    setDraggingCardId,
    applyLocalListReorder,
    applyLocalCardMove,
    applyLocalCardReorder,
    persistListOrder,
    persistCardMove,
    getSelectedCard,
  } = useBoardStore();

  const [newListTitle, setNewListTitle] = useState("");
  const [activeDrag, setActiveDrag] = useState(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 140,
        tolerance: 8,
      },
    }),
  );
  const filteredBoard = useBoardFilters(board, filters);
  const filteredCardCount = useMemo(
    () => filteredBoard?.lists.reduce((sum, list) => sum + list.cards.length, 0) ?? 0,
    [filteredBoard],
  );
  const activeCard = useMemo(
    () => board?.lists.flatMap((list) => list.cards).find((card) => card.id === draggingCardId) || null,
    [board, draggingCardId],
  );
  const activeList = useMemo(
    () => board?.lists.find((list) => list.id === activeDrag?.id) || null,
    [board, activeDrag],
  );

  if (isLoading) {
    return (
      <main className="min-h-screen bg-board-pattern px-4 py-6 md:px-8">
        <BoardSkeleton />
      </main>
    );
  }

  if (error) {
    return <div className="p-8 text-rose-200">{error}</div>;
  }

  if (!board || !filteredBoard) {
    return <div className="p-8 text-slate-200">No boards found.</div>;
  }

  const handleDragStart = (event) => {
    const type = event.active.data.current?.type;
    setActiveDrag({ id: event.active.id, type });
    if (type === "card") {
      setDraggingCardId(event.active.id);
    }
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) {
      return;
    }

    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;

    if (activeType === "card") {
      const activeListId = board.lists.find((list) => list.cards.some((card) => card.id === active.id))?.id;
      const overListId =
        overType === "card"
          ? over.data.current?.listId
          : overType === "list-drop"
            ? over.data.current?.listId
            : over.id;

      if (!overListId || !activeListId) {
        return;
      }

      if (overType === "card" && activeListId === overListId) {
        applyLocalCardReorder(active.id, over.id, overListId);
        return;
      }

      if (activeListId !== overListId || overType === "list-drop") {
        applyLocalCardMove(active.id, overType === "card" ? over.id : null, overListId);
      }
    }

    if (activeType === "list" && overType === "list" && active.id !== over.id) {
      applyLocalListReorder(active.id, over.id);
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    const activeType = active.data.current?.type;

    setDraggingCardId("");
    setActiveDrag(null);
    if (!over) {
      return;
    }
    if (activeType === "card") {
      void persistCardMove(active.id);
    }
    if (activeType === "list") {
      void persistListOrder();
    }
  };

  const selectedCard = selectedCardId ? getSelectedCard() : null;

  return (
    <main className="min-h-screen bg-board-pattern">
      <Navbar
        boards={boards}
        selectedBoardId={selectedBoardId}
        onBoardChange={switchBoard}
        onCreateBoard={createBoard}
        filters={filters}
        onFilterChange={updateFilters}
      />

      <div className="mx-auto flex max-w-[1600px] flex-col gap-6 px-4 py-6 md:px-8">
        <section className="glass-panel rounded-[32px] p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-teal-200/80">Board Overview</p>
              <h1 className="mt-3 font-display text-4xl text-white">{board.title}</h1>
              <p className="mt-2 max-w-3xl text-slate-300">{board.description}</p>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Lists</p>
                <p className="mt-2 text-3xl font-bold text-white">{board.lists.length}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Cards</p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {board.lists.reduce((sum, list) => sum + list.cards.length, 0)}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Members</p>
                <p className="mt-2 text-3xl font-bold text-white">{users.length}</p>
              </div>
            </div>
          </div>
        </section>

        <FilterBar board={board} users={users} filters={filters} onChange={updateFilters} onReset={resetFilters} />

        {filteredCardCount === 0 && (
          <section className="glass-panel rounded-[28px] border border-amber-300/10 bg-amber-400/5 p-5">
            <p className="font-display text-lg text-white">No cards match the current filters</p>
            <p className="mt-2 text-sm text-slate-300">
              Your board is still there, but the active filter selection is hiding every card. Try `Reset`
              or change the due-date/member filter to see cards again.
            </p>
          </section>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={collisionDetection}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={filteredBoard.lists.map((list) => list.id)} strategy={horizontalListSortingStrategy}>
            <section className="flex gap-5 overflow-x-auto pb-4">
              {filteredBoard.lists.map((list) => (
                <ListColumn
                  key={list.id}
                  list={list}
                  onOpenCard={setSelectedCardId}
                  onCreateCard={createCard}
                  onUpdateList={updateList}
                  onDeleteList={deleteList}
                />
              ))}

              <form
                onSubmit={async (event) => {
                  event.preventDefault();
                  if (!newListTitle.trim()) {
                    return;
                  }
                  await createList(newListTitle);
                  setNewListTitle("");
                }}
                className="glass-panel flex h-fit w-[320px] shrink-0 flex-col rounded-[28px] p-4"
              >
                <p className="font-display text-lg text-white">Add a new lane</p>
                <p className="mt-1 text-sm text-slate-400">Create a list for a new phase or team.</p>
                <input
                  value={newListTitle}
                  onChange={(event) => setNewListTitle(event.target.value)}
                  placeholder="List title"
                  className="mt-4 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none"
                />
                <button
                  type="submit"
                  className="mt-3 inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-4 py-3 font-semibold text-white transition hover:bg-teal-400 hover:text-slate-950"
                >
                  <Plus size={16} />
                  Create list
                </button>
              </form>
            </section>
          </SortableContext>

          <DragOverlay>
            {activeCard ? (
              <div className="w-[300px] rotate-3 opacity-95">
                <CardItem card={activeCard} onClick={() => {}} sortable={false} />
              </div>
            ) : activeList ? (
              <div className="glass-panel w-[320px] rounded-[28px] border border-teal-300/30 p-4 opacity-90 shadow-2xl">
                <p className="font-display text-lg text-white">{activeList.title}</p>
                <p className="mt-1 text-xs text-slate-400">{activeList.cards.length} cards</p>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      <CardModal
        card={selectedCard}
        board={board}
        users={users}
        onClose={() => setSelectedCardId("")}
        onSave={updateCard}
        onDelete={deleteCard}
        onAddComment={addComment}
        onCreateLabel={createLabel}
      />
    </main>
  );
}
