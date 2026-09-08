const db = require('../config/database');

function getNotifications(req, res) {
  const userId = req.user.id;
  const notifications = db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 30').all(userId);
  const unreadCount = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0').get(userId).count;

  return res.json({
    success: true,
    unreadCount,
    notifications
  });
}

function markAsRead(req, res) {
  const { id } = req.params;
  const userId = req.user.id;

  if (id === 'all') {
    db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(userId);
    return res.json({ success: true, message: 'All notifications marked as read.' });
  }

  db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?').run(id, userId);
  return res.json({ success: true, message: 'Notification marked as read.' });
}

function deleteNotification(req, res) {
  const { id } = req.params;
  const userId = req.user.id;

  db.prepare('DELETE FROM notifications WHERE id = ? AND user_id = ?').run(id, userId);
  return res.json({ success: true, message: 'Notification deleted.' });
}

module.exports = {
  getNotifications,
  markAsRead,
  deleteNotification
};
