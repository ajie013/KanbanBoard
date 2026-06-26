import { ColumnStatus, Task } from "../types/Task.js";

export default class KanbanBoard{
    private tasks: Task[] = []
    private id: number = 1;

    addTask(title: string, description: string): void {
        try {
            if(!title.trim()) throw new Error("Title cannot be empty.");
            
            const newTask: Task ={
                id: this.id++,
                title,
                description,
                status: 'todo'
            }

            this.tasks.push(newTask)
        } catch (ex) {
            if(ex instanceof Error){
                console.error(ex.message)
            }
        }
    }

    getTasksByStatus = (status: ColumnStatus): ReadonlyArray<Task> => this.tasks.filter((task) => task.status === status)
    

    getAllTasks = (): ReadonlyArray<Task> => [...this.tasks]
    

    updateTaskStatus(id: number, newStatus: ColumnStatus): void {
        const task = this.tasks.find((task) => task.id === id)

        if (!task) return;

        task.status = newStatus
    }

    updateTaskDetails(id: number, updates: Partial<Task>): void {
        const {title, description} = updates

        const task = this.tasks.find((task) => task.id === id)

        if (!task) return;

        task.title = title ?? task.title;
        task.description = description ?? task.description;
    }

    deleteTask (id: number): void {
        this.tasks = this.tasks.filter(task => task.id !== id)
    }
}