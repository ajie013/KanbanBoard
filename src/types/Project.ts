import KanbanBoard from "../models/KanbanBoard.js";

export interface Project {
  id: number;
  name: string;
  board: KanbanBoard;
}