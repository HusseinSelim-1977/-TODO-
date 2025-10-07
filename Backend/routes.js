const express = require('express');
const router = express.Router();
import{
    createTask,
    getAllTasks,
    getTaskByID,
    updateTask,
    deleteTask,
    toggleTaskDone,
    Counters,
    changeLayout
} from('../BACKEND/controller.js');

router.post('/createTask', createTask);
router.get('/getAllTasks', getAllTasks);
router.get('/getTaskByID/:id', getTaskByID);
router.put('/updateTask/:id', updateTask);
router.put('/Counters/:id', Counters);
router.put('/changeLayout', changeLayout);
router.delete('/deleteTask/:id', deleteTask);
router.patch('/toggleTaskDone/:id', toggleTaskDone);

export default router;