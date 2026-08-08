const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Task = require('../models/Task');

// @route   GET /api/tasks
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find().populate('assignedTo', 'name');
    res.json(tasks);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/tasks
router.post('/', auth, async (req, res) => {
  try {
    const newTask = new Task({
      ...req.body,
      assignedTo: req.body.assignedTo || req.user.id
    });
    const task = await newTask.save();
    res.json(task);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/tasks/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { returnDocument: 'after' }
    );
    res.json(task);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/tasks/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Task removed' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/tasks/:id/comments
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ msg: 'Task not found' });
    
    task.comments.push({
      text: req.body.text,
      user: req.user.id,
      userName: req.user.name || 'User',
      date: new Date()
    });
    
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/tasks/:id/attachments
router.post('/:id/attachments', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ msg: 'Task not found' });
    
    task.attachments.push({
      url: req.body.url,
      name: req.body.name,
      date: new Date()
    });
    
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
