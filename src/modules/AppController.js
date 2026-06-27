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