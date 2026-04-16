import { X } from "lucide-react";
import { useEffect, useState } from "react";

const formatForInput = (value) => (value ? new Date(value).toISOString().slice(0, 10) : "");
const labelPalette = ["#06b6d4", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function CardModal({
  card,
  board,
  users,
  onClose,
  onSave,
  onDelete,
  onAddComment,
  onCreateLabel,
}) {
  const [form, setForm] = useState(null);
  const [comment, setComment] = useState("");
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState(labelPalette[0]);

  useEffect(() => {
    if (!card) {
      return;
    }

    setForm({
      title: card.title,
      description: card.description || "",
      dueDate: formatForInput(card.dueDate),
      labelIds: card.labels.map((label) => label.id),
      memberIds: card.members.map((member) => member.id),
      checklistTitle: card.checklist?.title || "Checklist",
      checklistItems: card.checklist?.items?.length
        ? card.checklist.items.map((item) => ({ title: item.title, completed: item.completed }))
        : [{ title: "", completed: false }],
    });
  }, [card]);

  if (!card || !form) {
    return null;
  }

  const toggleValue = (values, value) =>
    values.includes(value) ? values.filter((item) => item !== value) : [...values, value];

  const updateChecklistItem = (index, patch) => {
    setForm((state) => ({
      ...state,
      checklistItems: state.checklistItems.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();

    await onSave(card.id, {
      ...form,
      dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
      checklistItems: form.checklistItems.filter((item) => item.title.trim()),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="glass-panel max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-[32px] p-6 md:p-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{card.listTitle}</p>
            <h2 className="mt-2 font-display text-3xl text-white">{card.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 p-2 text-slate-300"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-5">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-300">Card title</span>
              <input
                value={form.title}
                onChange={(event) => setForm((state) => ({ ...state, title: event.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-300">Description</span>
              <textarea
                value={form.description}
                onChange={(event) => setForm((state) => ({ ...state, description: event.target.value }))}
                className="min-h-32 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none"
              />
            </label>

            <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-5">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-display text-lg text-white">Checklist</p>
                <button
                  type="button"
                  onClick={() =>
                    setForm((state) => ({
                      ...state,
                      checklistItems: [...state.checklistItems, { title: "", completed: false }],
                    }))
                  }
                  className="text-sm font-semibold text-teal-200"
                >
                  Add item
                </button>
              </div>

              <input
                value={form.checklistTitle}
                onChange={(event) => setForm((state) => ({ ...state, checklistTitle: event.target.value }))}
                className="mb-4 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none"
              />

              <div className="space-y-3">
                {form.checklistItems.map((item, index) => (
                  <div key={`${card.id}-check-${index}`} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={(event) => updateChecklistItem(index, { completed: event.target.checked })}
                      className="h-4 w-4 rounded border-white/10 bg-transparent"
                    />
                    <input
                      value={item.title}
                      onChange={(event) => updateChecklistItem(index, { title: event.target.value })}
                      placeholder="Checklist item"
                      className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-5">
              <p className="mb-3 font-display text-lg text-white">Comments</p>
              <div className="space-y-3">
                {card.comments.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white"
                        style={{ backgroundColor: item.user.avatarColor }}
                      >
                        {item.user.name
                          .split(" ")
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{item.user.name}</p>
                        <p className="text-xs text-slate-500">
                          {new Intl.DateTimeFormat("en-IN", {
                            day: "numeric",
                            month: "short",
                            hour: "numeric",
                            minute: "2-digit",
                          }).format(new Date(item.createdAt))}
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-slate-300">{item.content}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 space-y-3">
                <textarea
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder="Add a quick update or review note..."
                  className="min-h-24 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none"
                />
                <button
                  type="button"
                  onClick={async () => {
                    if (!comment.trim()) {
                      return;
                    }

                    await onAddComment(card.id, comment);
                    setComment("");
                  }}
                  className="rounded-2xl border border-teal-300/40 bg-teal-400/15 px-4 py-2 font-semibold text-teal-100"
                >
                  Post comment
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-300">Due date</span>
              <input
                type="date"
                value={form.dueDate}
                onChange={(event) => setForm((state) => ({ ...state, dueDate: event.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-300">Labels</span>
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                <div className="mb-4 flex flex-wrap gap-2">
                  {board.labels.map((label) => {
                    const isSelected = form.labelIds.includes(label.id);
                    return (
                      <button
                        key={label.id}
                        type="button"
                        onClick={() =>
                          setForm((state) => ({
                            ...state,
                            labelIds: toggleValue(state.labelIds, label.id),
                          }))
                        }
                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold text-white transition ${
                          isSelected ? "border-white/70 ring-2 ring-white/20" : "border-white/10 opacity-75"
                        }`}
                        style={{ backgroundColor: label.color }}
                      >
                        {label.name}
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-3 rounded-2xl border border-dashed border-white/10 bg-slate-950/40 p-3">
                  <input
                    value={newLabelName}
                    onChange={(event) => setNewLabelName(event.target.value)}
                    placeholder="Create a new label..."
                    className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none"
                  />
                  <div className="flex flex-wrap gap-2">
                    {labelPalette.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewLabelColor(color)}
                        className={`h-8 w-8 rounded-full border-2 ${
                          newLabelColor === color ? "border-white" : "border-transparent"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!newLabelName.trim()) {
                        return;
                      }

                      await onCreateLabel({
                        boardId: board.id,
                        name: newLabelName.trim(),
                        color: newLabelColor,
                      });
                      setNewLabelName("");
                    }}
                    className="rounded-xl border border-teal-300/30 bg-teal-400/10 px-3 py-2 text-sm font-semibold text-teal-100"
                  >
                    Create label
                  </button>
                </div>
              </div>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-300">Assigned members</span>
              <div className="space-y-2 rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                {users.map((user) => (
                  <label
                    key={user.id}
                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white"
                  >
                    <input
                      type="checkbox"
                      checked={form.memberIds.includes(user.id)}
                      onChange={() =>
                        setForm((state) => ({
                          ...state,
                          memberIds: toggleValue(state.memberIds, user.id),
                        }))
                      }
                    />
                    <span>{user.name}</span>
                  </label>
                ))}
              </div>
            </label>

            <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-5">
              <p className="mb-3 font-display text-lg text-white">Activity</p>
              <div className="space-y-3">
                {board.activities
                  .filter((activity) => activity.cardId === card.id)
                  .map((activity) => (
                    <div key={activity.id} className="text-sm text-slate-300">
                      <span className="font-semibold text-white">{activity.user.name}</span> {activity.details}
                    </div>
                  ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button type="submit" className="rounded-2xl bg-teal-400 px-5 py-3 font-semibold text-slate-950">
                Save changes
              </button>
              <button
                type="button"
                onClick={() => onDelete(card.id)}
                className="rounded-2xl border border-rose-300/30 bg-rose-500/10 px-5 py-3 font-semibold text-rose-200"
              >
                Delete card
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
