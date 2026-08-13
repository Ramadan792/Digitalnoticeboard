import { useState } from 'react';
import { Check, X, Trash2, Eye } from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import { useNews } from '../context/NewsContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const STATUS_CLASS = {
  pending: 'status-pending',
  approved: 'status-approved',
  rejected: 'status-rejected',
};

export default function AdminAllNews() {
  const { news, loading, error, updateStatus, deleteNews } = useNews();
  // Updated permission rule: Approve/Reject/Delete are ALL Main-Admin-only
  // now. Mrs. Okoro and Mr. Bello can reach this page (ProtectedRoute's
  // adminOnly only checks isAdmin) but see a read-only table — no action
  // buttons render for them at all.
  const { isMainAdmin } = useAuth();
  const [pendingDelete, setPendingDelete] = useState(null);

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    await deleteNews(pendingDelete.id);
    setPendingDelete(null);
  };

  return (
    <div className="main-page">
      <Breadcrumb trail={[{ label: 'Home', to: '/daily-news' }, { label: 'All submitted news' }]} />
      <h1>All Submitted News</h1>

      {!isMainAdmin && (
        <p className="readonly-banner">
          <Eye size={14} /> View only — only Main Admin can approve, reject, or delete.
        </p>
      )}

      {error && <p className="status-error">{error}</p>}
      {loading && <p className="status-text">Loading submissions...</p>}

      {!loading && !error && (
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Submitted By</th>
                <th>Date</th>
                <th>Grade</th>
                <th>Status</th>
                {isMainAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {news.map((item) => (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td>{item.name}</td>
                  <td>{item.date}</td>
                  <td>{item.grade}</td>
                  <td>
                    <span className={`status-badge ${STATUS_CLASS[item.status]}`}>{item.status}</span>
                  </td>
                  {isMainAdmin && (
                    <td className="admin-table-actions">
                      {item.status !== 'approved' && (
                        <button
                          className="table-action-btn table-action-approve"
                          onClick={() => updateStatus(item.id, 'approved')}
                          aria-label={`Approve ${item.title}`}
                        >
                          <Check size={15} />
                        </button>
                      )}
                      {item.status !== 'rejected' && (
                        <button
                          className="table-action-btn table-action-reject"
                          onClick={() => updateStatus(item.id, 'rejected')}
                          aria-label={`Reject ${item.title}`}
                        >
                          <X size={15} />
                        </button>
                      )}
                      <button
                        className="table-action-btn table-action-delete"
                        onClick={() => setPendingDelete(item)}
                        aria-label={`Delete ${item.title}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {news.length === 0 && <p className="status-text">No submissions yet.</p>}
        </div>
      )}

      {pendingDelete && (
        <ConfirmModal
          title="Delete this submission?"
          body={`"${pendingDelete.title}" will be permanently removed. This can't be undone.`}
          confirmLabel="Delete"
          onConfirm={handleConfirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
