import { Link } from 'react-router-dom';

// `trail` is an array of { label, to }. The last item renders as plain
// text (current page), everything before it is a link.
export default function Breadcrumb({ trail }) {
  return (
    <div className="breadcrumb">
      {trail.map((crumb, i) => {
        const isLast = i === trail.length - 1;
        return (
          <span key={crumb.label} className="breadcrumb-item">
            {isLast || !crumb.to ? (
              <span className="breadcrumb-current">{crumb.label}</span>
            ) : (
              <Link to={crumb.to}>{crumb.label}</Link>
            )}
            {!isLast && <span className="breadcrumb-sep">›</span>}
          </span>
        );
      })}
    </div>
  );
}
