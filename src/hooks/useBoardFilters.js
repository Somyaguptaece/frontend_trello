import { useMemo } from "react";

const isDueMatch = (dueMode, dueDate) => {
  if (dueMode === "all") {
    return true;
  }

  if (!dueDate) {
    return false;
  }

  const target = new Date(dueDate);
  const today = new Date();
  const diffInDays = Math.ceil((target - today) / (1000 * 60 * 60 * 24));

  if (dueMode === "overdue") {
    return diffInDays < 0;
  }

  if (dueMode === "week") {
    return diffInDays >= 0 && diffInDays <= 7;
  }

  return true;
};

export function useBoardFilters(board, filters) {
  return useMemo(() => {
    if (!board) {
      return null;
    }

    const query = filters.query.trim().toLowerCase();

    return {
      ...board,
      lists: board.lists.map((list) => ({
        ...list,
        cards: list.cards.filter((card) => {
          const matchesQuery = !query || card.title.toLowerCase().includes(query);
          const matchesLabels =
            !filters.labelIds.length ||
            filters.labelIds.every((labelId) => card.labels.some((label) => label.id === labelId));
          const matchesMembers =
            !filters.memberIds.length ||
            filters.memberIds.every((memberId) => card.members.some((member) => member.id === memberId));
          const matchesDue = isDueMatch(filters.dueMode, card.dueDate);

          return matchesQuery && matchesLabels && matchesMembers && matchesDue;
        }),
      })),
    };
  }, [board, filters]);
}
