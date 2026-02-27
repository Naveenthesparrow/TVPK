import { editSectionItem, deleteSectionItem } from './adminHelpers';

export function initAdminEventHandler() {
  window.addEventListener('tvpk-admin-edit', async (e) => {
    const s = e?.detail?.section;
    const idx = e?.detail?.index;
    if (!s) return;
    const item = e?.detail?.item;
    // If the UI provided an `item` object, prefer opening a modal-based editor
    // so components with dedicated editors can handle the edit. Otherwise fall back
    // to the JSON prompt editor (`editSectionItem`).
    if (item) {
      window.dispatchEvent(new CustomEvent('tvpk-admin-open', { detail: { section: s, index: idx, item } }));
      return;
    }
    await editSectionItem(s, idx, item);
  });
  window.addEventListener('tvpk-admin-delete', async (e) => {
    const s = e?.detail?.section;
    const idx = e?.detail?.index;
    if (!s) return;
    await deleteSectionItem(s, idx);
  });
}
