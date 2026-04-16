import { useMemo, useState } from "react";

const dueOptions = [
  { value: "all", label: "All due dates" },
  { value: "week", label: "Due this week" },
  { value: "overdue", label: "Overdue" },
];

export default function FilterBar({ board, users, filters, onChange, onReset }) {
  const hasLabels = board.labels.length > 0;
  const [labelQuery, setLabelQuery] = useState("");
  const [memberQuery, setMemberQuery] = useState("");
  const filteredLabels = useMemo(
    () =>
      board.labels.filter((label) =>
        label.name.toLowerCase().includes(labelQuery.trim().toLowerCase()),
      ),
    [board.labels, labelQuery],
  );
  const filteredMembers = useMemo(
    () =>
      users.filter((user) =>
        user.name.toLowerCase().includes(memberQuery.trim().toLowerCase()),
      ),
    [users, memberQuery],
  );

  const toggleValue = (values, value) =>
    values.includes(value) ? values.filter((item) => item !== value) : [...values, value];

  return (
    <section className="glass-panel flex flex-col gap-4 rounded-3xl p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-display text-lg text-white">Filters</p>
          <p className="text-sm text-slate-400">Refine by labels, assignees, and due dates.</p>
        </div>
        <button type="button" onClick={onReset} className="text-sm font-semibold text-teal-200">
          Reset
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <label className="space-y-2">
          <span className="text-xs uppercase tracking-[0.24em] text-slate-500">Labels</span>
          {hasLabels ? (
            <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-3">
              <input
                value={labelQuery}
                onChange={(event) => setLabelQuery(event.target.value)}
                placeholder="Type to filter labels..."
                className="mb-3 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none"
              />
              <div className="flex max-h-32 flex-wrap gap-2 overflow-y-auto">
                {filteredLabels.map((label) => {
                  const isActive = filters.labelIds.includes(label.id);
                  return (
                    <button
                      key={label.id}
                      type="button"
                      onClick={() =>
                        onChange({
                          labelIds: toggleValue(filters.labelIds, label.id),
                        })
                      }
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold text-white transition ${
                        isActive ? "border-white/60" : "border-white/10 opacity-70"
                      }`}
                      style={{ backgroundColor: label.color }}
                    >
                      {label.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex min-h-32 items-center rounded-2xl border border-dashed border-white/10 bg-slate-950/30 px-4 py-3 text-sm text-slate-400">
              No labels on this board yet. Add labels from a card detail modal after creating a card.
            </div>
          )}
        </label>

        <label className="space-y-2">
          <span className="text-xs uppercase tracking-[0.24em] text-slate-500">Members</span>
          <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-3">
            <input
              value={memberQuery}
              onChange={(event) => setMemberQuery(event.target.value)}
              placeholder="Type to filter members..."
              className="mb-3 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none"
            />
            <div className="max-h-32 space-y-2 overflow-y-auto">
              {filteredMembers.map((user) => (
                <label
                  key={user.id}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white"
                >
                  <input
                    type="checkbox"
                    checked={filters.memberIds.includes(user.id)}
                    onChange={() =>
                      onChange({
                        memberIds: toggleValue(filters.memberIds, user.id),
                      })
                    }
                  />
                  <span>{user.name}</span>
                </label>
              ))}
            </div>
          </div>
        </label>

        <label className="space-y-2">
          <span className="text-xs uppercase tracking-[0.24em] text-slate-500">Due Date</span>
          <select
            value={filters.dueMode}
            onChange={(event) => onChange({ dueMode: event.target.value })}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white outline-none"
          >
            {dueOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}
