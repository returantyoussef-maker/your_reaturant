// ==============================================================================
// English English English English English (In-Memory Cache) English English English English (TTL)
// ==============================================================================
// English: English English English English English (English English English
// English English...) English English English MongoDB English English English English
// English English English English English English/English/English English English English English
// (English English English Redis English English English English English Single Process)
// ==============================================================================

const store = new Map();

/**
 * English English English English English English English English English English
 */
function get(key) {
    const entry = store.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt && entry.expiresAt < Date.now()) {
        store.delete(key);
        return undefined;
    }
    return entry.value;
}

/**
 * English English English English English English English English English English (English 5 English)
 * English ttlMs = 0 English English English English English (English English English invalidate English)
 */
function set(key, value, ttlMs = 5 * 60 * 1000) {
    store.set(key, {
        value,
        expiresAt: ttlMs ? Date.now() + ttlMs : null
    });
}

/**
 * English English English English English English
 */
function del(key) {
    store.delete(key);
}

/**
 * English English English English English English English
 * (English English English English English English English English English English English)
 */
function delByPrefix(prefix) {
    for (const key of store.keys()) {
        if (key.startsWith(prefix)) store.delete(key);
    }
}

/**
 * English English English (English English English English English English)
 */
function clear() {
    store.clear();
}

module.exports = { get, set, del, delByPrefix, clear };
