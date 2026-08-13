import { useState } from 'react';
import Breadcrumb from '../components/Breadcrumb.jsx';
import { useNews } from '../context/NewsContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

// Formats a <input type="date"> value (YYYY-MM-DD) into the DD-MM-YYYY
// format the cards display, per spec.
function toDisplayDate(isoDate) {
  const [year, month, day] = isoDate.split('-');
  return `${day}-${month}-${year}`;
}

export default function SubmitNews() {
  const { submitNews } = useNews();
  const { user } = useAuth();

  // Name is pre-filled from the signed-in account (we already know who's
  // submitting) but left editable — e.g. an admin posting on a student's
  // behalf might want to credit that student instead of themselves.
  const emptyForm = { title: '', name: user?.name || '', date: '', newsText: '', grade: 'First Grade', image: null };
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState(null);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  // JSON Server has no real file storage, so the image is read as a
  // base64 data URL and stored directly on the record. Fine for a few
  // small images in a prototype; a real backend would upload to storage
  // and save a URL instead.
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((prev) => ({ ...prev, image: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.name.trim() || !form.newsText.trim() || !form.date) {
      setStatus('error');
      return;
    }
    setStatus('saving');
    try {
      await submitNews({ ...form, date: toDisplayDate(form.date) });
      setForm(emptyForm);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="main-page">
      <Breadcrumb trail={[{ label: 'Home', to: '/daily-news' }, { label: 'Submit your news' }]} />
      <h1>Submit Your News</h1>
      <p className="page-subtext">
        Submissions are reviewed by an admin before appearing on Daily News.
      </p>

      <form className="submit-form" onSubmit={handleSubmit}>
        <label className="form-field">
          <span>Title</span>
          <input type="text" value={form.title} onChange={handleChange('title')} required />
        </label>

        <label className="form-field">
          <span>What's your name?</span>
          <input type="text" value={form.name} onChange={handleChange('name')} required />
        </label>

        <label className="form-field">
          <span>Date</span>
          <input type="date" value={form.date} onChange={handleChange('date')} required />
        </label>

        <label className="form-field">
          <span>News text</span>
          <textarea rows={5} value={form.newsText} onChange={handleChange('newsText')} required />
        </label>

        <label className="form-field">
          <span>Your grade</span>
          <select value={form.grade} onChange={handleChange('grade')}>
            <option value="First Grade">First Grade</option>
            <option value="Second Grade">Second Grade</option>
          </select>
        </label>

        <label className="form-field">
          <span>Image (optional)</span>
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </label>

        <button type="submit" className="btn-primary" disabled={status === 'saving'}>
          {status === 'saving' ? 'Submitting...' : 'Submit for Review'}
        </button>

        {status === 'success' && <p className="status-success">Submitted — an admin will review it shortly.</p>}
        {status === 'error' && <p className="status-error">Fill in all required fields, then try again.</p>}
      </form>
    </div>
  );
}
