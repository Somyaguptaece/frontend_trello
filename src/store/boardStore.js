import { create } from "zustand";

import { boardApi, cardApi, labelApi, listApi, metaApi } from "../services/api.js";

const emptyFilters = {
  query: "",
  labelIds: [],
  memberIds: [],
  dueMode: "all",
};

const ensureChecklist = (card) => card.checklist || { title: "Checklist", items: [] };

const reorder = (items, activeId, overId) => {
  const next = [...items];
  const oldIndex = next.findIndex((item) => item.id === activeId);
  const newIndex = next.findIndex((item) => item.id === overId);
  if (oldIndex === -1 || newIndex === -1) {
    return items;
  }

  const [moved] = next.splice(oldIndex, 1);
  next.splice(newIndex, 0, moved);
  return next.map((item, index) => ({ ...item, order: index }));
};

const findCardLocation = (board, cardId) => {
  for (const list of board?.lists || []) {
    const card = list.cards.find((entry) => entry.id === cardId);
    if (card) {
      return { list, card };
    }
  }
  return null;
};

const reorderCardsInList = (board, listId, activeId, overId) => {
  const nextLists = board.lists.map((list) => ({
    ...list,
    cards: [...list.cards],
  }));
  const targetList = nextLists.find((list) => list.id === listId);
  if (!targetList) {
    return board;
  }

  const oldIndex = targetList.cards.findIndex((card) => card.id === activeId);
  const newIndex = targetList.cards.findIndex((card) => card.id === overId);
  if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
    return board;
  }

  const [movedCard] = targetList.cards.splice(oldIndex, 1);
  targetList.cards.splice(newIndex, 0, movedCard);

  return {
    ...board,
    lists: nextLists.map((list) => ({
      ...list,
      cards: list.cards.map((card, index) => ({ ...card, order: index, listId: list.id })),
    })),
  };
};

const moveCardInBoard = (board, activeId, overId, overListId) => {
  const source = findCardLocation(board, activeId);
  if (!source) {
    return board;
  }

  const nextLists = board.lists.map((list) => ({
    ...list,
    cards: [...list.cards],
  }));
  const sourceList = nextLists.find((list) => list.id === source.list.id);
  const targetList = nextLists.find((list) => list.id === overListId);
  if (!sourceList || !targetList) {
    return board;
  }

  const sourceIndex = sourceList.cards.findIndex((card) => card.id === activeId);
  if (sourceIndex === -1) {
    return board;
  }
  const [movingCard] = sourceList.cards.splice(sourceIndex, 1);
  const targetIndex = overId
    ? targetList.cards.findIndex((card) => card.id === overId)
    : targetList.cards.length;
  const normalizedTargetIndex = targetIndex < 0 ? targetList.cards.length : targetIndex;

  if (sourceList.id === targetList.id && sourceIndex === normalizedTargetIndex) {
    return board;
  }

  targetList.cards.splice(normalizedTargetIndex, 0, {
    ...movingCard,
    listId: targetList.id,
  });

  return {
    ...board,
    lists: nextLists.map((list) => ({
      ...list,
      cards: list.cards.map((card, index) => ({ ...card, order: index, listId: list.id })),
    })),
  };
};

export const useBoardStore = create((set, get) => ({
  isLoading: true,
  error: "",
  board: null,
  boards: [],
  users: [],
  selectedBoardId: "",
  selectedCardId: "",
  filters: emptyFilters,
  draggingCardId: "",
  async initialize() {
    try {
      set({ isLoading: true, error: "" });
      const [meta, boards] = await Promise.all([metaApi.getMeta(), boardApi.getBoards()]);
      const selectedBoardId = boards[0]?.id || "";
      const board = selectedBoardId ? await boardApi.getBoard(selectedBoardId) : null;

      set({
        board,
        boards,
        users: meta.users,
        selectedBoardId,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Unable to load board workspace.",
      });
    }
  },
  async switchBoard(boardId) {
    try {
      set({ isLoading: true, error: "", selectedBoardId: boardId });
      const board = await boardApi.getBoard(boardId);
      set({ board, isLoading: false, selectedCardId: "" });
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Unable to switch boards.",
      });
    }
  },
  setSelectedCardId(cardId) {
    set({ selectedCardId: cardId || "" });
  },
  updateFilters(patch) {
    set((state) => ({ filters: { ...state.filters, ...patch } }));
  },
  resetFilters() {
    set({ filters: emptyFilters });
  },
  setDraggingCardId(cardId) {
    set({ draggingCardId: cardId || "" });
  },
  applyLocalListReorder(activeId, overId) {
    set((state) => {
      if (!state.board || !overId) {
        return state;
      }

      return {
        board: {
          ...state.board,
          lists: reorder(state.board.lists, activeId, overId),
        },
      };
    });
  },
  applyLocalCardMove(activeId, overId, overListId) {
    set((state) => ({
      board: state.board ? moveCardInBoard(state.board, activeId, overId, overListId) : state.board,
    }));
  },
  applyLocalCardReorder(activeId, overId, listId) {
    set((state) => ({
      board: state.board ? reorderCardsInList(state.board, listId, activeId, overId) : state.board,
    }));
  },
  async persistListOrder() {
    const { board } = get();
    if (!board) {
      return;
    }

    try {
      await listApi.reorder({
        boardId: board.id,
        orderedIds: board.lists.map((list) => list.id),
      });
    } catch (error) {
      await get().refreshBoard();
      throw error;
    }
  },
  async persistCardMove(cardId) {
    const { board } = get();
    if (!board) {
      return;
    }

    const location = findCardLocation(board, cardId);
    if (!location) {
      return;
    }

    try {
      await cardApi.move(cardId, {
        targetListId: location.list.id,
        targetIndex: location.list.cards.findIndex((card) => card.id === cardId),
      });
    } catch (error) {
      await get().refreshBoard();
      throw error;
    }
  },
  async refreshBoard() {
    const { selectedBoardId } = get();
    if (!selectedBoardId) {
      return;
    }

    const [board, boards] = await Promise.all([
      boardApi.getBoard(selectedBoardId),
      boardApi.getBoards(),
    ]);
    set({ board, boards });
  },
  async createBoard(payload) {
    await boardApi.createBoard(payload);
    const boards = await boardApi.getBoards();
    const newestBoardId = boards[0]?.id;
    set({ boards });
    if (newestBoardId) {
      await get().switchBoard(newestBoardId);
    }
  },
  async createList(title) {
    const { board } = get();
    if (!board) {
      return;
    }

    await listApi.create({ boardId: board.id, title });
    await get().refreshBoard();
  },
  async updateList(listId, title) {
    await listApi.update(listId, { title });
    await get().refreshBoard();
  },
  async deleteList(listId) {
    await listApi.delete(listId);
    await get().refreshBoard();
  },
  async createCard(listId, payload) {
    await cardApi.create({ listId, ...payload });
    await get().refreshBoard();
  },
  async createLabel(payload) {
    await labelApi.create(payload);
    await get().refreshBoard();
  },
  async updateCard(cardId, payload) {
    const selected = get().selectedCardId;
    await cardApi.update(cardId, payload);
    await get().refreshBoard();
    set({ selectedCardId: selected });
  },
  async deleteCard(cardId) {
    const { selectedCardId } = get();
    await cardApi.delete(cardId);
    await get().refreshBoard();
    if (selectedCardId === cardId) {
      set({ selectedCardId: "" });
    }
  },
  async addComment(cardId, content) {
    await cardApi.addComment(cardId, { content });
    await get().refreshBoard();
    set({ selectedCardId: cardId });
  },
  getSelectedCard() {
    const { board, selectedCardId } = get();
    const location = selectedCardId ? findCardLocation(board, selectedCardId) : null;
    if (!location) {
      return null;
    }

    return {
      ...location.card,
      checklist: ensureChecklist(location.card),
      listId: location.list.id,
      listTitle: location.list.title,
    };
  },
}));
