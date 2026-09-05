// =========================================================
// English English English English English - English English 100% English MongoDB Atlas English Socket.io
// Enterprise Client Logic: Real-Time Credentials Sync, Dynamic Theme Overrides & Live Visual Editor
// Full Internationalization (i18n) Support (Arabic & English) + Full Dark Theme Engine
// =========================================================

const socket =
  typeof io !== "undefined" ? io() : { on: () => {}, emit: () => {} };
const currentRestaurantId = "65d0a1b2c3d4e5f6a7b8c9d0";

let currentUserSession = null;
let cart = JSON.parse(localStorage.getItem("ora_restaurant_cart")) || [];
let recentlyViewedIds =
  JSON.parse(localStorage.getItem("ora_recently_viewed")) || [];
let lastOrderData =
  JSON.parse(localStorage.getItem("ora_last_completed_order")) || null;

let map, marker;
let allProductsFromDB = [];
let whatsappNumberFromDB = "01120751467";
let phoneNumberFromDB = "01120751467";
let activeDeliveryFee = 0;
let appliedCouponData = null;
let availableTablesRequest = 0;

let isRestaurantOpenNow = true;
let restaurantClosedReasonMessage = "";
let restaurantSettings = {};

let currentCustomizingProduct = null;
let currentProductDetailsObj = null;
let detailsQty = 1;

// English English English English English English
function t(key, params, fallback) {
  if (window.SiteI18n && typeof window.SiteI18n.t === "function") {
    return window.SiteI18n.t(key, params, fallback);
  }
  if (typeof params === "string") return params;
  return fallback !== undefined ? fallback : key;
}

function getActiveLanguage() {
  return window.SiteI18n && typeof window.SiteI18n.getLanguage === "function"
    ? window.SiteI18n.getLanguage()
    : "ar";
}

// English English English English English XSS
function escapeHTML(str) {
  if (typeof str !== "string") return str || "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// English English English English English English English English English
function updateTextPreservingIcons(element, newText) {
  if (!element) return;
  const hasSubElements = element.querySelector(
    "i, svg, .icon, .badge, span, img",
  );
  if (hasSubElements) {
    let replaced = false;
    element.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== "") {
        node.textContent = " " + newText + " ";
        replaced = true;
      }
    });
    if (!replaced) {
      element.appendChild(document.createTextNode(" " + newText));
    }
  } else {
    element.innerText = newText;
  }
}

// English English English English English English English English English English English
function applyTextColorOverride(element, colorVal) {
  if (!element || !colorVal) return;
  element.style.setProperty("color", colorVal, "important");
  element.style.setProperty("-webkit-text-fill-color", colorVal, "important");
  element.style.setProperty("background-clip", "border-box", "important");
  element.style.setProperty(
    "-webkit-background-clip",
    "border-box",
    "important",
  );
}

// English English English English English English English English English
function applyBgColorOverride(element, bgColorVal) {
  if (!element || !bgColorVal) return;
  element.style.setProperty("background-color", bgColorVal, "important");
  element.style.setProperty("background-image", "none", "important");
}

// English English English English English English English English English English English
function isColorDark(color) {
  if (!color) return false;
  const hex = String(color).replace("#", "").trim();
  if (hex.length !== 3 && hex.length !== 6) return false;
  const fullHex =
    hex.length === 3
      ? hex
          .split("")
          .map((char) => char + char)
          .join("")
      : hex;
  if (!/^[0-9a-fA-F]{6}$/.test(fullHex)) return false;
  const r = parseInt(fullHex.substring(0, 2), 16);
  const g = parseInt(fullHex.substring(2, 4), 16);
  const b = parseInt(fullHex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
}

// English English English English English English English English English English
function setSiteTheme(mode) {
  const isDark = mode === "dark";
  localStorage.setItem("ora_theme_mode", isDark ? "dark" : "light");
  document.documentElement.setAttribute(
    "data-theme",
    isDark ? "dark" : "light",
  );
  document.documentElement.setAttribute(
    "data-bs-theme",
    isDark ? "dark" : "light",
  );
  if (document.body) {
    document.body.classList.toggle("dark-theme", isDark);
  }
  // English: English English English English English English English English English English English
  // English English English (English/English) "English" English English English English English
  // English (English English English English English English English)
  if (window.restaurantSettings) {
    applyThemeColorVariables(window.restaurantSettings);
  }
  window.dispatchEvent(
    new CustomEvent("themeChanged", {
      detail: { isDark, mode: isDark ? "dark" : "light" },
    }),
  );
}

function toggleSiteTheme() {
  const currentTheme =
    document.documentElement.getAttribute("data-theme") ||
    (document.body && document.body.classList.contains("dark-theme")
      ? "dark"
      : "light");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  setSiteTheme(newTheme);
  return newTheme;
}

function initThemeOnStartup() {
  const savedTheme = localStorage.getItem("ora_theme_mode");
  if (savedTheme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
    document.documentElement.setAttribute("data-bs-theme", "dark");
    if (document.body) document.body.classList.add("dark-theme");
  } else if (savedTheme === "light") {
    document.documentElement.setAttribute("data-theme", "light");
    document.documentElement.setAttribute("data-bs-theme", "light");
    if (document.body) document.body.classList.remove("dark-theme");
  }
}

window.setSiteTheme = setSiteTheme;
window.toggleSiteTheme = toggleSiteTheme;

document.addEventListener("DOMContentLoaded", () => {
  initThemeOnStartup();
  if (window.UnifiedCartCheckout) window.UnifiedCartCheckout.mount();
  checkUserSessionOnHome();
  updateCartUI();
  loadCategoriesFromDB();
  loadProductsFromDB();
  loadDealsFromDB();
  loadTopSellersFromDB();
  loadDeliveryAreasFromDB();
  loadAvailableTablesFromDB();
  if (!document.getElementById("unifiedCartCheckoutForm"))
    setupCheckoutTableSelection();
  loadSettingsFromDB();
  initGPSMap();
  listenToSocketEvents();

  if (window.location.pathname.includes("product-details")) {
    initProductDetailsPage();
  }

  const urlParams = new URLSearchParams(window.location.search);
  const orderNumParam = urlParams.get("order");
  if (orderNumParam && document.getElementById("trackPhoneOrNumberInput")) {
    document.getElementById("trackPhoneOrNumberInput").value = orderNumParam;
    trackOrderByPhoneOrNumber();
  }
});

// English English English English English English English English English
window.addEventListener("languageChanged", () => {
  updateCartUI();
  loadCategoriesFromDB();
  loadProductsFromDB();
  loadDealsFromDB();
  loadTopSellersFromDB();
  loadDeliveryAreasFromDB();
  loadAvailableTablesFromDB();
  loadSettingsFromDB();
  if (currentUserSession) {
    renderUserSessionUI(currentUserSession);
  } else {
    resetUserHeaderToGuest();
  }
  if (currentProductDetailsObj) {
    renderProductDetailsUI(currentProductDetailsObj);
    loadProductReviews(currentProductDetailsObj._id);
  }
  const trackInput = document.getElementById("trackPhoneOrNumberInput");
  if (trackInput && trackInput.value.trim()) {
    trackOrderByPhoneOrNumber();
  }
});

// English English English English English English English English English English English English English.
// English English English: English English "English English" (English English English English English English English
// English English English English English)English English English English/English/English English English English
// English English English inline style English <html> English<body>English English English English English English English
// [data-theme="dark"] English style.css English English (English English + English English)English English English
// English English English English English (English English) English English.
// English: English English English/English/English English English English English English English English (English/English)
// English English English English English English English English English English (remove) English
// English English English inline style English English English English English English style.css English
// English English English English English.
function applyThemeColorVariables(s) {
  if (!s || !s.theme) return;
  const root = document.documentElement;
  const body = document.body;

  const setBootstrapRgb = (cssVariable, color) => {
    const hex = String(color || "").replace("#", "");
    const normalized =
      hex.length === 3
        ? hex
            .split("")
            .map((char) => char + char)
            .join("")
        : hex;
    if (/^[0-9a-fA-F]{6}$/.test(normalized)) {
      const value = parseInt(normalized, 16);
      const rgbStr = `${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}`;
      root.style.setProperty(cssVariable, rgbStr);
      if (body) body.style.setProperty(cssVariable, rgbStr);
    }
  };

  const savedUserTheme = localStorage.getItem("ora_theme_mode");
  const isDarkTheme =
    savedUserTheme === "dark" ||
    (!savedUserTheme &&
      (s.theme.isDark === true ||
        s.theme.mode === "dark" ||
        s.theme.preset === "midnight_gold" ||
        (s.theme.bgColor && isColorDark(s.theme.bgColor)) ||
        (s.theme.cardBgColor && isColorDark(s.theme.cardBgColor))));

  const themeMode = isDarkTheme ? "dark" : "light";
  root.setAttribute("data-theme", themeMode);
  root.setAttribute("data-bs-theme", themeMode);
  if (body) {
    body.classList.toggle("dark-theme", isDarkTheme);
  }

  // English English English English: English English English English English English English English English English
  if (s.theme.preset) {
    root.setAttribute("data-preset", s.theme.preset);
    if (body) body.setAttribute("data-preset", s.theme.preset);
  } else {
    root.removeAttribute("data-preset");
    if (body) body.removeAttribute("data-preset");
  }

  const setVar = (vName, val) => {
    if (!val) return;
    root.style.setProperty(vName, val);
    if (body) body.style.setProperty(vName, val);
  };
  const clearVar = (vName) => {
    root.style.removeProperty(vName);
    if (body) body.style.removeProperty(vName);
  };

  // English English (English): English English English English English English English English English
  if (s.theme.primaryColor) {
    setVar("--ember", s.theme.primaryColor);
    setVar("--brand-red", s.theme.primaryColor);
    setBootstrapRgb("--bs-danger-rgb", s.theme.primaryColor);
  }
  if (s.theme.primaryHover) {
    setVar("--ember-hover", s.theme.primaryHover);
    setVar("--brand-red-hover", s.theme.primaryHover);
  }
  if (s.theme.secondaryColor) {
    setVar("--brass", s.theme.secondaryColor);
    setVar("--brand-gold", s.theme.secondaryColor);
    setBootstrapRgb("--bs-warning-rgb", s.theme.secondaryColor);
  }
  if (s.theme.goldLight) {
    setVar("--brass-light", s.theme.goldLight);
    setVar("--brand-gold-light", s.theme.goldLight);
  }
  if (s.theme.darkColor) {
    // English English English English (English English English...)English English English English English English English
    setVar("--char", s.theme.darkColor);
    setVar("--brand-dark", s.theme.darkColor);
    setBootstrapRgb("--bs-dark-rgb", s.theme.darkColor);
  }

  // English English + English English + English English: English "English" English English English English
  // (English English English English English) English (English English English English English)English English English English English
  // English English English English English English English English English English
  const matchesCurrentMode = (hex) => !hex || isColorDark(hex) === isDarkTheme;

  if (s.theme.bgColor && matchesCurrentMode(s.theme.bgColor)) {
    setVar("--parchment", s.theme.bgColor);
    setVar("--bg-cream", s.theme.bgColor);
    setBootstrapRgb("--bs-light-rgb", s.theme.bgColor);
  } else {
    clearVar("--parchment");
    clearVar("--bg-cream");
  }

  if (s.theme.cardBgColor && matchesCurrentMode(s.theme.cardBgColor)) {
    setVar("--card-bg", s.theme.cardBgColor);
  } else {
    clearVar("--card-bg");
  }

  if (s.theme.textColor && matchesCurrentMode(s.theme.textColor)) {
    setVar("--ink", s.theme.textColor);
    setVar("--text-primary", s.theme.textColor);
  } else {
    clearVar("--ink");
    clearVar("--text-primary");
  }

  if (s.theme.textMutedColor && matchesCurrentMode(s.theme.textMutedColor)) {
    setVar("--text-muted", s.theme.textMutedColor);
  } else {
    clearVar("--text-muted");
  }

  if (s.theme.borderColor) {
    setVar("--border-color", s.theme.borderColor);
  }
  if (s.theme.borderRadius) {
    setVar("--radius-lg", s.theme.borderRadius);
    setVar("--radius-xl", s.theme.borderRadius);
  }

  if (s.theme.fontFamily) {
    setVar("--site-font", `'${s.theme.fontFamily}'`);
    if (body)
      body.style.fontFamily = `'${s.theme.fontFamily}', 'Tajawal', sans-serif`;
    const fontLink = document.getElementById("dynamicGoogleFont");
    if (fontLink) {
      const fontName =
        String(s.theme.fontFamily)
          .replace(/[^A-Za-z0-9 ]/g, "")
          .trim() || "Tajawal";
      fontLink.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, "+")}:wght@400;500;700;800;900&display=swap`;
    }
  }

  let customStyleTag = document.getElementById("dynamicCustomCss");
  if (!customStyleTag) {
    customStyleTag = document.createElement("style");
    customStyleTag.id = "dynamicCustomCss";
    document.head.appendChild(customStyleTag);
  }
  customStyleTag.innerHTML = s.theme.customCss || "";
}
window.applyThemeColorVariables = applyThemeColorVariables;

// 1. English English English English English English English English MongoDB English Socket.io
function applyDynamicThemeAndContent(s) {
  if (!s) return;
  restaurantSettings = s;
  window.restaurantSettings = s;
  const isEn = getActiveLanguage() === "en";
  const defaultRestaurantName = isEn ? "Restaurant" : "English";
  const defaultTagline = isEn
    ? "Authentic Flavors, Unforgettable Dining"
    : "English English";

  const restaurantName =
    s.name || (s.content && s.content.brandName) || defaultRestaurantName;
  window.getRestaurantName = () => restaurantName;

  const defaultFooter = isEn
    ? `All Rights Reserved © 2026 ${restaurantName}`
    : `English English English © 2026 ${restaurantName}`;

  const replaceRestaurantName = (value) =>
    String(value || "").replace(
      /English English English English|English English English English|English English English|English English|Abu Qorah Restaurant|Abu Qorah Kitchen|Abu Qorah|English|Restaurant/g,
      restaurantName,
    );

  if (s.theme) {
    applyThemeColorVariables(s);
  }

  if (s.content) {
    const c = s.content;

    document
      .querySelectorAll('[data-content="brandName"], [data-restaurant-name]')
      .forEach((el) => updateTextPreservingIcons(el, restaurantName));
    document.querySelectorAll("[data-restaurant-logo]").forEach((el) => {
      el.alt = isEn ? `${restaurantName} Logo` : `English ${restaurantName}`;
    });

    const pageTitle = document.querySelector("title[data-page-title]");
    if (pageTitle) {
      const pageTitleKey = pageTitle.dataset.pageTitleKey;
      const rawTitle = pageTitle.dataset.pageTitle;
      const titleText = pageTitleKey ? t(pageTitleKey, rawTitle) : rawTitle;
      document.title = `${titleText} - ${restaurantName}`;
    }

    document
      .querySelectorAll('[data-content="brandTagline"]')
      .forEach((el) =>
        updateTextPreservingIcons(el, c.brandTagline || defaultTagline),
      );

    const heroTitle = document.querySelector(
      '.hero-title, [data-content="heroTitle"]',
    );
    if (heroTitle && c.heroTitle)
      updateTextPreservingIcons(heroTitle, c.heroTitle);

    const heroSubtitle = document.querySelector(
      '.hero-subtitle, [data-content="heroSubtitle"]',
    );
    if (heroSubtitle && c.heroSubtitle)
      updateTextPreservingIcons(heroSubtitle, c.heroSubtitle);

    const heroWrapper = document.querySelector(".hero-wrapper");
    if (heroWrapper && c.heroBgImage) {
      heroWrapper.style.backgroundImage = `linear-gradient(rgba(10, 8, 6, 0.75), rgba(10, 8, 6, 0.85)), url('${c.heroBgImage}')`;
    }

    const dealsTitle = document.querySelector(
      '#dealsSection h2, [data-content="dealsSectionTitle"]',
    );
    if (dealsTitle && c.dealsSectionTitle)
      updateTextPreservingIcons(dealsTitle, c.dealsSectionTitle);

    const dealsSub = document.querySelector(
      '#dealsSection small, #dealsSection p, [data-content="dealsSectionSubtitle"]',
    );
    if (dealsSub && c.dealsSectionSubtitle)
      updateTextPreservingIcons(dealsSub, c.dealsSectionSubtitle);

    const topTitle = document.querySelector(
      '#menuSection h2, [data-content="topSellersTitle"]',
    );
    if (topTitle && c.topSellersTitle)
      updateTextPreservingIcons(topTitle, c.topSellersTitle);

    const topSub = document.querySelector(
      '#menuSection p, [data-content="topSellersSubtitle"]',
    );
    if (topSub && c.topSellersSubtitle)
      updateTextPreservingIcons(
        topSub,
        replaceRestaurantName(c.topSellersSubtitle),
      );

    let annBar = document.getElementById("announcementTickerBar");
    if (c.showAnnouncement && c.announcementText) {
      if (!annBar) {
        annBar = document.createElement("div");
        annBar.id = "announcementTickerBar";
        annBar.className =
          "bg-warning text-dark py-2 px-3 text-center fw-bold sticky-top shadow-sm";
        annBar.style.zIndex = "1015";
        document.body.prepend(annBar);
      }
      annBar.innerHTML = `<i class="fa-solid fa-bullhorn text-dark me-2"></i> <span>${escapeHTML(c.announcementText)}</span>`;
      annBar.classList.remove("d-none");
    } else if (annBar) {
      annBar.classList.add("d-none");
    }

    const footerText = replaceRestaurantName(c.footerText || defaultFooter);
    document
      .querySelectorAll('[data-content="footerText"]')
      .forEach((el) => updateTextPreservingIcons(el, footerText));
  }
}

// English English English English English English English English
window.addEventListener("message", (event) => {
  try {
    if (event.origin !== window.location.origin) return;
    const message = event.data;
    if (
      !message ||
      message.type !== "livePreviewDraft" ||
      !message.payload ||
      typeof message.payload !== "object"
    )
      return;

    const payload = message.payload;
    if (
      (payload.theme && typeof payload.theme !== "object") ||
      (payload.content && typeof payload.content !== "object")
    )
      return;

    applyDynamicThemeAndContent({
      ...restaurantSettings,
      name:
        typeof payload.name === "string"
          ? payload.name
          : restaurantSettings.name,
      theme: { ...(restaurantSettings.theme || {}), ...(payload.theme || {}) },
      content: {
        ...(restaurantSettings.content || {}),
        ...(payload.content || {}),
      },
    });
  } catch (error) {}
});

// 2. English English English English MongoDB Atlas
async function loadSettingsFromDB() {
  try {
    const res = await fetch("/api/settings");
    const data = await res.json();
    const s = data.settings || {};

    if (s.whatsappPhone) whatsappNumberFromDB = s.whatsappPhone;
    if (s.phone) phoneNumberFromDB = s.phone;

    isRestaurantOpenNow = s.isOpenNow !== false;
    restaurantClosedReasonMessage =
      s.closedReason || t("kitchen_closed_banner");

    applyDynamicThemeAndContent(s);

    const closedBanner = document.getElementById("restaurantClosedBanner");
    const closedText = document.getElementById("restaurantClosedText");
    const submitBtn = document.getElementById("submitOrderBtn");

    if (!isRestaurantOpenNow) {
      if (closedBanner) closedBanner.classList.remove("d-none");
      if (closedText) closedText.innerText = restaurantClosedReasonMessage;
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<i class="fa-solid fa-lock me-1"></i> <span>${t("kitchen_closed_submit_btn")}</span>`;
        submitBtn.classList.replace("btn-brand-red", "btn-secondary");
      }
    } else {
      if (closedBanner) closedBanner.classList.add("d-none");
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<i class="fa-solid fa-paper-plane me-1"></i> <span>${t("submit_order")}</span>`;
        submitBtn.classList.replace("btn-secondary", "btn-brand-red");
      }
    }

    if (document.getElementById("contactWhatsappDisplay"))
      document.getElementById("contactWhatsappDisplay").innerText =
        whatsappNumberFromDB;
    if (document.getElementById("contactPhoneDisplay"))
      document.getElementById("contactPhoneDisplay").innerText =
        phoneNumberFromDB;

    if (document.getElementById("contactWorkingHoursDisplay")) {
      const isEn = getActiveLanguage() === "en";
      const format12H = (time24) => {
        if (!time24) return "";
        const parts = time24.split(":");
        const h = parseInt(parts[0], 10);
        const m = parseInt(parts[1] || "0", 10);
        const period = isEn
          ? h >= 12
            ? "PM"
            : "AM"
          : h >= 12
            ? "English"
            : "English";
        const h12 = h % 12 || 12;
        const mStr = m < 10 ? "0" + m : m;
        return `${h12}:${mStr} ${period}`;
      };

      const openText = format12H(s.openingTime || "10:00");
      const closeText = format12H(s.closingTime || "23:59");

      document.getElementById("contactWorkingHoursDisplay").innerText = t(
        "working_hours_daily",
        { open: openText, close: closeText },
      );
    }

    if (document.getElementById("contactWhatsappLink")) {
      const isEn = getActiveLanguage() === "en";
      const defaultText = isEn
        ? "Hello, I would like to inquire about the menu and orders."
        : "English English English English English English English";
      const formattedPhone = whatsappNumberFromDB.startsWith("0")
        ? "2" + whatsappNumberFromDB
        : whatsappNumberFromDB;
      document.getElementById("contactWhatsappLink").href =
        `https://wa.me/${formattedPhone}?text=${encodeURIComponent(defaultText)}`;
    }
  } catch (error) {}
}

// 3. English English
async function submitOrder(event) {
  event.preventDefault();

  if (!isRestaurantOpenNow) {
    alert(restaurantClosedReasonMessage || t("kitchen_closed_banner"));
    return;
  }

  if (cart.length === 0) {
    alert(t("alert_cart_empty"));
    return;
  }

  const name = document.getElementById("custName")
    ? document.getElementById("custName").value.trim()
    : "";
  const phone = document.getElementById("custPhone")
    ? document.getElementById("custPhone").value.trim()
    : "";
  const whatsappPhone = document.getElementById("custWhatsappPhone")
    ? document.getElementById("custWhatsappPhone").value.trim()
    : phone;
  const address = document.getElementById("custAddress")
    ? document.getElementById("custAddress").value.trim()
    : "";
  const notes = document.getElementById("custNotes")
    ? document.getElementById("custNotes").value
    : "";
  const lat = document.getElementById("custLat")
    ? document.getElementById("custLat").value
    : "";
  const lng = document.getElementById("custLng")
    ? document.getElementById("custLng").value
    : "";
  const selectedOrderType = document.getElementById("orderType")
    ? document.getElementById("orderType").value
    : "delivery";
  const orderType =
    selectedOrderType === "dine-in" ? "dinein" : selectedOrderType;
  const isCheckoutOrderFlow = Boolean(document.getElementById("orderType"));
  const tableSelect = document.getElementById("custTableNumber");
  const tableNumber =
    (!isCheckoutOrderFlow || ["dinein", "takeaway"].includes(orderType)) &&
    tableSelect
      ? tableSelect.value.trim()
      : "";
  const extraPhone = document.getElementById("custExtraPhone")
    ? document.getElementById("custExtraPhone").value.trim()
    : "";
  const scheduledDeliveryTime = document.getElementById(
    "scheduledDeliveryTimeSelect",
  )
    ? document.getElementById("scheduledDeliveryTimeSelect").value
    : t("asap");

  if (!name || !phone || (orderType === "delivery" && !address)) {
    alert(t("alert_required_fields"));
    return;
  }

  if (
    ["dinein", "takeaway"].includes(orderType) &&
    (!tableNumber || tableSelect.disabled)
  ) {
    alert(t("alert_select_table"));
    return;
  }

  if (
    orderType === "delivery" &&
    (lat === "" ||
      lng === "" ||
      !Number.isFinite(Number(lat)) ||
      !Number.isFinite(Number(lng)))
  ) {
    alert(t("alert_gps_required"));
    return;
  }

  const customer = {
    name,
    phone,
    whatsappPhone: whatsappPhone || phone,
    address: orderType === "delivery" ? address : "",
    notes,
    extraPhone,
    gpsLocation: {
      lat: Number(lat) || 0,
      lng: Number(lng) || 0,
      mapUrl: `https://maps.google.com/?q=${lat},${lng}`,
    },
  };
  if (tableNumber) customer.tableNumber = tableNumber;

  const payload = {
    orderType,
    customer,
    items: cart,
    couponCode: appliedCouponData ? appliedCouponData.code : "",
    deliveryFee: activeDeliveryFee,
    scheduledDeliveryTime,
    paymentMethod: "COD",
  };

  try {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (data.success) {
      const orderObj = data.order;
      const orderNum = orderObj.orderNumber;
      const isEn = getActiveLanguage() === "en";
      const restaurantName =
        (window.getRestaurantName && window.getRestaurantName()) ||
        (isEn ? "Restaurant" : "English");

      localStorage.setItem(
        "ora_last_completed_order",
        JSON.stringify({ items: cart, orderType, customer: payload.customer }),
      );

      const itemsSummary = cart
        .map((i) => `- ${i.title} x${i.quantity}`)
        .join("\n");
      const whatsappMsg = encodeURIComponent(
        isEn
          ? `*New Order from ${restaurantName}*\n` +
              `*Order Number:* ${orderNum}\n` +
              `*Name:* ${name}\n` +
              `*Phone:* ${phone}\n` +
              `*WhatsApp:* ${whatsappPhone || phone}\n` +
              (extraPhone ? `*Extra Phone:* ${extraPhone}\n` : "") +
              `*Order Type:* ${orderType.toUpperCase()}\n` +
              (tableNumber ? `*Table Number:* ${tableNumber}\n` : "") +
              (orderType === "delivery"
                ? `*Address:* ${address}\n*GPS Link:* https://maps.google.com/?q=${lat},${lng}\n`
                : "") +
              `-------------------------\n` +
              `*Items:*\n` +
              itemsSummary +
              `\n-------------------------\n` +
              `*Total Amount:* ${orderObj.totalPrice} ${t("egp")}`
          : `*English English English ${restaurantName}*\n` +
              `*English English:* ${orderNum}\n` +
              `*English:* ${name}\n` +
              `*English English:* ${phone}\n` +
              `*English:* ${whatsappPhone || phone}\n` +
              (extraPhone ? `*English English:* ${extraPhone}\n` : "") +
              `*English English:* ${orderType.toUpperCase()}\n` +
              (tableNumber ? `*English English:* ${tableNumber}\n` : "") +
              (orderType === "delivery"
                ? `*English:* ${address}\n*English English GPS:* https://maps.google.com/?q=${lat},${lng}\n`
                : "") +
              `-------------------------\n` +
              `*English:*\n` +
              itemsSummary +
              `\n-------------------------\n` +
              `*English English:* ${orderObj.totalPrice} ${t("egp")}`,
      );

      const formattedRestaurantPhone = whatsappNumberFromDB.startsWith("0")
        ? "2" + whatsappNumberFromDB
        : whatsappNumberFromDB;
      window.open(
        `https://wa.me/${formattedRestaurantPhone}?text=${whatsappMsg}`,
        "_blank",
      );

      cart = [];
      appliedCouponData = null;
      saveCart();
      updateCartUI();
      toggleCartDrawer();

      showOrderQRModal(orderObj, phone);
    } else {
      alert(data.message || t("alert_server_error"));
    }
  } catch (error) {
    alert(t("alert_server_error"));
  }
}

function showOrderQRModal(order, phone) {
  const modalEl = document.getElementById("qrSuccessModal");
  if (!modalEl) {
    alert(`${t("order_success")} - ${t("order_number")} ${order.orderNumber}`);
    window.location.href = `/checkout.html?order=${phone}`;
    return;
  }

  document.getElementById("qrModalOrderNumber").innerText = order.orderNumber;
  document.getElementById("qrModalTotal").innerText =
    `${order.totalPrice} ${t("egp")}`;

  const qrImg = document.getElementById("qrModalImage");
  if (order.qrCodeData) {
    qrImg.src = order.qrCodeData;
    qrImg.classList.remove("d-none");
  }

  const bsModal = new bootstrap.Modal(modalEl, { backdrop: "static" });
  bsModal.show();

  modalEl.addEventListener(
    "hidden.bs.modal",
    () => {
      window.location.href = `/checkout.html?order=${phone}`;
    },
    { once: true },
  );
}

// 4. English English English
async function checkUserSessionOnHome() {
  const cachedUserStr = localStorage.getItem("ora_user_session");
  const savedToken = localStorage.getItem("ora_user_token");

  if (cachedUserStr) {
    try {
      currentUserSession = JSON.parse(cachedUserStr);
      renderUserSessionUI(currentUserSession);
    } catch (e) {}
  }

  try {
    const headers = { "Content-Type": "application/json" };
    if (savedToken) {
      headers["Authorization"] = `Bearer ${savedToken}`;
    }

    const res = await fetch("/api/auth/me", {
      method: "GET",
      headers,
      credentials: "include",
    });
    const data = await res.json();

    if (data.success && data.user) {
      currentUserSession = data.user;
      localStorage.setItem(
        "ora_user_session",
        JSON.stringify(currentUserSession),
      );
      if (data.token) {
        localStorage.setItem("ora_user_token", data.token);
      }
      renderUserSessionUI(currentUserSession);
    } else if (!data.success && !cachedUserStr) {
      localStorage.removeItem("ora_user_session");
      localStorage.removeItem("ora_user_token");
      currentUserSession = null;
      resetUserHeaderToGuest();
    }
  } catch (e) {
    if (currentUserSession) {
      renderUserSessionUI(currentUserSession);
    } else {
      resetUserHeaderToGuest();
    }
  }
}

function isUserAdmin(role) {
  if (!role) return false;
  const normalized = String(role).trim().toLowerCase();
  return (
    normalized === "superadmin" ||
    normalized === "super_admin" ||
    normalized === "admin" ||
    normalized === "staff" ||
    normalized === "owner" ||
    normalized === "manager"
  );
}

function getUserRoleLabel(role) {
  if (!role) return t("role_customer");
  const normalized = String(role).trim().toLowerCase();
  if (
    normalized === "superadmin" ||
    normalized === "super_admin" ||
    normalized === "owner"
  ) {
    return t("role_superadmin");
  }
  if (normalized === "admin" || normalized === "manager") {
    return t("role_admin");
  }
  if (normalized === "staff") {
    return t("role_staff");
  }
  return t("role_customer");
}

function openUserProfileModal() {
  if (!currentUserSession) {
    const loginModalEl = document.getElementById("loginModal");
    if (loginModalEl) {
      const modal = bootstrap.Modal.getOrCreateInstance(loginModalEl);
      modal.show();
    }
    return;
  }

  let modalEl = document.getElementById("userProfileModal");
  if (!modalEl) {
    modalEl = document.createElement("div");
    modalEl.id = "userProfileModal";
    modalEl.className = "modal fade";
    modalEl.setAttribute("tabindex", "-1");
    modalEl.setAttribute("aria-hidden", "true");
    document.body.appendChild(modalEl);
  }

  const roleLabel = getUserRoleLabel(currentUserSession.role);
  const rawName = currentUserSession.name || t("user_greeting_default");
  const firstLetter = rawName.charAt(0).toUpperCase() || "U";
  const email = currentUserSession.email || "-";
  const phone = currentUserSession.phone || "-";
  const isAdmin = isUserAdmin(currentUserSession.role);
  const isEn = getActiveLanguage() === "en";

  modalEl.innerHTML = `
    <div class="modal-dialog modal-dialog-centered" style="max-width: 440px;">
      <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden bg-white">
        <div class="p-3 pb-0 d-flex justify-content-between align-items-center">
          <span class="badge bg-light text-dark border px-3 py-1.5 rounded-pill fw-bold fs-7">
            <i class="fa-solid fa-crown me-1 text-warning"></i><span data-restaurant-name>${escapeHTML((window.getRestaurantName && window.getRestaurantName()) || (isEn ? "Restaurant" : "English"))}</span>
          </span>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="English"></button>
        </div>
        <div class="modal-body p-4 pt-2 text-center">
          <div class="profile-modal-avatar">
            ${escapeHTML(firstLetter)}
          </div>
          <h4 class="fw-black text-dark m-0 fs-5">${escapeHTML(rawName)}</h4>
          <div class="d-inline-flex align-items-center gap-1 badge bg-light text-dark border px-3 py-1 rounded-pill mt-2 fw-bold">
            <i class="fa-solid fa-shield-halved text-warning"></i>
            <span>${roleLabel}</span>
          </div>

          <div class="mt-4 text-start">
            <div class="profile-info-row">
              <span class="profile-info-label">${t("user_profile_name")}</span>
              <span class="profile-info-value">${escapeHTML(rawName)}</span>
            </div>
            <div class="profile-info-row">
              <span class="profile-info-label">${t("user_profile_email")}</span>
              <span class="profile-info-value" style="direction: ltr;">${escapeHTML(email)}</span>
            </div>
            <div class="profile-info-row">
              <span class="profile-info-label">${t("user_profile_phone")}</span>
              <span class="profile-info-value" style="direction: ltr;">${escapeHTML(phone)}</span>
            </div>
            <div class="profile-info-row">
              <span class="profile-info-label">${t("user_profile_status")}</span>
              <span class="profile-info-value text-success"><i class="fa-solid fa-circle-check me-1"></i>${t("user_profile_active")}</span>
            </div>
          </div>

          <div class="d-flex flex-column gap-2 mt-4">
            ${
              isAdmin
                ? `
              <a href="/admin_restaurant_food" class="btn btn-brand-dark w-100 py-2.5 fw-bold rounded-pill text-decoration-none">
                <i class="fa-solid fa-gauge-high me-2 text-warning"></i> ${t("nav_dashboard")}
              </a>
            `
                : ""
            }
            <button type="button" class="btn btn-light border w-100 py-2 fw-bold rounded-pill text-muted" onclick="checkUserSessionOnHome(); const m = bootstrap.Modal.getInstance(document.getElementById('userProfileModal')); if(m) m.hide();">
              <i class="fa-solid fa-arrows-rotate me-2"></i> ${t("sync_permissions")}
            </button>
            <button type="button" class="btn btn-outline-danger w-100 py-2 fw-bold rounded-pill" onclick="const m = bootstrap.Modal.getInstance(document.getElementById('userProfileModal')); if(m) m.hide(); logoutCustomerSession();">
              <i class="fa-solid fa-arrow-right-from-bracket me-2"></i> ${t("nav_logout")}
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  const bsModal = bootstrap.Modal.getOrCreateInstance(modalEl);
  bsModal.show();
}
window.openUserProfileModal = openUserProfileModal;

function closeMobileDrawer() {
  const drawerEl = document.getElementById("mobileNavDrawer");
  if (drawerEl) {
    const offcanvas = bootstrap.Offcanvas.getInstance(drawerEl);
    if (offcanvas) offcanvas.hide();
  }
}
window.closeMobileDrawer = closeMobileDrawer;

function closeMobileDrawerAndOpenLogin() {
  closeMobileDrawer();
  setTimeout(() => {
    const loginModalEl = document.getElementById("loginModal");
    if (loginModalEl) {
      const modal = bootstrap.Modal.getOrCreateInstance(loginModalEl);
      modal.show();
    }
  }, 300);
}
window.closeMobileDrawerAndOpenLogin = closeMobileDrawerAndOpenLogin;

function renderDrawerUserSection(user) {
  const drawerUserSection = document.getElementById("drawerUserSection");
  if (!drawerUserSection) return;

  if (!user) {
    drawerUserSection.innerHTML = `
      <div class="drawer-guest-box p-3 rounded-4 bg-light border text-center">
        <div class="drawer-guest-icon mb-2">
          <i class="fa-solid fa-circle-user text-muted fs-1"></i>
        </div>
        <h6 class="fw-bold text-dark mb-1" data-i18n="user_guest_welcome">${t("user_guest_welcome", {}, "English English English English English")}</h6>
        <p class="small text-muted mb-3" data-i18n="user_guest_prompt">${t("user_guest_prompt", {}, "English English English English English English English")}</p>
        <button type="button" class="btn btn-brand-red w-100 py-2.5 rounded-pill fw-bold shadow-sm" onclick="closeMobileDrawerAndOpenLogin()">
          <i class="fa-solid fa-arrow-right-to-bracket me-1"></i> <span data-i18n="nav_login">${t("nav_login")}</span>
        </button>
      </div>
    `;
    return;
  }

  const isAdmin = isUserAdmin(user.role);
  const roleLabel = getUserRoleLabel(user.role);
  const rawName = user.name ? String(user.name).trim() : "";
  const firstName = rawName ? rawName.split(/\s+/)[0] : "";
  const greetingName = firstName || t("user_greeting_default");
  const greetingText = firstName
    ? t("user_greeting", { name: escapeHTML(firstName) }, firstName)
    : t("user_greeting_default");
  const firstLetter = rawName.charAt(0).toUpperCase() || "U";

  drawerUserSection.innerHTML = `
    <div class="drawer-user-box p-3 rounded-4 bg-light border">
      <div class="d-flex align-items-center gap-2.5 mb-3">
        <div class="drawer-user-avatar">
          ${escapeHTML(firstLetter)}
        </div>
        <div class="flex-grow-1 overflow-hidden">
          <h6 class="fw-bold text-dark m-0 text-truncate">${escapeHTML(greetingText)}</h6>
          <span class="badge bg-white text-dark border px-2 py-0.5 rounded-pill fw-bold mt-1" style="font-size: 0.72rem;">
            <i class="fa-solid fa-shield-halved text-warning me-1"></i>${roleLabel}
          </span>
          ${user.phone ? `<small class="text-muted d-block text-truncate mt-0.5" style="direction: ltr; font-size: 0.75rem;">${escapeHTML(user.phone)}</small>` : ""}
        </div>
      </div>
      <div class="d-flex flex-column gap-1 pt-2 border-top">
        ${
          isAdmin
            ? `
          <a href="/admin_restaurant_food" class="btn btn-brand-dark btn-sm rounded-pill fw-bold py-2 text-start px-3 mb-1 text-decoration-none">
            <i class="fa-solid fa-gauge-high me-2 text-warning"></i> ${t("nav_dashboard")}
          </a>
        `
            : ""
        }
        <button type="button" class="drawer-action-link" onclick="closeMobileDrawer(); openUserProfileModal();">
          <i class="fa-solid fa-user text-primary"></i> <span>${t("nav_profile")}</span>
        </button>
        <a href="checkout.html" class="drawer-action-link">
          <i class="fa-solid fa-receipt text-success"></i> <span>${t("nav_my_orders")}</span>
        </a>
        <button type="button" class="drawer-action-link" onclick="closeMobileDrawer(); openUserProfileModal();">
          <i class="fa-solid fa-sliders text-secondary"></i> <span>${t("nav_settings")}</span>
        </button>
        <button type="button" class="drawer-action-link text-danger fw-bold" onclick="closeMobileDrawer(); logoutCustomerSession();">
          <i class="fa-solid fa-arrow-right-from-bracket"></i> <span>${t("nav_logout")}</span>
        </button>
      </div>
    </div>
  `;
}

function renderUserSessionUI(user) {
  if (!user) return;
  const userHeaderArea = document.getElementById("userHeaderArea");
  const mobileUserIndicator = document.getElementById("mobileUserIndicator");
  const mobileUserHeaderArea = document.getElementById("mobileUserHeaderArea");
  const mobileAuthText = document.getElementById("mobileUserAuthText");

  if (document.getElementById("custName"))
    document.getElementById("custName").value = user.name || "";
  if (document.getElementById("custPhone"))
    document.getElementById("custPhone").value = user.phone || "";
  if (document.getElementById("custWhatsappPhone"))
    document.getElementById("custWhatsappPhone").value = user.phone || "";

  const isAdmin = isUserAdmin(user.role);
  const roleLabel = getUserRoleLabel(user.role);

  const rawName = user.name ? String(user.name).trim() : "";
  const firstName = rawName ? rawName.split(/\s+/)[0] : "";
  const greetingName = firstName || t("user_greeting_default");
  const greetingText = firstName
    ? t("user_greeting", { name: escapeHTML(firstName) }, firstName)
    : t("user_greeting_default");

  // 1. English English English (Desktop Header)
  if (userHeaderArea) {
    if (isAdmin) {
      userHeaderArea.innerHTML = `
        <div class="user-header-group d-flex align-items-center gap-2">
          <a href="/admin_restaurant_food" class="btn-admin-header" title="${t("nav_dashboard")}">
            <i class="fa-solid fa-gauge-high"></i>
            <span>${t("nav_dashboard")}</span>
          </a>
          <div class="dropdown">
            <button class="btn-user-greeting dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="fa-solid fa-circle-user"></i>
              <span class="user-greeting-name">${greetingText}</span>
              <i class="fa-solid fa-chevron-down ms-1 caret-icon"></i>
            </button>
            <ul class="dropdown-menu dropdown-menu-end user-dropdown-menu shadow">
              <li class="user-dropdown-header">
                <div class="user-dropdown-title">${escapeHTML(rawName || greetingName)}</div>
                <div class="user-dropdown-badge"><i class="fa-solid fa-shield-halved me-1"></i>${roleLabel}</div>
              </li>
              <li>
                <button type="button" class="dropdown-item user-dropdown-item" onclick="openUserProfileModal()">
                  <i class="fa-solid fa-user text-primary"></i> <span>${t("nav_profile")}</span>
                </button>
              </li>
              <li>
                <a class="dropdown-item user-dropdown-item text-dark fw-bold" href="/admin_restaurant_food">
                  <i class="fa-solid fa-gauge-high text-warning"></i> <span>${t("nav_dashboard")}</span>
                </a>
              </li>
              <li>
                <a class="dropdown-item user-dropdown-item" href="checkout.html">
                  <i class="fa-solid fa-receipt text-success"></i> <span>${t("nav_my_orders")}</span>
                </a>
              </li>
              <li>
                <button type="button" class="dropdown-item user-dropdown-item" onclick="openUserProfileModal()">
                  <i class="fa-solid fa-sliders text-secondary"></i> <span>${t("nav_settings")}</span>
                </button>
              </li>
              <li><hr class="dropdown-divider my-1"></li>
              <li>
                <button type="button" class="dropdown-item user-dropdown-item text-danger fw-bold" onclick="logoutCustomerSession()">
                  <i class="fa-solid fa-arrow-right-from-bracket"></i> <span>${t("nav_logout")}</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      `;
    } else {
      userHeaderArea.innerHTML = `
        <div class="user-header-group">
          <div class="dropdown">
            <button class="btn-user-greeting dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="fa-solid fa-circle-user"></i>
              <span class="user-greeting-name">${greetingText}</span>
              <i class="fa-solid fa-chevron-down ms-1 caret-icon"></i>
            </button>
            <ul class="dropdown-menu dropdown-menu-end user-dropdown-menu shadow">
              <li class="user-dropdown-header">
                <div class="user-dropdown-title">${escapeHTML(rawName || greetingName)}</div>
                ${user.phone ? `<small class="text-muted d-block mt-1">${escapeHTML(user.phone)}</small>` : ""}
              </li>
              <li>
                <button type="button" class="dropdown-item user-dropdown-item" onclick="openUserProfileModal()">
                  <i class="fa-solid fa-user text-primary"></i> <span>${t("nav_profile")}</span>
                </button>
              </li>
              <li>
                <a class="dropdown-item user-dropdown-item" href="checkout.html">
                  <i class="fa-solid fa-receipt text-success"></i> <span>${t("nav_my_orders")}</span>
                </a>
              </li>
              <li>
                <button type="button" class="dropdown-item user-dropdown-item" onclick="openUserProfileModal()">
                  <i class="fa-solid fa-sliders text-secondary"></i> <span>${t("nav_settings")}</span>
                </button>
              </li>
              <li><hr class="dropdown-divider my-1"></li>
              <li>
                <button type="button" class="dropdown-item user-dropdown-item text-danger fw-bold" onclick="logoutCustomerSession()">
                  <i class="fa-solid fa-arrow-right-from-bracket"></i> <span>${t("nav_logout")}</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      `;
    }
  }

  if (mobileUserIndicator) {
    mobileUserIndicator.classList.remove("d-none");
  }

  renderDrawerUserSection(user);

  if (mobileUserHeaderArea) {
    mobileUserHeaderArea.innerHTML = `
      <button class="mobile-top-btn" type="button" data-bs-toggle="offcanvas" data-bs-target="#mobileNavDrawer" aria-label="${escapeHTML(greetingText)}">
        <i class="fa-solid fa-user text-warning"></i>
      </button>
    `;
  }

  if (mobileAuthText) {
    mobileAuthText.innerHTML = escapeHTML(firstName || greetingName);
  }
}

function resetUserHeaderToGuest() {
  currentUserSession = null;
  const userHeaderArea = document.getElementById("userHeaderArea");
  const mobileUserIndicator = document.getElementById("mobileUserIndicator");
  const mobileUserHeaderArea = document.getElementById("mobileUserHeaderArea");
  const mobileAuthText = document.getElementById("mobileUserAuthText");

  if (userHeaderArea) {
    userHeaderArea.innerHTML = `
      <button class="btn-guest-login" type="button" data-bs-toggle="modal" data-bs-target="#loginModal">
        <i class="fa-solid fa-arrow-right-to-bracket"></i> <span data-i18n="nav_login">${t("nav_login")}</span>
      </button>
    `;
  }

  if (mobileUserIndicator) {
    mobileUserIndicator.classList.add("d-none");
  }

  renderDrawerUserSection(null);

  if (mobileUserHeaderArea) {
    mobileUserHeaderArea.innerHTML = `
      <button class="mobile-top-btn" type="button" data-bs-toggle="offcanvas" data-bs-target="#mobileNavDrawer" aria-label="${t("nav_login")}">
        <i class="fa-solid fa-bars"></i>
      </button>
    `;
  }

  if (mobileAuthText) mobileAuthText.innerText = t("login");
}

// 5. English English
function openCustomizationModal(product) {
  currentCustomizingProduct = product;

  const titleEl = document.getElementById("customModalTitle");
  const descEl = document.getElementById("customModalDesc");
  if (titleEl) titleEl.innerText = product.title;
  if (descEl)
    descEl.innerText = product.shortDescription || product.description || "";

  const sizesContainer = document.getElementById("modalSizesContainer");
  if (sizesContainer) {
    if (product.sizes && product.sizes.length > 0) {
      sizesContainer.innerHTML =
        `<label class="form-label fw-bold small d-block mb-2 text-dark"><i class="fa-solid fa-ruler-combined text-warning me-1"></i> ${t("choose_size")}</label>` +
        product.sizes
          .map(
            (s, idx) => `
                    <div class="form-check bg-light p-3 rounded-3 border mb-2 cursor-pointer shadow-sm d-flex justify-content-between align-items-center" onclick="selectModalRadio('msize_${idx}')">
                        <div class="d-flex align-items-center gap-2">
                            <input class="form-check-input modal-size-radio" type="radio" name="modalSize" id="msize_${idx}" value="${s.price}" ${idx === 0 ? "checked" : ""} onchange="recalculateModalPrice()">
                            <label class="form-check-label fw-bold cursor-pointer m-0" for="msize_${idx}">${escapeHTML(s.name)}</label>
                        </div>
                        <strong class="text-danger fs-6">${s.price} ${t("egp")}</strong>
                    </div>
                `,
          )
          .join("");
    } else {
      sizesContainer.innerHTML = "";
    }
  }

  const addonsContainer = document.getElementById("modalAddonsContainer");
  if (addonsContainer) {
    if (product.addons && product.addons.length > 0) {
      addonsContainer.innerHTML =
        `<label class="form-label fw-bold small d-block mb-2 text-dark"><i class="fa-solid fa-plus-circle text-warning me-1"></i> ${t("choose_addons_sauces")}</label>` +
        product.addons
          .filter((a) => !a.isHidden)
          .map(
            (a, idx) => `
                    <div class="form-check bg-light p-3 rounded-3 border mb-2 cursor-pointer shadow-sm d-flex justify-content-between align-items-center" onclick="toggleModalAddonCheckbox('maddon_${idx}', event)">
                        <div class="d-flex align-items-center gap-2">
                            <input class="form-check-input modal-addon-cb" type="checkbox" id="maddon_${idx}" value="${a.price}" data-name="${escapeHTML(a.name)}" onchange="recalculateModalPrice()">
                            <label class="form-check-label fw-bold cursor-pointer m-0" for="maddon_${idx}">${escapeHTML(a.name)}</label>
                        </div>
                        <span class="badge bg-danger text-white fs-6">+${a.price} ${t("egp")}</span>
                    </div>
                `,
          )
          .join("");
    } else {
      addonsContainer.innerHTML = "";
    }
  }

  recalculateModalPrice();

  const modalEl = document.getElementById("productCustomModal");
  if (modalEl) {
    const bsModal = new bootstrap.Modal(modalEl);
    bsModal.show();
  }
}

function selectModalRadio(radioId) {
  const radio = document.getElementById(radioId);
  if (radio) {
    radio.checked = true;
    recalculateModalPrice();
  }
}

function toggleModalAddonCheckbox(cbId, event) {
  if (event.target.tagName === "INPUT") {
    recalculateModalPrice();
    return;
  }
  const cb = document.getElementById(cbId);
  if (cb) {
    cb.checked = !cb.checked;
    recalculateModalPrice();
  }
}

function recalculateModalPrice() {
  if (!currentCustomizingProduct) return;

  let basePrice =
    currentCustomizingProduct.discountPrice > 0
      ? currentCustomizingProduct.discountPrice
      : currentCustomizingProduct.price;

  const checkedSize = document.querySelector('input[name="modalSize"]:checked');
  if (checkedSize) basePrice = Number(checkedSize.value);

  let addonsSum = 0;
  document.querySelectorAll(".modal-addon-cb:checked").forEach((cb) => {
    addonsSum += Number(cb.value || 0);
  });

  const finalPrice = basePrice + addonsSum;

  const priceEl = document.getElementById("customModalPrice");
  if (priceEl) {
    priceEl.innerText = `${finalPrice} ${t("egp")}`;
  }
}

window.selectModalRadio = selectModalRadio;
window.toggleModalAddonCheckbox = toggleModalAddonCheckbox;
window.recalculateModalPrice = recalculateModalPrice;

function handleProductAddToCartClick(product) {
  if (
    (product.sizes && product.sizes.length > 0) ||
    (product.addons && product.addons.length > 0)
  ) {
    openCustomizationModal(product);
  } else {
    addToCartDirect({
      _id: product._id,
      title: product.title,
      price:
        product.discountPrice > 0 && product.discountPrice < product.price
          ? product.discountPrice
          : product.price,
      quantity: 1,
      selectedSize: null,
      selectedAddons: [],
    });
  }
}

window.handleProductAddToCartClick = handleProductAddToCartClick;

function confirmAddToCartCustomized() {
  if (!currentCustomizingProduct) return;

  const checkedSize = document.querySelector('input[name="modalSize"]:checked');
  let selectedSize = null;
  let basePrice =
    currentCustomizingProduct.discountPrice > 0 &&
    currentCustomizingProduct.discountPrice < currentCustomizingProduct.price
      ? currentCustomizingProduct.discountPrice
      : currentCustomizingProduct.price;

  if (checkedSize) {
    basePrice = Number(checkedSize.value);
    const sizeLabel = checkedSize.closest(".form-check")
      ? checkedSize
          .closest(".form-check")
          .querySelector("label")
          .innerText.trim()
      : "";
    selectedSize = { name: sizeLabel, price: basePrice };
  }

  const selectedAddons = [];
  document.querySelectorAll(".modal-addon-cb:checked").forEach((cb) => {
    selectedAddons.push({
      name: cb.getAttribute("data-name"),
      price: Number(cb.value),
    });
  });

  addToCartDirect({
    _id: currentCustomizingProduct._id,
    title: currentCustomizingProduct.title,
    price: basePrice,
    quantity: 1,
    selectedSize,
    selectedAddons,
  });

  const modalEl = document.getElementById("productCustomModal");
  if (modalEl) {
    const instance = bootstrap.Modal.getInstance(modalEl);
    if (instance) instance.hide();
  }

  currentCustomizingProduct = null;
}

window.confirmAddToCartCustomized = confirmAddToCartCustomized;

// English English English English English English (Infinite Scroll & Server-side Pagination)
const productPaginationState = {
  page: 1,
  limit: 12,
  hasMore: true,
  isLoading: false,
  abortController: null,
  observer: null,
  searchDebounceTimer: null,
};

function handleSearchAndSortInput(event) {
  if (
    event &&
    (event.type === "change" || event.target?.tagName === "SELECT")
  ) {
    clearTimeout(productPaginationState.searchDebounceTimer);
    loadProductsFromDB({ reset: true });
    return;
  }
  clearTimeout(productPaginationState.searchDebounceTimer);
  productPaginationState.searchDebounceTimer = setTimeout(() => {
    loadProductsFromDB({ reset: true });
  }, 250);
}
window.handleSearchAndSortInput = handleSearchAndSortInput;

// 6. English English English
async function loadCategoriesFromDB() {
  const container = document.getElementById("categoryPillsContainer");
  if (!container) return;

  try {
    const res = await fetch("/api/categories");
    const data = await res.json();
    const categories = data.categories || [];
    const isEn = getActiveLanguage() === "en";

    let pillsHtml = `<button class="category-pill active" data-category="all" onclick="filterByCategory('all', this)"><span data-i18n="all">${t("all")}</span></button>`;
    if (Array.isArray(categories)) {
      pillsHtml += categories
        .map((c) => {
          const catDisplayName = isEn && c.nameEn ? c.nameEn : c.name;
          return `
                <button class="category-pill" data-category="${escapeHTML(c.name)}" onclick="filterByCategory('${escapeHTML(c.name)}', this)">${escapeHTML(catDisplayName)}</button>
            `;
        })
        .join("");
    }
    container.innerHTML = pillsHtml;
  } catch (error) {}
}

function generateSingleFoodCardHtml(p) {
  const displayPrice = (item) =>
    item.discountPrice > 0 && item.discountPrice < item.price
      ? item.discountPrice
      : item.price;

  const mainPrice = displayPrice(p);
  const hasOptions =
    (p.sizes && p.sizes.length) || (p.addons && p.addons.length);
  const btnText = hasOptions ? t("add_to_cart_custom") : t("add_to_cart");
  const defaultDesc = t("fresh_meal_daily");
  const imgUrl =
    p.images && p.images[0]
      ? p.images[0]
      : "https://images.unsplash.com/photo-1555939594-58d7cb561ad1";

  return `
        <div class="col-md-6 col-lg-4 product-card-col" data-product-id="${p._id}">
            <div class="food-card shadow-sm border rounded-4 overflow-hidden" data-editor-id="product-card-${p._id}">
                <div class="food-card-img-wrapper cursor-pointer" onclick="openProductDetailPage('${p._id}')">
                    <img src="${escapeHTML(imgUrl)}" alt="${escapeHTML(p.title)}" loading="lazy" width="400" height="240" onerror="this.src='https://images.unsplash.com/photo-1555939594-58d7cb561ad1'">
                    <span class="badge-price fs-6">${mainPrice} ${t("egp")}</span>
                    ${p.discountPrice && p.discountPrice < p.price ? `<span class="badge-discount">${t("discount_badge")} ${p.price - p.discountPrice} ${t("egp")}</span>` : ""}
                </div>
                <div class="food-card-body p-3 d-flex flex-column justify-content-between flex-grow-1">
                    <div>
                        <div class="d-flex justify-content-between align-items-start mb-2 gap-2">
                            <h5 class="food-title cursor-pointer m-0 fw-black text-dark" onclick="openProductDetailPage('${p._id}')">${escapeHTML(p.title)}</h5>
                            <span class="badge bg-warning text-dark fw-bold fs-6 text-nowrap">${mainPrice} ${t("egp")}</span>
                        </div>
                        <p class="food-desc text-muted small mb-3">${escapeHTML(p.shortDescription || p.description || defaultDesc)}</p>
                    </div>
                    <button class="btn-add-to-cart fw-bold py-2 shadow-sm d-flex justify-content-between align-items-center px-3" onclick='handleProductAddToCartClick(${JSON.stringify(p).replace(/'/g, "&#39;")})'>
                        <span class="d-flex align-items-center gap-2"><i class="fa-solid fa-cart-plus"></i> ${btnText}</span>
                        <span class="fw-black border-start ps-2 border-secondary">${mainPrice} ${t("egp")}</span>
                    </button>
                </div>
            </div>
        </div>
    `;
}

function renderFoodCards(products, container, append = false) {
  if (!container) return;

  if (!append && products.length === 0) {
    container.innerHTML = `<div class="col-12 text-center py-5"><p class="fs-5 text-muted">${t("no_dishes_matched")}</p></div>`;
    return;
  }

  const cardsHtml = products.map(generateSingleFoodCardHtml).join("");

  if (append) {
    container.insertAdjacentHTML("beforeend", cardsHtml);
  } else {
    container.innerHTML = cardsHtml;
  }
}

function setupProductInfiniteScroll() {
  const sentinel = document.getElementById("productsLoadingSentinel");
  if (!sentinel) return;

  if (productPaginationState.observer) {
    productPaginationState.observer.disconnect();
  }

  productPaginationState.observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      if (
        entry &&
        entry.isIntersecting &&
        !productPaginationState.isLoading &&
        productPaginationState.hasMore
      ) {
        loadProductsFromDB({ append: true });
      }
    },
    { rootMargin: "250px" },
  );

  productPaginationState.observer.observe(sentinel);
}

async function loadProductsFromDB(options = {}) {
  const container = document.getElementById("productsContainer");
  if (!container) return;

  const isAppend = Boolean(options.append);

  if (!isAppend) {
    if (productPaginationState.abortController) {
      productPaginationState.abortController.abort();
    }

    productPaginationState.page = 1;
    productPaginationState.hasMore = true;
    productPaginationState.isLoading = false;

    const endOfListEl = document.getElementById("productsEndOfList");
    if (endOfListEl) endOfListEl.classList.add("d-none");

    if (container.children.length === 0 || options.reset) {
      container.innerHTML = `
        <div class="col-md-6 col-lg-4">
          <div class="food-card p-3 placeholder-glow border rounded-4">
            <div class="bg-secondary rounded-3 mb-3" style="height: 180px; opacity: 0.12;"></div>
            <div class="placeholder col-8 mb-2"></div>
            <div class="placeholder col-5"></div>
          </div>
        </div>

        <div class="col-md-6 col-lg-4">
          <div class="food-card p-3 placeholder-glow border rounded-4">
            <div class="bg-secondary rounded-3 mb-3" style="height: 180px; opacity: 0.12;"></div>
            <div class="placeholder col-8 mb-2"></div>
            <div class="placeholder col-5"></div>
          </div>
        </div>

        <div class="col-md-6 col-lg-4">
          <div class="food-card p-3 placeholder-glow border rounded-4">
            <div class="bg-secondary rounded-3 mb-3" style="height: 180px; opacity: 0.12;"></div>
            <div class="placeholder col-8 mb-2"></div>
            <div class="placeholder col-5"></div>
          </div>
        </div>
      `;
    }
  }

  if (
    productPaginationState.isLoading ||
    !productPaginationState.hasMore
  ) {
    return;
  }

  productPaginationState.isLoading = true;

  const sentinel = document.getElementById("productsLoadingSentinel");
  const endOfListEl = document.getElementById("productsEndOfList");

  if (isAppend && sentinel) {
    sentinel.classList.remove("d-none");
  }

  try {
    const isHomePage =
      window.location.pathname === "/" ||
      window.location.pathname.endsWith("index.html") ||
      !document.getElementById("searchInput");

    const pageSize = isHomePage ? 10 : 12;
    const pageNum = productPaginationState.page;

    let url = `/api/products?isAvailable=true&page=${pageNum}&limit=${pageSize}`;

    if (isHomePage) {
      url += `&sort=top_sales`;
    }

    const categoryFilter = getActiveCategoryFilter();

    if (categoryFilter && categoryFilter !== "all") {
      url += `&category=${encodeURIComponent(categoryFilter)}`;
    }

    const searchInput = document.getElementById("searchInput");

    if (searchInput && searchInput.value.trim()) {
      url += `&search=${encodeURIComponent(searchInput.value.trim())}`;
    }

    const sortSelect = document.getElementById("sortSelect");

    if (sortSelect && sortSelect.value) {
      url += `&sort=${encodeURIComponent(sortSelect.value)}`;
    }

    console.log("🍽️ Loading products from:", url);

    productPaginationState.abortController = new AbortController();

    const response = await fetch(url, {
      method: "GET",
      signal: productPaginationState.abortController.signal,
      headers: {
        Accept: "application/json",
      },
      credentials: "include",
    });

    let data = null;

    try {
      data = await response.json();
    } catch (jsonError) {
      throw new Error(
        `Invalid JSON response from server. HTTP ${response.status}`,
      );
    }

    console.log("📦 Products API response:", {
      status: response.status,
      ok: response.ok,
      data,
    });

    if (!response.ok) {
      throw new Error(
        data?.message ||
          `Products API failed with HTTP ${response.status}`,
      );
    }

    if (!data || data.success !== true) {
      throw new Error(
        data?.message ||
          "Products API returned success=false without an error message",
      );
    }

    const newProducts = Array.isArray(data.products)
      ? data.products
      : [];

    console.log(
      `✅ Products received: ${newProducts.length} / total: ${
        Number.isFinite(Number(data.total)) ? data.total : 0
      }`,
    );

    if (!isAppend) {
      allProductsFromDB = newProducts;

      renderFoodCards(
        newProducts,
        container,
        false,
      );

      if (!isHomePage) {
        setupProductInfiniteScroll();
      }
    } else {
      allProductsFromDB =
        allProductsFromDB.concat(newProducts);

      renderFoodCards(
        newProducts,
        container,
        true,
      );
    }

    const hasMore = Boolean(data.hasMore);

    productPaginationState.hasMore = hasMore;

    if (hasMore) {
      productPaginationState.page += 1;

      if (sentinel) {
        sentinel.classList.remove("d-none");
      }
    } else {
      if (sentinel) {
        sentinel.classList.add("d-none");
      }

      if (
        endOfListEl &&
        allProductsFromDB.length > pageSize
      ) {
        endOfListEl.classList.remove("d-none");
      }
    }


    if (
      !isAppend &&
      newProducts.length === 0
    ) {
      console.warn(
        "⚠️ Products API succeeded, but returned zero products.",
        {
          requestedUrl: url,
          total: data.total,
          page: data.page,
          pages: data.pages,
        },
      );
    }
  } catch (error) {
    if (error.name === "AbortError") {
      console.log("ℹ️ Previous products request was aborted.");
      return;
    }

    console.error(
      "❌ Failed to load products:",
      error,
    );

    if (!isAppend) {
      container.innerHTML = `
        <div class="col-12">
          <div class="alert alert-danger text-center rounded-4 shadow-sm">
            <h5 class="fw-bold mb-2">
              <i class="fa-solid fa-triangle-exclamation me-1"></i>
              ${escapeHTML(
                t(
                  "error_loading_dishes",
                  {},
                  "An error occurred while loading the products.",
                ),
              )}
            </h5>

            <p class="small mb-2">
              ${escapeHTML(
                error.message ||
                  "Unknown products loading error",
              )}
            </p>

            <button
              type="button"
              class="btn btn-outline-danger btn-sm rounded-pill fw-bold"
              onclick="loadProductsFromDB({ reset: true })"
            >
              <i class="fa-solid fa-rotate-right me-1"></i>
              ${escapeHTML(
                t("retry", {}, "Try again"),
              )}
            </button>
          </div>
        </div>
      `;
    }
  } finally {
    productPaginationState.isLoading = false;
    productPaginationState.abortController = null;

    if (
      !productPaginationState.hasMore &&
      sentinel
    ) {
      sentinel.classList.add("d-none");
    }
  }
}



function getActiveCategoryFilter() {
  const activePill = document.querySelector(".category-pill.active");
  if (!activePill) return "all";
  return activePill.dataset.category || "all";
}

function openProductDetailPage(productId) {
  if (!productId) return;
  trackRecentlyViewed(productId);
  window.location.href = `/product-details?id=${productId}`;
}

window.openProductDetailPage = openProductDetailPage;

function filterByCategory(categoryName, btnElement) {
  document
    .querySelectorAll(".category-pill")
    .forEach((b) => b.classList.remove("active"));
  if (btnElement) btnElement.classList.add("active");
  clearTimeout(productPaginationState.searchDebounceTimer);
  loadProductsFromDB({ reset: true });
}

function toggleCartDrawer() {
  const drawer = document.getElementById("cartDrawer");
  const overlay = document.getElementById("cartDrawerOverlay");
  if (drawer && overlay) {
    drawer.classList.toggle("show");
    overlay.classList.toggle("show");
    if (drawer.classList.contains("show") && map) {
      setTimeout(() => map.invalidateSize(), 300);
    }
  }
}

async function loadDealsFromDB() {
  const container = document.getElementById("dealsProductsContainer");
  if (!container) return;

  try {
    const res = await fetch("/api/products?isDeal=true&limit=8");
    const data = await res.json();
    const deals = data.products || [];

    if (deals.length === 0 && document.getElementById("dealsSection")) {
      document.getElementById("dealsSection").classList.add("d-none");
      return;
    }

    renderFoodCards(deals, container, false);
  } catch (e) {}
}

async function loadTopSellersFromDB() {
  const container = document.getElementById("topSellersProductsContainer");
  if (!container) return;

  try {
    const res = await fetch("/api/products?sort=top_sales&limit=6");
    const data = await res.json();
    const topSellers = data.products || [];

    renderFoodCards(topSellers, container, false);
  } catch (e) {}
}

function trackRecentlyViewed(productId) {
  if (!productId) return;
  recentlyViewedIds = recentlyViewedIds.filter((id) => id !== productId);
  recentlyViewedIds.unshift(productId);
  if (recentlyViewedIds.length > 4) recentlyViewedIds.pop();
  localStorage.setItem(
    "ora_recently_viewed",
    JSON.stringify(recentlyViewedIds),
  );
}

async function loadDeliveryAreasFromDB() {
  const select = document.getElementById("deliveryAreaSelect");
  if (!select) return;

  try {
    const res = await fetch("/api/delivery-areas");
    const data = await res.json();
    const areas = data.areas || [];

    if (areas.length === 0) {
      select.innerHTML = `<option value="20">${t("delivery_area_fallback")} (20 ${t("egp")})</option>`;
      activeDeliveryFee = 20;
      updateCartUI();
      return;
    }

    select.innerHTML =
      `<option value="">-- ${t("delivery_area_placeholder")} --</option>` +
      areas
        .map(
          (a) =>
            `<option value="${a.deliveryFee}">${escapeHTML(a.areaName)} (${a.deliveryFee} ${t("egp")})</option>`,
        )
        .join("");
  } catch (error) {
    select.innerHTML = `<option value="20">${t("delivery_area_fallback")} (20 ${t("egp")})</option>`;
  }
}

async function loadAvailableTablesFromDB() {
  const select = document.getElementById("custTableNumber");
  if (!select) return;
  const isCheckout = Boolean(document.getElementById("orderType"));
  const requestId = ++availableTablesRequest;
  const availabilityMessage = document.getElementById(
    "tableAvailabilityMessage",
  );
  const retryButton = document.getElementById("tableRetryBtn");
  select.dataset.tablesAvailable = "false";
  select.disabled = true;
  select.innerHTML = `<option value="">${t("cart_table_loading")}</option>`;
  if (availabilityMessage) availabilityMessage.classList.add("d-none");
  if (retryButton) retryButton.classList.add("d-none");

  try {
    const res = await fetch("/api/tables/available");
    const data = await res.json();
    if (requestId !== availableTablesRequest) return;
    const tables = data.tables || [];
    if (isCheckout && tables.length === 0) {
      select.dataset.tablesAvailable = "false";
      select.innerHTML = `<option value="">${t("table_no_tables")}</option>`;
      if (availabilityMessage) {
        availabilityMessage.textContent = t("table_no_tables");
        availabilityMessage.classList.remove("d-none");
      }
    } else {
      select.dataset.tablesAvailable = "true";
      if (availabilityMessage) availabilityMessage.classList.add("d-none");
      select.innerHTML =
        `<option value="">${t("table_select_placeholder")}</option>` +
        tables
          .map((table) => {
            const label = `${t("table_word")} ${escapeHTML(table.tableNumber)} (${table.seats} ${t("seats_word")})`;
            return `<option value="${escapeHTML(table.tableNumber)}" data-table-id="${table._id || ""}">${label}</option>`;
          })
          .join("");
      const savedTable =
        window.UnifiedCartCheckout &&
        window.UnifiedCartCheckout.state().tableNumber;
      if (
        savedTable &&
        tables.some((table) => table.tableNumber === savedTable)
      )
        select.value = savedTable;
    }
  } catch (error) {
    if (requestId !== availableTablesRequest) return;
    select.dataset.tablesAvailable = "false";
    select.innerHTML = `<option value="">${t("table_load_error")}</option>`;
    if (availabilityMessage) {
      availabilityMessage.textContent = t("table_load_error_retry");
      availabilityMessage.classList.remove("d-none");
    }
    if (retryButton) retryButton.classList.remove("d-none");
  }

  if (isCheckout) {
    if (
      document.getElementById("unifiedCartCheckoutForm") &&
      window.UnifiedCartCheckout
    )
      window.UnifiedCartCheckout.sync();
    else updateCheckoutTableSelection();
  }
}

function setupCheckoutTableSelection() {
  const orderType = document.getElementById("orderType");
  if (!orderType) return;
  orderType.addEventListener("change", () => {
    updateCheckoutTableSelection();
    if (orderType.value === "dine-in") loadAvailableTablesFromDB();
  });
  updateCheckoutTableSelection();
}

function updateCheckoutTableSelection() {
  const orderType = document.getElementById("orderType");
  const section = document.getElementById("tableSelectionSection");
  const select = document.getElementById("custTableNumber");
  if (!orderType || !section || !select) return;

  const requiresTable = ["dine-in", "dinein", "takeaway"].includes(
    orderType.value,
  );
  section.classList.toggle("d-none", !requiresTable);
  select.required = requiresTable;
  select.disabled = !requiresTable || select.dataset.tablesAvailable === "false";
  if (!requiresTable) select.value = "";
}

function updateDeliveryFeeFromSelect() {
  const select = document.getElementById("deliveryAreaSelect");
  if (select) {
    const orderType = document.getElementById("orderType");
    activeDeliveryFee =
      !orderType || orderType.value === "delivery"
        ? Number(select.value) || 0
        : 0;
    updateCartUI();
  }
}

async function applyCouponDiscount() {
  const input = document.getElementById("couponCodeInput");
  const msg = document.getElementById("couponMessage");
  if (!input || !input.value.trim()) return;

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  try {
    const res = await fetch("/api/coupons/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: input.value.trim(),
        subtotal,
        customerPhone: currentUserSession ? currentUserSession.phone : "",
      }),
    });

    const data = await res.json();
    if (data.success) {
      appliedCouponData = data.coupon;
      msg.className = "mt-2 small fw-bold text-success";
      msg.innerText = data.message;
      updateCartUI();
    } else {
      appliedCouponData = null;
      msg.className = "mt-2 small fw-bold text-danger";
      msg.innerText = data.message;
      updateCartUI();
    }
  } catch (e) {
    msg.innerText = t("coupon_error_generic");
  }
}

function addToCartDirect(cartItem) {
  cart.push(cartItem);
  saveCart();
  updateCartUI();
  toggleCartDrawer();
}

function changeQty(index, delta) {
  cart[index].quantity += delta;
  if (cart[index].quantity <= 0) cart.splice(index, 1);
  saveCart();
  updateCartUI();
}

function removeCartItem(index) {
  cart.splice(index, 1);
  saveCart();
  updateCartUI();
}

function saveCart() {
  localStorage.setItem("ora_restaurant_cart", JSON.stringify(cart));
}

function updateCartUI() {
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  let subtotal = 0;
  cart.forEach((i) => {
    let addonsPrice = i.selectedAddons
      ? i.selectedAddons.reduce((s, a) => s + (a.price || 0), 0)
      : 0;
    subtotal += (i.price + addonsPrice) * i.quantity;
  });

  let discount = appliedCouponData ? appliedCouponData.discountAmount : 0;
  let finalTotal = Math.max(0, subtotal - discount + activeDeliveryFee);

  const badge = document.getElementById("cartBadge");
  const drawerCount = document.getElementById("cartDrawerCount");
  const drawerTotal = document.getElementById("cartDrawerTotal");

  if (badge) badge.innerText = totalCount;
  if (drawerCount) drawerCount.innerText = totalCount;
  if (drawerTotal) drawerTotal.innerText = `${subtotal} ${t("egp")}`;

  if (document.getElementById("summarySubtotal"))
    document.getElementById("summarySubtotal").innerText =
      `${subtotal} ${t("egp")}`;
  if (document.getElementById("summaryDiscount"))
    document.getElementById("summaryDiscount").innerText =
      `${discount} ${t("egp")}`;
  if (document.getElementById("summaryDeliveryFee"))
    document.getElementById("summaryDeliveryFee").innerText =
      `${activeDeliveryFee} ${t("egp")}`;
  if (document.getElementById("summaryFinalTotal"))
    document.getElementById("summaryFinalTotal").innerText =
      `${finalTotal} ${t("egp")}`;

  renderCartDrawerItems();
}

function renderCartDrawerItems() {
  const container = document.getElementById("cartDrawerItems");
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="text-center py-5">
        <i class="fa-solid fa-basket-shopping text-muted mb-3" style="font-size: 2.8rem; opacity: 0.35;"></i>
        <p class="text-muted fw-bold mt-2">${t("cart_empty")}</p>
      </div>`;
    return;
  }

  container.innerHTML = cart
    .map((item, index) => {
      let addonsText =
        item.selectedAddons && item.selectedAddons.length
          ? item.selectedAddons.map((a) => escapeHTML(a.name)).join(", ")
          : "";
      let sizeText = item.selectedSize
        ? ` (${escapeHTML(item.selectedSize.name)})`
        : "";

      return `
            <div class="p-3 mb-2 bg-light-subtle rounded-3 border shadow-sm">
                <div class="d-flex justify-content-between align-items-center mb-1">
                    <h6 class="fw-bold m-0 text-dark">${escapeHTML(item.title)}${sizeText}</h6>
                    <span class="text-danger fw-bold">${item.price} ${t("egp")}</span>
                </div>
                ${addonsText ? `<small class="text-muted d-block mb-2"><i class="fa-solid fa-plus-circle text-warning me-1"></i> ${t("cart_addons_label")} ${addonsText}</small>` : ""}
                <div class="d-flex align-items-center justify-content-between mt-2 pt-2 border-top">
                    <div class="d-flex align-items-center gap-2">
                        <button class="btn btn-sm btn-outline-secondary px-2 py-0 fw-bold" onclick="changeQty(${index}, -1)">-</button>
                        <span class="fw-bold fs-6 px-1">${item.quantity}</span>
                        <button class="btn btn-sm btn-outline-secondary px-2 py-0 fw-bold" onclick="changeQty(${index}, 1)">+</button>
                    </div>
                    <button class="btn btn-sm text-danger d-flex align-items-center gap-1" onclick="removeCartItem(${index})">
                        <i class="fa-regular fa-trash-can"></i> <span>${t("cart_remove_item")}</span>
                    </button>
                </div>
            </div>
        `;
    })
    .join("");
}

function initGPSMap() {
  const mapElement = document.getElementById("map");
  if (!mapElement) return;

  const defaultLat = 30.0444;
  const defaultLng = 31.2357;

  map = L.map("map").setView([defaultLat, defaultLng], 13);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap",
  }).addTo(map);

  marker = L.marker([defaultLat, defaultLng], { draggable: true }).addTo(map);
  marker.on("dragend", function (e) {
    const position = marker.getLatLng();
    updateLatContainer(position.lat, position.lng);
  });

  updateLatContainer(defaultLat, defaultLng);
  locateUserGPSQuiet();
}

function locateUserGPSQuiet() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        if (map && marker) {
          map.setView([lat, lng], 16);
          marker.setLatLng([lat, lng]);
        }
        updateLatContainer(lat, lng);
      },
      (err) => {},
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  }
}

function locateUserGPS() {
  const btn =
    document.getElementById("gpsLocateBtn") ||
    (typeof event !== "undefined" ? event?.target : null);
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin me-1"></i> ${t("gps_detecting")}`;
  }

  if (!navigator.geolocation) {
    alert(t("alert_gps_unsupported"));
    resetGpsBtnUI();
    return;
  }

  const optionsHigh = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 60000,
  };
  const optionsLow = {
    enableHighAccuracy: false,
    timeout: 15000,
    maximumAge: 300000,
  };

  navigator.geolocation.getCurrentPosition(
    (position) =>
      setGpsPositionSuccess(
        position.coords.latitude,
        position.coords.longitude,
      ),
    (err) => {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          setGpsPositionSuccess(pos.coords.latitude, pos.coords.longitude),
        (err2) => {
          if (map) {
            map.locate({ setView: true, maxZoom: 16 });
            map.once("locationfound", (e) =>
              setGpsPositionSuccess(e.latlng.lat, e.latlng.lng),
            );
            map.once("locationerror", () => {
              alert(t("alert_gps_error"));
              resetGpsBtnUI();
            });
          } else {
            alert(t("alert_gps_error"));
            resetGpsBtnUI();
          }
        },
        optionsLow,
      );
    },
    optionsHigh,
  );
}

function setGpsPositionSuccess(lat, lng) {
  if (map && marker) {
    map.setView([lat, lng], 16);
    marker.setLatLng([lat, lng]);
    setTimeout(() => map.invalidateSize(), 200);
  }
  updateLatContainer(lat, lng);
  resetGpsBtnUI();
  alert(t("gps_detected"));
}

function resetGpsBtnUI() {
  const btn = document.getElementById("gpsLocateBtn");
  if (btn) {
    btn.disabled = false;
    btn.innerHTML = `<i class="fa-solid fa-location-crosshairs me-1"></i> ${t("gps_button")}`;
  }
}

function updateLatContainer(lat, lng) {
  const latInput = document.getElementById("custLat");
  const lngInput = document.getElementById("custLng");
  if (latInput) latInput.value = lat;
  if (lngInput) lngInput.value = lng;
}

// 7. English English English
async function handleCustomerLogin(e) {
  e.preventDefault();
  const emailInput = document.getElementById("loginEmail");
  const passwordInput = document.getElementById("loginPassword");

  if (!emailInput || !passwordInput) return;

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    alert(t("alert_login_required"));
    return;
  }

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });

    const data = await response.json();

    if (data.success && data.user) {
      currentUserSession = data.user;
      if (window.AuthStore) {
        window.AuthStore.setUser(data.user, data.token);
      } else {
        localStorage.setItem(
          "ora_user_session",
          JSON.stringify(currentUserSession),
        );
        if (data.token) localStorage.setItem("ora_user_token", data.token);
      }

      if (document.getElementById("custName"))
        document.getElementById("custName").value =
          currentUserSession.name || "";
      if (document.getElementById("custPhone"))
        document.getElementById("custPhone").value =
          currentUserSession.phone || "";
      if (document.getElementById("custWhatsappPhone"))
        document.getElementById("custWhatsappPhone").value =
          currentUserSession.phone || "";

      const loginModalEl = document.getElementById("loginModal");
      if (loginModalEl) {
        const instance = bootstrap.Modal.getInstance(loginModalEl);
        if (instance) instance.hide();
      }

      alert(data.message || `${t("welcome")} ${currentUserSession.name}!`);
      checkUserSessionOnHome();
    } else {
      alert(data.message || t("alert_server_error"));
    }
  } catch (error) {
    alert(t("alert_server_error"));
  }
}

// 8. English English English
async function handleCustomerRegister(e) {
  e.preventDefault();
  const nameInput = document.getElementById("regCustName");
  const emailInput = document.getElementById("regCustEmail");
  const phoneInput = document.getElementById("regCustPhone");
  const passwordInput = document.getElementById("regCustPassword");

  if (!nameInput || !emailInput || !phoneInput || !passwordInput) return;

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const phone = phoneInput.value.trim();
  const password = passwordInput.value;

  if (!name || !email || !phone || !password) {
    alert(t("alert_register_required"));
    return;
  }

  try {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, password }),
      credentials: "include",
    });

    const data = await response.json();

    if (data.success && data.user) {
      currentUserSession = data.user;
      if (window.AuthStore) {
        window.AuthStore.setUser(data.user, data.token);
      } else {
        localStorage.setItem(
          "ora_user_session",
          JSON.stringify(currentUserSession),
        );
        if (data.token) localStorage.setItem("ora_user_token", data.token);
      }

      if (document.getElementById("custName"))
        document.getElementById("custName").value =
          currentUserSession.name || "";
      if (document.getElementById("custPhone"))
        document.getElementById("custPhone").value =
          currentUserSession.phone || "";
      if (document.getElementById("custWhatsappPhone"))
        document.getElementById("custWhatsappPhone").value =
          currentUserSession.phone || "";

      const loginModalEl = document.getElementById("loginModal");
      if (loginModalEl) {
        const instance = bootstrap.Modal.getInstance(loginModalEl);
        if (instance) instance.hide();
      }

      alert(`${t("welcome")} ${currentUserSession.name}!`);
      checkUserSessionOnHome();
    } else {
      alert(data.message || t("alert_server_error"));
    }
  } catch (error) {
    alert(t("alert_server_error"));
  }
}

window.handleCustomerLogin = handleCustomerLogin;
window.handleCustomerRegister = handleCustomerRegister;

async function logoutCustomerSession() {
  if (window.AuthStore) {
    await window.AuthStore.logout();
  } else {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (e) {}
    localStorage.removeItem("ora_user_session");
    localStorage.removeItem("ora_user_token");
    currentUserSession = null;
    resetUserHeaderToGuest();
  }
  alert(t("alert_logout_success"));
}

// 9. English English
async function trackOrderByPhoneOrNumber() {
  const input = document.getElementById("trackPhoneOrNumberInput");
  const container = document.getElementById("trackedOrdersListContainer");
  const isEn = getActiveLanguage() === "en";
  const dateLocale = isEn ? "en-GB" : "ar-EG";

  if (!input || !container) return;

  const query = input.value.trim();
  if (!query) {
    container.innerHTML = `<div class="text-center py-4 text-muted fw-bold"><p>${t("track_empty_query")}</p></div>`;
    return;
  }

  container.innerHTML = `<div class="text-center py-4"><div class="spinner-border text-danger" role="status"></div><p class="mt-2 text-muted fw-bold">${t("track_loading")}</p></div>`;

  try {
    const res = await fetch(`/api/orders/track/${encodeURIComponent(query)}`);
    const data = await res.json();

    if (data.success && data.orders && data.orders.length > 0) {
      container.innerHTML = data.orders
        .map((order) => {
          const statusBadge = getStatusBadgeHTML(order.status);
          const itemsListHtml = (order.items || [])
            .map(
              (item) => `
                    <div class="d-flex justify-content-between align-items-center border-bottom py-2 small">
                        <div>
                            <strong>${escapeHTML(item.title)}</strong>
                            ${item.selectedSize ? ` <span class="badge bg-light text-dark border">(${escapeHTML(item.selectedSize.name)})</span>` : ""}
                            ${item.selectedAddons && item.selectedAddons.length ? `<br><small class="text-muted">${t("order_addons")} ${item.selectedAddons.map((a) => escapeHTML(a.name)).join(", ")}</small>` : ""}
                        </div>
                        <div class="text-nowrap ms-2">
                            <span class="fw-bold">${item.quantity} × ${item.unitPrice} ${t("egp")}</span> = <strong class="text-danger">${item.itemTotal || item.quantity * item.unitPrice} ${t("egp")}</strong>
                        </div>
                    </div>
                `,
            )
            .join("");

          return `
                    <div class="card shadow-sm border rounded-4 mb-4 overflow-hidden" data-editor-id="order-card-${order.orderNumber}">
                        <div class="card-header bg-dark text-white p-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
                            <div>
                                <span class="badge bg-warning text-dark fw-bold me-2">${t("order_number")} ${escapeHTML(order.orderNumber)}</span>
                                <small class="text-white-50"><i class="fa-regular fa-calendar me-1"></i> ${new Date(order.createdAt || order.orderDate).toLocaleString(dateLocale)}</small>
                            </div>
                            <div>${statusBadge}</div>
                        </div>
                        <div class="card-body p-4">
                            <h6 class="fw-bold text-muted mb-3"><i class="fa-solid fa-utensils text-warning me-1"></i> ${t("items_prepared")}</h6>
                            <div class="mb-3 bg-light p-3 rounded-3 border">${itemsListHtml}</div>

                            <div class="row g-2 mb-3 align-items-center">
                                <div class="col-md-6 small">
                                    <div class="mb-1"><i class="fa-solid fa-user text-warning me-1"></i> <strong>${t("customer")}</strong> ${escapeHTML(order.customer ? order.customer.name : t("guest_customer"))}</div>
                                    <div class="mb-1"><i class="fa-solid fa-phone text-warning me-1"></i> <strong>${t("invoice_phone")}</strong> ${escapeHTML(order.customer ? order.customer.phone : "-")}</div>
                                    <div><i class="fa-solid fa-location-dot text-warning me-1"></i> <strong>${t("delivery_address")}</strong> ${escapeHTML(order.customer ? order.customer.address : "-")}</div>
                                </div>
                                <div class="col-md-6 text-md-end bg-light p-3 rounded-3 border">
                                    <small class="text-muted d-block">${t("net_total")}</small>
                                    <h4 class="fw-black text-danger m-0">${order.totalPrice} ${t("egp")}</h4>
                                </div>
                            </div>

                            <div class="d-flex gap-2 flex-wrap pt-2 border-top">
                                ${order.qrCodeSignature ? `<a href="/invoice/${order._id || order.orderNumber}?sig=${order.qrCodeSignature}" target="_blank" class="btn btn-outline-dark btn-sm fw-bold rounded-pill px-3"><i class="fa-solid fa-file-invoice text-warning me-1"></i> ${t("view_invoice")}</a>` : ""}
                            </div>
                        </div>
                    </div>
                `;
        })
        .join("");
    } else {
      container.innerHTML = `
                <div class="alert alert-warning text-center p-4 rounded-4 shadow-sm">
                    <h5 class="fw-bold"><i class="fa-solid fa-circle-exclamation me-1"></i> ${t("track_not_found_title")} [${escapeHTML(query)}]</h5>
                    <p class="small text-muted mb-0">${t("track_not_found_hint")}</p>
                </div>
            `;
    }
  } catch (err) {
    container.innerHTML = `<div class="alert alert-danger text-center p-3">${t("track_error")}</div>`;
  }
}

function getStatusBadgeHTML(status) {
  if (status === "New")
    return `<span class="badge bg-warning text-dark px-3 py-2 fs-6"><i class="fa-regular fa-clock me-1"></i> ${t("status_new")}</span>`;
  if (status === "Reviewed")
    return `<span class="badge bg-info text-dark px-3 py-2 fs-6"><i class="fa-solid fa-clipboard-check me-1"></i> ${t("status_reviewed")}</span>`;
  if (status === "Preparing")
    return `<span class="badge bg-primary px-3 py-2 fs-6"><i class="fa-solid fa-fire-burner me-1"></i> ${t("status_preparing")}</span>`;
  if (status === "Ready")
    return `<span class="badge bg-info px-3 py-2 fs-6"><i class="fa-solid fa-box-archive me-1"></i> ${t("status_ready")}</span>`;
  if (status === "OutForDelivery")
    return `<span class="badge bg-primary px-3 py-2 fs-6"><i class="fa-solid fa-motorcycle me-1"></i> ${t("status_out_for_delivery")}</span>`;
  if (status === "Delivered")
    return `<span class="badge bg-success px-3 py-2 fs-6"><i class="fa-solid fa-circle-check me-1"></i> ${t("status_delivered")}</span>`;
  if (status === "Cancelled" || status === "Rejected")
    return `<span class="badge bg-danger px-3 py-2 fs-6"><i class="fa-solid fa-ban me-1"></i> ${t("status_cancelled")}</span>`;
  return `<span class="badge bg-secondary px-3 py-2 fs-6">${status}</span>`;
}

window.trackOrderByPhoneOrNumber = trackOrderByPhoneOrNumber;

function listenToSocketEvents() {
  socket.on("categories-updated", () => loadCategoriesFromDB());
  socket.on("products-updated", () => {
    loadProductsFromDB();
    loadDealsFromDB();
    loadTopSellersFromDB();
  });
  socket.on("settings-updated", (data) => {
    if (data && data.whatsappPhone) whatsappNumberFromDB = data.whatsappPhone;
    applyDynamicThemeAndContent(data);
    loadSettingsFromDB();
  });

  socket.on("order-status-updated-global", () => {
    const input = document.getElementById("trackPhoneOrNumberInput");
    if (input && input.value.trim()) trackOrderByPhoneOrNumber();
  });

  socket.on("user-account-status-changed", (data) => {
    if (!currentUserSession || !data || !data.userId) return;

    const currentId = currentUserSession._id || currentUserSession.id;
    if (String(currentId) === String(data.userId)) {
      if (data.action === "banned" || data.action === "deleted") {
        localStorage.removeItem("ora_user_session");
        localStorage.removeItem("ora_user_token");
        currentUserSession = null;
        resetUserHeaderToGuest();
        alert(data.message || t("alert_account_banned_deleted"));
        window.location.href = "/index.html";
      } else if (data.action === "role_updated") {
        alert(data.message || t("alert_account_role_updated"));
        if (data.role) currentUserSession.role = data.role;
        if (data.token) localStorage.setItem("ora_user_token", data.token);
        localStorage.setItem(
          "ora_user_session",
          JSON.stringify(currentUserSession),
        );

        renderUserSessionUI(currentUserSession);
        checkUserSessionOnHome();
      }
    }
  });
}

// 10. English English English
async function initProductDetailsPage() {
  const urlParams = new URLSearchParams(window.location.search);
  let productId = urlParams.get("id");

  if (!productId) {
    try {
      const res = await fetch("/api/products?limit=1");
      const data = await res.json();
      if (data.products && data.products.length > 0) {
        productId = data.products[0]._id;
      }
    } catch (e) {}
  }

  if (!productId) return;

  try {
    const res = await fetch(`/api/products/${productId}`);
    const data = await res.json();

    if (data.success && data.product) {
      currentProductDetailsObj = data.product;
      renderProductDetailsUI(data.product);
      if (data.similarProducts) {
        renderSimilarProducts(data.similarProducts);
      }
      loadProductReviews(data.product._id);
    } else {
      alert(t("alert_dish_not_found"));
      window.location.href = "/menu.html";
    }
  } catch (e) {
    console.error("Error fetching product details:", e);
  }
}

function renderProductDetailsUI(p) {
  const mainImg = document.getElementById("detailsMainImage");
  const titleEl = document.getElementById("detailsTitle");
  const shortDescEl = document.getElementById("detailsShortDesc");
  const fullDescEl = document.getElementById("detailsFullDesc");
  const catBadge = document.getElementById("detailsCategoryBadge");
  const ratingScore = document.getElementById("detailsRatingScore");
  const reviewsCount = document.getElementById("detailsReviewsCount");
  const stockQty = document.getElementById("detailsStockQty");
  const maxLimit = document.getElementById("detailsMaxLimit");
  const oldPrice = document.getElementById("detailsOldPrice");
  const discountBadge = document.getElementById("detailsDiscountBadge");
  const badgePrice = document.getElementById("detailsBadgePrice");
  const defaultDesc = t("fresh_meal_daily");

  if (mainImg)
    mainImg.src =
      p.images && p.images[0]
        ? p.images[0]
        : "https://images.unsplash.com/photo-1555939594-58d7cb561ad1";
  if (titleEl) titleEl.innerText = p.title;
  if (shortDescEl)
    shortDescEl.innerText = p.shortDescription || p.description || defaultDesc;
  if (fullDescEl)
    fullDescEl.innerText = p.fullDescription || p.description || "";
  if (catBadge)
    catBadge.innerText =
      p.categoryId && p.categoryId.name
        ? p.categoryId.name
        : p.category || t("all");
  if (ratingScore)
    ratingScore.innerText = p.rating ? p.rating.toFixed(1) : "5.0";
  if (reviewsCount) reviewsCount.innerText = p.ratingsCount || 0;
  if (stockQty)
    stockQty.innerText = p.stockQuantity !== undefined ? p.stockQuantity : 100;
  if (maxLimit) maxLimit.innerText = p.maxOrderLimit || 10;

  const displayPrice =
    p.discountPrice > 0 && p.discountPrice < p.price
      ? p.discountPrice
      : p.price;
  if (badgePrice) badgePrice.innerText = `${displayPrice} ${t("egp")}`;

  if (p.discountPrice > 0 && p.discountPrice < p.price) {
    if (discountBadge) {
      discountBadge.classList.remove("d-none");
      discountBadge.innerText = `${t("discount_badge")} ${p.price - p.discountPrice} ${t("egp")}`;
    }
    if (oldPrice) {
      oldPrice.classList.remove("d-none");
      oldPrice.innerText = `${p.price} ${t("egp")}`;
    }
  } else {
    if (discountBadge) discountBadge.classList.add("d-none");
    if (oldPrice) oldPrice.classList.add("d-none");
  }

  const thumbsRow = document.getElementById("detailsThumbnailsRow");
  if (thumbsRow && p.images && p.images.length > 1) {
    thumbsRow.innerHTML = p.images
      .map(
        (img, idx) => `
            <img src="${img}" class="rounded border cursor-pointer ${idx === 0 ? "border-primary" : ""}" style="width: 70px; height: 70px; object-fit: cover;" onclick="document.getElementById('detailsMainImage').src='${img}'">
        `,
      )
      .join("");
  }

  const sizesWrapper = document.getElementById("detailsSizesWrapper");
  const sizesContainer = document.getElementById("detailsSizesContainer");
  if (p.sizes && p.sizes.length > 0) {
    if (sizesWrapper) sizesWrapper.classList.remove("d-none");
    if (sizesContainer) {
      sizesContainer.innerHTML = p.sizes
        .map(
          (s, idx) => `
                <div class="form-check bg-light p-3 rounded-3 border flex-grow-1 cursor-pointer" onclick="selectDetailsRadio('dsize_${idx}')">
                    <input class="form-check-input details-size-radio" type="radio" name="detailsSize" id="dsize_${idx}" value="${s.price}" data-name="${escapeHTML(s.name)}" ${idx === 0 ? "checked" : ""} onchange="recalculateDetailsPrice()">
                    <label class="form-check-label fw-bold me-1 cursor-pointer" for="dsize_${idx}">${escapeHTML(s.name)} (<span class="text-danger">${s.price} ${t("egp")}</span>)</label>
                </div>
            `,
        )
        .join("");
    }
  } else {
    if (sizesWrapper) sizesWrapper.classList.add("d-none");
  }

  const addonsWrapper = document.getElementById("detailsAddonsWrapper");
  const addonsContainer = document.getElementById("detailsAddonsContainer");
  if (p.addons && p.addons.length > 0) {
    if (addonsWrapper) addonsWrapper.classList.remove("d-none");
    if (addonsContainer) {
      addonsContainer.innerHTML = p.addons
        .filter((a) => !a.isHidden)
        .map(
          (a, idx) => `
                <div class="col-6">
                    <div class="form-check bg-light p-3 rounded-3 border cursor-pointer d-flex align-items-center justify-content-between" onclick="toggleDetailsAddonCheckbox('daddon_${idx}', event)">
                        <div class="d-flex align-items-center gap-2">
                            <input class="form-check-input details-addon-cb" type="checkbox" id="daddon_${idx}" value="${a.price}" data-name="${escapeHTML(a.name)}" onchange="recalculateDetailsPrice()">
                            <label class="form-check-label fw-bold me-1 cursor-pointer m-0" for="daddon_${idx}">${escapeHTML(a.name)}</label>
                        </div>
                        <span class="badge bg-danger text-white">+${a.price} ${t("egp")}</span>
                    </div>
                </div>
            `,
        )
        .join("");
    }
  } else {
    if (addonsWrapper) addonsWrapper.classList.add("d-none");
  }

  detailsQty = 1;
  if (document.getElementById("detailsQtyDisplay"))
    document.getElementById("detailsQtyDisplay").innerText = detailsQty;
  recalculateDetailsPrice();
}

function selectDetailsRadio(id) {
  const radio = document.getElementById(id);
  if (radio) {
    radio.checked = true;
    recalculateDetailsPrice();
  }
}

function toggleDetailsAddonCheckbox(id, event) {
  if (event.target.tagName === "INPUT") {
    recalculateDetailsPrice();
    return;
  }
  const cb = document.getElementById(id);
  if (cb) {
    cb.checked = !cb.checked;
    recalculateDetailsPrice();
  }
}

function changeDetailsQty(delta) {
  if (!currentProductDetailsObj) return;

  const maxLimit = currentProductDetailsObj.maxOrderLimit || 10;
  const stock =
    currentProductDetailsObj.stockQuantity !== undefined
      ? currentProductDetailsObj.stockQuantity
      : 100;
  const maxAllowed = Math.min(maxLimit, stock);

  detailsQty += delta;
  if (detailsQty < 1) detailsQty = 1;
  if (detailsQty > maxAllowed) {
    detailsQty = maxAllowed;
    alert(t("alert_max_order_limit", { max: maxAllowed }));
  }

  if (document.getElementById("detailsQtyDisplay")) {
    document.getElementById("detailsQtyDisplay").innerText = detailsQty;
  }
  recalculateDetailsPrice();
}

function recalculateDetailsPrice() {
  if (!currentProductDetailsObj) return;

  let basePrice =
    currentProductDetailsObj.discountPrice > 0 &&
    currentProductDetailsObj.discountPrice < currentProductDetailsObj.price
      ? currentProductDetailsObj.discountPrice
      : currentProductDetailsObj.price;

  const checkedSize = document.querySelector(
    'input[name="detailsSize"]:checked',
  );
  if (checkedSize) {
    basePrice = Number(checkedSize.value);
  }

  let addonsSum = 0;
  document.querySelectorAll(".details-addon-cb:checked").forEach((cb) => {
    addonsSum += Number(cb.value || 0);
  });

  const unitTotal = basePrice + addonsSum;
  const finalTotal = unitTotal * detailsQty;

  const priceEl = document.getElementById("detailsComputedPrice");
  if (priceEl) {
    priceEl.innerText = `${finalTotal} ${t("egp")}`;
  }
}

function addDetailsToCartDirect() {
  if (!currentProductDetailsObj) return;

  const checkedSize = document.querySelector(
    'input[name="detailsSize"]:checked',
  );
  let selectedSize = null;
  let basePrice =
    currentProductDetailsObj.discountPrice > 0 &&
    currentProductDetailsObj.discountPrice < currentProductDetailsObj.price
      ? currentProductDetailsObj.discountPrice
      : currentProductDetailsObj.price;

  if (checkedSize) {
    basePrice = Number(checkedSize.value);
    selectedSize = {
      name: checkedSize.getAttribute("data-name"),
      price: basePrice,
    };
  }

  const selectedAddons = [];
  document.querySelectorAll(".details-addon-cb:checked").forEach((cb) => {
    selectedAddons.push({
      name: cb.getAttribute("data-name"),
      price: Number(cb.value),
    });
  });

  addToCartDirect({
    _id: currentProductDetailsObj._id,
    title: currentProductDetailsObj.title,
    price: basePrice,
    quantity: detailsQty,
    selectedSize,
    selectedAddons,
  });

  alert(
    t("alert_added_to_cart_success", { title: currentProductDetailsObj.title }),
  );
}

function buyNowDirect() {
  addDetailsToCartDirect();
  toggleCartDrawer();
}

async function loadProductReviews(productId) {
  const container = document.getElementById("productReviewsListContainer");
  if (!container) return;
  const isEn = getActiveLanguage() === "en";
  const dateLocale = isEn ? "en-GB" : "ar-EG";

  try {
    const res = await fetch(`/api/reviews/product/${productId}`);
    const data = await res.json();

    if (data.success) {
      const avg = data.averages || {};
      if (document.getElementById("reviewsBigScore"))
        document.getElementById("reviewsBigScore").innerText =
          avg.food || "5.0";
      if (document.getElementById("avgFoodScore"))
        document.getElementById("avgFoodScore").innerText =
          `${avg.food || 5.0} / 5`;
      if (document.getElementById("avgDeliveryScore"))
        document.getElementById("avgDeliveryScore").innerText =
          `${avg.delivery || 5.0} / 5`;
      if (document.getElementById("avgServiceScore"))
        document.getElementById("avgServiceScore").innerText =
          `${avg.service || 5.0} / 5`;

      const reviews = data.reviews || [];
      if (reviews.length === 0) {
        container.innerHTML = `<div class="text-center py-4 text-muted fw-bold"><p>${t("no_reviews_yet")}</p></div>`;
        return;
      }

      container.innerHTML = reviews
        .map(
          (r) => `
                <div class="p-3 mb-3 bg-light rounded-3 border shadow-sm">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <strong class="text-dark"><i class="fa-solid fa-circle-user text-warning me-1"></i> ${escapeHTML(r.userName)}</strong>
                        <span class="badge bg-warning text-dark fw-bold"><i class="fa-solid fa-star me-1"></i> ${r.foodRating} / 5</span>
                    </div>
                    <p class="text-muted small m-0">${escapeHTML(r.comment || "-")}</p>
                    <small class="text-muted d-block mt-2" style="font-size: 0.75rem;"><i class="fa-regular fa-calendar me-1"></i> ${new Date(r.createdAt).toLocaleDateString(dateLocale)}</small>
                </div>
            `,
        )
        .join("");
    }
  } catch (e) {}
}

async function submitCustomerReviewWithImages(e) {
  e.preventDefault();
  if (!currentProductDetailsObj) return;

  const foodRating = document.getElementById("reviewFoodRating")
    ? document.getElementById("reviewFoodRating").value
    : 5;
  const deliverySpeedRating = document.getElementById("reviewDeliveryRating")
    ? document.getElementById("reviewDeliveryRating").value
    : 5;
  const serviceRating = document.getElementById("reviewServiceRating")
    ? document.getElementById("reviewServiceRating").value
    : 5;
  const comment = document.getElementById("reviewComment")
    ? document.getElementById("reviewComment").value.trim()
    : "";

  const userName = currentUserSession
    ? currentUserSession.name
    : prompt(t("alert_review_prompt_name")) || t("guest_customer");

  try {
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: currentProductDetailsObj._id,
        userName,
        foodRating,
        deliverySpeedRating,
        serviceRating,
        comment,
      }),
    });

    const data = await res.json();
    if (data.success) {
      alert(t("alert_review_success"));
      if (document.getElementById("reviewComment"))
        document.getElementById("reviewComment").value = "";
      loadProductReviews(currentProductDetailsObj._id);
    } else {
      alert(data.message || t("alert_server_error"));
    }
  } catch (err) {
    alert(t("alert_server_error"));
  }
}

function renderSimilarProducts(products) {
  const container = document.getElementById("similarProductsContainer");
  if (!container) return;

  if (!products || products.length === 0) {
    container.innerHTML = `<div class="col-12 text-center text-muted"><p>${t("no_similar_meals")}</p></div>`;
    return;
  }

  renderFoodCards(products, container);
}

window.initProductDetailsPage = initProductDetailsPage;
window.changeDetailsQty = changeDetailsQty;
window.recalculateDetailsPrice = recalculateDetailsPrice;
window.addDetailsToCartDirect = addDetailsToCartDirect;
window.buyNowDirect = buyNowDirect;
window.submitCustomerReviewWithImages = submitCustomerReviewWithImages;
window.selectDetailsRadio = selectDetailsRadio;
window.toggleDetailsAddonCheckbox = toggleDetailsAddonCheckbox;

// English English English English English English English English English English
function togglePasswordVisibility(inputId, btnElement) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const icon = btnElement ? btnElement.querySelector("i") : null;

  if (input.type === "password") {
    input.type = "text";
    if (icon) {
      icon.classList.remove("fa-eye");
      icon.classList.add("fa-eye-slash");
    }
  } else {
    input.type = "password";
    if (icon) {
      icon.classList.remove("fa-eye-slash");
      icon.classList.add("fa-eye");
    }
  }
}

window.togglePasswordVisibility = togglePasswordVisibility;
