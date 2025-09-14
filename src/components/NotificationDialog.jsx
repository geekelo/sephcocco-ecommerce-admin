import React, { useState } from 'react';
import '../styles/NotificationDialog.css';
import { X } from 'lucide-react';

import { getActiveOutlet } from '../utils/getActiveOutlets';
import { formatDate } from '../utils/formatDate';
import { useUpdateNotifyAdmin } from '../hooks/useUpdateNotifyAdmin';

const NotificationDialog = ({ onClose, notifyData, refetch }) => {
  const activeOutlet = getActiveOutlet();
  const { mutateAsync: updateNotify } = useUpdateNotifyAdmin();

  const [loadingId, setLoadingId] = useState(null); 

  const handleMarkRead = async (notif) => {
    try {
      setLoadingId(notif.id);

      const payload = {
        [`sephcocco_${activeOutlet}_admin_notification`]: { viewed: true },
      };

      await updateNotify({
        active_outlet: activeOutlet,
        notifyId: notif.id,
        payload,
      });

      await refetch();
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    } finally {
      setLoadingId(null); // stop loading
    }
  };

  const sortedNotifications = notifyData
    ? [...notifyData].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    : [];

  return (
    <div className="notification-dialog">
      <div className="dialog-header">
        <h2>Notifications</h2>
        <button className="close-button-noti" onClick={onClose}>
          <X />
        </button>
      </div>
      <div className="dialog-content">
        {sortedNotifications.length === 0 && <p>No notifications</p>}
        {sortedNotifications.map((notif) => (
          <div key={notif.id} className="notification-item">
            <p className="notification-date">{formatDate(notif.created_at)}</p>
            <p className="notification-text">{notif.message}</p>
            {!notif.read && (
              <button
                className="mark-read-btn"
                onClick={() => handleMarkRead(notif)}
                disabled={loadingId === notif.id} // disable only this one
              >
                {loadingId === notif.id ? 'Marking...' : 'Mark as Read'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationDialog;
