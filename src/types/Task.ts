export interface Task{
    id: number
    title: string
    description: string
    status: ColumnStatus
}

export type ColumnStatus = 'todo' | 'in-progress' | 'review' | 'done'