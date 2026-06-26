import { Project } from './Project.js';
import { Task } from './Task.js';

export class TaskManager {
    constructor() {
        this.projects = [];
        this.tasks = [];
    }

    // ==========================================================================
    // PRIVATE helpers 
    // ==========================================================================

    #projectExists(projectId) {
        return this.projects.some(p => p.projectId === projectId);
    }

    #taskIdExists(taskId) {
        return this.tasks.some(t => t.taskId === taskId);
    }

    #projectNameExists(name) {
        const cleanedName = name.trim().toLowerCase();
        return this.projects.some(p => p.name.toLowerCase() === cleanedName);
    }

    // ==========================================================================
    // PROJECTS operations
    // ==========================================================================

    addProject(projectData) {
        if (this.#projectNameExists(projectData.name)) {
            throw new Error(`Project Manager Error: A project named "${projectData.name.trim()}" already exists.`);
        }

        const newProject = new Project(projectData);
        this.projects.push(newProject);
        return newProject;
    }

    deleteProject(projectId) {
        if (!this.#projectExists(projectId)) {
            throw new Error(`Project Manager Error: Cannot delete. Project ID "${projectId}" not found.`);
        }
        
        this.projects = this.projects.filter(p => p.projectId !== projectId);
        this.tasks = this.tasks.filter(t => t.projectId !== projectId);
    }

    // ==========================================================================
    // TASKS operations
    // ==========================================================================

    addTask(taskData) {
        if (!this.#projectExists(taskData.projectId)) {
            throw new Error(`Task Manager Error: Cannot add task. Project ID "${taskData.projectId}" does not exist.`);
        }

        const newTask = new Task(taskData);
        this.tasks.push(newTask);
        return newTask;
    }

    deleteTask(taskId) {
        if (!this.#taskIdExists(taskId)) {
            throw new Error(`Task Manager Error: Cannot remove task. Task ID "${taskId}" does not exist.`);
        }

        this.tasks = this.tasks.filter(t => t.taskId !== taskId)
    }

    // ==========================================================================
    // FILTER / QUERY operations
    // ==========================================================================
    
    getTasksByProject(projectId){
        if (!this.#projectExists(projectId)) {
            throw new Error(`Task Manager Error: Cannot get tasks. Project ID "${projectId}" does not exist.`);
        }

        return this.tasks.filter(t => t.projectId === projectId);
    }

    updateTaskStatus(taskId, newStatus){
        if (!this.#taskIdExists(taskId)) {
            throw new Error(`Task Manager Error: Cannot update task. Task ID "${taskId}" does not exist.`);
        } 

        const task = this.tasks.filter(t => t.taskId === taskId);
        task.status = ["todo", "progress", "completed"].includes(newStatus) ? newStatus : task.status;
        return task;
    }
}