import KanbanBoard from "../model/KanbanBoard.js";

export interface Project {
  id: number;
  name: string;
  board: KanbanBoard;
}