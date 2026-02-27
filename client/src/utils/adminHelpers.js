export async function fetchContent() {
  const api = import.meta.env.VITE_API_URL || '';
  const token = localStorage.getItem('tvpk_token');
  const res = await fetch(`${api}/admin/content`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error('Failed to fetch content');
  const j = await res.json();
  return j.content || {};
}

function setAtPath(obj, pathParts, value) {
  if (pathParts.length === 0) return value;
  const [first, ...rest] = pathParts;
  const copy = Array.isArray(obj) ? obj.slice() : { ...(obj || {}) };
  copy[first] = setAtPath(copy[first], rest, value);
  return copy;
}

function getAtPath(obj, pathParts) {
  let cur = obj;
  for (const p of pathParts) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
}

export async function saveTopKey(topKey, value) {
  const api = import.meta.env.VITE_API_URL || '';
  const token = localStorage.getItem('tvpk_token');
  const res = await fetch(`${api}/admin/content`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ content: value, focus: topKey })
  });
  if (!res.ok) {
    const out = await res.json().catch(() => ({}));
    throw new Error(out.error || 'Save failed');
  }
  return await res.json();
}

export function isAdmin() {
  try { const u = JSON.parse(localStorage.getItem('tvpk_user')); return !!u && u.role === 'admin'; } catch { return false; }
}

export async function editSectionItem(sectionPath, index, initialItem) {
  try {
    const parts = sectionPath.split('.').filter(Boolean);
    const top = parts[0];
    const rest = parts.slice(1);
    const doc = await fetchContent();
    const topObj = doc[top] ?? {};
    const targetParent = rest.length ? getAtPath(topObj, rest.slice(0, -1)) : topObj;
    const arrKey = rest.length ? rest[rest.length - 1] : null;
    let arr;
    if (arrKey) arr = targetParent ? targetParent[arrKey] : undefined;
    else arr = Array.isArray(topObj) ? topObj : undefined;

    // Support pattern where topObj contains the editable array under common keys
    if (!Array.isArray(arr) && topObj && typeof topObj === 'object') {
      if (Array.isArray(topObj.items)) {
        arr = topObj.items;
        rest.push('items');
      } else if (Array.isArray(topObj.news)) {
        arr = topObj.news;
        rest.push('news');
      } else if (Array.isArray(topObj.items || topObj.list)) {
        arr = topObj.items || topObj.list;
        rest.push(Array.isArray(topObj.items) ? 'items' : 'list');
      }
    }

    if (!Array.isArray(arr)) {
      // If caller supplied an initialItem (from UI translations), use that to seed the array
      if (typeof initialItem !== 'undefined') {
        arr = [];
        // place initial item at requested index if provided, otherwise append
        if (typeof index === 'number') arr[index] = initialItem;
        else arr.push(initialItem);
      } else {
        alert('Editable array not found for ' + sectionPath);
        return;
      }
    }
    const item = arr[index];
    const input = prompt(`Edit JSON for ${sectionPath}[${index}]`, JSON.stringify(item, null, 2));
    if (input === null) return;
    let parsed;
    try { parsed = JSON.parse(input); } catch (e) { alert('Invalid JSON'); return; }
    const newArr = arr.slice();
    newArr[index] = parsed;
    // assemble new top value
    let newTopValue;
    if (arrKey || (!arrKey && rest[rest.length-1] === 'items')) {
      // clone topObj and set nested path
      const newTop = JSON.parse(JSON.stringify(topObj));
      let cur = newTop;
      for (let i = 0; i < rest.length - 1; i++) {
        const p = rest[i];
        cur[p] = cur[p] ?? {};
        cur = cur[p];
      }
      cur[rest[rest.length - 1]] = newArr;
      newTopValue = newTop;
    } else {
      newTopValue = newArr;
    }
    const out = await saveTopKey(top, newTopValue);
    window.dispatchEvent(new CustomEvent('tvpk-content-updated', { detail: { section: top, content: out.content?.[top] ?? newTopValue } }));
    alert('Saved');
  } catch (err) {
    alert(err.message || 'Save failed');
  }
}

export async function deleteSectionItem(sectionPath, index) {
  try {
    const parts = sectionPath.split('.').filter(Boolean);
    const top = parts[0];
    const rest = parts.slice(1);
    const doc = await fetchContent();
    const topObj = doc[top] ?? {};
    const targetParent = rest.length ? getAtPath(topObj, rest.slice(0, -1)) : topObj;
    const arrKey = rest.length ? rest[rest.length - 1] : null;
    let arr;
    if (arrKey) arr = targetParent ? targetParent[arrKey] : undefined;
    else arr = Array.isArray(topObj) ? topObj : undefined;

    // Support pattern where topObj contains the editable array under common keys
    if (!Array.isArray(arr) && topObj && typeof topObj === 'object') {
      if (Array.isArray(topObj.items)) {
        arr = topObj.items;
        rest.push('items');
      } else if (Array.isArray(topObj.news)) {
        arr = topObj.news;
        rest.push('news');
      } else if (Array.isArray(topObj.items || topObj.list)) {
        arr = topObj.items || topObj.list;
        rest.push(Array.isArray(topObj.items) ? 'items' : 'list');
      }
    }

    if (!Array.isArray(arr)) {
      alert('Array not found for ' + sectionPath);
      return;
    }
    if (!confirm('Delete this item?')) return;
    const newArr = arr.slice();
    newArr.splice(index, 1);
    let newTopValue;
    if (arrKey) {
      const newTop = JSON.parse(JSON.stringify(topObj));
      let cur = newTop;
      for (let i = 0; i < rest.length - 1; i++) {
        const p = rest[i];
        cur[p] = cur[p] ?? {};
        cur = cur[p];
      }
      cur[rest[rest.length - 1]] = newArr;
      newTopValue = newTop;
    } else {
      newTopValue = newArr;
    }
    const out = await saveTopKey(top, newTopValue);
    window.dispatchEvent(new CustomEvent('tvpk-content-updated', { detail: { section: top, content: out.content?.[top] ?? newTopValue } }));
    alert('Deleted');
  } catch (err) {
    alert(err.message || 'Delete failed');
  }
}
