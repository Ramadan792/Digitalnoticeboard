import { useMemo, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useNews } from '../context/NewsContext.jsx';
import Breadcrumb from '../components/Breadcrumb.jsx';
import NewsCard from '../components/NewsCard.jsx';

const GRADES = ['All Grades', 'First Grade', 'Second Grade'];

export default function DailyNews() {
  const { news, loading, error } = useNews();
  const [gradeFilter, setGradeFilter] = useState('All Grades');
  const [showFilter, setShowFilter] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const visible = useMemo(() => {
    return news
      // Public feed only ever shows admin-approved submissions.
      .filter((n) => n.status === 'approved')
      .filter((n) => gradeFilter === 'All Grades' || n.grade === gradeFilter)
      .filter((n) => searchTerm.trim() === '' || n.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [news, gradeFilter, searchTerm]);

  return (
    <div className="main-page">
      <Breadcrumb trail={[{ label: 'Home', to: '/daily-news' }, { label: 'Daily News' }]} />

      <div className="page-top-row">
        <h1>Daily News</h1>
        <div className="page-top-actions">
          <div className="search-box">
            <Search size={15} />
            <input
              type="text"
              placeholder="Search by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-wrap">
            <button className="btn-secondary btn-icon" onClick={() => setShowFilter((v) => !v)}>
              <SlidersHorizontal size={15} />
              Filter
            </button>
            {showFilter && (
              <div className="filter-dropdown">
                {GRADES.map((g) => (
                  <button
                    key={g}
                    className={gradeFilter === g ? 'filter-option filter-option-active' : 'filter-option'}
                    onClick={() => {
                      setGradeFilter(g);
                      setShowFilter(false);
                    }}
                  >
                    {g}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {error && <p className="status-error">{error}</p>}
      {loading && <p className="status-text">Loading news...</p>}
      {!loading && !error && visible.length === 0 && (
        <p className="status-text">No approved news matches your search yet.</p>
      )}

      <div className="news-grid">
        {visible.map((item) => (
          <NewsCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
