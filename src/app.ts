import KanbanBoard from "./models/KanbanBoard.js";
import { Modal } from "./components/Modal.js";
import { Project } from "./types/Project.js";
import { ColumnStatus, Task } from "./types/Task.js";
import Toast from "./components/Toast.js";
import {render} from './renderer.js'

let projectList: Project[] = [
  { id: 1, name: "Default Project", board: new KanbanBoard() }
];

let selectedProject: Project | null = null;
let currentTask: Task | null = null;
let draggedTaskElement: HTMLElement | null = null;

// DOM ELEMENTS\
const projectGuide = document.querySelector(".project-guide") as HTMLDivElement;
const sidebar = document.getElementById("sidebar") as HTMLDivElement;
const hamburger = document.getElementById("hamburger") as HTMLButtonElement;
const closeBtn = document.querySelector('.sidebar-close') as HTMLButtonElement;
const noProjectWrapper = document.querySelector(".no-project") as HTMLDivElement;
const projectListWrapper = document.querySelector(".project-list") as HTMLDivElement;
const projectListWrapperSide = document.querySelector("#projectList") as HTMLDivElement;
const board = document.getElementById("board") as HTMLDivElement;
const boardTitle = document.getElementById("boardTitle") as HTMLHeadingElement;
const backBtn = document.getElementById("backBtn") as HTMLButtonElement;
const mainContent = document.querySelector('.main-content') as HTMLDivElement;

// TASK WRAPPERS
const toDoWrapper = document.querySelector(".todo .task-list") as HTMLDivElement;
const inProgressWrapper = document.querySelector(".in-progress .task-list") as HTMLDivElement;
const reviewWrapper = document.querySelector(".review .task-list") as HTMLDivElement;
const doneWrapper = document.querySelector(".done .task-list") as HTMLDivElement;
const addTaskBtn = document.querySelector(".add-task-btn") as HTMLButtonElement;

// PROJECT MODAL
const projectNameInput = document.getElementById("projectName") as HTMLInputElement;
const saveProjectBtn = document.getElementById("saveProject") as HTMLButtonElement;
const cancelProjectBtn = document.getElementById("cancelProject") as HTMLButtonElement;
const addProjectBtn = document.querySelectorAll(".addProjectBtn");

// TASK MODAL
const taskTitleInput = document.getElementById("taskTitle") as HTMLInputElement;
const taskDescInput = document.getElementById("taskDescription") as HTMLTextAreaElement;
const saveTaskBtn = document.getElementById("saveTask") as HTMLButtonElement;
const cancelTaskBtn = document.getElementById("cancelTask") as HTMLButtonElement;

// VIEW MODAL
const viewTitle = document.getElementById("viewTaskTitle") as HTMLHeadingElement;
const viewDesc = document.getElementById("viewTaskDescription") as HTMLParagraphElement;
const editBtn = document.getElementById("editTaskBtn") as HTMLButtonElement;
const closeViewBtn = document.getElementById("closeTaskView") as HTMLButtonElement;

const editTitle = document.getElementById("editTaskTitle") as HTMLInputElement;
const editDesc = document.getElementById("editTaskDescription") as HTMLTextAreaElement;
const cancelEditBtn = document.getElementById("cancelEditTask") as HTMLButtonElement;
const saveEditBtn = document.getElementById("saveEditTask") as HTMLButtonElement;

const taskViewMode = document.getElementById("taskViewMode") as HTMLDivElement;
const taskEditMode = document.getElementById("taskEditMode") as HTMLDivElement;

const ui = {
  projectGuide,
  noProjectWrapper,
  projectListWrapper,
  projectListWrapperSide,
  board,
  boardTitle,
  toDoWrapper,
  inProgressWrapper,
  reviewWrapper,
  doneWrapper,
};

//Modal instance
const projectModal = new Modal("projectModal", "modalOverlay");
const taskModal = new Modal("taskModal", "taskOverlay" );
const viewModal = new Modal("taskViewModal", "taskViewOverlay");

//Toast instance
const toast = new Toast(".toast-wrapper", ".toast-title", ".toast-content", ".toast-close")

projectModal.onClose(() =>{
    projectNameInput.value = "";
})

taskModal.onClose(() =>{
  taskTitleInput.value = "";
  taskDescInput.value = "";
})

viewModal.onOpen((task) => {
   if (!task) return;
   currentTask = task; 
   viewTitle.textContent = task.title;
   viewDesc.textContent = task.description;
})

viewModal.onClose(() => {
  currentTask = null; 
  taskViewMode.classList.remove("hidden");
  taskEditMode.classList.add("hidden");
})

//PROJECT OPERATIONS
const addProject = () =>{
  const name = projectNameInput.value.trim();

  if (!name) return;

  projectList.push({ id: Date.now(), name, board: new KanbanBoard() });

  projectModal.close();
  sidebar.classList.remove('open');
  render(projectList, selectedProject, ui);

  toast.showToast("Project Created", "The project was created successfully.")
}

const deleteProject = (projectId: number) =>{
  projectList = projectList.filter(p => p.id !== projectId);

  if (selectedProject?.id === projectId) selectedProject = null;

  render(projectList, selectedProject, ui);
  toast.showToast("Project Deleted", "The project was removed successfully.")
}

//TASK OPERATIONS
const onAddTask = () =>{
  if (!selectedProject) return;

  const title = taskTitleInput.value.trim();
  const desc = taskDescInput.value.trim();

  if (!title) return;

  selectedProject.board.addTask(title, desc);
  
  taskModal.close()
  render(projectList, selectedProject, ui);

  toast.showToast("Task Added", "The task was added successfully.")
}

const onUpdateTask = () =>{
  if (!selectedProject || !currentTask) return;
  
  const updatedTitle = editTitle.value.trim();
  if (!updatedTitle) return; 

  selectedProject.board.updateTaskDetails(currentTask.id, {
    title: updatedTitle,
    description: editDesc.value.trim()
  });

  viewModal.close(); 
  render(projectList, selectedProject, ui);
  toast.showToast("Task Updated", "The task was updated successfully.")
}

const onDeleteTask = (taskId: number) =>{
  selectedProject?.board.deleteTask(taskId);

  render(projectList, selectedProject, ui);
  toast.showToast("Task Deleted", "The task was removed successfully.")
}

//SideBar events
const sideBarEvent= () =>{
  hamburger.addEventListener("click", () => sidebar.classList.toggle("open"));
  closeBtn.addEventListener("click", () => sidebar.classList.remove("open"));
}

const setupDragAndDropeEvent = () => {
  const columns = [
    { wrapper: toDoWrapper, status: "todo" as ColumnStatus },
    { wrapper: inProgressWrapper, status: "in-progress" as ColumnStatus },
    { wrapper: reviewWrapper, status: "review" as ColumnStatus },
    { wrapper: doneWrapper, status: "done" as ColumnStatus }
  ];

  columns.forEach(({ wrapper, status }) => {

    wrapper.addEventListener("dragover", (e) => {
      e.preventDefault();
    });

    wrapper.addEventListener("drop", (e) => {
      e.preventDefault();

      if (!selectedProject) return;

      const id = Number(
        e.dataTransfer?.getData("text/plain") ||
        draggedTaskElement?.dataset.id
      );

      if (!id) return;

      selectedProject.board.updateTaskStatus(id, status);

      draggedTaskElement = null;

      render(projectList, selectedProject, ui);
    });
  });
}

//For selecting a project inside the SideBar
const projectListSideEvents = () =>{
  projectListWrapperSide.onclick = (e) => {
    const target = e.target as HTMLElement;
    const projectEl = target.closest(".project-item") as HTMLElement;
    if (!projectEl) return;

    const id = Number(projectEl.dataset.id);
    selectedProject = projectList.find(p => p.id === id) || null;
    render(projectList, selectedProject, ui);
  };
}

//Showin/Closing the modal
const projectCreationEvents = () =>{
  addProjectBtn.forEach(btn => btn.addEventListener('click', () => projectModal.open()));
  cancelProjectBtn.addEventListener("click", () => projectModal.close());
  projectModal.close();

  saveProjectBtn.addEventListener("click", addProject)
}

//Showin/Closing the modal
const taskCreationEvents = () =>{
  addTaskBtn.addEventListener("click", () => {
    if(selectedProject) taskModal.open()
  });

  cancelTaskBtn.addEventListener("click", () => taskModal.close());
  
  saveTaskBtn.addEventListener("click", onAddTask)
  
  taskModal.close()
}

const taskBoardsEvent = () =>{
  [toDoWrapper, inProgressWrapper, reviewWrapper, doneWrapper].forEach(wrapper => {
    wrapper.onclick = (e) => {
      const target = e.target as HTMLElement;
      const taskEl = target.closest(".task-item") as HTMLElement;

      if (!taskEl) return;

      const id = Number(taskEl.dataset.id);
      const task = selectedProject?.board.getAllTasks().find(t => t.id === id);

      if (!task) return;

      if (target.closest(".delete-task-btn")) {
        e.stopPropagation();
        onDeleteTask(id);

        return;
      }

      viewModal.open(task)
    };
  });
}

//Events when selecting a project and deleting a project
const projectListMainEvents = () =>{
  projectListWrapper.onclick = (e) => {
    const target = e.target as HTMLElement;
    const projectEl = target.closest(".project-item") as HTMLElement;
    if (!projectEl) return;

    const id = Number(projectEl.dataset.id);

    if (target.closest(".delete-project-btn")) {
      deleteProject(id)

      return;
    }

    selectedProject = projectList.find(p => p.id === id) || null;
    render(projectList, selectedProject, ui);
  };
}

const viewAndEditTaskEvent = () => {
  closeViewBtn.addEventListener("click", viewModal.close);
  viewModal.close();
  
  editBtn.addEventListener("click", () => {
    if (!currentTask) return;

    editTitle.value = currentTask.title;
    editDesc.value = currentTask.description;
    
    taskViewMode.classList.add("hidden");
    taskEditMode.classList.remove("hidden");
  });

  cancelEditBtn.addEventListener("click", () => {
    taskEditMode.classList.add("hidden");
    taskViewMode.classList.remove("hidden");
  });

  saveEditBtn.addEventListener("click", onUpdateTask)
}

//Global Event
const setupEventListeners = () => {
  sideBarEvent();
  projectListMainEvents();
  projectListSideEvents();
  projectCreationEvents();
  taskCreationEvents();
  taskBoardsEvent();
  viewAndEditTaskEvent();
  setupDragAndDropeEvent();

  mainContent.onclick = (e) =>{
    sidebar.classList.remove('open')
  }
  
  backBtn.addEventListener("click", () => {
    selectedProject = null;
    render(projectList, selectedProject, ui);
  });

  document.addEventListener("dragstart", (e) => {
    const el = (e.target as HTMLElement).closest(".task-item") as HTMLElement;
    
    if (!el) return;

    draggedTaskElement = el;

    e.dataTransfer?.setData("text/plain", el.dataset.id || "");
    e.dataTransfer!.effectAllowed = "move";
  });

}

setupEventListeners();
render(projectList, selectedProject, ui);