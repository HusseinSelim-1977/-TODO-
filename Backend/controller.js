import mongoose from "mongoose";
import { TODO } from "../SCHEMAS/schema.js";

export async function createTask(req, res, next) {
    try {
        const { Task} = req.body;
        
        if (!Task || Task.trim() === '') {
            return res.status(400).json({
                error: "A task is required", 
                suggestion: "It is you stopping yourself from accomplishing it"
            });
        }

        const newTODO = await TODO.create({
            Task: Task.trim(),
            Priority: Priority || 'Medium',
            DueDate: DueDate || null,
            Done: false
        });

        res.status(201).json({
            success: true,
            data: newTODO,
            message: "Task created successfully"
        });

    } catch(e) {
        console.error("Error Creating Task: ", e);
        if(e.name === 'ValidationError') {
            return res.status(400).json({error: e.message});
        }
        next(e);
    }
};

export async function getAllTasks(req, res, next) {
    try {
        const layout = req.query.layout || req.session?.layout || 'list';
        if (req.session) req.session.layout = layout;
        
        const tasks = await TODO.find();
        
        if(!tasks || tasks.length === 0) {
            return res.status(404).json({error: "There are No Tasks Found"});
        }
        
        res.json({
            success: true,
            count: tasks.length,
            layout: layout,
            data: tasks
        });
    } catch(error) {
        next(error);
    }
};

export async function getTaskByID(req, res, next) {
    try {
        const { id } = req.params;
        const singleTask = await TODO.findById(id);
        
        if(!singleTask) {
            return res.status(404).json({
                error: "Task Not Found",
                suggestion: "Task may have been already accomplished"
            });
        }
        
        res.json({
            success: true,
            data: singleTask
        });
    } catch(error) {
        next(error);
    }
};

export async function updateTask(req, res, next) {
    try {
        const { id } = req.params;
        const { Task} = req.body;
        
        const updatedTODO = await TODO.findByIdAndUpdate(
            id, 
            { Task, Done, Priority, DueDate }, 
            { new: true, runValidators: true }
        );
        
        if(!updatedTODO) {
            return res.status(404).json({error: "Task Not Found"});
        }
        
        res.json({
            success: true,
            data: updatedTODO,
            message: "Task updated successfully"
        });
    } catch(e) {
        console.error(e);
        if(e.name === 'CastError') {
            return res.status(400).json({error: "Invalid Id Format"});
        }
        if(e.name === 'ValidationError') {
            return res.status(400).json({error: "Invalid Input"});
        }
        next(e);
    }
};

export async function deleteTask(req, res, next) {
    try {
        const { id } = req.params;
        const deletedTODO = await TODO.findByIdAndDelete(id);
        
        if(!deletedTODO) {
            return res.status(404).json({error: "Task Not Found"});
        }
        
        res.json({
            success: true,
            message: "Task deleted successfully",
            data: deletedTODO
        });
    } catch(e) {
        console.error(e);
        if(e.name === 'CastError') {
            return res.status(400).json({error: "Invalid Id Format"});
        }
        next(e);
    }
};

export async function toggleTaskDone(req, res, next) {
    try {
        const { id } = req.params;
        const task = await TODO.findById(id);
        
        if(!task) {
            return res.status(404).json({
                error: "Task Not Found",
                suggestion: "Task may be already accomplished"
            });
        } 
        
        task.Done = !task.Done;
        await task.save();
        
        res.json({
            success: true,
            data: task,
            message: `Task marked as ${task.Done ? 'done' : 'not done'}`
        });

    } catch(error) {
        console.error("Toggle Task Error: ", error);
        if(error.name === 'CastError') {
            return res.status(400).json({error: "Invalid Id Format"});
        }
        next(error);
    }
}

export async function Counters(req, res,next) {
    try {
        const { id } = req.params;
        const tasks = await tasks.find({ user: id });
        const active = tasks.filter(task => !task.Done).length;
        const completed = tasks.filter(task => task.Done).length;
        res.json({
            active,
            completed,
            total: tasks.length
        });
    } catch(error) {
        console.error("Counter Error: ", error);
        res.status(500).json({ error: "Failed to count tasks" });
    } next();
}

export const changeLayout = async (req, res,next) => {
    try {
        const { layout } = req.body;
        
        if (!['list', 'grid'].includes(layout)) {
            return res.status(400).json({ error: 'Invalid layout type' });
        }
          req.session.layout = layout;
        res.json({ success: true, layout });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    } next();
};