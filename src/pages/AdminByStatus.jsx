import Breadcrumb from '../components/Breadcrumb.jsx';
import { useNews } from '../context/NewsContext.jsx';

const STATUSES = ['pending', 'approved', 'rejected'];
const STATUS_CLASS = {
  pending: 'status-pending',
  approved: 'status-approved',
  rejected: 'status-rejected',
};

export default function AdminByStatus() {
  const { news, loading, error } = useNews();

  return (
    <div className="main-page">
      <Breadcrumb trail={[{ label: 'Home', to: '/daily-news' }, { label: 'News by status' }]} />
      <h1>News by Status</h1>

      {error && <p className="status-error">{error}</p>}
      {loading && <p className="status-text">Loading submissions...</p>}

      {!loading &&
        !error &&
        STATUSES.map((status) => {
          const items = news.filter((n) => n.status === status);
          return (
            <div key={status} className="status-group">
              <h3 className={`status-group-heading ${STATUS_CLASS[status]}`}>
                {status} <span className="status-group-count">({items.length})</span>
              </h3>
              {items.length === 0 ? (
                <p className="status-text">Nothing here yet.</p>
              ) : (
                <div className="status-group-list">
                  {items.map((item) => (
                    <div key={item.id} className="status-group-item">
                      <span className="status-group-item-title">{item.title}</span>
                      <span className="status-group-item-meta">{item.name} · {item.date}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
    </div>
  );
}
