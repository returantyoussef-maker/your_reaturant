// =========================================================
// English English English English English English MongoDB Atlas English Socket.io
// Enterprise Management Portal: Live Orders KDS, QZ Tray Printing, User Management & i18n
// Full Dynamic Design System: Live Color Overrides, Template Decoupling & Default Reset
// =========================================================

const socket =
  typeof io !== "undefined" ? io() : { on: () => {}, emit: () => {} };
const currentRestaurantId = "65d0a1b2c3d4e5f6a7b8c9d0";

let currentAdminUser = null;
let allOrdersList = [];

// ⚡ English English English English (Infinite Scroll) - 20 English English English English English English English English English
const ORDERS_PAGE_SIZE = 20;
let ordersCurrentPage = 1;
let ordersHasMore = true;
let ordersIsLoading = false;
let ordersActiveFilter = "all";
let ordersActiveSearch = "";
let ordersScrollObserver = null;
let ordersSearchDebounceTimer = null;
let allDishesList = [];
let allCategoriesList = [];
let allCouponsList = [];
let allDeliveryAreasList = [];
let allTablesList = [];

// English English English English English
const DEFAULT_THEME = {
  primaryColor: "#8E2130",
  primaryHover: "#681521",
  secondaryColor: "#AE8A34",
  goldLight: "#E8CB77",
  darkColor: "#16120D",
  bgColor: "#FAF6EC",
  cardBgColor: "#FFFFFF",
  textColor: "#221C15",
  borderRadius: "20px",
  fontFamily: "Tajawal",
  customCss: "",
};

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

// English English English English English English English English English (XSS Protection)
function escapeHTML(str) {
  if (typeof str !== "string") return str || "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// English English English English English English English English English NaN English MongoDB
function parseOptionsString(inputStr) {
  const result = [];
  if (!inputStr || typeof inputStr !== "string" || !inputStr.trim())
    return result;

  inputStr.split(",").forEach((item) => {
    const parts = item.split(":");
    if (parts.length === 2) {
      const name = parts[0].trim();
      const price = Number(parts[1].trim());
      if (name && !isNaN(price)) {
        result.push({ name, price });
      }
    }
  });
  return result;
}

document.addEventListener("DOMContentLoaded", () => {
  initAdminSessionCheck();
  listenToSocketEvents();
});

// English English English English English English English English English
window.addEventListener("languageChanged", () => {
  if (currentAdminUser) {
    showMainPortal();
  } else {
    initAdminSessionCheck();
  }
});

// 1. English English English English English English English
async function initAdminSessionCheck() {
  const authSection = document.getElementById("adminAuthSection");
  const mainPortal = document.getElementById("adminMainPortal");
  const loginForm = document.getElementById("adminLoginForm");
  const registerForm = document.getElementById("superAdminRegisterForm");
  const subtitle = document.getElementById("authSubtitle");

  try {
    const savedToken = localStorage.getItem("ora_user_token");
    const headers = { "Content-Type": "application/json" };
    if (savedToken) headers["Authorization"] = "Bearer " + savedToken;

    // English) English English English English English English
    const meRes = await fetch("/api/auth/me", {
      headers,
      credentials: "include",
    });
    const meData = await meRes.json();

    if (meData.success && meData.user) {
      const allowedAdminRoles = ["superadmin", "staff", "admin"];
      if (allowedAdminRoles.includes(meData.user.role)) {
        currentAdminUser = meData.user;
        if (window.AuthStore)
          window.AuthStore.setUser(meData.user, meData.token);
        showMainPortal();
        return;
      }
    }

    // English) English English English English English English English English English
    const checkRes = await fetch("/api/auth/check-superadmin");
    const checkData = await checkRes.json();

    if (checkData.exists) {
      window.location.href = "/index.html";
      return;
    } else {
      if (authSection) authSection.classList.remove("d-none");
      if (mainPortal) mainPortal.classList.add("d-none");
      if (loginForm) loginForm.classList.add("d-none");
      if (registerForm) registerForm.classList.remove("d-none");
      if (subtitle) subtitle.innerText = t("admin_register_owner_notice");
    }
  } catch (e) {
    console.error("Session check error:", e);
    window.location.href = "/index.html";
  }
}

// 2. English English English English English English English
async function submitSuperAdminRegister(e) {
  if (e) e.preventDefault();

  const nameInput = document.getElementById("regAdminName");
  const emailInput = document.getElementById("regAdminEmail");
  const phoneInput = document.getElementById("regAdminPhone");
  const passwordInput = document.getElementById("regAdminPassword");

  const name = nameInput ? nameInput.value.trim() : "";
  const email = emailInput ? emailInput.value.trim() : "";
  const phone = phoneInput ? phoneInput.value.trim() : "";
  const password = passwordInput ? passwordInput.value : "";

  if (!name || !email || !phone || !password) {
    alert(t("alert_superadmin_all_fields"));
    return;
  }

  const btn = e.target
    ? e.target.querySelector('button[type="submit"]') ||
      document.getElementById("regAdminSubmitBtn")
    : null;
  if (btn) {
    btn.disabled = true;
    btn.innerText = t("admin_create_owner_btn");
  }

  try {
    const res = await fetch("/api/auth/register-superadmin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, password }),
    });

    const data = await res.json();

    if (data.success) {
      alert(t("alert_superadmin_create_success"));
      if (data.token) localStorage.setItem("ora_user_token", data.token);
      currentAdminUser = data.user;
      if (window.AuthStore) window.AuthStore.setUser(data.user, data.token);
      showMainPortal();
    } else {
      alert(data.message || t("alert_server_error"));
      if (btn) {
        btn.disabled = false;
        btn.innerText = t("admin_create_owner_btn");
      }
    }
  } catch (err) {
    console.error("Register error:", err);
    alert(t("alert_server_error"));
    if (btn) {
      btn.disabled = false;
      btn.innerText = t("admin_create_owner_btn");
    }
  }
}

// 3. English English English English
async function submitAdminLogin(e) {
  e.preventDefault();
  const email = document.getElementById("loginAdminEmail").value.trim();
  const password = document.getElementById("loginAdminPassword").value;

  try {
    const res = await fetch("/api/auth/login-admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (
      data.success &&
      data.user &&
      ["superadmin", "staff", "admin"].includes(data.user.role)
    ) {
      if (data.token) localStorage.setItem("ora_user_token", data.token);
      currentAdminUser = data.user;
      if (window.AuthStore) window.AuthStore.setUser(data.user, data.token);
      showMainPortal();
    } else {
      alert(data.message || t("alert_admin_unauthorized"));
      window.location.href = "/index.html";
    }
  } catch (err) {
    alert(t("alert_server_error"));
    window.location.href = "/index.html";
  }
}

function showMainPortal() {
  const authSec = document.getElementById("adminAuthSection");
  const mainPort = document.getElementById("adminMainPortal");
  if (authSec) authSec.classList.add("d-none");
  if (mainPort) mainPort.classList.remove("d-none");

  const roleBadge = document.getElementById("currentAdminRoleBadge");
  const superAdminElements = document.querySelectorAll(".superadmin-only-ui");

  if (currentAdminUser && currentAdminUser.role === "staff") {
    if (roleBadge) roleBadge.innerText = t("role_staff");
    superAdminElements.forEach((el) => el.classList.add("d-none"));
  } else {
    if (roleBadge) roleBadge.innerText = t("role_superadmin");
    superAdminElements.forEach((el) => el.classList.remove("d-none"));
    loadAllUsersAdmin();
    fetchCouponsFromDB();
    fetchAuditLogsFromDB();
  }

  loadAdminDashboard();
  fetchDishesFromDB();
  fetchCategoriesFromDB();
  fetchReviewsFromDB();
  fetchTablesFromDB();
  fetchDeliveryAreasFromDB();
  loadSettingsFromDB();

  if (
    window.SiteI18n &&
    typeof window.SiteI18n.applyTranslations === "function"
  ) {
    window.SiteI18n.applyTranslations(
      document.getElementById("adminMainPortal"),
    );
  }

  if (window.Notification && Notification.permission === "default") {
    try {
      Notification.requestPermission();
    } catch (e) {}
  }

  setTimeout(() => {
    attemptClaimPrimaryPrinterRole();
  }, 1500);
}

function attemptClaimPrimaryPrinterRole() {
  if (!window.QZPrint) return;
  QZPrint.getPrintingSettings()
    .then((cs) => {
      QZPrint.connectQZ();
      if (cs.enabled && cs.printerName && socket && socket.id) {
        socket.emit("claim-primary-printer", {
          socketId: socket.id,
          printerName: cs.printerName,
        });
      }
    })
    .catch(() => {});
}

async function logoutAdminSession() {
  try {
    if (typeof socket !== "undefined" && socket && socket.id) {
      socket.emit("release-primary-printer", {});
    }
    await fetch("/api/auth/logout", { method: "POST" });
  } catch (e) {}
  localStorage.removeItem("ora_user_session");
  localStorage.removeItem("ora_user_token");
  currentAdminUser = null;
  initAdminSessionCheck();
}

function listenToSocketEvents() {
  socket.on("connect", () => {
    if (currentAdminUser) attemptClaimPrimaryPrinterRole();
  });

  socket.on("new-order-global", (order) => {
    playOrderSound();
    const num = order && order.orderNumber ? order.orderNumber : "";
    if (window.Notification && Notification.permission === "granted") {
      try {
        new Notification(t("status_new"), {
          body: t("order_number") + " " + num,
        });
      } catch (e) {}
    }
    // ⚡ English English English English English English English English (English English English English English)
    // English English English English English English English English English
    refreshAdminStatsOnly();
    prependNewOrderToList(order);

    if (window.QZPrint) {
      QZPrint.autoPrintOrder(order, "auto-new")
        .then((res) => {
          if (!res.success && !res.duplicate)
            console.warn("Thermal auto print skipped:", res.reason);
        })
        .catch((e) => {
          console.warn("QZ auto print failed:", e);
        });
    }
  });

  socket.on("new-order", (order) => {
    playOrderSound();
    refreshAdminStatsOnly();
    prependNewOrderToList(order);
    if (window.QZPrint) {
      QZPrint.autoPrintOrder(order, "auto-new")
        .then((res) => {
          if (!res.success && !res.duplicate)
            console.warn("Thermal auto print skipped:", res.reason);
        })
        .catch(() => {});
    }
  });

  socket.on("notification-sound-alert", () => playOrderSound());
  socket.on("products-updated", () => fetchDishesFromDB());
  socket.on("categories-updated", () => {
    fetchCategoriesFromDB();
    populateCategorySelectDropdown();
  });
  socket.on("settings-updated", () => loadSettingsFromDB());

  socket.on("order-status-updated-global", (order) => {
    if (!order || !window.QZPrint) return;
    QZPrint.getPrintingSettings()
      .then((cs) => {
        if (!cs.enabled || !cs.printOnStatusChange) return;
        QZPrint.autoPrintOrder(
          order,
          "auto-status:" + String(order.status || "unknown"),
        )
          .then((res) => {
            if (!res.success && !res.duplicate)
              console.warn("Thermal status print skipped:", res.reason);
          })
          .catch(() => {});
      })
      .catch(() => {});
  });

  socket.on("primary-printer-claimed", (payload) => {
    if (socket.id === payload.socketId) {
      if (window.QZPrint) QZPrint.setPrimaryRole(true);
    } else {
      if (window.QZPrint) QZPrint.setPrimaryRole(false);
    }
  });

  socket.on("primary-printer-released", () => {
    if (window.QZPrint) QZPrint.setPrimaryRole(false);
  });

  socket.on("order-deleted-global", (payload) => {
    const orderId = payload && payload.orderId;
    if (orderId) {
      allOrdersList = allOrdersList.filter(
        (o) => String(o._id) !== String(orderId),
      );
      if (window.adminOrdersMap) window.adminOrdersMap.delete(String(orderId));
      const row = document.getElementById("order_card_" + orderId);
      if (row) row.remove();
    }
    // ⚡ English English English English English English English English English English English English English English English
    refreshAdminStatsOnly();
  });
}

function playOrderSound() {
  const sound = document.getElementById("orderNotificationSound");
  if (sound) {
    sound.currentTime = 0;
    sound.play().catch((e) => {});
  }
}

function switchAdminTab(tabId, btnElement) {
  document
    .querySelectorAll(".admin-tab-content")
    .forEach((c) => c.classList.add("d-none"));
  document
    .querySelectorAll(".admin-tab-btn")
    .forEach((b) => b.classList.remove("active"));

  const targetTab = document.getElementById(tabId);
  if (targetTab) targetTab.classList.remove("d-none");
  if (btnElement) btnElement.classList.add("active");
}

// ================= English English "English" English (18 English English English) =================
const DESIGN_THEME_TEMPLATES = {
  ottoman_royal: {
    name: "English English",
    theme: {
      primaryColor: "#831826",
      primaryHover: "#6b121e",
      secondaryColor: "#c59b27",
      goldLight: "#f4ecd8",
      darkColor: "#191214",
      bgColor: "#faf7f2",
      cardBgColor: "#ffffff",
      textColor: "#1d1718",
      borderRadius: "18px",
      fontFamily: "Tajawal",
      customCss: "/* English English English */",
    },
  },
  heritage_flame: {
    name: "English English English",
    theme: {
      primaryColor: "#b83a1b",
      primaryHover: "#962c12",
      secondaryColor: "#d97724",
      goldLight: "#fceede",
      darkColor: "#1e1715",
      bgColor: "#f8f4ee",
      cardBgColor: "#ffffff",
      textColor: "#211916",
      borderRadius: "12px",
      fontFamily: "Cairo",
      customCss: "/* English English English English */",
    },
  },
  nordic_luxury: {
    name: "English English",
    theme: {
      primaryColor: "#0f4c3a",
      primaryHover: "#0a3629",
      secondaryColor: "#c4a47c",
      goldLight: "#edf2ee",
      darkColor: "#0a2119",
      bgColor: "#f5f8f6",
      cardBgColor: "#ffffff",
      textColor: "#13241d",
      borderRadius: "22px",
      fontFamily: "Almarai",
      customCss: "/* English English English English */",
    },
  },
  midnight_gold: {
    name: "English English English",
    theme: {
      primaryColor: "#e6b422",
      primaryHover: "#c79812",
      secondaryColor: "#9c7a1c",
      goldLight: "#2a281d",
      darkColor: "#09090b",
      bgColor: "#121216",
      cardBgColor: "#1c1c24",
      textColor: "#f4f3ed",
      borderRadius: "14px",
      fontFamily: "Changa",
      customCss: "/* English English English English */",
    },
  },
  levantine_brass: {
    name: "English English",
    theme: {
      primaryColor: "#78222c",
      primaryHover: "#5c1820",
      secondaryColor: "#b38b32",
      goldLight: "#f4eed9",
      darkColor: "#1c2b21",
      bgColor: "#fbf7ec",
      cardBgColor: "#fffef9",
      textColor: "#261f18",
      borderRadius: "16px",
      fontFamily: "Reem Kufi",
      customCss:
        'body::before{content:"";position:fixed;inset:0;pointer-events:none;z-index:1;opacity:.04;background-image:repeating-linear-gradient(45deg, var(--brass, #b38b32) 0 2px, transparent 2px 42px),repeating-linear-gradient(-45deg, var(--brass, #b38b32) 0 2px, transparent 2px 42px);}',
    },
  },
  copper_steakhouse: {
    name: "English English",
    theme: {
      primaryColor: "#bd532b",
      primaryHover: "#9c401d",
      secondaryColor: "#8c3b1c",
      goldLight: "#f7ebe6",
      darkColor: "#1f1412",
      bgColor: "#f9f5f0",
      cardBgColor: "#ffffff",
      textColor: "#1e1310",
      borderRadius: "8px",
      fontFamily: "Alexandria",
      customCss: "/* English English English English */",
    },
  },
  riviera_terracotta: {
    name: "English English",
    theme: {
      primaryColor: "#ba4c3c",
      primaryHover: "#9c3b2d",
      secondaryColor: "#4a6857",
      goldLight: "#f7eeeb",
      darkColor: "#222222",
      bgColor: "#fcf9f5",
      cardBgColor: "#ffffff",
      textColor: "#2c2523",
      borderRadius: "20px",
      fontFamily: "Tajawal",
      customCss: "/* English English English English */",
    },
  },
  urban_bistro: {
    name: "English English",
    theme: {
      primaryColor: "#e63946",
      primaryHover: "#c82333",
      secondaryColor: "#457b9d",
      goldLight: "#f1f5f9",
      darkColor: "#1d3557",
      bgColor: "#ffffff",
      cardBgColor: "#ffffff",
      textColor: "#1d3557",
      borderRadius: "10px",
      fontFamily: "Alexandria",
      customCss: "/* English English English English */",
    },
  },
  napoli_pizzeria: {
    name: "English English English",
    theme: {
      primaryColor: "#c1272d",
      primaryHover: "#9c1e23",
      secondaryColor: "#4b6f44",
      goldLight: "#f7ece1",
      darkColor: "#201a15",
      bgColor: "#fdf6ec",
      cardBgColor: "#ffffff",
      textColor: "#261f18",
      borderRadius: "14px",
      fontFamily: "Cairo",
      customCss: "/* English English English English */",
    },
  },
  classic_burger_diner: {
    name: "English English English",
    theme: {
      primaryColor: "#d62828",
      primaryHover: "#b31f1f",
      secondaryColor: "#f7b32b",
      goldLight: "#fff2d9",
      darkColor: "#1a1a1a",
      bgColor: "#fff8ee",
      cardBgColor: "#ffffff",
      textColor: "#201c14",
      borderRadius: "10px",
      fontFamily: "Alexandria",
      customCss: "/* English English English English */",
    },
  },
  sakura_sushi: {
    name: "English English",
    theme: {
      primaryColor: "#af1e3c",
      primaryHover: "#8c1830",
      secondaryColor: "#e8a5b8",
      goldLight: "#f7eef0",
      darkColor: "#120f0e",
      bgColor: "#f8f4f1",
      cardBgColor: "#ffffff",
      textColor: "#1c1615",
      borderRadius: "6px",
      fontFamily: "Almarai",
      customCss: "/* English English English English */",
    },
  },
  ocean_depths_seafood: {
    name: "English English",
    theme: {
      primaryColor: "#0b3d5c",
      primaryHover: "#082c43",
      secondaryColor: "#2e8b8b",
      goldLight: "#eaf6f6",
      darkColor: "#071e2b",
      bgColor: "#f2f8f8",
      cardBgColor: "#ffffff",
      textColor: "#10262f",
      borderRadius: "18px",
      fontFamily: "Tajawal",
      customCss: "/* English English English English */",
    },
  },
  specialty_coffee_house: {
    name: "English English English",
    theme: {
      primaryColor: "#6f4518",
      primaryHover: "#573512",
      secondaryColor: "#c8945b",
      goldLight: "#f7ead9",
      darkColor: "#221408",
      bgColor: "#fbf3e7",
      cardBgColor: "#fffdf9",
      textColor: "#2b1c10",
      borderRadius: "16px",
      fontFamily: "Reem Kufi",
      customCss: "/* English English English English */",
    },
  },
  parisian_patisserie: {
    name: "English English",
    theme: {
      primaryColor: "#c98a9c",
      primaryHover: "#b06e82",
      secondaryColor: "#cba135",
      goldLight: "#fbf1ec",
      darkColor: "#2a2422",
      bgColor: "#fdf9f6",
      cardBgColor: "#ffffff",
      textColor: "#2e2624",
      borderRadius: "24px",
      fontFamily: "Changa",
      customCss: "/* English English English English */",
    },
  },
  cairo_street_koshary: {
    name: "English English English",
    theme: {
      primaryColor: "#d1382d",
      primaryHover: "#ab2c22",
      secondaryColor: "#e8a33d",
      goldLight: "#fdf1d9",
      darkColor: "#201a12",
      bgColor: "#fbf4e4",
      cardBgColor: "#ffffff",
      textColor: "#241d14",
      borderRadius: "12px",
      fontFamily: "Cairo",
      customCss: "/* English English English English English */",
    },
  },
  balady_ahwa: {
    name: "English English",
    theme: {
      primaryColor: "#5a3825",
      primaryHover: "#432a1b",
      secondaryColor: "#ab7b3f",
      goldLight: "#f8f1e0",
      darkColor: "#1b140d",
      bgColor: "#f4ecd9",
      cardBgColor: "#fffaf0",
      textColor: "#241b10",
      borderRadius: "8px",
      fontFamily: "Reem Kufi",
      customCss: "/* English English English English */",
    },
  },
  taco_fiesta_mexicano: {
    name: "English English English",
    theme: {
      primaryColor: "#e8542a",
      primaryHover: "#c2431f",
      secondaryColor: "#4c9a4a",
      goldLight: "#fdf1da",
      darkColor: "#201512",
      bgColor: "#fef6e4",
      cardBgColor: "#ffffff",
      textColor: "#251c15",
      borderRadius: "14px",
      fontFamily: "Alexandria",
      customCss: "/* English English English English */",
    },
  },
  urban_vegan_green: {
    name: "English English",
    theme: {
      primaryColor: "#3f7d4f",
      primaryHover: "#2f5f3c",
      secondaryColor: "#c9b896",
      goldLight: "#f2efe6",
      darkColor: "#16241a",
      bgColor: "#f7faf5",
      cardBgColor: "#ffffff",
      textColor: "#1c2a1f",
      borderRadius: "20px",
      fontFamily: "Almarai",
      customCss: "/* English English English English */",
    },
  },
};

let themesSelectedPreviewKey = "ottoman_royal";

// English English: English English English English 100% English English English English English English English English
function getActiveDesignTemplateKey() {
  const cur =
    (window.restaurantSettings && window.restaurantSettings.theme) || null;
  if (!cur) return null;
  const norm = (v) =>
    String(v || "")
      .trim()
      .toLowerCase();
  for (const key in DESIGN_THEME_TEMPLATES) {
    const t = DESIGN_THEME_TEMPLATES[key].theme;
    if (
      norm(cur.primaryColor) === norm(t.primaryColor) &&
      norm(cur.secondaryColor) === norm(t.secondaryColor) &&
      norm(cur.bgColor) === norm(t.bgColor) &&
      norm(cur.darkColor) === norm(t.darkColor)
    ) {
      return key;
    }
  }
  return null;
}

// English English English English English
function previewDesignTemplate(key) {
  if (!DESIGN_THEME_TEMPLATES[key]) return;
  themesSelectedPreviewKey = key;
  const previewBox = document.getElementById("themesInteractivePreview");
  if (previewBox) {
    previewBox.setAttribute("data-preset", key);
    const t = DESIGN_THEME_TEMPLATES[key].theme;
    previewBox.style.setProperty("--dm-primary", t.primaryColor);
    previewBox.style.setProperty("--dm-secondary", t.secondaryColor);
    previewBox.style.setProperty("--dm-dark", t.darkColor);
    previewBox.style.setProperty("--dm-bg", t.bgColor);
    previewBox.style.setProperty("--dm-card", t.cardBgColor);
    previewBox.style.setProperty("--dm-text", t.textColor);
    previewBox.style.setProperty("--dm-radius", t.borderRadius);
    previewBox.style.fontFamily = `'${t.fontFamily}', sans-serif`;
  }
  document.querySelectorAll(".design-theme-card").forEach((card) => {
    card.classList.toggle(
      "is-selected",
      card.getAttribute("data-preset") === key,
    );
  });

  const brandName =
    (window.restaurantSettings &&
      (window.restaurantSettings.name ||
        (window.restaurantSettings.content &&
          window.restaurantSettings.content.brandName))) ||
    (document.getElementById("restaurantName")
      ? document.getElementById("restaurantName").value
      : "") ||
    (getActiveLanguage() === "en" ? "Restaurant" : "English");
  const brandElem = document.getElementById("previewMockBrandName");
  if (brandElem) brandElem.innerText = brandName;
}

// English English English English English
function setMockupViewMode(mode, btn) {
  const container = document.getElementById("mockContainer");
  if (!container) return;
  container.className = "design-mock-container view-" + mode;
  document
    .querySelectorAll(".btn-view-mode")
    .forEach((b) => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
}

// English English English English English English English English
function renderDesignThemeCardsState() {
  const activeKey = getActiveDesignTemplateKey();
  document.querySelectorAll(".design-theme-card").forEach((card) => {
    const key = card.getAttribute("data-preset");
    const badge = card.querySelector(".design-theme-card-badge");
    if (badge) badge.classList.toggle("is-active", key === activeKey);
  });

  if (activeKey) {
    previewDesignTemplate(activeKey);
  } else {
    updateLivePreviewStyles();
  }
}

// English English English English: English English English English English English English
async function applyDesignTemplate(key) {
  const tpl = DESIGN_THEME_TEMPLATES[key];
  if (!tpl) return;
  if (
    !confirm(
      `English English English "${tpl.name}" English English English English. English English English English English English English English English English. English English English`,
    )
  )
    return;

  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val;
  };
  setVal("themePrimaryColor", tpl.theme.primaryColor);
  setVal("themePrimaryHover", tpl.theme.primaryHover);
  setVal("themeSecondaryColor", tpl.theme.secondaryColor);
  setVal("themeGoldLight", tpl.theme.goldLight);
  setVal("themeDarkColor", tpl.theme.darkColor);
  setVal("themeBgColor", tpl.theme.bgColor);
  setVal("themeCardBgColor", tpl.theme.cardBgColor);
  setVal("themeTextColor", tpl.theme.textColor);
  setVal("themeBorderRadius", tpl.theme.borderRadius);
  setVal("themeFontFamily", tpl.theme.fontFamily);
  setVal("themeCustomCss", tpl.theme.customCss);

  previewDesignTemplate(key);
  updateLivePreviewStyles();

  await saveFullSiteBuilderSettingsToDB();
  renderDesignThemeCardsState();
}

// English English English English English English English English English
async function resetToDefaultTheme() {
  const isEn = getActiveLanguage() === "en";
  const confirmMsg = isEn
    ? "Are you sure you want to deactivate preset templates and restore the original default theme?"
    : "English English English English English English English English English English English";

  if (!confirm(confirmMsg)) return;

  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val;
  };

  setVal("themePrimaryColor", DEFAULT_THEME.primaryColor);
  setVal("themePrimaryHover", DEFAULT_THEME.primaryHover);
  setVal("themeSecondaryColor", DEFAULT_THEME.secondaryColor);
  setVal("themeGoldLight", DEFAULT_THEME.goldLight);
  setVal("themeDarkColor", DEFAULT_THEME.darkColor);
  setVal("themeBgColor", DEFAULT_THEME.bgColor);
  setVal("themeCardBgColor", DEFAULT_THEME.cardBgColor);
  setVal("themeTextColor", DEFAULT_THEME.textColor);
  setVal("themeBorderRadius", DEFAULT_THEME.borderRadius);
  setVal("themeFontFamily", DEFAULT_THEME.fontFamily);
  setVal("themeCustomCss", DEFAULT_THEME.customCss);

  const previewBox = document.getElementById("themesInteractivePreview");
  if (previewBox) {
    previewBox.removeAttribute("data-preset");
  }

  updateLivePreviewStyles();
  await saveFullSiteBuilderSettingsToDB();
  renderDesignThemeCardsState();

  const successMsg = isEn
    ? "Original default theme restored successfully!"
    : "English English English English English English English English English!";
  alert(successMsg);
}

// ================= 2. English English English =================

async function loadSettingsFromDB() {
  try {
    const res = await fetch("/api/settings");
    const data = await res.json();
    const s = data.settings || {};
    window.restaurantSettings = s;
    const isEn = getActiveLanguage() === "en";

    if (document.getElementById("settingsWhatsappInput"))
      document.getElementById("settingsWhatsappInput").value =
        s.whatsappPhone || "01120751467";
    if (document.getElementById("settingsPhoneInput"))
      document.getElementById("settingsPhoneInput").value =
        s.phone || "01120751467";
    if (document.getElementById("settingsOpeningTime"))
      document.getElementById("settingsOpeningTime").value =
        s.openingTime || "10:00";
    if (document.getElementById("settingsClosingTime"))
      document.getElementById("settingsClosingTime").value =
        s.closingTime || "23:59";
    if (document.getElementById("settingsAutoCloseToggle"))
      document.getElementById("settingsAutoCloseToggle").checked =
        s.autoCloseOutsideWorkingHours !== false;
    if (document.getElementById("settingsAcceptingOrdersToggle"))
      document.getElementById("settingsAcceptingOrdersToggle").checked =
        s.isAcceptingOrders !== false;

    if (s.theme) {
      if (document.getElementById("themePrimaryColor"))
        document.getElementById("themePrimaryColor").value =
          s.theme.primaryColor || DEFAULT_THEME.primaryColor;
      if (document.getElementById("themePrimaryHover"))
        document.getElementById("themePrimaryHover").value =
          s.theme.primaryHover || DEFAULT_THEME.primaryHover;
      if (document.getElementById("themeSecondaryColor"))
        document.getElementById("themeSecondaryColor").value =
          s.theme.secondaryColor || DEFAULT_THEME.secondaryColor;
      if (document.getElementById("themeGoldLight"))
        document.getElementById("themeGoldLight").value =
          s.theme.goldLight || DEFAULT_THEME.goldLight;
      if (document.getElementById("themeDarkColor"))
        document.getElementById("themeDarkColor").value =
          s.theme.darkColor || DEFAULT_THEME.darkColor;
      if (document.getElementById("themeBgColor"))
        document.getElementById("themeBgColor").value =
          s.theme.bgColor || DEFAULT_THEME.bgColor;
      if (document.getElementById("themeCardBgColor"))
        document.getElementById("themeCardBgColor").value =
          s.theme.cardBgColor || DEFAULT_THEME.cardBgColor;
      if (document.getElementById("themeTextColor"))
        document.getElementById("themeTextColor").value =
          s.theme.textColor || DEFAULT_THEME.textColor;
      if (document.getElementById("themeFontFamily"))
        document.getElementById("themeFontFamily").value =
          s.theme.fontFamily || DEFAULT_THEME.fontFamily;
      if (document.getElementById("themeBorderRadius"))
        document.getElementById("themeBorderRadius").value =
          s.theme.borderRadius || DEFAULT_THEME.borderRadius;
      if (document.getElementById("themeCustomCss"))
        document.getElementById("themeCustomCss").value =
          s.theme.customCss || "";
    }

    if (s.content) {
      if (document.getElementById("restaurantName"))
        document.getElementById("restaurantName").value =
          s.name || s.content.brandName || (isEn ? "Restaurant" : "English");
      if (document.getElementById("contentBrandTagline"))
        document.getElementById("contentBrandTagline").value =
          s.content.brandTagline ||
          (isEn
            ? "Authentic Flavors, Unforgettable Dining"
            : "English English");
      if (document.getElementById("contentHeroTitle"))
        document.getElementById("contentHeroTitle").value =
          s.content.heroTitle ||
          s.name ||
          s.content.brandName ||
          (isEn ? "Restaurant" : "English");
      if (document.getElementById("contentHeroSubtitle"))
        document.getElementById("contentHeroSubtitle").value =
          s.content.heroSubtitle ||
          (isEn ? "An authentic taste that suits your palate" : "English English English English");
      if (document.getElementById("contentHeroBtn1Text"))
        document.getElementById("contentHeroBtn1Text").value =
          s.content.heroBtn1Text || (isEn ? "Order Now" : "English English");
      if (document.getElementById("contentHeroBtn2Text"))
        document.getElementById("contentHeroBtn2Text").value =
          s.content.heroBtn2Text || (isEn ? "Today's Deals" : "English English");
      if (document.getElementById("contentHeroBgImage"))
        document.getElementById("contentHeroBgImage").value =
          s.content.heroBgImage ||
          "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1600";
      if (document.getElementById("contentDealsSectionTitle"))
        document.getElementById("contentDealsSectionTitle").value =
          s.content.dealsSectionTitle || t("deals_section_default_title");
      if (document.getElementById("contentDealsSectionSubtitle"))
        document.getElementById("contentDealsSectionSubtitle").value =
          s.content.dealsSectionSubtitle || t("deals_section_default_sub");
      if (document.getElementById("contentTopSellersTitle"))
        document.getElementById("contentTopSellersTitle").value =
          s.content.topSellersTitle || t("top_sellers_default_title");
      if (document.getElementById("contentTopSellersSubtitle"))
        document.getElementById("contentTopSellersSubtitle").value =
          s.content.topSellersSubtitle || t("top_sellers_default_sub");
      if (document.getElementById("contentAnnouncementText"))
        document.getElementById("contentAnnouncementText").value =
          s.content.announcementText || "";
      if (document.getElementById("contentShowAnnouncement"))
        document.getElementById("contentShowAnnouncement").checked =
          s.content.showAnnouncement === true;
      if (document.getElementById("contentFooterText"))
        document.getElementById("contentFooterText").value =
          s.content.footerText ||
          (isEn
            ? "All Rights Reserved © 2026 Restaurant"
            : "English English English © 2026 English - English English");
    }

    const resolvedBrandName =
      s.name || (s.content && s.content.brandName) || null;

    if (document.getElementById("adminHeaderBrandName") && resolvedBrandName) {
      document.getElementById("adminHeaderBrandName").innerText =
        resolvedBrandName;
    }
    if (document.getElementById("adminPortalTitle")) {
      document.getElementById("adminPortalTitle").innerText = isEn
        ? `${resolvedBrandName || "Restaurant"} Kitchen Management`
        : `English English ${resolvedBrandName || "English"}`;
    }
    if (document.getElementById("previewMockBrandName")) {
      document.getElementById("previewMockBrandName").innerText =
        resolvedBrandName || (isEn ? "Restaurant" : "English");
    }
    document.title = isEn
      ? `Admin Portal - ${resolvedBrandName || "Restaurant"}`
      : `English English English English - ${resolvedBrandName || "English"}`;

    hasLoadedDesignSettings = true;
    updateLivePreviewStyles();
    updateLivePreviewTexts();
    if (typeof renderDesignThemeCardsState === "function")
      renderDesignThemeCardsState();

    const statusHelper = document.getElementById("settingsLiveStatusHelper");
    if (statusHelper) {
      const localeStr = isEn ? "en-GB" : "ar";
      const localTimeStr = new Date().toLocaleTimeString(localeStr, {
        hour: "2-digit",
        minute: "2-digit",
      });
      if (s.isOpenNow) {
        statusHelper.className =
          "alert alert-success mt-3 mb-0 fw-bold small shadow-sm";
        statusHelper.innerHTML = isEn
          ? '<i class="fa-solid fa-circle-check me-1 text-success"></i> The kitchen is currently OPEN and accepting orders online. (Current Time: ' +
            localTimeStr +
            ")"
          : '<i class="fa-solid fa-circle-check me-1 text-success"></i> English English English English English English English. (English English: ' +
            localTimeStr +
            ")";
      } else {
        statusHelper.className =
          "alert alert-danger mt-3 mb-0 fw-bold small shadow-sm";
        statusHelper.innerHTML = isEn
          ? '<i class="fa-solid fa-circle-xmark me-1 text-danger"></i> The kitchen is currently CLOSED. (Current Time: ' +
            localTimeStr +
            " outside [" +
            s.openingTime +
            " - " +
            s.closingTime +
            "])."
          : '<i class="fa-solid fa-circle-xmark me-1 text-danger"></i> English English English English English English English English English (' +
            localTimeStr +
            ") English English English [" +
            s.openingTime +
            " - " +
            s.closingTime +
            "].";
      }
    }

    const p = s.printingSettings || {};
    if (document.getElementById("qzEnabledToggle"))
      document.getElementById("qzEnabledToggle").checked = p.enabled === true;
    if (document.getElementById("qzPrinterSelect"))
      document.getElementById("qzPrinterSelect").value = p.printerName || "";
    if (document.getElementById("qzPrinterTypeSelect"))
      document.getElementById("qzPrinterTypeSelect").value = [
        "thermal",
        "office",
        "unknown",
      ].includes(p.printerType)
        ? p.printerType
        : "unknown";
    if (document.getElementById("qzProtocolSelect"))
      document.getElementById("qzProtocolSelect").value = [
        "escpos-raster",
        "escpos-text",
        "browser",
        "unknown",
      ].includes(p.protocol)
        ? p.protocol
        : "unknown";
    if (document.getElementById("qzPaperSizeSelect"))
      document.getElementById("qzPaperSizeSelect").value =
        p.paperSize === "58mm" ? "58mm" : "80mm";
    if (document.getElementById("qzCopiesInput"))
      document.getElementById("qzCopiesInput").value = Math.min(
        5,
        Math.max(1, Number(p.copies) || 1),
      );
    if (document.getElementById("qzAutoPrintNewOrdersToggle"))
      document.getElementById("qzAutoPrintNewOrdersToggle").checked =
        p.autoPrintNewOrders !== false;
    if (document.getElementById("qzPrintOnStatusChangeToggle"))
      document.getElementById("qzPrintOnStatusChangeToggle").checked =
        p.printOnStatusChange === true;
    if (document.getElementById("qzCutPaperToggle"))
      document.getElementById("qzCutPaperToggle").checked =
        p.cutPaper !== false;
    if (document.getElementById("qzBeepToggle"))
      document.getElementById("qzBeepToggle").checked = p.beep !== false;
    if (document.getElementById("qzMarginBottomInput"))
      document.getElementById("qzMarginBottomInput").value = Math.min(
        50,
        Math.max(0, Number(p.marginBottom) || 0),
      );

    if (window.QZPrint)
      QZPrint.getPrintingSettings().then(() => {
        const psl = window.QZPrint.getCachedSettings();
        const sel = document.getElementById("qzPrinterSelect");
        if (sel && psl.printerName) sel.value = psl.printerName;
      });
  } catch (e) {}
}

let livePreviewDraftTimer;
let hasLoadedDesignSettings = false;

function getLivePreviewDraft() {
  const primary = document.getElementById("themePrimaryColor")
    ? document.getElementById("themePrimaryColor").value
    : DEFAULT_THEME.primaryColor;
  const primaryHover = document.getElementById("themePrimaryHover")
    ? document.getElementById("themePrimaryHover").value
    : DEFAULT_THEME.primaryHover;
  const secondary = document.getElementById("themeSecondaryColor")
    ? document.getElementById("themeSecondaryColor").value
    : DEFAULT_THEME.secondaryColor;
  const goldLight = document.getElementById("themeGoldLight")
    ? document.getElementById("themeGoldLight").value
    : DEFAULT_THEME.goldLight;
  const dark = document.getElementById("themeDarkColor")
    ? document.getElementById("themeDarkColor").value
    : DEFAULT_THEME.darkColor;
  const bg = document.getElementById("themeBgColor")
    ? document.getElementById("themeBgColor").value
    : DEFAULT_THEME.bgColor;
  const cardBg = document.getElementById("themeCardBgColor")
    ? document.getElementById("themeCardBgColor").value
    : DEFAULT_THEME.cardBgColor;
  const textCol = document.getElementById("themeTextColor")
    ? document.getElementById("themeTextColor").value
    : DEFAULT_THEME.textColor;
  const radius = document.getElementById("themeBorderRadius")
    ? document.getElementById("themeBorderRadius").value
    : DEFAULT_THEME.borderRadius;
  const font = document.getElementById("themeFontFamily")
    ? document.getElementById("themeFontFamily").value
    : DEFAULT_THEME.fontFamily;
  const name = document.getElementById("restaurantName")
    ? document.getElementById("restaurantName").value.trim()
    : (window.restaurantSettings &&
        (window.restaurantSettings.name ||
          (window.restaurantSettings.content &&
            window.restaurantSettings.content.brandName))) ||
      (getActiveLanguage() === "en" ? "Restaurant" : "English");

  const customCss = document.getElementById("themeCustomCss")
    ? document.getElementById("themeCustomCss").value
    : "";

  return {
    name,
    theme: {
      primaryColor: primary,
      primaryHover,
      secondaryColor: secondary,
      goldLight,
      darkColor: dark,
      bgColor: bg,
      cardBgColor: cardBg,
      textColor: textCol,
      borderRadius: radius,
      fontFamily: font,
      customCss,
      preset: getActiveDesignTemplateKey() || null,
    },
    content: {
      brandName: name,
      brandTagline: document.getElementById("contentBrandTagline")
        ? document.getElementById("contentBrandTagline").value.trim()
        : "",
      heroTitle: document.getElementById("contentHeroTitle")
        ? document.getElementById("contentHeroTitle").value.trim()
        : "",
      heroSubtitle: document.getElementById("contentHeroSubtitle")
        ? document.getElementById("contentHeroSubtitle").value.trim()
        : "",
      heroBtn1Text: document.getElementById("contentHeroBtn1Text")
        ? document.getElementById("contentHeroBtn1Text").value.trim()
        : "",
      heroBtn2Text: document.getElementById("contentHeroBtn2Text")
        ? document.getElementById("contentHeroBtn2Text").value.trim()
        : "",
    },
  };
}

function scheduleLivePreviewDraft() {
  if (!hasLoadedDesignSettings) return;
  clearTimeout(livePreviewDraftTimer);
  livePreviewDraftTimer = setTimeout(() => {
    const frame = document.getElementById("livePreviewFrame");
    if (!frame || !frame.contentWindow) return;
    frame.contentWindow.postMessage(
      { type: "livePreviewDraft", payload: getLivePreviewDraft() },
      window.location.origin,
    );
  }, 100);
}

// English English English English English English Mockup English English English English Color Picker
function updateLivePreviewStyles() {
  const draft = getLivePreviewDraft();
  const {
    primaryColor: primary,
    primaryHover,
    secondaryColor: secondary,
    goldLight,
    darkColor: dark,
    bgColor: bg,
    cardBgColor: cardBg,
    textColor: textCol,
    borderRadius: radius,
    fontFamily: font,
  } = draft.theme;

  if (document.getElementById("themePrimaryColorHex"))
    document.getElementById("themePrimaryColorHex").innerText = primary;
  if (document.getElementById("themePrimaryHoverHex"))
    document.getElementById("themePrimaryHoverHex").innerText = primaryHover;
  if (document.getElementById("themeSecondaryColorHex"))
    document.getElementById("themeSecondaryColorHex").innerText = secondary;
  if (document.getElementById("themeGoldLightHex"))
    document.getElementById("themeGoldLightHex").innerText = goldLight;
  if (document.getElementById("themeDarkColorHex"))
    document.getElementById("themeDarkColorHex").innerText = dark;
  if (document.getElementById("themeBgColorHex"))
    document.getElementById("themeBgColorHex").innerText = bg;
  if (document.getElementById("themeCardBgColorHex"))
    document.getElementById("themeCardBgColorHex").innerText = cardBg;
  if (document.getElementById("themeTextColorHex"))
    document.getElementById("themeTextColorHex").innerText = textCol;

  // English English Interactive Mockup English English "English" English English English
  const mockElem = document.getElementById("themesInteractivePreview");
  if (mockElem) {
    mockElem.style.setProperty("--dm-primary", primary);
    mockElem.style.setProperty("--dm-secondary", secondary);
    mockElem.style.setProperty("--dm-dark", dark);
    mockElem.style.setProperty("--dm-bg", bg);
    mockElem.style.setProperty("--dm-card", cardBg);
    mockElem.style.setProperty("--dm-text", textCol);
    mockElem.style.setProperty("--dm-radius", radius || "16px");
    if (font) mockElem.style.fontFamily = `'${font}', sans-serif`;
  }

  scheduleLivePreviewDraft();
  if (typeof renderDesignThemeCardsState === "function") {
    const activeKey = getActiveDesignTemplateKey();
    document.querySelectorAll(".design-theme-card").forEach((card) => {
      const key = card.getAttribute("data-preset");
      const badge = card.querySelector(".design-theme-card-badge");
      if (badge) badge.classList.toggle("is-active", key === activeKey);
    });
  }
}

function updateLivePreviewTexts() {
  scheduleLivePreviewDraft();
}

// English English English English English English English English English English English English English English
async function saveFullSiteBuilderSettingsToDB() {
  const activeMatchingPreset = getActiveDesignTemplateKey();

  const theme = {
    primaryColor: document.getElementById("themePrimaryColor")
      ? document.getElementById("themePrimaryColor").value
      : DEFAULT_THEME.primaryColor,
    primaryHover: document.getElementById("themePrimaryHover")
      ? document.getElementById("themePrimaryHover").value
      : DEFAULT_THEME.primaryHover,
    secondaryColor: document.getElementById("themeSecondaryColor")
      ? document.getElementById("themeSecondaryColor").value
      : DEFAULT_THEME.secondaryColor,
    goldLight: document.getElementById("themeGoldLight")
      ? document.getElementById("themeGoldLight").value
      : DEFAULT_THEME.goldLight,
    darkColor: document.getElementById("themeDarkColor")
      ? document.getElementById("themeDarkColor").value
      : DEFAULT_THEME.darkColor,
    bgColor: document.getElementById("themeBgColor")
      ? document.getElementById("themeBgColor").value
      : DEFAULT_THEME.bgColor,
    cardBgColor: document.getElementById("themeCardBgColor")
      ? document.getElementById("themeCardBgColor").value
      : DEFAULT_THEME.cardBgColor,
    textColor: document.getElementById("themeTextColor")
      ? document.getElementById("themeTextColor").value
      : DEFAULT_THEME.textColor,
    borderRadius: document.getElementById("themeBorderRadius")
      ? document.getElementById("themeBorderRadius").value
      : DEFAULT_THEME.borderRadius,
    fontFamily: document.getElementById("themeFontFamily")
      ? document.getElementById("themeFontFamily").value
      : DEFAULT_THEME.fontFamily,
    customCss: document.getElementById("themeCustomCss")
      ? document.getElementById("themeCustomCss").value
      : "",
    preset: activeMatchingPreset || null,
  };

  const name = document.getElementById("restaurantName")
    ? document.getElementById("restaurantName").value.trim()
    : (window.restaurantSettings &&
        (window.restaurantSettings.name ||
          (window.restaurantSettings.content &&
            window.restaurantSettings.content.brandName))) ||
      (getActiveLanguage() === "en" ? "Restaurant" : "English");
  const content = {
    brandName: name,
    brandTagline: document.getElementById("contentBrandTagline")
      ? document.getElementById("contentBrandTagline").value.trim()
      : "English English",
    heroTitle: document.getElementById("contentHeroTitle")
      ? document.getElementById("contentHeroTitle").value.trim()
      : name,
    heroSubtitle: document.getElementById("contentHeroSubtitle")
      ? document.getElementById("contentHeroSubtitle").value.trim()
      : "English English English English",
    heroBtn1Text: document.getElementById("contentHeroBtn1Text")
      ? document.getElementById("contentHeroBtn1Text").value.trim()
      : "English English",
    heroBtn2Text: document.getElementById("contentHeroBtn2Text")
      ? document.getElementById("contentHeroBtn2Text").value.trim()
      : "English English",
    heroBgImage: document.getElementById("contentHeroBgImage")
      ? document.getElementById("contentHeroBgImage").value.trim()
      : "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1600",
    dealsSectionTitle: document.getElementById("contentDealsSectionTitle")
      ? document.getElementById("contentDealsSectionTitle").value.trim()
      : "English English English English",
    dealsSectionSubtitle: document.getElementById("contentDealsSectionSubtitle")
      ? document.getElementById("contentDealsSectionSubtitle").value.trim()
      : "English English English English English English",
    topSellersTitle: document.getElementById("contentTopSellersTitle")
      ? document.getElementById("contentTopSellersTitle").value.trim()
      : "English 10 English English English English",
    topSellersSubtitle: document.getElementById("contentTopSellersSubtitle")
      ? document.getElementById("contentTopSellersSubtitle").value.trim()
      : `English English English English English English English English English ${name}`,
    announcementText: document.getElementById("contentAnnouncementText")
      ? document.getElementById("contentAnnouncementText").value.trim()
      : "",
    showAnnouncement: document.getElementById("contentShowAnnouncement")
      ? document.getElementById("contentShowAnnouncement").checked
      : false,
    footerText: document.getElementById("contentFooterText")
      ? document.getElementById("contentFooterText").value.trim()
      : `English English English © 2026 English ${name} - English English`,
  };

  try {
    const savedToken = localStorage.getItem("ora_user_token");
    const headers = { "Content-Type": "application/json" };
    if (savedToken) headers["Authorization"] = "Bearer " + savedToken;

    const res = await fetch("/api/settings", {
      method: "PUT",
      headers,
      body: JSON.stringify({ name, theme, content }),
    });
    const data = await res.json();
    if (data.success) {
      loadSettingsFromDB();
    } else {
      alert(data.message || t("alert_server_error"));
    }
  } catch (err) {
    alert(t("alert_server_error"));
  }
}

async function saveFullRestaurantSettingsToDB() {
  const whatsappPhone = document.getElementById("settingsWhatsappInput")
    ? document.getElementById("settingsWhatsappInput").value.trim()
    : "";
  const phone = document.getElementById("settingsPhoneInput")
    ? document.getElementById("settingsPhoneInput").value.trim()
    : "";
  const openingTime = document.getElementById("settingsOpeningTime")
    ? document.getElementById("settingsOpeningTime").value
    : "10:00";
  const closingTime = document.getElementById("settingsClosingTime")
    ? document.getElementById("settingsClosingTime").value
    : "23:59";
  const autoCloseOutsideWorkingHours = document.getElementById(
    "settingsAutoCloseToggle",
  )
    ? document.getElementById("settingsAutoCloseToggle").checked
    : true;
  const isAcceptingOrders = document.getElementById(
    "settingsAcceptingOrdersToggle",
  )
    ? document.getElementById("settingsAcceptingOrdersToggle").checked
    : true;

  const printingSettings = {
    enabled: document.getElementById("qzEnabledToggle")
      ? document.getElementById("qzEnabledToggle").checked
      : false,
    printerName: document.getElementById("qzPrinterSelect")
      ? document.getElementById("qzPrinterSelect").value.trim()
      : "",
    printerType: document.getElementById("qzPrinterTypeSelect")
      ? document.getElementById("qzPrinterTypeSelect").value
      : "unknown",
    protocol: document.getElementById("qzProtocolSelect")
      ? document.getElementById("qzProtocolSelect").value
      : "unknown",
    connection: "qz-queue",
    paperSize: document.getElementById("qzPaperSizeSelect")
      ? document.getElementById("qzPaperSizeSelect").value
      : "80mm",
    copies: document.getElementById("qzCopiesInput")
      ? Math.min(
          5,
          Math.max(
            1,
            parseInt(document.getElementById("qzCopiesInput").value, 10) || 1,
          ),
        )
      : 1,
    autoPrintNewOrders: document.getElementById("qzAutoPrintNewOrdersToggle")
      ? document.getElementById("qzAutoPrintNewOrdersToggle").checked
      : true,
    printOnStatusChange: document.getElementById("qzPrintOnStatusChangeToggle")
      ? document.getElementById("qzPrintOnStatusChangeToggle").checked
      : false,
    cutPaper: document.getElementById("qzCutPaperToggle")
      ? document.getElementById("qzCutPaperToggle").checked
      : true,
    beep: document.getElementById("qzBeepToggle")
      ? document.getElementById("qzBeepToggle").checked
      : true,
    marginBottom: document.getElementById("qzMarginBottomInput")
      ? Math.min(
          50,
          Math.max(
            0,
            parseInt(
              document.getElementById("qzMarginBottomInput").value,
              10,
            ) || 0,
          ),
        )
      : 0,
  };

  try {
    const savedToken = localStorage.getItem("ora_user_token");
    const headers = { "Content-Type": "application/json" };
    if (savedToken) headers["Authorization"] = "Bearer " + savedToken;

    const res = await fetch("/api/settings", {
      method: "PUT",
      headers,
      body: JSON.stringify({
        whatsappPhone,
        phone,
        openingTime,
        closingTime,
        autoCloseOutsideWorkingHours,
        isAcceptingOrders,
        printingSettings,
      }),
    });
    const data = await res.json();
    if (data.success) {
      alert(t("alert_save_settings_success"));
      loadSettingsFromDB();
    } else {
      alert(data.message || t("alert_server_error"));
    }
  } catch (err) {
    alert(t("alert_server_error"));
  }
}

async function saveQZPrintingSettings() {
  const printingSettings = {
    enabled: document.getElementById("qzEnabledToggle")
      ? document.getElementById("qzEnabledToggle").checked
      : false,
    printerName: document.getElementById("qzPrinterSelect")
      ? document.getElementById("qzPrinterSelect").value.trim()
      : "",
    printerType: document.getElementById("qzPrinterTypeSelect")
      ? document.getElementById("qzPrinterTypeSelect").value
      : "unknown",
    protocol: document.getElementById("qzProtocolSelect")
      ? document.getElementById("qzProtocolSelect").value
      : "unknown",
    connection: "qz-queue",
    paperSize: document.getElementById("qzPaperSizeSelect")
      ? document.getElementById("qzPaperSizeSelect").value
      : "80mm",
    copies: document.getElementById("qzCopiesInput")
      ? Math.min(
          5,
          Math.max(
            1,
            parseInt(document.getElementById("qzCopiesInput").value, 10) || 1,
          ),
        )
      : 1,
    autoPrintNewOrders: document.getElementById("qzAutoPrintNewOrdersToggle")
      ? document.getElementById("qzAutoPrintNewOrdersToggle").checked
      : true,
    printOnStatusChange: document.getElementById("qzPrintOnStatusChangeToggle")
      ? document.getElementById("qzPrintOnStatusChangeToggle").checked
      : false,
    cutPaper: document.getElementById("qzCutPaperToggle")
      ? document.getElementById("qzCutPaperToggle").checked
      : true,
    beep: document.getElementById("qzBeepToggle")
      ? document.getElementById("qzBeepToggle").checked
      : true,
    marginBottom: document.getElementById("qzMarginBottomInput")
      ? Math.min(
          50,
          Math.max(
            0,
            parseInt(
              document.getElementById("qzMarginBottomInput").value,
              10,
            ) || 0,
          ),
        )
      : 0,
  };

  if (printingSettings.enabled && !printingSettings.printerName) {
    alert(t("alert_qz_select_printer_required"));
    return;
  }
  if (
    printingSettings.enabled &&
    (printingSettings.printerType !== "thermal" ||
      !["escpos-raster", "escpos-text"].includes(printingSettings.protocol))
  ) {
    alert(t("alert_qz_safe_protocol_required"));
    return;
  }

  try {
    const savedToken = localStorage.getItem("ora_user_token");
    const headers = { "Content-Type": "application/json" };
    if (savedToken) headers["Authorization"] = "Bearer " + savedToken;

    const res = await fetch("/api/settings", {
      method: "PUT",
      headers,
      body: JSON.stringify({ printingSettings }),
    });
    const data = await res.json();
    if (data.success) {
      alert(t("alert_save_qz_success"));
      loadSettingsFromDB();
    } else {
      alert(data.message || t("alert_server_error"));
    }
  } catch (err) {
    alert(t("alert_server_error"));
  }
}

async function refreshQZPrintersList() {
  if (!window.QZPrint) {
    alert(t("alert_qz_not_loaded"));
    return;
  }
  const st = QZPrint.getState();
  if (!st.connected) {
    alert(t("alert_qz_not_connected"));
    return;
  }
  await QZPrint.refreshPrinterList();
  alert(t("alert_qz_refresh_success"));
}

async function testQZPrint() {
  if (!window.QZPrint) {
    alert(t("alert_qz_not_loaded"));
    return;
  }
  const box = document.getElementById("qzTestResultBox");
  if (box)
    box.innerHTML =
      '<div class="alert alert-secondary small mt-2"><i class="fa-solid fa-spinner fa-spin"></i> ' +
      t("loading") +
      "</div>";

  const st = QZPrint.getState();
  if (!st.connected) {
    await QZPrint.connectQZ();
  }
  const result = await QZPrint.printTestReceipt();
  if (box) {
    if (result.success) {
      box.innerHTML =
        '<div class="alert alert-success small mt-2"><i class="fa-solid fa-circle-check"></i> ' +
        t("alert_qz_test_success") +
        "</div>";
    } else {
      box.innerHTML =
        '<div class="alert alert-danger small mt-2"><i class="fa-solid fa-circle-xmark"></i> ' +
        t("alert_qz_test_failed") +
        " " +
        (result.reason || "Error") +
        "</div>";
    }
  } else {
    alert(
      result.success
        ? t("alert_qz_test_success")
        : t("alert_qz_test_failed") + " " + (result.reason || "Error"),
    );
  }
  setTimeout(() => {
    if (box) box.innerHTML = "";
  }, 5000);
}

async function claimPrimaryPrinterRole() {
  if (!window.QZPrint) {
    alert(t("alert_qz_not_loaded"));
    return;
  }
  const st = QZPrint.getState();
  if (!st.connected) {
    alert(t("alert_qz_not_connected"));
    return;
  }
  const cs = QZPrint.getCachedSettings();
  if (!cs.enabled || !cs.printerName) {
    alert(t("alert_qz_claim_required"));
    return;
  }
  socket.emit("claim-primary-printer", {
    socketId: socket.id,
    printerName: cs.printerName,
  });
}

// ================= 3. English English English =================

async function loadAdminDashboard() {
  await refreshAdminStatsOnly();
  await resetAndLoadOrders();
}

// English English English English English English (English English English English English English English English Scroll reset)
async function refreshAdminStatsOnly() {
  try {
    const savedToken = localStorage.getItem("ora_user_token");
    const headers = { "Content-Type": "application/json" };
    if (savedToken) headers["Authorization"] = "Bearer " + savedToken;

    const res = await fetch("/api/admin/stats/" + currentRestaurantId, {
      headers,
    });
    const data = await res.json();
    const stats = data.stats || {};

    if (document.getElementById("statRevenue"))
      document.getElementById("statRevenue").innerText =
        (stats.totalRevenue || 0) + " " + t("egp");
    if (document.getElementById("statOrdersCount"))
      document.getElementById("statOrdersCount").innerText =
        stats.completedOrders || 0;
    if (document.getElementById("statPendingCount"))
      document.getElementById("statPendingCount").innerText =
        stats.newOrders || 0;
    if (document.getElementById("statPreparingCount"))
      document.getElementById("statPreparingCount").innerText =
        stats.activeOrdersNow || 0;
  } catch (err) {}
}

// English English English English English - English English English English English English English/English
async function resetAndLoadOrders() {
  ordersCurrentPage = 1;
  ordersHasMore = true;
  allOrdersList = [];
  if (ordersScrollObserver) ordersScrollObserver.disconnect();
  await loadMoreOrders(true);
}

// ⚡ English English English English English English (20 English) - English English English English English 632 English English English
async function loadMoreOrders(isReset = false) {
  if (ordersIsLoading) return;
  if (!isReset && !ordersHasMore) return;

  ordersIsLoading = true;
  showOrdersLoadingIndicator(true);

  try {
    const savedToken = localStorage.getItem("ora_user_token");
    const headers = { "Content-Type": "application/json" };
    if (savedToken) headers["Authorization"] = "Bearer " + savedToken;

    const params = new URLSearchParams({
      page: String(ordersCurrentPage),
      limit: String(ORDERS_PAGE_SIZE),
    });
    if (ordersActiveFilter && ordersActiveFilter !== "all")
      params.set("status", ordersActiveFilter);
    if (ordersActiveSearch) params.set("q", ordersActiveSearch);

    const res = await fetch(
      "/api/admin/orders/" + currentRestaurantId + "?" + params.toString(),
      { headers },
    );
    const data = await res.json();
    const newOrders = data.orders || [];

    allOrdersList = isReset ? newOrders : allOrdersList.concat(newOrders);
    ordersHasMore = !!data.hasMore;
    ordersCurrentPage += 1;

    renderAdminOrdersTable(allOrdersList);
    setupOrdersInfiniteScroll();
  } catch (err) {
    if (isReset) renderAdminOrdersTable([]);
  } finally {
    ordersIsLoading = false;
    showOrdersLoadingIndicator(false);
  }
}

// English/English English "English English English..." English English
function showOrdersLoadingIndicator(show) {
  const container = document.getElementById("adminOrdersContainer");
  if (!container || !container.parentElement) return;
  let el = document.getElementById("ordersLoadingMore");

  if (show) {
    if (!el) {
      el = document.createElement("div");
      el.id = "ordersLoadingMore";
      el.className = "text-center py-3 text-muted small";
      el.innerHTML =
        '<i class="fa-solid fa-spinner fa-spin me-1"></i> ' +
        (typeof t === "function" ? t("loading_more_orders") || "" : "") ||
        '<i class="fa-solid fa-spinner fa-spin me-1"></i> English English English English English...';
      container.parentElement.appendChild(el);
    }
    el.style.display = "block";
  } else if (el) {
    el.style.display = "none";
  }
}

// English English (IntersectionObserver): English English English English English English English English
// English English English English (20 English English) - English English English Infinite Scroll
function setupOrdersInfiniteScroll() {
  if (ordersScrollObserver) ordersScrollObserver.disconnect();

  const container = document.getElementById("adminOrdersContainer");
  if (!container || !container.lastElementChild) return;
  if (!ordersHasMore) return;

  ordersScrollObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && ordersHasMore && !ordersIsLoading) {
          loadMoreOrders(false);
        }
      });
    },
    { root: null, rootMargin: "400px", threshold: 0 },
  );

  ordersScrollObserver.observe(container.lastElementChild);
}

// English English English English English English Socket.io English English English English English English Reset English English English
function prependNewOrderToList(order) {
  if (!order || !order._id) return;
  if (allOrdersList.some((o) => String(o._id) === String(order._id))) return;

  // English English English English English English English English English English English English English English
  if (ordersActiveSearch) return;
  if (
    ordersActiveFilter &&
    ordersActiveFilter !== "all" &&
    order.status !== ordersActiveFilter
  )
    return;

  allOrdersList = [order, ...allOrdersList];
  renderAdminOrdersTable(allOrdersList);
  setupOrdersInfiniteScroll();
}

function renderAdminOrdersTable(orders) {
  const container =
    document.getElementById("adminOrdersContainer") ||
    document.getElementById("adminOrdersTableBody");
  if (!container) return;

  if (!orders || orders.length === 0) {
    container.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="empty-orders-card p-5 rounded-4">
                    <div class="empty-icon-circle mx-auto mb-3">
                        <i class="fa-solid fa-kitchen-set fs-1"></i>
                    </div>
                    <h5 class="fw-bold text-ink mb-1">${t("admin_orders_empty")}</h5>
                    <p class="text-muted small mb-0">${t("admin_orders_empty_desc")}</p>
                </div>
            </div>`;
    return;
  }

  const isSuperAdmin =
    currentAdminUser && currentAdminUser.role === "superadmin";
  const isEn = getActiveLanguage() === "en";
  const timeLocale = isEn ? "en-GB" : "ar-EG";

  const statusConfig = {
    New: {
      label: t("status_new"),
      bg: "#B5401A",
      color: "#FFFFFF",
      icon: "fa-fire-burner",
    },
    Reviewed: {
      label: t("status_reviewed"),
      bg: "#A8792F",
      color: "#FFFFFF",
      icon: "fa-clipboard-check",
    },
    Preparing: {
      label: t("status_preparing"),
      bg: "#D8B978",
      color: "#1B1512",
      icon: "fa-kitchen-set",
    },
    Ready: {
      label: t("status_ready"),
      bg: "#35586B",
      color: "#FFFFFF",
      icon: "fa-box-open",
    },
    OutForDelivery: {
      label: t("status_out_for_delivery"),
      bg: "#1B1512",
      color: "#D8B978",
      icon: "fa-motorcycle",
    },
    Delivered: {
      label: t("status_delivered"),
      bg: "#556B45",
      color: "#FFFFFF",
      icon: "fa-circle-check",
    },
    Cancelled: {
      label: t("status_cancelled"),
      bg: "#7A6C58",
      color: "#FFFFFF",
      icon: "fa-circle-xmark",
    },
    Rejected: {
      label: t("status_cancelled"),
      bg: "#2A2119",
      color: "#FFFFFF",
      icon: "fa-ban",
    },
  };

  window.adminOrdersMap = window.adminOrdersMap || new Map();
  orders.forEach((o) => window.adminOrdersMap.set(String(o._id), o));

  const cardsHtml = orders
    .map((o) => {
      const realCustomerName = escapeHTML(
        o.customer && o.customer.name ? o.customer.name : t("guest_customer"),
      );
      const custPhone = escapeHTML(o.customer ? o.customer.phone : "");
      const custAddress = escapeHTML(o.customer ? o.customer.address : "-");
      const custNotes = escapeHTML(
        o.customer && o.customer.notes ? o.customer.notes.trim() : "",
      );
      const custExtraPhone = escapeHTML(
        o.customer && o.customer.extraPhone ? o.customer.extraPhone.trim() : "",
      );
      const custTableNumber = escapeHTML(
        o.customer && o.customer.tableNumber
          ? o.customer.tableNumber.trim()
          : "",
      );
      const orderTime = new Date(o.createdAt || o.orderDate).toLocaleTimeString(
        timeLocale,
        { hour: "2-digit", minute: "2-digit" },
      );

      const items = o.items || [];
      const itemsHtml = items
        .map((i) => {
          let sizeBadge =
            i.selectedSize && i.selectedSize.name
              ? `<span class="kds-size-badge">${escapeHTML(i.selectedSize.name)}</span>`
              : "";
          let addonsText =
            i.selectedAddons && i.selectedAddons.length
              ? `<div class="kds-addons-list"><i class="fa-solid fa-plus text-warning"></i> ${i.selectedAddons.map((a) => escapeHTML(a.name)).join(", ")}</div>`
              : "";

          return `
                <div class="kds-item-row">
                    <div class="d-flex align-items-center justify-content-between">
                        <div class="d-flex align-items-center gap-2">
                            <span class="kds-qty-badge">${i.quantity || 1}x</span>
                            <strong class="kds-item-title">${escapeHTML(i.title)}</strong>
                        </div>
                        ${sizeBadge}
                    </div>
                    ${addonsText}
                </div>
            `;
        })
        .join("");

      let gpsButtonHtml = "";
      if (
        o.customer &&
        o.customer.gpsLocation &&
        o.customer.gpsLocation.mapUrl
      ) {
        gpsButtonHtml = `<a href="${escapeHTML(o.customer.gpsLocation.mapUrl)}" target="_blank" class="kds-gps-btn"><i class="fa-solid fa-location-dot"></i> ${t("kds_map_open")}</a>`;
      } else if (
        o.customer &&
        o.customer.gpsLocation &&
        o.customer.gpsLocation.lat
      ) {
        const mapUrl =
          "https://maps.google.com/?q=" +
          o.customer.gpsLocation.lat +
          "," +
          o.customer.gpsLocation.lng;
        gpsButtonHtml = `<a href="${mapUrl}" target="_blank" class="kds-gps-btn"><i class="fa-solid fa-location-dot"></i> ${t("kds_map_open")}</a>`;
      }

      const statusInfo = statusConfig[o.status] || {
        bg: "#A8792F",
        color: "#FFF",
        label: o.status,
        icon: "fa-clock",
      };

      return `
            <div class="col-12 col-md-6 col-xl-4" id="order_card_${o._id}">
                <div class="kds-order-card h-100">
                    <div class="kds-card-header d-flex align-items-center justify-content-between">
                        <div class="d-flex align-items-center gap-2">
                            <div class="kds-order-num">#${escapeHTML(o.orderNumber)}</div>
                            <span class="kds-time-chip"><i class="fa-regular fa-clock"></i> ${orderTime}</span>
                        </div>
                        <div class="kds-status-select-wrapper" style="background-color: ${statusInfo.bg}; color: ${statusInfo.color};">
                            <i class="fa-solid ${statusInfo.icon}"></i>
                            <select class="kds-status-select" onchange="updateOrderStatusOptimistic('${o._id}', this.value)">
                                <option value="New" ${o.status === "New" ? "selected" : ""}>${t("status_new")}</option>
                                <option value="Reviewed" ${o.status === "Reviewed" ? "selected" : ""}>${t("status_reviewed")}</option>
                                <option value="Preparing" ${o.status === "Preparing" ? "selected" : ""}>${t("status_preparing")}</option>
                                <option value="Ready" ${o.status === "Ready" ? "selected" : ""}>${t("status_ready")}</option>
                                <option value="OutForDelivery" ${o.status === "OutForDelivery" ? "selected" : ""}>${t("status_out_for_delivery")}</option>
                                <option value="Delivered" ${o.status === "Delivered" ? "selected" : ""}>${t("status_delivered")}</option>
                                <option value="Cancelled" ${o.status === "Cancelled" ? "selected" : ""}>${t("status_cancelled")}</option>
                                <option value="Rejected" ${o.status === "Rejected" ? "selected" : ""}>${t("status_cancelled")}</option>
                            </select>
                        </div>
                    </div>

                    <div class="kds-card-body p-3">
                        <div class="kds-customer-box mb-3">
                            <div class="d-flex align-items-start justify-content-between gap-2">
                                <div>
                                    <h6 class="fw-bold mb-1 text-ink"><i class="fa-solid fa-user text-brass me-1"></i> ${realCustomerName}
                                        ${custTableNumber ? `<span class="badge bg-danger ms-1"><i class="fa-solid fa-chair"></i> ${t("table_word")} ${custTableNumber}</span>` : ""}
                                    </h6>
                                    <a href="tel:${custPhone}" class="kds-phone-link"><i class="fa-solid fa-phone text-success me-1"></i> ${custPhone}</a>
                                    ${custExtraPhone ? `<div class="small text-muted"><i class="fa-solid fa-phone-volume me-1"></i> ${t("extra_phone")}: <a href="tel:${custExtraPhone}">${custExtraPhone}</a></div>` : ""}
                                </div>
                                ${gpsButtonHtml}
                            </div>
                            <div class="kds-address-text mt-2"><i class="fa-solid fa-house text-brass me-1"></i> ${custAddress}</div>
                            ${custNotes ? `<div class="kds-notes-alert mt-2"><i class="fa-solid fa-note-sticky text-amber me-1"></i> <strong>${t("kds_order_note")}</strong> ${custNotes}</div>` : ""}
                        </div>

                        <div class="kds-items-box">
                            <div class="kds-items-header d-flex justify-content-between align-items-center mb-2 pb-1 border-bottom">
                                <span class="fw-bold text-ink small"><i class="fa-solid fa-utensils text-brass me-1"></i> ${t("kds_items_requested")}</span>
                                <span class="badge rounded-pill bg-dark text-warning">${t("kds_items_count", { count: items.length })}</span>
                            </div>
                            <div class="kds-items-list">
                                ${itemsHtml}
                            </div>
                        </div>
                    </div>

                    <div class="kds-card-footer p-3 border-top">
                        <div class="d-flex align-items-center justify-content-between mb-3">
                            <span class="text-muted small fw-bold">${t("kds_total_price")}</span>
                            <span class="kds-total-price">${o.totalPrice} <small class="fs-6 text-dark fw-bold">${t("egp")}</small></span>
                        </div>

                        <div class="d-flex gap-2">
                            <button class="btn kds-btn-whatsapp flex-grow-1" onclick="openCustomerWhatsappById('${o._id}')" title="${t("kds_whatsapp_btn")}">
                                <i class="fa-brands fa-whatsapp fs-5"></i> <span>${t("kds_whatsapp_btn")}</span>
                            </button>
                            <button class="btn kds-btn-print" onclick="printThermalReceiptById('${o._id}')" title="${t("kds_print_btn")}">
                                <i class="fa-solid fa-print"></i> <span>${t("kds_print_btn")}</span>
                            </button>
                            ${
                              isSuperAdmin
                                ? `
                            <button class="btn kds-btn-delete" onclick="deleteOrderFromDB('${o._id}')" title="${t("kds_delete_btn")}">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>`
                                : ""
                            }
                        </div>
                    </div>

                </div>
            </div>
        `;
    })
    .join("");

  container.innerHTML = cardsHtml;
}

// English English English English English English English English (Rollback on Error)
async function updateOrderStatusOptimistic(orderId, newStatus) {
  const targetOrder = allOrdersList.find((o) => o._id === orderId);
  if (!targetOrder) return;

  const previousStatus = targetOrder.status;
  targetOrder.status = newStatus;

  try {
    const savedToken = localStorage.getItem("ora_user_token");
    const headers = { "Content-Type": "application/json" };
    if (savedToken) headers["Authorization"] = "Bearer " + savedToken;

    const res = await fetch("/api/orders/" + orderId + "/status", {
      method: "PUT",
      headers,
      body: JSON.stringify({ status: newStatus }),
    });
    const data = await res.json();
    if (!data.success) {
      alert(
        t("alert_qz_status_update_error") +
          " " +
          (data.message || "Unknown error"),
      );
      targetOrder.status = previousStatus;
      renderAdminOrdersTable(allOrdersList);
    }
  } catch (e) {
    alert(t("alert_qz_status_update_conn_error"));
    targetOrder.status = previousStatus;
    renderAdminOrdersTable(allOrdersList);
  }
}

function openCustomerWhatsappById(id) {
  if (!window.adminOrdersMap) return;
  const order = window.adminOrdersMap.get(String(id));
  if (order) openCustomerWhatsapp(order);
}

function printThermalReceiptById(id) {
  if (!window.adminOrdersMap) return;
  const order = window.adminOrdersMap.get(String(id));
  if (!order) return;

  if (window.QZPrint) {
    QZPrint.manualPrintOrder(order)
      .then((res) => {
        if (res.success) {
          console.info(
            "QZ thermal receipt printed for order:",
            order.orderNumber,
          );
        } else if (!res.duplicate) {
          console.warn("QZ thermal print failed:", res.reason);
          alert("Thermal print failed: " + (res.reason || "Unknown error"));
        }
      })
      .catch((e) => {
        console.warn("QZ manual print error:", e);
        alert("Thermal print failed.");
      });
  } else {
    alert(t("alert_qz_not_loaded"));
  }
}

function openCustomerWhatsapp(order) {
  if (!order || !order.customer) return;

  const phone = order.customer.whatsappPhone || order.customer.phone;
  if (!phone) {
    alert(t("alert_no_whatsapp"));
    return;
  }

  const isEn = getActiveLanguage() === "en";
  const realCustomerName = order.customer.name || t("guest_customer");
  const restaurantName =
    (window.restaurantSettings && window.restaurantSettings.name) ||
    (isEn ? "Restaurant" : "English");
  const itemsSummary = (order.items || [])
    .map((i) => "- " + i.title + " x" + i.quantity)
    .join("\n");

  const msgText = isEn
    ? "Hello " +
      realCustomerName +
      "\n" +
      "Regarding your order [#" +
      order.orderNumber +
      "] from " +
      restaurantName +
      ":\n" +
      "-------------------------\n" +
      itemsSummary +
      "\n" +
      "-------------------------\n" +
      "Total: " +
      order.totalPrice +
      " " +
      t("egp") +
      "\n" +
      "Status: [" +
      order.status +
      "]\n" +
      "Thank you for reaching out!"
    : "English English English/English " +
      realCustomerName +
      "\n" +
      "English English English [" +
      order.orderNumber +
      "] English " +
      restaurantName +
      ":\n" +
      "-------------------------\n" +
      itemsSummary +
      "\n" +
      "-------------------------\n" +
      "English English: " +
      order.totalPrice +
      " " +
      t("egp") +
      "\n" +
      "English English English: [" +
      order.status +
      "]\n" +
      "English English English!";

  const formattedPhone = phone.startsWith("0") ? "2" + phone : phone;
  window.open(
    "https://wa.me/" + formattedPhone + "?text=" + encodeURIComponent(msgText),
    "_blank",
  );
}

async function deleteOrderFromDB(orderId) {
  if (!confirm(t("alert_delete_order_confirm"))) return;

  const row = document.getElementById("order_card_" + orderId);
  if (row) row.remove();

  allOrdersList = allOrdersList.filter((o) => o._id !== orderId);

  try {
    const savedToken = localStorage.getItem("ora_user_token");
    const headers = {};
    if (savedToken) headers["Authorization"] = "Bearer " + savedToken;

    const res = await fetch("/api/orders/" + orderId, {
      method: "DELETE",
      headers,
    });
    const data = await res.json();
    if (data.success) {
      refreshAdminStatsOnly();
    } else {
      alert(data.message);
      refreshAdminStatsOnly();
    }
  } catch (err) {
    alert(t("alert_server_error"));
    loadAdminDashboard();
  }
}

// ⚡ English English English English English (English English English English 20 English English)English English English English English
function filterAdminOrders(status) {
  ordersActiveFilter = status;
  resetAndLoadOrders();
}

// ⚡ English English English English English English English English English Debounce English English English English English English English
function searchAdminOrders(query) {
  ordersActiveSearch = (query || "").trim();
  clearTimeout(ordersSearchDebounceTimer);
  ordersSearchDebounceTimer = setTimeout(() => {
    resetAndLoadOrders();
  }, 350);
}

// ================= 5. English English =================

async function fetchDishesFromDB() {
  try {
    const res = await fetch("/api/products");
    const data = await res.json();
    allDishesList = data.products || [];
    renderDishesGrid();
  } catch (e) {
    allDishesList = [];
    renderDishesGrid();
  }
}

function searchDishesInAdmin(query) {
  const q = (query || "").toLowerCase();
  const filtered = allDishesList.filter(
    (d) =>
      d.title.toLowerCase().includes(q) ||
      (d.description && d.description.toLowerCase().includes(q)),
  );
  renderDishesGridCustomList(filtered);
}

function renderDishesGrid() {
  renderDishesGridCustomList(allDishesList);
}

function renderDishesGridCustomList(list) {
  const grid = document.getElementById("adminDishesGrid");
  if (!grid) return;

  if (list.length === 0) {
    grid.innerHTML = `<div class="col-12 text-center py-5"><p class="text-muted fs-5 fw-bold">${t("admin_dishes_empty")}</p></div>`;
    return;
  }

  const isSuperAdmin =
    currentAdminUser && currentAdminUser.role === "superadmin";

  window.adminDishesMap = window.adminDishesMap || new Map();
  list.forEach((d) => window.adminDishesMap.set(String(d._id), d));

  grid.innerHTML = list
    .map((d) => {
      let sizesCount = d.sizes ? d.sizes.length : 0;
      let addonsCount = d.addons ? d.addons.length : 0;
      const statusBadgeText =
        d.isAvailable !== false ? t("dish_available") : t("dish_unavailable");
      const toggleActionText =
        d.isAvailable !== false
          ? t("dish_status_disable")
          : t("dish_status_enable");

      return `
            <div class="col-md-4">
                <div class="card h-100 shadow-sm border rounded-3 overflow-hidden">
                    <img src="${d.images && d.images[0] ? d.images[0] : "https://images.unsplash.com/photo-1555939594-58d7cb561ad1"}" class="card-img-top" style="height: 180px; object-fit: cover;">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="badge ${d.isAvailable !== false ? "bg-success" : "bg-danger"}">${statusBadgeText}</span>
                            <span class="fw-bold text-danger">${d.price} ${t("egp")}</span>
                        </div>
                        <h5 class="fw-bold mb-1">${escapeHTML(d.title)}</h5>
                        <p class="text-muted small mb-2">${escapeHTML(d.shortDescription || d.description || "")}</p>
                        
                        <div class="mb-3">
                            <span class="badge bg-light text-dark border me-1"><i class="fa-solid fa-ruler-combined me-1"></i> ${t("dish_sizes_count", { count: sizesCount })}</span>
                            <span class="badge bg-light text-dark border me-1"><i class="fa-solid fa-circle-plus me-1"></i> ${t("dish_addons_count", { count: addonsCount })}</span>
                            <span class="badge bg-dark text-white"><i class="fa-solid fa-boxes-stacked me-1"></i> ${t("dish_stock", { qty: d.stockQuantity !== undefined ? d.stockQuantity : 100 })}</span>
                        </div>

                        <div class="d-flex gap-2">
                            <button class="btn btn-sm btn-outline-warning text-dark fw-bold" onclick="openEditDishModalById('${d._id}')">
                                <i class="fa-solid fa-pen-to-square me-1"></i> ${t("edit")}
                            </button>
                            <button class="btn btn-sm btn-outline-secondary w-100" onclick="toggleDishStatus('${d._id}', ${d.isAvailable !== false})">
                                ${toggleActionText}
                            </button>
                            ${isSuperAdmin ? `<button class="btn btn-sm btn-outline-danger" onclick="deleteDishFromDB('${d._id}')"><i class="fa-solid fa-trash-can"></i></button>` : ""}
                        </div>
                    </div>
                </div>
            </div>
        `;
    })
    .join("");
}

function openEditDishModalById(id) {
  if (!window.adminDishesMap) return;
  const dish = window.adminDishesMap.get(String(id));
  if (dish) openEditDishModal(dish);
}

function openEditDishModal(dish) {
  document.getElementById("editDishId").value = dish._id;
  document.getElementById("editDishTitle").value = dish.title;
  document.getElementById("editDishPrice").value = dish.price;
  document.getElementById("editDishDiscountPrice").value =
    dish.discountPrice || 0;
  document.getElementById("editDishDesc").value =
    dish.description || dish.shortDescription || "";

  const currentImg = dish.images && dish.images[0] ? dish.images[0] : "";
  document.getElementById("editDishImg").value = currentImg;

  const editPreviewImg = document.getElementById("editDishImgPreview");
  const editPreviewContainer = document.getElementById(
    "editDishImgPreviewContainer",
  );
  if (currentImg) {
    if (editPreviewImg) editPreviewImg.src = currentImg;
    if (editPreviewContainer) editPreviewContainer.classList.remove("d-none");
  } else {
    if (editPreviewImg) editPreviewImg.src = "";
    if (editPreviewContainer) editPreviewContainer.classList.add("d-none");
  }
  const editFileInput = document.getElementById("editDishImgFile");
  if (editFileInput) editFileInput.value = "";

  if (dish.sizes && dish.sizes.length > 0) {
    document.getElementById("editDishSizesInput").value = dish.sizes
      .map((s) => s.name + ":" + s.price)
      .join(", ");
  } else {
    document.getElementById("editDishSizesInput").value = "";
  }

  if (dish.addons && dish.addons.length > 0) {
    document.getElementById("editDishAddonsInput").value = dish.addons
      .map((a) => a.name + ":" + a.price)
      .join(", ");
  } else {
    document.getElementById("editDishAddonsInput").value = "";
  }

  const select = document.getElementById("editDishCategorySelect");
  if (select) {
    select.innerHTML = allCategoriesList
      .map(
        (c) =>
          `<option value="${c.name}" ${dish.categoryId && dish.categoryId.name === c.name ? "selected" : ""}>${c.name}</option>`,
      )
      .join("");
  }

  const modal = new bootstrap.Modal(document.getElementById("editDishModal"));
  modal.show();
}

async function submitEditDishToDB(e) {
  e.preventDefault();
  const id = document.getElementById("editDishId").value;
  const title = document.getElementById("editDishTitle").value;
  const category = document.getElementById("editDishCategorySelect").value;
  const price = document.getElementById("editDishPrice").value;
  const discountPrice = document.getElementById("editDishDiscountPrice").value;
  const desc = document.getElementById("editDishDesc").value;
  const img = document.getElementById("editDishImg").value;

  const sizesArray = parseOptionsString(
    document.getElementById("editDishSizesInput").value,
  );
  const addonsArray = parseOptionsString(
    document.getElementById("editDishAddonsInput").value,
  );

  try {
    const savedToken = localStorage.getItem("ora_user_token");
    const headers = { "Content-Type": "application/json" };
    if (savedToken) headers["Authorization"] = "Bearer " + savedToken;

    const res = await fetch("/api/products/" + id, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        title,
        category,
        price: Number(price),
        discountPrice: Number(discountPrice) || 0,
        shortDescription: desc,
        fullDescription: desc,
        images: [
          img || "https://images.unsplash.com/photo-1555939594-58d7cb561ad1",
        ],
        sizes: sizesArray,
        addons: addonsArray,
      }),
    });

    const data = await res.json();
    if (data.success) {
      alert(data.message || t("dish_save_edit_btn"));
      fetchDishesFromDB();
      bootstrap.Modal.getInstance(
        document.getElementById("editDishModal"),
      ).hide();
    } else {
      alert(data.message || t("alert_server_error"));
    }
  } catch (err) {
    alert(t("alert_server_error"));
  }
}

async function addNewDishToDB(e) {
  e.preventDefault();
  const title = document.getElementById("dishTitle").value;
  const category = document.getElementById("dishCategorySelect").value;
  const price = document.getElementById("dishPrice").value;
  const discountPrice = document.getElementById("dishDiscountPrice").value;
  const desc = document.getElementById("dishDesc").value;
  const img = document.getElementById("dishImg").value;

  const sizesArray = parseOptionsString(
    document.getElementById("dishSizesInput").value,
  );
  const addonsArray = parseOptionsString(
    document.getElementById("dishAddonsInput").value,
  );

  try {
    const savedToken = localStorage.getItem("ora_user_token");
    const headers = { "Content-Type": "application/json" };
    if (savedToken) headers["Authorization"] = "Bearer " + savedToken;

    const res = await fetch("/api/products", {
      method: "POST",
      headers,
      body: JSON.stringify({
        title,
        category,
        price: Number(price),
        discountPrice: Number(discountPrice) || 0,
        shortDescription: desc,
        fullDescription: desc,
        images: img
          ? [img]
          : ["https://images.unsplash.com/photo-1555939594-58d7cb561ad1"],
        sizes: sizesArray,
        addons: addonsArray,
      }),
    });

    const data = await res.json();
    if (data.success) {
      alert(data.message || t("dish_save_publish_btn"));
      fetchDishesFromDB();
      bootstrap.Modal.getInstance(
        document.getElementById("addDishModal"),
      ).hide();
    } else {
      alert(data.message || t("alert_server_error"));
    }
  } catch (err) {
    alert(t("alert_server_error"));
  }
}

async function toggleDishStatus(id, currentStatus) {
  try {
    const savedToken = localStorage.getItem("ora_user_token");
    const headers = { "Content-Type": "application/json" };
    if (savedToken) headers["Authorization"] = "Bearer " + savedToken;

    await fetch("/api/products/" + id, {
      method: "PUT",
      headers,
      body: JSON.stringify({ isAvailable: !currentStatus }),
    });
    fetchDishesFromDB();
  } catch (e) {}
}

async function deleteDishFromDB(id) {
  if (!confirm(t("alert_delete_dish_confirm"))) return;

  try {
    const savedToken = localStorage.getItem("ora_user_token");
    const headers = {};
    if (savedToken) headers["Authorization"] = "Bearer " + savedToken;

    const res = await fetch("/api/products/" + id, {
      method: "DELETE",
      headers,
    });
    const data = await res.json();

    if (data.success) {
      fetchDishesFromDB();
    } else {
      alert(data.message);
    }
  } catch (err) {
    alert(t("alert_server_error"));
  }
}

async function fetchCategoriesFromDB() {
  try {
    const res = await fetch("/api/categories");
    const data = await res.json();
    allCategoriesList = data.categories || [];
    renderCategoriesList();
    populateCategorySelectDropdown();
  } catch (e) {
    allCategoriesList = [];
    renderCategoriesList();
  }
}

function populateCategorySelectDropdown() {
  const select = document.getElementById("dishCategorySelect");
  if (!select) return;

  if (allCategoriesList.length === 0) {
    select.innerHTML = `<option value="English">${t("all")}</option>`;
    return;
  }

  const isEn = getActiveLanguage() === "en";
  select.innerHTML = allCategoriesList
    .map((c) => {
      const displayName = isEn && c.nameEn ? c.nameEn : c.name;
      return `<option value="${escapeHTML(c.name)}">${escapeHTML(displayName)}</option>`;
    })
    .join("");
}

function renderCategoriesList() {
  const list = document.getElementById("adminCategoriesList");
  if (!list) return;

  if (allCategoriesList.length === 0) {
    list.innerHTML = `<div class="p-4 text-center text-muted fw-bold">${t("cat_empty")}</div>`;
    return;
  }

  list.innerHTML = allCategoriesList
    .map(
      (c) => `
        <div class="d-flex justify-content-between align-items-center p-3 border-bottom">
            <div>
                <h6 class="fw-bold m-0">${escapeHTML(c.name)} <small class="text-muted">(${escapeHTML(c.nameEn || "")})</small></h6>
            </div>
            <button class="btn btn-sm btn-outline-danger" onclick="deleteCategoryFromDB('${c._id}')"><i class="fa-solid fa-trash-can"></i> ${t("cat_delete_btn")}</button>
        </div>
    `,
    )
    .join("");
}

async function addNewCategoryToDB(e) {
  e.preventDefault();
  const nameAr = document.getElementById("catNameAr").value;
  const nameEn = document.getElementById("catNameEn").value;

  try {
    const savedToken = localStorage.getItem("ora_user_token");
    const headers = { "Content-Type": "application/json" };
    if (savedToken) headers["Authorization"] = "Bearer " + savedToken;

    const res = await fetch("/api/categories", {
      method: "POST",
      headers,
      body: JSON.stringify({ name: nameAr, nameEn }),
    });

    const data = await res.json();
    if (data.success) {
      document.getElementById("catNameAr").value = "";
      document.getElementById("catNameEn").value = "";
      fetchCategoriesFromDB();
    } else {
      alert(data.message || t("alert_server_error"));
    }
  } catch (err) {
    alert(t("alert_server_error"));
  }
}

async function deleteCategoryFromDB(id) {
  if (!confirm(t("alert_delete_category_confirm"))) return;

  try {
    const savedToken = localStorage.getItem("ora_user_token");
    const headers = {};
    if (savedToken) headers["Authorization"] = "Bearer " + savedToken;

    const res = await fetch("/api/categories/" + id, {
      method: "DELETE",
      headers,
    });
    const data = await res.json();
    if (data.success) {
      fetchCategoriesFromDB();
    }
  } catch (e) {}
}

async function fetchCouponsFromDB() {
  const tbody = document.getElementById("couponsAdminTableBody");
  if (!tbody) return;
  const isEn = getActiveLanguage() === "en";
  const dateLocale = isEn ? "en-GB" : "ar-EG";

  try {
    const savedToken = localStorage.getItem("ora_user_token");
    const headers = {};
    if (savedToken) headers["Authorization"] = "Bearer " + savedToken;

    const res = await fetch("/api/coupons", { headers });
    const data = await res.json();
    allCouponsList = data.coupons || [];

    if (allCouponsList.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted fw-bold">${t("coupon_empty")}</td></tr>`;
      return;
    }

    tbody.innerHTML = allCouponsList
      .map(
        (c) => `
            <tr>
                <td><strong class="text-primary fs-6">${escapeHTML(c.code)}</strong></td>
                <td><span class="badge bg-success">${c.discountPercentage}% ${t("discount_badge")}</span></td>
                <td>${c.minOrderAmount} ${t("egp")}</td>
                <td><small>${new Date(c.expirationDate).toLocaleDateString(dateLocale)}</small></td>
                <td><span class="badge bg-light text-dark border">${c.usedCount}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteCouponFromDB('${c._id}')"><i class="fa-solid fa-trash-can"></i> ${t("delete")}</button>
                </td>
            </tr>
        `,
      )
      .join("");
  } catch (e) {}
}

async function addNewCouponToDB(e) {
  e.preventDefault();
  const code = document.getElementById("couponCode").value;
  const discountPercentage = document.getElementById("couponPercentage").value;
  const minOrderAmount = document.getElementById("couponMinOrder").value;
  const expirationDate = document.getElementById("couponExpiration").value;

  try {
    const savedToken = localStorage.getItem("ora_user_token");
    const headers = { "Content-Type": "application/json" };
    if (savedToken) headers["Authorization"] = "Bearer " + savedToken;

    const res = await fetch("/api/coupons", {
      method: "POST",
      headers,
      body: JSON.stringify({
        code,
        discountPercentage,
        minOrderAmount,
        expirationDate,
      }),
    });
    const data = await res.json();
    if (data.success) {
      fetchCouponsFromDB();
      bootstrap.Modal.getInstance(
        document.getElementById("addCouponModal"),
      ).hide();
    } else {
      alert(data.message || t("alert_server_error"));
    }
  } catch (e) {}
}

async function deleteCouponFromDB(id) {
  if (!confirm(t("alert_delete_coupon_confirm"))) return;
  try {
    const savedToken = localStorage.getItem("ora_user_token");
    const headers = {};
    if (savedToken) headers["Authorization"] = "Bearer " + savedToken;

    const res = await fetch("/api/coupons/" + id, {
      method: "DELETE",
      headers,
    });
    const data = await res.json();
    if (data.success) {
      fetchCouponsFromDB();
    }
  } catch (e) {}
}

async function fetchDeliveryAreasFromDB() {
  const tbody = document.getElementById("deliveryAreasAdminTableBody");
  if (!tbody) return;

  try {
    const res = await fetch("/api/delivery-areas");
    const data = await res.json();
    allDeliveryAreasList = data.areas || [];

    if (allDeliveryAreasList.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted fw-bold">${t("delivery_empty")}</td></tr>`;
      return;
    }

    tbody.innerHTML = allDeliveryAreasList
      .map(
        (a) => `
            <tr>
                <td><strong>${escapeHTML(a.areaName)}</strong></td>
                <td><strong class="text-danger">${a.deliveryFee} ${t("egp")}</strong></td>
                <td>${a.minOrderAmount} ${t("egp")}</td>
                <td><small>${a.estimatedTimeMinutes} min</small></td>
                <td>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteDeliveryAreaFromDB('${a._id}')"><i class="fa-solid fa-trash-can"></i> ${t("delete")}</button>
                </td>
            </tr>
        `,
      )
      .join("");
  } catch (e) {}
}

async function addNewDeliveryAreaToDB(e) {
  e.preventDefault();
  const areaName = document.getElementById("areaName").value;
  const deliveryFee = document.getElementById("areaDeliveryFee").value;
  const minOrderAmount = document.getElementById("areaMinOrder").value;

  try {
    const savedToken = localStorage.getItem("ora_user_token");
    const headers = { "Content-Type": "application/json" };
    if (savedToken) headers["Authorization"] = "Bearer " + savedToken;

    const res = await fetch("/api/delivery-areas", {
      method: "POST",
      headers,
      body: JSON.stringify({ areaName, deliveryFee, minOrderAmount }),
    });
    const data = await res.json();
    if (data.success) {
      fetchDeliveryAreasFromDB();
      bootstrap.Modal.getInstance(
        document.getElementById("addDeliveryAreaModal"),
      ).hide();
    } else {
      alert(data.message || t("alert_server_error"));
    }
  } catch (e) {}
}

async function deleteDeliveryAreaFromDB(id) {
  if (!confirm(t("alert_delete_delivery_confirm"))) return;
  try {
    const savedToken = localStorage.getItem("ora_user_token");
    const headers = {};
    if (savedToken) headers["Authorization"] = "Bearer " + savedToken;

    const res = await fetch("/api/delivery-areas/" + id, {
      method: "DELETE",
      headers,
    });
    const data = await res.json();
    if (data.success) {
      fetchDeliveryAreasFromDB();
    }
  } catch (e) {}
}

async function fetchTablesFromDB() {
  const tbody = document.getElementById("tablesAdminTableBody");
  if (!tbody) return;

  try {
    const savedToken = localStorage.getItem("ora_user_token");
    const headers = savedToken ? { Authorization: "Bearer " + savedToken } : {};
    const res = await fetch("/api/tables", { headers });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);

    allTablesList = data.tables || [];
    if (!allTablesList.length) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted fw-bold">${t("tables_empty")}</td></tr>`;
      return;
    }

    tbody.innerHTML = allTablesList
      .map(
        (table) => `
            <tr>
                <td><strong>${escapeHTML(table.tableNumber)}</strong></td>
                <td>${table.seats}</td>
                <td>
                    <select class="form-select form-select-sm" onchange="updateTableStatus('${table._id}', this.value)">
                        <option value="available" ${table.status === "available" ? "selected" : ""}>${t("table_status_available")}</option>
                        <option value="reserved" ${table.status === "reserved" ? "selected" : ""}>${t("table_status_reserved")}</option>
                        <option value="occupied" ${table.status === "occupied" ? "selected" : ""}>${t("table_status_occupied")}</option>
                    </select>
                </td>
                <td>${escapeHTML(table.notes || "-")}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="editTable('${table._id}')">${t("edit")}</button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteTable('${table._id}')">${t("delete")}</button>
                </td>
            </tr>
        `,
      )
      .join("");
  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-danger">${t("table_load_error")}</td></tr>`;
  }
}

function openTableModal(table = null) {
  document.getElementById("tableId").value = table ? table._id : "";
  document.getElementById("tableNumber").value = table ? table.tableNumber : "";
  document.getElementById("tableSeats").value = table ? table.seats : "";
  document.getElementById("tableStatus").value = table
    ? table.status
    : "available";
  document.getElementById("tableNotes").value = table ? table.notes || "" : "";
  document.getElementById("tableModalTitle").innerHTML =
    `<i class="fa-solid fa-chair"></i> ${table ? t("table_modal_edit_title") : t("table_modal_add_title")}`;
  bootstrap.Modal.getOrCreateInstance(
    document.getElementById("tableModal"),
  ).show();
}

function editTable(id) {
  const table = allTablesList.find((item) => item._id === id);
  if (table) openTableModal(table);
}

async function saveTable(event) {
  event.preventDefault();
  const id = document.getElementById("tableId").value;
  const payload = {
    tableNumber: document.getElementById("tableNumber").value.trim(),
    seats: Number(document.getElementById("tableSeats").value),
    status: document.getElementById("tableStatus").value,
    notes: document.getElementById("tableNotes").value.trim(),
  };

  try {
    const savedToken = localStorage.getItem("ora_user_token");
    const res = await fetch(id ? "/api/tables/" + id : "/api/tables", {
      method: id ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + savedToken,
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!data.success)
      return alert(data.message || t("alert_save_table_error"));
    bootstrap.Modal.getInstance(document.getElementById("tableModal")).hide();
    fetchTablesFromDB();
  } catch (error) {
    alert(t("alert_save_table_error"));
  }
}

async function updateTableStatus(id, status) {
  try {
    const savedToken = localStorage.getItem("ora_user_token");
    const res = await fetch("/api/tables/" + id, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + savedToken,
      },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!data.success) alert(data.message || t("alert_update_table_error"));
    fetchTablesFromDB();
  } catch (error) {
    alert(t("alert_update_table_error"));
    fetchTablesFromDB();
  }
}

async function deleteTable(id) {
  if (!confirm(t("alert_delete_table_confirm"))) return;
  try {
    const savedToken = localStorage.getItem("ora_user_token");
    const res = await fetch("/api/tables/" + id, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + savedToken },
    });
    const data = await res.json();
    if (!data.success)
      return alert(data.message || t("alert_delete_table_error"));
    fetchTablesFromDB();
  } catch (error) {
    alert(t("alert_delete_table_error"));
  }
}

async function fetchReviewsFromDB() {
  const tbody = document.getElementById("reviewsAdminTableBody");
  if (!tbody) return;

  try {
    const savedToken = localStorage.getItem("ora_user_token");
    const headers = {};
    if (savedToken) headers["Authorization"] = "Bearer " + savedToken;

    const res = await fetch("/api/reviews/admin/all", { headers });
    const data = await res.json();
    const reviews = data.reviews || [];

    if (reviews.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted fw-bold">${t("reviews_empty")}</td></tr>`;
      return;
    }

    tbody.innerHTML = reviews
      .map(
        (r) => `
            <tr>
                <td><strong>${escapeHTML(r.userName || t("guest_customer"))}</strong></td>
                <td><small class="fw-bold text-dark">${r.productId ? escapeHTML(r.productId.title) : "-"}</small></td>
                <td><span class="badge bg-warning text-dark"><i class="fa-solid fa-star me-1 text-dark"></i> ${r.foodRating || 5} / 5</span></td>
                <td><small>${escapeHTML(r.comment || "-")}</small></td>
                <td>
                    <span class="badge ${r.isApproved ? "bg-success" : "bg-secondary"}">
                        ${r.isApproved ? t("reviews_status_approved") : t("reviews_status_hidden")}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-dark me-1" onclick="toggleReviewApprovalInDB('${r._id}')">
                        ${r.isApproved ? t("reviews_action_hide") : t("reviews_action_approve")}
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteReviewFromDB('${r._id}')"><i class="fa-solid fa-trash-can"></i></button>
                </td>
            </tr>
        `,
      )
      .join("");
  } catch (e) {}
}

async function toggleReviewApprovalInDB(id) {
  try {
    const savedToken = localStorage.getItem("ora_user_token");
    const headers = {};
    if (savedToken) headers["Authorization"] = "Bearer " + savedToken;

    const res = await fetch("/api/reviews/" + id + "/toggle-approval", {
      method: "PUT",
      headers,
    });
    const data = await res.json();
    fetchReviewsFromDB();
  } catch (e) {}
}

async function deleteReviewFromDB(id) {
  if (!confirm(t("alert_delete_review_confirm"))) return;
  try {
    const savedToken = localStorage.getItem("ora_user_token");
    const headers = {};
    if (savedToken) headers["Authorization"] = "Bearer " + savedToken;

    const res = await fetch("/api/reviews/" + id, {
      method: "DELETE",
      headers,
    });
    const data = await res.json();
    if (data.success) {
      fetchReviewsFromDB();
    }
  } catch (e) {}
}

// 6. English English English
async function loadAllUsersAdmin() {
  const tbody = document.getElementById("usersAdminTableBody");
  if (!tbody) return;

  try {
    const savedToken = localStorage.getItem("ora_user_token");
    const headers = {};
    if (savedToken) headers["Authorization"] = "Bearer " + savedToken;

    const res = await fetch("/api/auth/users", { headers });
    const data = await res.json();
    const users = Array.isArray(data.users) ? data.users : [];

    if (users.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-4">${t("users_empty")}</td></tr>`;
      return;
    }

    tbody.innerHTML = users
      .map(
        (u) => `
            <tr>
                <td>
                    <strong>${escapeHTML(u.name)}</strong><br>
                    <small class="text-muted">${escapeHTML(u.email)}</small>
                </td>
                <td>
                    <span class="badge ${u.role === "superadmin" ? "bg-warning text-dark" : u.role === "staff" ? "bg-info text-dark" : "bg-secondary"}">
                        ${u.role === "superadmin" ? t("role_superadmin") : u.role === "staff" ? t("role_staff") : t("role_client")}
                    </span>
                </td>
                <td>
                    <span class="badge ${u.isBanned ? "bg-danger" : "bg-success"}">
                        ${u.isBanned ? t("users_status_banned") : t("users_status_active")}
                    </span>
                </td>
                <td>
                    ${
                      u.role !== "superadmin"
                        ? `
                        <button class="btn btn-sm btn-outline-primary ms-1" onclick="promoteUser('${u._id}')">
                            ${u.role === "staff" ? t("users_demote_to_client") : t("users_promote_to_staff")}
                        </button>
                        <button class="btn btn-sm ${u.isBanned ? "btn-outline-success" : "btn-outline-danger"} ms-1" onclick="toggleBanUser('${u._id}')">
                            ${u.isBanned ? t("users_unban") : t("users_ban")}
                        </button>
                        <button class="btn btn-sm btn-outline-danger ms-1" onclick="deleteUserFromAdminDB('${u._id}')">
                            <i class="fa-solid fa-trash-can"></i> ${t("users_delete")}
                        </button>
                    `
                        : `<small class="text-muted">${t("users_superadmin_protected")}</small>`
                    }
                </td>
            </tr>
        `,
      )
      .join("");
  } catch (e) {}
}

async function promoteUser(userId) {
  try {
    const savedToken = localStorage.getItem("ora_user_token");
    const headers = {};
    if (savedToken) headers["Authorization"] = "Bearer " + savedToken;

    const res = await fetch("/api/auth/promote/" + userId, {
      method: "PUT",
      headers,
    });
    const data = await res.json();
    alert(data.message);
    loadAllUsersAdmin();
  } catch (e) {}
}

async function toggleBanUser(userId) {
  try {
    const savedToken = localStorage.getItem("ora_user_token");
    const headers = {};
    if (savedToken) headers["Authorization"] = "Bearer " + savedToken;

    const res = await fetch("/api/auth/ban/" + userId, {
      method: "PUT",
      headers,
    });
    const data = await res.json();
    alert(data.message);
    loadAllUsersAdmin();
  } catch (e) {}
}

async function deleteUserFromAdminDB(userId) {
  if (!confirm(t("alert_delete_user_confirm"))) return;

  try {
    const savedToken = localStorage.getItem("ora_user_token");
    const headers = {};
    if (savedToken) headers["Authorization"] = "Bearer " + savedToken;

    const res = await fetch("/api/auth/users/" + userId, {
      method: "DELETE",
      headers,
    });
    const data = await res.json();
    alert(data.message);
    loadAllUsersAdmin();
  } catch (e) {
    alert(t("alert_server_error"));
  }
}

// ================= 7. English English English (Audit Logs) =================
async function fetchAuditLogsFromDB() {
  const tbody = document.getElementById("auditLogsBody");
  if (!tbody) return;
  const isEn = getActiveLanguage() === "en";
  const dateLocale = isEn ? "en-GB" : "ar-EG";

  tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted"><i class="fa-solid fa-spinner fa-spin"></i> ${t("audit_loading")}</td></tr>`;

  try {
    const savedToken = localStorage.getItem("ora_user_token");
    const headers = {};
    if (savedToken) headers["Authorization"] = "Bearer " + savedToken;

    const res = await fetch("/api/admin/audit-logs", { headers });
    const data = await res.json();
    const logs = (data && data.logs) || [];

    if (!logs.length) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted fw-bold">${t("audit_empty")}</td></tr>`;
      return;
    }

    tbody.innerHTML = logs
      .map(
        (l) => `
            <tr>
                <td>${escapeHTML(l.adminName || "-")}</td>
                <td>${escapeHTML(l.email || "-")}</td>
                <td>${escapeHTML(l.action || "-")}</td>
                <td><span class="badge ${l.success === false ? "bg-danger" : "bg-success"}">${l.success === false ? t("audit_status_failed") : t("audit_status_success")}</span></td>
                <td><small>${escapeHTML(l.ipAddress || "-")}</small></td>
                <td><small>${l.createdAt ? new Date(l.createdAt).toLocaleString(dateLocale) : "-"}</small></td>
            </tr>
        `,
      )
      .join("");
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted small">${t("audit_error")}</td></tr>`;
  }
}

// =========================================================
// English English English English English English (English English English + English)
// =========================================================

function handleImageFileUpload(fileInput, urlInputId, previewImgId) {
  const file = fileInput.files[0];
  const previewContainer = document.getElementById(previewImgId + "Container");
  const previewImg = document.getElementById(previewImgId);
  const urlInput = document.getElementById(urlInputId);

  if (file) {
    if (!file.type.startsWith("image/")) {
      alert(t("alert_image_invalid"));
      fileInput.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      const base64Data = e.target.result;
      if (urlInput) urlInput.value = base64Data;
      if (previewImg) previewImg.src = base64Data;
      if (previewContainer) previewContainer.classList.remove("d-none");
    };
    reader.readAsDataURL(file);
  }
}

function handleImageUrlInput(urlValue, previewImgId) {
  const previewContainer = document.getElementById(previewImgId + "Container");
  const previewImg = document.getElementById(previewImgId);

  if (urlValue && urlValue.trim().length > 5) {
    if (previewImg) previewImg.src = urlValue.trim();
    if (previewContainer) previewContainer.classList.remove("d-none");
  } else {
    if (previewContainer) previewContainer.classList.add("d-none");
  }
}

function clearImageSelection(
  fileInputId,
  urlInputId,
  previewContainerId,
  previewImgId,
) {
  const fileInput = document.getElementById(fileInputId);
  const urlInput = document.getElementById(urlInputId);
  const previewContainer = document.getElementById(previewContainerId);
  const previewImg = document.getElementById(previewImgId);

  if (fileInput) fileInput.value = "";
  if (urlInput) urlInput.value = "";
  if (previewImg) previewImg.src = "";
  if (previewContainer) previewContainer.classList.add("d-none");
}

function initDragAndDropForUploads() {
  const zones = [
    {
      dropId: "dishDropZone",
      fileId: "dishImgFile",
      urlId: "dishImg",
      prevId: "dishImgPreview",
    },
    {
      dropId: "editDishDropZone",
      fileId: "editDishImgFile",
      urlId: "editDishImg",
      prevId: "editDishImgPreview",
    },
  ];

  zones.forEach((z) => {
    const dropZone = document.getElementById(z.dropId);
    if (!dropZone) return;

    ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
      dropZone.addEventListener(
        eventName,
        (e) => {
          e.preventDefault();
          e.stopPropagation();
        },
        false,
      );
    });

    ["dragenter", "dragover"].forEach((eventName) => {
      dropZone.addEventListener(
        eventName,
        () => dropZone.classList.add("dragover"),
        false,
      );
    });

    ["dragleave", "drop"].forEach((eventName) => {
      dropZone.addEventListener(
        eventName,
        () => dropZone.classList.remove("dragover"),
        false,
      );
    });

    dropZone.addEventListener("drop", (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files && files.length > 0) {
        const fileInput = document.getElementById(z.fileId);
        if (fileInput) {
          fileInput.files = files;
          handleImageFileUpload(fileInput, z.urlId, z.prevId);
        }
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initDragAndDropForUploads();
});

// English English English English (Window Exports)
window.restaurantSettings = window.restaurantSettings || {};
window.openTableModal = openTableModal;
window.editTable = editTable;
window.saveTable = saveTable;
window.updateTableStatus = updateTableStatus;
window.deleteTable = deleteTable;

window.handleImageFileUpload = handleImageFileUpload;
window.handleImageUrlInput = handleImageUrlInput;
window.clearImageSelection = clearImageSelection;
window.saveQZPrintingSettings = saveQZPrintingSettings;
window.refreshQZPrintersList = refreshQZPrintersList;
window.testQZPrint = testQZPrint;
window.claimPrimaryPrinterRole = claimPrimaryPrinterRole;
window.printThermalReceiptById = printThermalReceiptById;

window.setMockupViewMode = setMockupViewMode;
window.previewDesignTemplate = previewDesignTemplate;
window.applyDesignTemplate = applyDesignTemplate;
window.resetToDefaultTheme = resetToDefaultTheme;
window.updateLivePreviewStyles = updateLivePreviewStyles;
window.updateLivePreviewTexts = updateLivePreviewTexts;
window.saveFullSiteBuilderSettingsToDB = saveFullSiteBuilderSettingsToDB;
window.saveFullRestaurantSettingsToDB = saveFullRestaurantSettingsToDB;
