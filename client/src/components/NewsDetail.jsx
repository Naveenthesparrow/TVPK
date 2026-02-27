import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calendar, ChevronLeft, Pencil, Trash2 } from 'lucide-react';
import { isAdmin } from '../utils/adminHelpers';
import NewsEditorModal from './NewsEditorModal';

const CARD_IMAGES = [
    'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=1200&h=700&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1540910419892-f0c74b045366?q=80&w=1200&h=700&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=1200&h=700&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1200&h=700&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1574943320219-553eb213f72d?q=80&w=1200&h=700&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1524178232363-1fb28f74b0cd?q=80&w=1200&h=700&auto=format&fit=crop',
];

export default function NewsDetail() {
  const { index } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.resolvedLanguage || i18n.language || 'en').split('-')[0];
  const items = Array.isArray(t('news.items', { returnObjects: true, lng: currentLang })) ? t('news.items', { returnObjects: true, lng: currentLang }) : [];
  const idx = parseInt(index, 10);
  const item = Number.isFinite(idx) && items[idx] ? items[idx] : null;
  const [editorOpen, setEditorOpen] = React.useState(false);
  const [localItem, setLocalItem] = React.useState(item);

  if (!item) {
    return (
      <div className="max-w-4xl mx-auto py-24 px-4">
        <div className="bg-white p-10 rounded shadow text-center">
          <h2 className="text-2xl font-bold mb-4">Article not found</h2>
          <p className="mb-6">The requested news article could not be located.</p>
          <button onClick={() => navigate('/news')} className="px-4 py-2 bg-primary text-white rounded">Back to news</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="mb-6 flex items-center justify-between">
        <button onClick={() => navigate('/news')} className="inline-flex items-center gap-2 text-sm text-primary font-extrabold"><ChevronLeft size={16}/> Back</button>
        {isAdmin() && (
          <div className="flex items-center gap-2">
            <button onClick={() => { setEditorOpen(true); }} title="Edit article" className="bg-white rounded-full p-2 shadow"><Pencil size={16} /></button>
            <button onClick={async () => {
              if (!confirm('Delete this article?')) return;
              const api = import.meta.env.VITE_API_URL || '';
              const token = localStorage.getItem('tvpk_token');
              try {
                const r = await fetch(`${api}/admin/content`, { headers: { Authorization: `Bearer ${token}` } });
                const j = await r.json();
                const doc = j.content || {};
                const arr = Array.isArray(doc.news) ? doc.news.slice() : [];
                if (arr.length > idx) arr.splice(idx, 1);
                const res = await fetch(`${api}/admin/content`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ content: arr, focus: 'news' }) });
                const out = await res.json();
                if (!res.ok) return alert(out.error || 'Delete failed');
                window.dispatchEvent(new CustomEvent('tvpk-content-updated', { detail: { section: 'news', content: out.content.news } }));
                navigate('/news');
              } catch (e) { alert('Delete failed'); }
            }} title="Delete article" className="bg-white rounded-full p-2 shadow"><Trash2 size={16} /></button>
          </div>
        )}
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        <div className="aspect-[16/7] overflow-hidden">
          <img src={CARD_IMAGES[idx % CARD_IMAGES.length]} alt={((localItem || item).title && typeof (localItem || item).title === 'object') ? ((localItem || item).title[currentLang] || (localItem || item).title.en || (localItem || item).title.ta) : (localItem || item).title} className="w-full h-full object-cover" />
        </div>
        <div className="p-8">
          <div className="flex items-center gap-3 text-sm text-slate-500 mb-4"><Calendar size={14} className="text-primary/60" />{(localItem || item).date}</div>
          <h1 className={`text-2xl font-extrabold text-slate-900 mb-4 ${currentLang === 'ta' ? 'font-tamil' : 'font-header'}`}>{((localItem || item).title && typeof (localItem || item).title === 'object') ? ((localItem || item).title[currentLang] || (localItem || item).title.en || (localItem || item).title.ta) : (localItem || item).title}</h1>
          <div className="prose max-w-none text-slate-700">
            {((localItem || item).content || (localItem || item).desc) ? (
              (localItem || item).content ? (
                typeof (localItem || item).content === 'object' ? <div dangerouslySetInnerHTML={{ __html: (localItem || item).content[currentLang] || (localItem || item).content.en || (localItem || item).content.ta || '' }} /> : <div dangerouslySetInnerHTML={{ __html: (localItem || item).content }} />
              ) : (
                <p>{((localItem || item).desc && typeof (localItem || item).desc === 'object') ? ((localItem || item).desc[currentLang] || (localItem || item).desc.en || (localItem || item).desc.ta) : (localItem || item).desc}</p>
              )
            ) : null}
          </div>
        </div>
      </div>

      <NewsEditorModal open={editorOpen} onClose={() => setEditorOpen(false)} item={(localItem || item)} index={idx} onSave={async (data, i) => {
        const api = import.meta.env.VITE_API_URL || '';
        const token = localStorage.getItem('tvpk_token');
        try {
          const r = await fetch(`${api}/admin/content`, { headers: { Authorization: `Bearer ${token}` } });
          const j = await r.json();
          const doc = j.content || {};
          const arr = Array.isArray(doc.news) ? doc.news.slice() : [];
          if (typeof i === 'number') arr[i] = { ...arr[i], ...data };
          else arr.push(data);
          const res = await fetch(`${api}/admin/content`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ content: arr, focus: 'news' }) });
          const out = await res.json();
          if (!res.ok) return alert(out.error || 'Save failed');
          window.dispatchEvent(new CustomEvent('tvpk-content-updated', { detail: { section: 'news', content: out.content.news } }));
          setEditorOpen(false);
          setLocalItem(arr[i]);
        } catch (e) { alert('Save failed'); }
      }} onDelete={async (i) => {
        if (!confirm('Delete this news item?')) return;
        const api = import.meta.env.VITE_API_URL || '';
        const token = localStorage.getItem('tvpk_token');
        try {
          const r = await fetch(`${api}/admin/content`, { headers: { Authorization: `Bearer ${token}` } });
          const j = await r.json();
          const doc = j.content || {};
          const arr = Array.isArray(doc.news) ? doc.news.slice() : [];
          arr.splice(i, 1);
          const res = await fetch(`${api}/admin/content`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ content: arr, focus: 'news' }) });
          const out = await res.json();
          if (!res.ok) return alert(out.error || 'Delete failed');
          window.dispatchEvent(new CustomEvent('tvpk-content-updated', { detail: { section: 'news', content: out.content.news } }));
          setEditorOpen(false);
          navigate('/news');
        } catch (e) { alert('Delete failed'); }
      }} />
    </div>
  );
}
