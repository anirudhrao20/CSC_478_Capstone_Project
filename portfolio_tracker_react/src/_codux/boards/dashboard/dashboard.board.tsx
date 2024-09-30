import { createBoard } from "@wixc3/react-board";
import Dashboard from "../../../components/Dashboard";

export default createBoard({
  name: "Dashboard",
  Board: () => <Dashboard />,
  isSnippet: true,
  environmentProps: {
    windowHeight: 641,
  },
});
