import { Project } from "./types/Project.js";
import { ColumnStatus } from "./types/Task.js";

export const displayProjectsSideBar = (projectList: Project[], selectedProject: Project | null, projectListWrapperSide: HTMLDivElement) => {
  projectListWrapperSide.innerHTML = projectList
    .map(
      p => `
      <div class="project-item sidebar-item ${
        selectedProject?.id === p.id ? "active" : ""
      }" data-id="${p.id}">
        <span>
          <i class="fa-solid fa-folder" style="color: var(--primary); margin-right: 6px;"></i>
          ${p.name}
        </span>
      </div>
    `
    )
    .join("");
}

export const displayTaskItem = ( status: ColumnStatus, wrapper: HTMLDivElement, selectedProject: Project | null) => {
  if (!selectedProject) return;

  wrapper.innerHTML = selectedProject.board
    .getTasksByStatus(status)
    .map(
      task => {
        return `<div class="task-item" draggable="true" data-id="${task.id}">
          <strong>${task.id} ${task.title}</strong>
          <p>${task.description || "No description provided."}</p>

          <button
            class="delete-task-btn btn btn-secondary"
            style="align-self:flex-end;padding:.25rem .5rem;font-size:.75rem;border-radius:4px;border:none;background:transparent;"
            data-id="${task.id}"
            title="Delete Task">

            <i class="fa-solid fa-trash-can"></i>

          </button>
        </div>`
     }
    )
    .join("");
}

interface ElementType{
    projectGuide: HTMLDivElement,
    noProjectWrapper: HTMLDivElement;
    projectListWrapper: HTMLDivElement;
    projectListWrapperSide: HTMLDivElement;
    board: HTMLDivElement;
    boardTitle: HTMLHeadingElement;
    toDoWrapper: HTMLDivElement;
    inProgressWrapper: HTMLDivElement;
    reviewWrapper: HTMLDivElement;
    doneWrapper: HTMLDivElement;
}

export const render = (projectList: Project[], selectedProject: Project | null, elements: ElementType) => {
  displayProjectsSideBar(projectList,selectedProject,elements.projectListWrapperSide);

  if (projectList.length === 0) {
    elements.noProjectWrapper.style.display = "block";
    elements.projectListWrapper.innerHTML = "";
    elements.board.classList.add("hidden");
    elements.projectGuide.classList.remove("hidden");
    return;
  }

  if (!selectedProject) {
    elements.noProjectWrapper.style.display = "none";
    elements.projectListWrapper.classList.remove("hidden");
    elements.board.classList.add("hidden");
    elements.projectGuide.classList.remove("hidden");
    
    elements.projectListWrapper.innerHTML = projectList
      .map(
        p => `
      <div class="project-item" data-id="${p.id}">
        <span>
          <i class="fa-solid fa-folder" style="color: var(--primary); margin-right:8px;"></i>
          ${p.name}
        </span>

        <button class="delete-project-btn" data-id="${p.id}">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    `
      )
      .join("");

    return;
  }

  elements.noProjectWrapper.style.display = "none";
  elements.projectListWrapper.innerHTML = "";
  elements.projectGuide.classList.add("hidden");
  elements.board.classList.remove("hidden");
  elements.boardTitle.textContent = selectedProject.name;

  displayTaskItem("todo", elements.toDoWrapper, selectedProject);
  displayTaskItem("in-progress", elements.inProgressWrapper, selectedProject);
  displayTaskItem("review", elements.reviewWrapper, selectedProject);
  displayTaskItem("done", elements.doneWrapper, selectedProject);
}