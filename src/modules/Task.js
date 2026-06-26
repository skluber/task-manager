export class Task {
    constructor({ 
        taskId = null, 
        projectId = null, 
        name, 
        description = "", 
        status = "todo", 
        priority = "low", 
        dueDate 
    }){
        if (!name || name.trim() === "") {
            throw new Error("Task validation failed: 'name' is required and cannot be empty.");
        }

        if (!projectId) {
            throw new Error("Task validation failed: 'projectId' is required to bind the task to a project.");
        }

        this.taskId = taskId || crypto.randomUUID();
        this.projectId = projectId;
        this.name = name.trim();
        this.description = description.trim();

        this.status = ["todo", "progress", "completed"].includes(status) ? status : "todo";
        this.priority = ["low", "medium", "high"].includes(priority) ? priority : "low";

        this.dueDate = dueDate;
    }
}