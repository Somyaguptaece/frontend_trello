import { CalendarDays, CheckSquare2 } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(new Date(value))
    : "";

export default function CardItem({ card, onClick, sortable = true }) {
  const sortableState = useSortable({
    id: card.id,
    data: {
      type: "card",
      listId: card.listId,
    },
    disabled: !sortable,
    transition: {
      duration: 220,
      easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
    },
  });
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = sortableState;

  const completedCount = card.checklist?.items?.filter((item) => item.completed).length || 0;
  const totalCount = card.checklist?.items?.length || 0;

  return (
    <article
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(
          transform ? { ...transform, scaleX: 1, scaleY: 1 } : null,
        ),
        transition,
      }}
      {...(sortable ? attributes : {})}
      {...(sortable ? listeners : {})}
      onClick={onClick}
      className={`cursor-pointer rounded-2xl border border-white/8 bg-slate-950/70 p-4 shadow-[0_12px_30px_rgba(2,6,23,0.18)] transition ${
        isDragging
          ? "z-20 rotate-1 border-teal-300/30 opacity-50 shadow-2xl"
          : "hover:-translate-y-0.5 hover:border-white/20 hover:bg-slate-950/90"
      }`}
    >
      <div className="mb-3 flex flex-wrap gap-2">
        {card.labels.map((label) => (
          <span
            key={label.id}
            className="rounded-full px-2.5 py-1 text-[11px] font-semibold text-white"
            style={{ backgroundColor: label.color }}
          >
            {label.name}
          </span>
        ))}
      </div>

      <h4 className="text-sm font-semibold text-white">{card.title}</h4>
      {card.description && <p className="mt-2 line-clamp-2 text-xs text-slate-400">{card.description}</p>}

      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-400">
        {card.dueDate && (
          <span className="inline-flex items-center gap-1">
            <CalendarDays size={14} />
            {formatDate(card.dueDate)}
          </span>
        )}
        {totalCount > 0 && (
          <span className="inline-flex items-center gap-1">
            <CheckSquare2 size={14} />
            {completedCount}/{totalCount}
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2">
        {card.members.map((member) => (
          <div
            key={member.id}
            title={member.name}
            className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ backgroundColor: member.avatarColor }}
          >
            {member.name
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)}
          </div>
        ))}
      </div>
    </article>
  );
}
