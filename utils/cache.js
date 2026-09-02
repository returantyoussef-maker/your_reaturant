// ==============================================================================
// طبقة كاش بسيطة داخل الذاكرة (In-Memory Cache) مع دعم انتهاء الصلاحية (TTL)
// ==============================================================================
// الهدف: تخزين نتائج الاستعلامات شبه الثابتة (الأقسام، المنتجات، الإعدادات،
// مناطق التوصيل...) لتقليل الضغط على MongoDB وتسريع الاستجابة، مع تفريغ
// الكاش تلقائياً فور حدوث أي تعديل/إضافة/حذف لضمان تطابق البيانات فوراً
// (لا حاجة لـ Redis طالما السيرفر يعمل بعملية واحدة Single Process)
// ==============================================================================

const store = new Map();

/**
 * جلب قيمة من الكاش إن كانت موجودة ولم تنتهِ صلاحيتها
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
 * حفظ قيمة في الكاش مع مدة صلاحية اختيارية بالمللي ثانية (افتراضياً 5 دقائق)
 * مرر ttlMs = 0 لتخزين دائم بدون انتهاء صلاحية (يُفرّغ فقط عند invalidate يدوي)
 */
function set(key, value, ttlMs = 5 * 60 * 1000) {
    store.set(key, {
        value,
        expiresAt: ttlMs ? Date.now() + ttlMs : null
    });
}

/**
 * حذف مفتاح واحد بعينه من الكاش
 */
function del(key) {
    store.delete(key);
}

/**
 * حذف كل المفاتيح التي تبدأ بسابقة معينة
 * (مفيد جداً لكاش المنتجات لأنه بيتخزن بمفاتيح متعددة حسب الفلاتر والبحث)
 */
function delByPrefix(prefix) {
    for (const key of store.keys()) {
        if (key.startsWith(prefix)) store.delete(key);
    }
}

/**
 * تفريغ الكاش بالكامل (مفيد عند الحاجة لإعادة ضبط شاملة)
 */
function clear() {
    store.clear();
}

module.exports = { get, set, del, delByPrefix, clear };