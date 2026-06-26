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
            console.warn("Proyectos iniciales ya existentes o error de carga:", error.message);
        }

        DOMRenderer.renderProjectsSidebar(this.TaskManager.projects);

        this.setupEventsListeners();
    }

    setupEventsListeners() {
        this.#setupProjectModalEvents();
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
}