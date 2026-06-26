import { ColumnStatus, Task } from "../types/Task.js";

export default class KanbanBoard{
    private tasks: Task[] = []

    addTask = (title: string, description: string): void => {
        try {
            const newTask: Task ={
                id: this.tasks.length + 1 + Date.now(),
                title,
                description,
                status: 'todo'
            }

            this.tasks.push(newTask)
        } catch (ex) {
            console.log("Something went wrong")
        }
    }

    getTasksByStatus = (status: ColumnStatus): ReadonlyArray<Task> => this.tasks.filter((task) => task.status === status)
    

    getAllTasks = (): ReadonlyArray<Task> => this.tasks
    

    updateTaskStatus = (id: number, newStatus: ColumnStatus): void => {
        const task = this.tasks.find((task) => task.id === id)

        if (!task) return;

        task.status = newStatus
    }

    updateTaskDetails = (id: number, updates: Partial<Task>): void => {
        const task = this.tasks.find((task) => task.id === id)

        if (!task) return;

       if(updates.description != undefined){
            task.description = updates.description
       }

       if(updates.title != undefined){
            task.title = updates.title
       }
    }

    deleteTask = (id: number): void => {
        this.tasks = this.tasks.filter(task => task.id !== id)
    }
}