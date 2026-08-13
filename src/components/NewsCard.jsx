import { ImageOff } from 'lucide-react';

// Cards now show moderation status instead of grade — pending/approved/
// rejected — matching the same color language used on the admin pages
// (status-pending/status-approved/status-rejected badges).
const STATUS_CLASS = {
  pending: 'pill-amber',
  approved: 'pill-green',
  rejected: 'pill-red',
};

export default function NewsCard({ item }) {
  return (
    <article className="news-card">
      <h3 className="news-card-title">{item.title}</h3>

      {/* Real image if the submitter attached one (base64 data URL from
          the upload form); otherwise a CSS-only placeholder banner — no
          external image request, so it never breaks offline. */}
      {item.image ? (
        <img src={item.image} alt={item.title} className="news-card-image" />
      ) : (
        <div className="news-card-image news-card-image-placeholder">
          <ImageOff size={22} />
        </div>
      )}

      <div className="news-card-field">
        <span className="news-card-label">What's your name?</span>
        <span className="news-card-value news-card-value-strong">{item.name}</span>
      </div>

      <div className="news-card-field">
        <span className="news-card-label">Date</span>
        <span className="news-card-value">{item.date}</span>
      </div>

      <div className="news-card-field">
        <span className="news-card-label">News text</span>
        <p className="news-card-body">{item.newsText}</p>
      </div>

      <div className="news-card-field">
        <span className="news-card-label">Status</span>
        <span className={`pill ${STATUS_CLASS[item.status] || 'pill-amber'}`}>{item.status}</span>
      </div>
    </article>
  );
}
