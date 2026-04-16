import { Plus, Search, Sparkles } from "lucide-react";
import { useState } from "react";

export default function Navbar({
  boards,
  selectedBoardId,
  onBoardChange,
  onCreateBoard,
  filters,
  onFilterChange,
}) {
  const [isCreatingBoard, setIsCreatingBoard] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    background: "aurora",
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) {
      return;
    }

    await onCreateBoard(form);
    setForm({ title: "", description: "", background: "aurora" });
    setIsCreatingBoard(false);
  };

  return (
    <header className="glass-panel sticky top-0 z-30 border-x-0 border-t-0 px-4 py-4 md:px-8">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-teal-400/15 p-2 text-teal-200">
            <Sparkles size={22} />
          </div>
          <div>
            <p className="font-display text-xl text-white">Trellis Workspace</p>
            <p className="text-sm text-slate-300">Modern Kanban flow for product teams</p>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3 lg:max-w-4xl lg:flex-row lg:items-center lg:justify-end">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 lg:min-w-[320px]">
            <Search size={18} className="text-slate-400" />
            <input
              value={filters.query}
              onChange={(event) => onFilterChange({ query: event.target.value })}
              placeholder="Search cards, backlog items, design tasks..."
              className="w-full border-0 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
            />
          </div>

          <select
            value={selectedBoardId}
            onChange={(event) => onBoardChange(event.target.value)}
            className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
          >
            {boards.map((board) => (
              <option key={board.id} value={board.id}>
                {board.title}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setIsCreatingBoard((value) => !value)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-teal-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-teal-300"
          >
            <Plus size={18} />
            New board
          </button>
        </div>
      </div>

      {isCreatingBoard && (
        <form onSubmit={handleSubmit} className="mx-auto mt-4 grid max-w-[1600px] gap-3 md:grid-cols-4">
          <input
            value={form.title}
            onChange={(event) => setForm((state) => ({ ...state, title: event.target.value }))}
            placeholder="Board title"
            className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none"
          />
          <input
            value={form.description}
            onChange={(event) => setForm((state) => ({ ...state, description: event.target.value }))}
            placeholder="Short description"
            className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none md:col-span-2"
          />
          <button
            type="submit"
            className="rounded-2xl border border-teal-300/40 bg-teal-400/15 px-4 py-3 font-semibold text-teal-100"
          >
            Create board
          </button>
        </form>
      )}
    </header>
  );
}
