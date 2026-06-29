import { TaskManager } from "./TaskManager.js";
import { DOMRenderer } from "./DOMRenderer.js";

export class AppController {
    constructor() {
        this.TaskManager = new TaskManager();
        this.init();
    }

    init() {
        try {
            if (this.TaskManager.projects.length === 0) {
                this.TaskManager.addProject({ name: "Personal", color: "#3b82f6" });
                this.TaskManager.addProject({ name: "Work", color: "#f59e0b" });
            }
        } catch (error) {
            console.warn("Initial data already stored:", error.message);
        }

        DOMRenderer.renderProjectsSidebar(this.TaskManager.projects);
        DOMRenderer.renderTasks(this.TaskManager.tasks, this.TaskManager.projects);

        this.setupEventsListeners();
    }

    setupEventsListeners() {
        this.#setupProjectModalEvents();
        this.#setupTaskModalEvents();
        this.#setupDraggableColumns();
        this.#setupCheckboxEvents();
        this.#setupSidebarEvents();
    }

    // ==========================================================================
    // PRIVATE modules 
    // ==========================================================================

    #setupProjectModalEvents() {
        const btnOpen = document.getElementById('btn-open-project-modal');
        const btnClose = document.getElementById('btn-close-project-modal');
        const btnCancel = document.getElementById('btn-cancel-project');
        const form = document.getElementById('form-new-project');

        if (btnOpen) btnOpen.addEventListener("click", () => DOMRenderer.openModal("project"));
        if (btnClose) btnClose.addEventListener("click", () => DOMRenderer.closeModal("project"));
        if (btnCancel) btnCancel.addEventListener("click", () => DOMRenderer.closeModal("project"));

        if (form) {
            form.addEventListener("submit", (e) => this.#handleProjectSubmit(e));
        }
    }

    #setupTaskModalEvents() {
        const btnOpen = document.getElementById('btn-open-task-modal');
        const btnClose = document.getElementById('btn-close-modal');
        const btnCancel = document.getElementById('btn-cancel-task');
        const form = document.getElementById('form-new-task');

        if (btnOpen) {
            btnOpen.addEventListener("click", () => {
                DOMRenderer.renderProjectsSelect(this.TaskManager.projects);
                DOMRenderer.openModal("task");
            });
        }

        if (btnClose) btnClose.addEventListener("click", () => DOMRenderer.closeModal("task"));
        if (btnCancel) btnCancel.addEventListener("click", () => DOMRenderer.closeModal("task"));

        if (form) {
            form.addEventListener("submit", (e) => this.#handleTaskSubmit(e));
        }
    }

    #setupCheckboxEvents() {
        const board = document.querySelector(".task-board");;
        if (!board) return;

        board.addEventListener("change", (e) => {
            if (e.target.classList.contains("task-card__checkbox")) {
                const checkbox = e.target;
                const taskId = checkbox.dataset.id;
                
                const newStatus = checkbox.checked ? "completed" : "todo";

                try {
                    this.TaskManager.updateTaskStatus(taskId, newStatus);
                    
                    setTimeout(() => {
                        DOMRenderer.renderTasks(this.TaskManager.tasks, this.TaskManager.projects);
                    }, 0);

                } catch (error) {
                    console.error(error.message);
                    checkbox.checked = !checkbox.checked;
                }
            }
        });
    }

    #setupDraggableColumns() {
        const columns = document.querySelectorAll(".task-board__column"); 

        columns.forEach(column => {
            column.addEventListener("dragover", (e) => {
                e.preventDefault(); 
            });

            column.addEventListener("dragenter", () => {
                column.classList.add("board__column--hovered");
            });

            column.addEventListener("dragleave", () => {
                column.classList.remove("board__column--hovered");
            });

            column.addEventListener("drop", (e) => {
                column.classList.remove("board__column--hovered");
                
                const taskId = e.dataTransfer.getData("text/plain");
                const newStatus = e.currentTarget.dataset.status; 

                try {
                    this.TaskManager.updateTaskStatus(taskId, newStatus);
                    
                    setTimeout(() => {
                        DOMRenderer.renderTasks(this.TaskManager.tasks, this.TaskManager.projects);
                    }, 0);

                } catch (error) {
                    console.error(error.message);
                }
            });
        });
    }

    #setupSidebarEvents() {
        const sidebarContainer = document.querySelector(".sidebar");

        if (!sidebarContainer) return;

        sidebarContainer.addEventListener("click", (e) => {
            const projectBtn = e.target.closest(".sidebar__project-button");
            if (!projectBtn) return;

            const projectId = projectBtn.dataset.id;
            const projectName = projectBtn.textContent;
            const numberOfTasks = this.TaskManager.getNumberOfTasksByProject(projectId);

            const message = `Are you sure you want to delete the project "${projectName}"?\nThis action will permanently delete the project and its ${numberOfTasks} associated tasks.`;
            const userConfirmed = confirm(message);

            if (userConfirmed) {
                this.TaskManager.deleteProject(projectId);

                DOMRenderer.renderProjectsSidebar(this.TaskManager.projects);
                DOMRenderer.renderTasks(this.TaskManager.tasks, this.TaskManager.projects);
            } else {
                console.log("Project removal cancelled by user")
            }
        })
    }

    // ==========================================================================
    // Handlers
    // ==========================================================================

    #handleProjectSubmit(e) {
        e.preventDefault();

        const nameInput = document.getElementById('project-name');
        const colorInput = document.getElementById('project-color');

        try {
            this.TaskManager.addProject({
                name: nameInput.value,
                color: colorInput.value
            });

            DOMRenderer.renderProjectsSidebar(this.TaskManager.projects);
            DOMRenderer.closeModal("project");
        } catch (error) {
            alert(error.message);
        }
    }

    #handleTaskSubmit(e) {
        e.preventDefault();

        const nameInput = document.getElementById("task-title");
        const descriptionInput = document.getElementById("task-desc");
        const dueDateInput = document.getElementById("task-date");
        const priorityInput = document.getElementById("task-priority");
        const projectInput = document.getElementById("task-project");

        try {
            this.TaskManager.addTask({
                name: nameInput.value,
                description: descriptionInput.value,
                dueDate: dueDateInput.value,
                priority: priorityInput.value,
                status: "todo",
                projectId: projectInput.value
            });

            DOMRenderer.renderTasks(this.TaskManager.tasks, this.TaskManager.projects);
            DOMRenderer.closeModal("task");
        } catch (error) {
            alert(error.message);
        }

    }
}