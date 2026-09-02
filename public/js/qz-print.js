// Thermal printing boundary for QZ Tray.
// Thermal profiles deliberately produce one RAW ESC/POS job only.  HTML/PDF/
// PostScript are never sent to a thermal profile.
(function (global) {
    'use strict';

    const state = { connected: false, connecting: false, primaryPrinter: false, lastError: '', printersCache: [] };
    const queues = new Map(); // One FIFO queue per local printer queue.
    const RETRY_INTERVAL_MS = 5000;
    const JOB_TIMEOUT_MS = 20000;
    const DUPLICATE_WINDOW_MS = 30000;
    let retryTimer = null;

    let cachedSettings = {
        enabled: false,
        printerName: '',
        printerType: 'unknown',
        protocol: 'unknown',
        connection: 'qz-queue',
        paperSize: '80mm',
        copies: 1,
        autoPrintNewOrders: true,
        printOnStatusChange: false,
        cutPaper: true,
        beep: false,
        marginBottom: 4
    };

    function clamp(value, min, max, fallback) {
        const number = Number(value);
        return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
    }

    function normaliseSettings(source) {
        source = source || {};
        const printerType = ['thermal', 'office', 'unknown'].includes(source.printerType) ? source.printerType : 'unknown';
        const allowedProtocols = ['escpos-raster', 'escpos-text', 'browser', 'unknown'];
        const protocol = allowedProtocols.includes(source.protocol) ? source.protocol : 'unknown';
        return {
            enabled: source.enabled === true,
            printerName: typeof source.printerName === 'string' ? source.printerName.trim() : '',
            printerType: printerType,
            protocol: protocol,
            connection: source.connection === 'qz-queue' ? 'qz-queue' : 'qz-queue',
            paperSize: source.paperSize === '58mm' ? '58mm' : '80mm',
            copies: clamp(source.copies, 1, 5, 1),
            autoPrintNewOrders: source.autoPrintNewOrders !== false,
            printOnStatusChange: source.printOnStatusChange === true,
            cutPaper: source.cutPaper !== false,
            beep: source.beep === true,
            marginBottom: clamp(source.marginBottom, 0, 50, 4)
        };
    }

    function updateStatusBadge() {
        const badge = document.getElementById('qzConnectionBadge');
        const primaryBadge = document.getElementById('qzPrimaryBadge');
        if (badge) {
            badge.className = 'qz-status-badge ' + (state.connected ? 'qz-status-connected' : state.connecting ? 'qz-status-connecting' : 'qz-status-disconnected');
            badge.innerHTML = state.connected ? '<i class="fa-solid fa-circle-check"></i> QZ Tray متصل' : state.connecting ? '<i class="fa-solid fa-spinner fa-spin"></i> جاري الاتصال...' : '<i class="fa-solid fa-circle-xmark"></i> QZ Tray غير متصل';
        }
        if (primaryBadge) {
            primaryBadge.className = 'qz-role-badge ' + (state.primaryPrinter ? 'qz-role-primary' : 'qz-role-secondary');
            primaryBadge.innerHTML = state.primaryPrinter ? '<i class="fa-solid fa-crown"></i> الطابعة الأساسية' : '<i class="fa-solid fa-user"></i> متفرج';
        }
    }

    function scheduleRetry() {
        if (retryTimer) clearTimeout(retryTimer);
        retryTimer = global.setTimeout(connectQZ, RETRY_INTERVAL_MS);
    }

    async function connectQZ() {
        if (typeof global.qz === 'undefined') {
            state.connected = false;
            updateStatusBadge();
            scheduleRetry();
            return false;
        }
        if (state.connected || state.connecting) return state.connected;
        state.connecting = true;
        updateStatusBadge();
        try {
            await global.qz.websocket.connect({ retries: 2, delay: 1 });
            state.connected = true;
            state.lastError = '';
            refreshPrinterList();
            global.dispatchEvent(new CustomEvent('qz-ready'));
            return true;
        } catch (error) {
            state.connected = false;
            state.lastError = error && error.message ? error.message : String(error);
            scheduleRetry();
            return false;
        } finally {
            state.connecting = false;
            updateStatusBadge();
        }
    }

    function disconnectQZ() {
        if (retryTimer) clearTimeout(retryTimer);
        retryTimer = null;
        try { if (global.qz && state.connected) global.qz.websocket.disconnect(); } catch (_) {}
        state.connected = false;
        state.primaryPrinter = false;
        updateStatusBadge();
    }

    async function getPrintingSettings() {
        try {
            const response = await fetch('/api/settings');
            const payload = await response.json();
            cachedSettings = normaliseSettings((payload.settings || {}).printingSettings);
        } catch (_) {
            try { cachedSettings = normaliseSettings(JSON.parse(localStorage.getItem('ora_qz_print_settings') || '{}')); } catch (e) {}
        }
        try { localStorage.setItem('ora_qz_print_settings', JSON.stringify(cachedSettings)); } catch (_) {}
        syncSettingsControls();
        return Object.assign({}, cachedSettings);
    }

    function syncSettingsControls() {
        const select = document.getElementById('qzPrinterSelect');
        if (select && cachedSettings.printerName && !Array.from(select.options).some(function (option) { return option.value === cachedSettings.printerName; })) {
            const option = document.createElement('option');
            option.value = cachedSettings.printerName;
            option.textContent = cachedSettings.printerName + ' (محفوظة)';
            select.appendChild(option);
        }
        if (select) select.value = cachedSettings.printerName;
        ['qzPrinterTypeSelect', 'qzProtocolSelect'].forEach(function (id) {
            const element = document.getElementById(id);
            if (element) element.value = id === 'qzPrinterTypeSelect' ? cachedSettings.printerType : cachedSettings.protocol;
        });
    }

    async function refreshPrinterList() {
        if (!state.connected || typeof global.qz === 'undefined') return [];
        const select = document.getElementById('qzPrinterSelect');
        try {
            const printers = await global.qz.printers.find();
            state.printersCache = Array.isArray(printers) ? printers : [];
            if (select) {
                select.innerHTML = '<option value="">-- اختر الطابعة --</option>';
                state.printersCache.forEach(function (name) {
                    const option = document.createElement('option');
                    option.value = name;
                    option.textContent = name;
                    select.appendChild(option);
                });
                syncSettingsControls();
            }
            return state.printersCache.slice();
        } catch (error) {
            state.lastError = error && error.message ? error.message : String(error);
            return [];
        }
    }

    function hasArabic(value) { return /[\u0600-\u06FF]/.test(String(value || '')); }
    function escapeHTML(value) { return String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;'); }
    function amount(value) { return Number(value || 0).toFixed(2).replace(/\.00$/, ''); }
    function orderTypeLabel(order) {
        const type = String(order.orderType || '').toLowerCase();
        return type === 'dinein' ? 'داخل المطعم' : type === 'takeaway' ? 'استلام' : 'توصيل';
    }

    function getRestaurantName() {
        const settings = global.restaurantSettings || {};
        return settings.name || (settings.content && settings.content.brandName) || 'مطعم أبو قورة الفلاحي';
    }

    // Kept only for the explicitly configured office/browser path; never used by thermal QZ jobs.
    function buildReceiptHTML(order) {
        const rows = (order.items || []).map(function (item) {
            return '<tr><td>' + escapeHTML(item.title) + ' × ' + Number(item.quantity || 1) + '</td><td>' + amount(item.itemTotal || Number(item.unitPrice || 0) * Number(item.quantity || 1)) + '</td></tr>';
        }).join('');
        return '<div class="thermal-receipt-box" dir="rtl"><h2>' + escapeHTML(getRestaurantName()) + '</h2><p>طلب #' + escapeHTML(order.orderNumber) + '</p><p>العميل: ' + escapeHTML(order.customer && order.customer.name) + '</p><table><tbody>' + rows + '</tbody></table><h3>الإجمالي: ' + amount(order.totalPrice) + ' ج.م</h3></div>';
    }

    function receiptLines(order) {
        const customer = order.customer || {};
        const lines = [
            { text: getRestaurantName(), align: 'center', size: 2 },
            { text: 'فاتورة مبيعات', align: 'center' },
            { text: 'طلب #' + String(order.orderNumber || '-'), align: 'center' },
            { text: new Date(order.createdAt || Date.now()).toLocaleString('ar-EG'), align: 'center' },
            { text: '--------------------------------' },
            { text: 'العميل: ' + (customer.name || 'عميل') },
            { text: 'الهاتف: ' + (customer.phone || '-') },
            { text: 'نوع الطلب: ' + orderTypeLabel(order) }
        ];
        if (customer.tableNumber) lines.push({ text: 'الطاولة: ' + customer.tableNumber });
        if (customer.address && orderTypeLabel(order) === 'توصيل') lines.push({ text: 'العنوان: ' + customer.address });
        if (customer.notes) lines.push({ text: 'ملاحظات: ' + customer.notes });
        lines.push({ text: '--------------------------------' });
        (order.items || []).forEach(function (item) {
            const total = amount(item.itemTotal || Number(item.unitPrice || 0) * Number(item.quantity || 1));
            lines.push({ text: String(item.title || 'صنف') + ' ×' + Number(item.quantity || 1) });
            lines.push({ text: total + ' ج.م', align: 'left' });
        });
        lines.push({ text: '--------------------------------' });
        lines.push({ text: 'المجموع: ' + amount(order.subtotal || order.totalPrice) + ' ج.م' });
        if (Number(order.discountAmount || 0)) lines.push({ text: 'الخصم: -' + amount(order.discountAmount) + ' ج.م' });
        if (Number(order.deliveryFee || 0)) lines.push({ text: 'التوصيل: ' + amount(order.deliveryFee) + ' ج.م' });
        lines.push({ text: 'الإجمالي: ' + amount(order.totalPrice) + ' ج.م', align: 'center', size: 2 });
        lines.push({ text: 'شكراً لزيارتكم', align: 'center' });
        return lines;
    }

    function wrapCanvasText(context, text, maxWidth) {
        const words = String(text || '').split(/\s+/).filter(Boolean);
        if (!words.length) return [''];
        const result = [];
        let current = '';
        words.forEach(function (word) {
            const candidate = current ? current + ' ' + word : word;
            if (context.measureText(candidate).width <= maxWidth || !current) current = candidate;
            else { result.push(current); current = word; }
        });
        if (current) result.push(current);
        return result;
    }

    async function buildEscPosRasterBytes(order, settings) {
        if (!document.createElement || !global.HTMLCanvasElement) throw new Error('لا يدعم هذا المتصفح الرسم المطلوب لطباعة العربية. استخدم متصفحاً حديثاً.');
        const width = settings.paperSize === '58mm' ? 384 : 576; // 203dpi ESC/POS widths
        const padding = settings.paperSize === '58mm' ? 12 : 18;
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d', { willReadFrequently: true });
        if (!context) throw new Error('تعذر إنشاء صورة الإيصال للطباعة الحرارية.');
        const lineModels = [];
        receiptLines(order).forEach(function (line) {
            const fontSize = line.size === 2 ? (settings.paperSize === '58mm' ? 24 : 30) : (settings.paperSize === '58mm' ? 18 : 22);
            context.font = (line.size === 2 ? '700 ' : '400 ') + fontSize + 'px "Noto Sans Arabic", Tahoma, Arial, sans-serif';
            wrapCanvasText(context, line.text, width - padding * 2).forEach(function (text) {
                lineModels.push({ text: text, align: line.align || 'right', fontSize: fontSize, bold: line.size === 2 });
            });
        });
        const lineGap = 7;
        const height = Math.max(1, padding * 2 + lineModels.reduce(function (sum, line) { return sum + line.fontSize + lineGap; }, 0));
        if (height > 16000) throw new Error('الإيصال طويل جداً للطابعة الحرارية؛ قسّم الطلب أو استخدم طباعة المكتب.');
        canvas.width = width;
        canvas.height = Math.ceil(height);
        context.fillStyle = '#fff';
        context.fillRect(0, 0, width, canvas.height);
        context.fillStyle = '#000';
        context.textBaseline = 'top';
        context.direction = 'rtl';
        let y = padding;
        lineModels.forEach(function (line) {
            context.font = (line.bold ? '700 ' : '400 ') + line.fontSize + 'px "Noto Sans Arabic", Tahoma, Arial, sans-serif';
            context.textAlign = line.align === 'center' ? 'center' : line.align === 'left' ? 'left' : 'right';
            const x = line.align === 'center' ? width / 2 : line.align === 'left' ? padding : width - padding;
            context.fillText(line.text, x, y);
            y += line.fontSize + lineGap;
        });
        const pixels = context.getImageData(0, 0, width, canvas.height).data;
        const bytesPerRow = Math.ceil(width / 8);
        const raster = new Uint8Array(bytesPerRow * canvas.height);
        for (let py = 0; py < canvas.height; py++) {
            for (let px = 0; px < width; px++) {
                const offset = (py * width + px) * 4;
                const luminance = pixels[offset] * 0.299 + pixels[offset + 1] * 0.587 + pixels[offset + 2] * 0.114;
                if (luminance < 180 && pixels[offset + 3] > 0) raster[py * bytesPerRow + (px >> 3)] |= 0x80 >> (px & 7);
            }
        }
        const chunks = [[0x1b, 0x40, 0x1b, 0x33, 24, 0x1d, 0x76, 0x30, 0x00, bytesPerRow & 0xff, bytesPerRow >> 8, canvas.height & 0xff, canvas.height >> 8]];
        chunks.push(Array.from(raster));
        return chunks.reduce(function (all, chunk) { return all.concat(chunk); }, []);
    }

    function asciiBytes(text) {
        const value = String(text || '');
        if (/[^\x0A\x0D\x20-\x7E]/.test(value)) throw new Error('ESC/POS text mode يستخدم CP437/ASCII فقط في هذا النظام. استخدم وضع ESC/POS Raster لطباعة العربية أو أي رموز.');
        return Array.prototype.map.call(value, function (character) { return character.charCodeAt(0); });
    }

    function buildEscPosTextBytes(order) {
        // This intentionally has no Arabic labels: CP437 is selected below and does
        // not contain Arabic glyphs.  Arabic-capable installations use raster mode.
        const customer = order.customer || {};
        const text = [
            'ABU QOURA RESTAURANT',
            'ORDER #' + String(order.orderNumber || '-'),
            'CUSTOMER: ' + String(customer.name || '-'),
            'PHONE: ' + String(customer.phone || '-'),
            '-------------------------------'
        ].concat((order.items || []).reduce(function (lines, item) {
            lines.push(String(item.title || 'ITEM') + ' x' + Number(item.quantity || 1));
            lines.push('EGP ' + amount(item.itemTotal || Number(item.unitPrice || 0) * Number(item.quantity || 1)));
            return lines;
        }, []), ['-------------------------------', 'TOTAL: EGP ' + amount(order.totalPrice), 'THANK YOU']).join('\n');
        return [0x1b, 0x40, 0x1b, 0x74, 0x00].concat(asciiBytes(text), [0x0a]);
    }

    function finaliseEscPos(bytes, settings) {
        const result = bytes.slice();
        result.push(0x1b, 0x64, 0x04); // feed before the cut
        if (settings.beep) result.push(0x07);
        if (settings.cutPaper) result.push(0x1d, 0x56, 0x41, 0x00);
        return result;
    }

    function bytesToHex(bytes) { return bytes.map(function (byte) { return (byte & 0xff).toString(16).padStart(2, '0'); }).join('').toUpperCase(); }
    function withTimeout(promise, timeoutMs) {
        return new Promise(function (resolve, reject) {
            const timer = global.setTimeout(function () { reject(new Error('انتهت مهلة QZ Tray. قد تكون المهمة وصلت للطابعة؛ لن يعيد النظام إرسالها تلقائياً.')); }, timeoutMs);
            Promise.resolve(promise).then(function (value) { global.clearTimeout(timer); resolve(value); }, function (error) { global.clearTimeout(timer); reject(error); });
        });
    }

    async function createThermalPayload(order, settings) {
        let bytes;
        if (settings.protocol === 'escpos-raster') bytes = await buildEscPosRasterBytes(order, settings);
        else if (settings.protocol === 'escpos-text') bytes = buildEscPosTextBytes(order);
        else throw new Error('بروتوكول الطابعة الحرارية غير مدعوم. اختر ESC/POS Raster أو ESC/POS Text بعد تأكيد قدرات الطابعة.');
        const oneCopy = finaliseEscPos(bytes, settings);
        const allCopies = [];
        // Avoid Function#apply here: a long raster receipt can exceed the engine's
        // argument limit and falsely look like a printer failure.
        for (let copy = 0; copy < settings.copies; copy++) {
            for (let index = 0; index < oneCopy.length; index++) allCopies.push(oneCopy[index]);
        }
        return [{ type: 'RAW', format: 'HEX', data: bytesToHex(allCopies) }];
    }

    function validateProfile(settings) {
        if (!settings.printerName) return { error: 'لم يتم اختيار طابعة.' };
        if (settings.printerType === 'unknown' || settings.protocol === 'unknown') return { error: 'نوع أو بروتوكول الطابعة غير مؤكد. تم حظر الطباعة حمايةً من إرسال لغة طابعة خاطئة.' };
        if (settings.printerType !== 'thermal') return { error: 'الطابعة المختارة ليست ملفاً حرارياً. استخدم زر/مسار طباعة المكتب المقصود.' };
        if (!['escpos-raster', 'escpos-text'].includes(settings.protocol)) return { error: 'لا يسمح ملف الطابعة الحرارية بإرسال HTML أو PDF أو PostScript.' };
        return {};
    }

    function queueFor(printerName) {
        if (!queues.has(printerName)) queues.set(printerName, { active: false, jobs: [], seen: new Map() });
        return queues.get(printerName);
    }

    function pruneSeen(queue) {
        const now = Date.now();
        queue.seen.forEach(function (expiry, key) { if (expiry <= now) queue.seen.delete(key); });
    }

    function enqueuePrintJob(job) {
        const queue = queueFor(job.settings.printerName);
        pruneSeen(queue);
        if (queue.seen.has(job.dedupeKey)) return Promise.resolve({ success: false, duplicate: true, reason: 'تم تجاهل طلب مكرر لحماية الطابعة.' });
        queue.seen.set(job.dedupeKey, Date.now() + DUPLICATE_WINDOW_MS);
        return new Promise(function (resolve) {
            queue.jobs.push(Object.assign(job, { resolve: resolve }));
            runQueue(job.settings.printerName);
        });
    }

    // Defense-in-depth: validates that the data we are about to send to QZ Tray
    // is exactly one RAW/HEX ESC/POS payload.  ANY trace of HTML / PostScript /
    // PDF / Ghostscript source is rejected unconditionally before reaching the
    // printer.  The bug this prevents: a future code path that injects an HTML
    // string into the queue would cause CUPS/Ghostscript on the client to send
    // a PostScript stream to a raw ESC/POS thermal queue.
    function validateThermalPayload(data, printerName) {
        if (!Array.isArray(data) || data.length !== 1) return 'INVALID_PRINT_DATA: يجب إرسال payload واحد فقط للطابعة الحرارية.';
        const item = data[0];
        if (!item || item.type !== 'RAW' || item.format !== 'HEX' || typeof item.data !== 'string') {
            return 'INVALID_PRINT_DATA: يجب أن يكون نوع البيانات RAW/HEX فقط للطابعة الحرارية.';
        }
        if (!/^[0-9a-fA-F]*$/.test(item.data)) {
            return 'INVALID_PRINT_DATA: البيانات ليست سلسلة HEX نقية؛ رُفض الإرسال حمايةً من تمرير HTML/PostScript/PDF.';
        }
        // HEX is byte-safe; no PostScript / HTML / PDF magic can sneak through a
        // pure-hex string.  Reject suspicious ASCII markers anyway as a final guard.
        const header = item.data.slice(0, 200).toLowerCase();
        if (header.indexOf('2521707320') === 0 /* '%!PS ' */ ||
            header.indexOf('255044462d') === 0 /* '%PDF-' */ ||
            header.indexOf('3c21444f4354595045') === 0 /* '<!DOCTYPE' */ ||
            header.indexOf('3c68746d6c') === 0 /* '<html' */) {
            return 'INVALID_PRINT_DATA: اكتشف النظام ترويسة PostScript/PDF/HTML داخل الحمولة الحرارية. تم إيقاف الإرسال.';
        }
        return null;
    }

    async function runQueue(printerName) {
        const queue = queueFor(printerName);
        if (queue.active) return;
        queue.active = true;
        while (queue.jobs.length) {
            const job = queue.jobs.shift();
            try {
                const data = await createThermalPayload(job.order, job.settings);
                const validationError = validateThermalPayload(data, printerName);
                if (validationError) {
                    queue.seen.delete(job.dedupeKey); // allow a deliberate retry after a fix
                    console.warn('[thermal-print] BLOCKED', { printer: printerName, jobId: job.id, reason: validationError });
                    job.resolve({ success: false, reason: validationError, jobId: job.id });
                    continue;
                }
                const config = global.qz.configs.create(printerName, { encoding: 'ISO-8859-1' });
                await withTimeout(global.qz.print(config, data), JOB_TIMEOUT_MS);
                job.resolve({ success: true, jobId: job.id });
            } catch (error) {
                queue.seen.delete(job.dedupeKey); // a failed job may be deliberately retried by staff
                const reason = error && error.message ? error.message : String(error);
                console.warn('[thermal-print]', { printer: printerName, jobId: job.id, reason: reason });
                job.resolve({ success: false, reason: reason, jobId: job.id });
            }
        }
        queue.active = false;
    }

    function jobKey(order, trigger) { return String((order && (order._id || order.orderNumber)) || 'unknown') + ':' + trigger; }

    async function sendThermalOrder(order, trigger) {
        if (!order) return { success: false, reason: 'لا يوجد طلب للطباعة.' };
        await getPrintingSettings();
        const profile = validateProfile(cachedSettings);
        if (profile.error) return { success: false, reason: profile.error };
        if (!state.connected || typeof global.qz === 'undefined') return { success: false, reason: 'QZ Tray غير متصل. لم يتم استخدام طباعة المتصفح كبديل حراري.' };
        if (state.printersCache.length && !state.printersCache.includes(cachedSettings.printerName)) return { success: false, reason: 'الطابعة المحددة غير موجودة في قائمة QZ Tray الحالية.' };
        const dedupeKey = jobKey(order, trigger);
        return enqueuePrintJob({
            id: 'thermal-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8),
            order: order,
            settings: Object.assign({}, cachedSettings),
            dedupeKey: dedupeKey
        });
    }

    async function autoPrintOrder(order, trigger) {
        await getPrintingSettings();
        if (!cachedSettings.enabled || !cachedSettings.autoPrintNewOrders) return { success: false, reason: 'الطباعة التلقائية معطلة.' };
        if (!state.primaryPrinter) return { success: false, reason: 'هذه ليست جلسة الطابعة الأساسية.' };
        return sendThermalOrder(order, trigger || 'auto-new');
    }

    function manualPrintOrder(order) { return sendThermalOrder(order, 'manual'); }

    async function printTestReceipt() {
        const order = {
            orderNumber: 'TEST-' + Math.floor(1000 + Math.random() * 9000), createdAt: new Date().toISOString(), orderType: 'dinein',
            customer: { name: 'اختبار الطباعة', phone: '01000000000', tableNumber: '5' },
            items: [{ title: 'صنف تجريبي', quantity: 2, unitPrice: 20, itemTotal: 40 }], subtotal: 40, deliveryFee: 0, totalPrice: 40
        };
        return sendThermalOrder(order, 'test-' + order.orderNumber);
    }

    function setPrimaryRole(value) { state.primaryPrinter = Boolean(value); updateStatusBadge(); }
    function init() {
        getPrintingSettings().then(connectQZ);
        global.addEventListener('beforeunload', disconnectQZ);
    }
    global.addEventListener('qz-primary-granted', function () { setPrimaryRole(true); });
    global.addEventListener('qz-primary-denied', function () { setPrimaryRole(false); });

    global.QZPrint = {
        init: init, connectQZ: connectQZ, disconnectQZ: disconnectQZ, refreshPrinterList: refreshPrinterList,
        getPrintingSettings: getPrintingSettings, buildReceiptHTML: buildReceiptHTML, autoPrintOrder: autoPrintOrder,
        manualPrintOrder: manualPrintOrder, printTestReceipt: printTestReceipt, setPrimaryRole: setPrimaryRole,
        getState: function () { return Object.assign({}, state); }, getCachedSettings: function () { return Object.assign({}, cachedSettings); },
        getQueueState: function () { return Array.from(queues.entries()).map(function (entry) { return { printer: entry[0], active: entry[1].active, pending: entry[1].jobs.length }; }); }
    };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})(window);
