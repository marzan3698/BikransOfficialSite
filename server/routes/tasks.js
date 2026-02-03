import express from 'express'
import {
  getMyTasks,
  getTaskForUser,
  updateTaskStatus,
  addTaskAttachment,
  listTaskAttachments,
  deleteTaskAttachment,
  addTaskComment,
  listTaskComments,
} from '../controllers/taskController.js'
import { authMiddleware } from '../middleware/auth.js'
import { uploadTaskAttachment } from '../middleware/upload.js'

const router = express.Router()

router.use(authMiddleware)

router.get('/my-tasks', getMyTasks)
router.get('/:id', getTaskForUser)
router.put('/:id/status', updateTaskStatus)
router.post('/:id/attachments', (req, res, next) => {
  uploadTaskAttachment(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message || 'File upload failed' })
    next()
  })
}, addTaskAttachment)
router.get('/:id/attachments', listTaskAttachments)
router.delete('/:id/attachments/:attachmentId', deleteTaskAttachment)
router.post('/:id/comments', addTaskComment)
router.get('/:id/comments', listTaskComments)

export default router
