(function (global) {
  "use strict";

  const DRAFT_KEY = "ora_order_draft";
  const defaults = {
    orderType: "delivery",
    tableId: null,
    tableNumber: null,
    customerName: "",
    phone: "",
    extraPhone: "",
    address: "",
    latitude: null,
    longitude: null,
    notes: "",
  };
  let state = { ...defaults };

  const save = () => localStorage.setItem(DRAFT_KEY, JSON.stringify(state));
  const input = (id) => document.getElementById(id);

  function markup() {
    const t = (key) => (global.SiteI18n ? global.SiteI18n.t(key) : key);
    return `
      <div class="cart-total-banner d-flex justify-content-between align-items-center mb-3">
        <span class="d-flex align-items-center gap-2">
          <i class="fa-solid fa-receipt text-warning"></i>
          <span data-i18n="cart_total">${t("cart_total") || "English English:"}</span>
        </span>
        <span id="cartDrawerTotal" class="fw-black text-danger fs-5">0 ${t("egp") || "English.English"}</span>
      </div>

      <div id="cartDrawerItems" class="cart-items-wrapper"></div>

      <div class="card border-0 bg-light-subtle rounded-3 p-3 my-3 shadow-sm border">
        <label class="form-label small fw-bold mb-2 d-flex align-items-center gap-2" data-i18n="coupon_prompt">
          <i class="fa-solid fa-tag text-warning"></i> ${t("coupon_prompt") || "English English English English"}
        </label>
        <div class="input-group">
          <input type="text" id="couponCodeInput" class="form-control text-uppercase" placeholder="${t("coupon_placeholder") || "SAVE20"}">
          <button type="button" class="btn btn-brand-dark px-3 fw-bold" data-i18n="coupon_apply" onclick="applyCouponDiscount()">
            <i class="fa-solid fa-check"></i> ${t("coupon_apply") || "English"}
          </button>
        </div>
        <div id="couponMessage" class="mt-2 small fw-bold"></div>
      </div>

      <form id="unifiedCartCheckoutForm" class="mt-3 border-top pt-3" onsubmit="submitOrder(event)">
        <div class="mb-3">
          <label class="form-label small fw-bold d-flex align-items-center gap-2" data-i18n="cart_order_type_label">
            <i class="fa-solid fa-bag-shopping text-warning"></i> ${t("cart_order_type_label") || "English English *"}
          </label>
          <select id="orderType" class="form-select" required>
            <option value="delivery" data-i18n="cart_order_type_delivery">${t("cart_order_type_delivery") || "English (English)"}</option>
            <option value="takeaway" data-i18n="cart_order_type_takeaway">${t("cart_order_type_takeaway") || "English English (English)"}</option>
            <option value="dinein" data-i18n="cart_order_type_dinein">${t("cart_order_type_dinein") || "English (English English)"}</option>
          </select>
        </div>

        <div id="tableSelectionSection" class="mb-3 d-none">
          <label class="form-label small fw-bold d-flex align-items-center gap-2" data-i18n="table_number">
            <i class="fa-solid fa-chair text-warning"></i> ${t("table_number") || "English English *"}
          </label>
          <select id="custTableNumber" class="form-select">
            <option value="" data-i18n="cart_table_loading">${t("cart_table_loading") || "English English English..."}</option>
          </select>
          <div id="tableAvailabilityMessage" class="small text-danger mt-1 d-none"></div>
          <button id="tableRetryBtn" type="button" class="btn btn-sm btn-outline-secondary mt-1 d-none" data-i18n="cart_table_retry">
            <i class="fa-solid fa-rotate"></i> ${t("cart_table_retry") || "English English English"}
          </button>
        </div>

        <div class="mb-3">
          <label class="form-label small fw-bold d-flex align-items-center gap-2" data-i18n="customer_name">
            <i class="fa-solid fa-user text-warning"></i> ${t("customer_name") || "English English *"}
          </label>
          <input id="custName" class="form-control" placeholder="${t("customer_name_placeholder") || "English English English"}" required>
        </div>

        <div class="mb-3">
          <label class="form-label small fw-bold d-flex align-items-center gap-2" data-i18n="phone">
            <i class="fa-solid fa-phone text-warning"></i> ${t("phone") || "English English English *"}
          </label>
          <input id="custPhone" type="tel" class="form-control" placeholder="${t("phone_placeholder") || "01012345678"}" required>
        </div>

        <div class="mb-3">
          <label class="form-label small fw-bold d-flex align-items-center gap-2" data-i18n="extra_phone">
            <i class="fa-solid fa-mobile-screen-button text-warning"></i> ${t("extra_phone") || "English English English"}
          </label>
          <input id="custExtraPhone" type="tel" class="form-control" placeholder="${t("extra_phone_placeholder") || "English English English (English)"}">
        </div>

        <div id="deliveryFields">
          <div class="mb-3">
            <label class="form-label small fw-bold d-flex align-items-center gap-2" data-i18n="delivery_area">
              <i class="fa-solid fa-map-location-dot text-warning"></i> ${t("delivery_area") || "English English English *"}
            </label>
            <select id="deliveryAreaSelect" class="form-select" onchange="updateDeliveryFeeFromSelect()">
              <option value="" data-i18n="delivery_loading">${t("delivery_loading") || "English English English English..."}</option>
            </select>
          </div>

          <div class="mb-3">
            <label class="form-label small fw-bold d-flex align-items-center gap-2" data-i18n="address">
              <i class="fa-solid fa-location-dot text-warning"></i> ${t("address") || "English English *"}
            </label>
            <textarea id="custAddress" class="form-control" rows="2" placeholder="${t("address_placeholder") || "English English English English English..."}"></textarea>
          </div>

          <div class="mb-3">
            <button id="gpsLocateBtn" type="button" class="btn btn-sm btn-outline-dark w-100 py-2 d-flex align-items-center justify-content-center gap-2" data-i18n="gps_button">
              <i class="fa-solid fa-location-crosshairs text-warning"></i>
              <span>${t("gps_button") || "English English English English GPS"}</span>
            </button>
            <div id="gpsStatus" class="small text-muted mt-1 text-center"></div>
            <input id="custLat" type="hidden">
            <input id="custLng" type="hidden">
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label small fw-bold d-flex align-items-center gap-2" data-i18n="notes">
            <i class="fa-solid fa-comment-dots text-warning"></i> ${t("notes") || "English"}
          </label>
          <input id="custNotes" class="form-control" placeholder="${t("notes_placeholder") || "English: English English / English English"}">
        </div>

        <div class="bg-light p-3 rounded-3 border mb-3 shadow-sm">
          <div class="d-flex justify-content-between small mb-1">
            <span class="text-muted" data-i18n="subtotal">${t("subtotal") || "English English:"}</span>
            <span id="summarySubtotal" class="fw-bold">0 ${t("egp") || "English.English"}</span>
          </div>
          <div class="d-flex justify-content-between small mb-1">
            <span class="text-muted" data-i18n="discount">${t("discount") || "English English:"}</span>
            <span id="summaryDiscount" class="fw-bold text-success">0 ${t("egp") || "English.English"}</span>
          </div>
          <div class="d-flex justify-content-between small mb-2">
            <span class="text-muted" data-i18n="delivery_fee">${t("delivery_fee") || "English English:"}</span>
            <span id="summaryDeliveryFee" class="fw-bold">0 ${t("egp") || "English.English"}</span>
          </div>
          <hr class="my-2 border-secondary-subtle">
          <div class="d-flex justify-content-between align-items-center pt-1">
            <span class="fw-bold fs-6" data-i18n="grand_total">${t("grand_total") || "English English:"}</span>
            <span id="summaryFinalTotal" class="fw-black text-danger fs-5">0 ${t("egp") || "English.English"}</span>
          </div>
        </div>

        <button type="submit" id="submitOrderBtn" class="btn btn-brand-red w-100 py-3 fw-bold fs-6 shadow-sm d-flex align-items-center justify-content-center gap-2" data-i18n="submit_order">
          <i class="fa-solid fa-paper-plane"></i>
          <span>${t("submit_order") || "English English English"}</span>
        </button>
      </form>`;
  }

  function hydrate() {
    [
      "custName",
      "custPhone",
      "custExtraPhone",
      "custAddress",
      "custNotes",
    ].forEach((id) => {
      const key = {
        custName: "customerName",
        custPhone: "phone",
        custExtraPhone: "extraPhone",
        custAddress: "address",
        custNotes: "notes",
      }[id];
      if (input(id)) input(id).value = state[key] || "";
    });
    if (input("orderType")) input("orderType").value = state.orderType || "delivery";
    if (input("custLat")) input("custLat").value = state.latitude || "";
    if (input("custLng")) input("custLng").value = state.longitude || "";
  }

  function sync() {
    const type = input("orderType") ? input("orderType").value : "delivery";
    state.orderType = type;
    const requiresTable = ["dinein", "takeaway"].includes(type);
    const delivery = type === "delivery";

    const tableSec = input("tableSelectionSection");
    const deliverySec = input("deliveryFields");
    const tableSelect = input("custTableNumber");
    const addressInput = input("custAddress");

    if (tableSec) tableSec.classList.toggle("d-none", !requiresTable);
    if (deliverySec) deliverySec.classList.toggle("d-none", !delivery);
    if (tableSelect) {
      tableSelect.required = requiresTable;
      tableSelect.disabled =
        !requiresTable || tableSelect.dataset.tablesAvailable === "false";
      if (!requiresTable) {
        state.tableId = null;
        state.tableNumber = null;
        tableSelect.value = "";
      }
    }
    if (addressInput) addressInput.required = delivery;

    if (typeof global.updateDeliveryFeeFromSelect === "function") {
      global.updateDeliveryFeeFromSelect();
    }
    save();
  }

  async function locate() {
    const status = input("gpsStatus");
    const button = input("gpsLocateBtn");
    if (!navigator.geolocation) {
      if (status) status.textContent = "English English English English English English";
      return;
    }
    if (button) button.disabled = true;
    if (status) status.textContent = "English English English...";

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        state.latitude = latitude;
        state.longitude = longitude;
        if (input("custLat")) input("custLat").value = latitude;
        if (input("custLng")) input("custLng").value = longitude;
        if (status) status.textContent = "English English English English";
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
          );
          const data = await response.json();
          if (data.display_name && input("custAddress") && !input("custAddress").value.trim()) {
            input("custAddress").value = data.display_name;
          }
        } catch (_) {}
        persistInputs();
        if (button) button.disabled = false;
      },
      (error) => {
        if (status) {
          status.textContent =
            {
              1: "English English English English English.",
              2: "English English English English.",
              3: "English English English English.",
            }[error.code] || "English English English English.";
        }
        if (button) button.disabled = false;
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }

  function persistInputs() {
    state.customerName = input("custName") ? input("custName").value.trim() : "";
    state.phone = input("custPhone") ? input("custPhone").value.trim() : "";
    state.extraPhone = input("custExtraPhone") ? input("custExtraPhone").value.trim() : "";
    state.address = input("custAddress") ? input("custAddress").value.trim() : "";
    state.notes = input("custNotes") ? input("custNotes").value : "";
    save();
  }

  function mount() {
    const body = document.querySelector(".cart-drawer-body");
    if (!body || body.dataset.unifiedCartMounted) return;
    try {
      state = {
        ...defaults,
        ...JSON.parse(localStorage.getItem(DRAFT_KEY) || "{}"),
      };
    } catch (_) {
      state = { ...defaults };
    }
    body.dataset.unifiedCartMounted = "true";
    body.innerHTML = markup();
    hydrate();
    if (global.SiteI18n) global.SiteI18n.applyTranslations();

    [
      "custName",
      "custPhone",
      "custExtraPhone",
      "custAddress",
      "custNotes",
    ].forEach((id) => {
      const el = input(id);
      if (el) el.addEventListener("input", persistInputs);
    });

    const orderTypeSelect = input("orderType");
    if (orderTypeSelect) {
      orderTypeSelect.addEventListener("change", () => {
        sync();
        if (
          ["dinein", "takeaway"].includes(state.orderType) &&
          global.loadAvailableTablesFromDB
        ) {
          global.loadAvailableTablesFromDB();
        }
        if (state.orderType === "delivery") locate();
      });
    }

    const tableSelect = input("custTableNumber");
    if (tableSelect) {
      tableSelect.addEventListener("change", (event) => {
        const option = event.target.selectedOptions[0];
        state.tableNumber = event.target.value || null;
        state.tableId = option ? option.dataset.tableId || null : null;
        save();
      });
    }

    const gpsBtn = input("gpsLocateBtn");
    if (gpsBtn) gpsBtn.addEventListener("click", locate);

    const retryBtn = input("tableRetryBtn");
    if (retryBtn) {
      retryBtn.addEventListener(
        "click",
        () =>
          global.loadAvailableTablesFromDB && global.loadAvailableTablesFromDB(),
      );
    }

    sync();
    if (state.orderType === "delivery") locate();
  }

  global.UnifiedCartCheckout = {
    mount,
    sync,
    state: () => state,
    persistInputs,
  };
})(window);
