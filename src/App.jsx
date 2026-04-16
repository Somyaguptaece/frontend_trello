import { useEffect } from "react";

import BoardPage from "./pages/BoardPage.jsx";
import { useBoardStore } from "./store/boardStore.js";

function App() {
  const initialize = useBoardStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return <BoardPage />;
}

export default App;
