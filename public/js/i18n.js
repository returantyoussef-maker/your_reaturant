(() => {
  "use strict";

  const langStorageKey = "siteLang";
  const themeStorageKey = "siteTheme";
  const cacheStorageKey = "site_trans_cache_ar_en";

  // ================= 1. Translation cache memory (Cache) =================
  let memoryCache = {};
  try {
    const savedCache = localStorage.getItem(cacheStorageKey);
    if (savedCache) {
      memoryCache = JSON.parse(savedCache);
    }
  } catch (_) {
    memoryCache = {};
  }

  function saveCacheToStorage() {
    try {
      localStorage.setItem(cacheStorageKey, JSON.stringify(memoryCache));
    } catch (e) {
      // If localStorage is full, clear older entries
      if (e.name === "QuotaExceededError") {
        const keys = Object.keys(memoryCache);
        if (keys.length > 500) {
          for (let i = 0; i < 200; i++) delete memoryCache[keys[i]];
          try {
            localStorage.setItem(cacheStorageKey, JSON.stringify(memoryCache));
          } catch (_) {}
        }
      }
    }
  }

  function getCachedTranslation(text) {
    const clean = text.trim();
    return memoryCache[clean] || null;
  }

  function setCachedTranslation(original, translated) {
    const cleanOrig = original.trim();
    const cleanTrans = translated.trim();
    if (!cleanOrig || !cleanTrans || cleanOrig === cleanTrans) return;
    memoryCache[cleanOrig] = cleanTrans;
    saveCacheToStorage();
  }

  // ================= 2. Cloud translation engines (MyMemory + Google Fallback) =================
  const ARABIC_REGEX = /[\u0600-\u06FF]/;

  // Check whether text contains Arabic characters that require translation
  function containsArabic(text) {
    return ARABIC_REGEX.test(text);
  }

  // Engine 1: MyMemory API
  async function translateWithMyMemory(text, fromLang = "ar", toLang = "en") {
    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${fromLang}|${toLang}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("MyMemory network error");
      const data = await response.json();
      if (data && data.responseData && data.responseData.translatedText) {
        const result = data.responseData.translatedText.trim();
        // Verify that the result is valid rather than an error or usage-limit message
        if (
          result &&
          !result.includes("MYMEMORY WARNING") &&
          !result.includes("QUERY LENGTH LIMIT")
        ) {
          return result;
        }
      }
      throw new Error("MyMemory translation unavailable");
    } catch (err) {
      return null; // Fall back to the alternative engine
    }
  }

  // Engine 2: Google Translate Web Engine (fallback if MyMemory fails)
  async function translateWithGoogleFallback(
    text,
    fromLang = "ar",
    toLang = "en",
  ) {
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${fromLang}&tl=${toLang}&dt=t&q=${encodeURIComponent(text)}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Google fallback error");
      const data = await response.json();
      if (data && data[0]) {
        let fullTrans = "";
        data[0].forEach((item) => {
          if (item && item[0]) fullTrans += item[0];
        });
        if (fullTrans.trim()) return fullTrans.trim();
      }
      throw new Error("Google fallback empty");
    } catch (err) {
      return null;
    }
  }

  // Smart engine integrated with the cache: checks cache, then MyMemory, then Google
  async function translateText(text, fromLang = "ar", toLang = "en") {
    const trimmed = text.trim();
    if (!trimmed || !containsArabic(trimmed)) return trimmed;

    // 1. Cache first (0 Token & 0ms)
    const cached = getCachedTranslation(trimmed);
    if (cached) return cached;

    // 2. Try MyMemory
    let result = await translateWithMyMemory(trimmed, fromLang, toLang);

    // 3. Fall back to Google Translate if MyMemory fails
    if (!result) {
      result = await translateWithGoogleFallback(trimmed, fromLang, toLang);
    }

    if (result && result !== trimmed) {
      setCachedTranslation(trimmed, result);
      return result;
    }

    return trimmed;
  }

  // ================= 3. Fast static dictionary (Static Dictionary) =================
  const translations = {
    ar: {
      nav_home: "Home",
      nav_menu: "Menu",
      nav_food_menu: "Food Menu",
      nav_track: "Track Order",
      nav_contact: "Contact Us",
      nav_cart: "Cart",
      nav_login: "Sign In / Create Account",
      login: "Sign In",
      register: "Create Account",
      logout: "Logout",
      close: "Close",
      done: "Done",
      save: "Save",
      edit: "Edit",
      delete: "Delete",
      cancel: "Cancel",
      confirm: "Confirm",
      actions: "Actions",
      loading: "Loading...",
      search: "Search...",
      egp: "EGP",
      all: "All",
      status: "Status",
      notes: "Notes",
      yes: "Yes",
      no: "No",
      details: "Details",
      order_now: "Order Now",
      order_new: "Start a New Order",
      order_meal_now: "Order This Meal Now",
      today_deals: "Today's Deals",
      view_full_menu: "View Full Menu",
      browse_menu: "Browse the Full Menu",
      reorder_prompt:
        "Welcome back — would you like to repeat your last order?",
      reorder_last: "Repeat Last Order",
      stat_years: "Established in",
      stat_rating: "Customer Rating",
      stat_happy: "Happy Customers",
      trust_fast: "Fast delivery within 30 minutes",
      trust_fresh: "Fresh grills made daily",
      trust_safe: "Secure cash on delivery",
      trust_rating: "Rated 4.8 by our customers",
      limited_deals: "Limited Deals",
      popular: "Most Popular",
      customer_rating: "Customer Ratings",
      top_rated: "Top Rated & Popular",
      top_rated_copy:
        "Dishes and meals that received the highest customer ratings",
      recent_viewed: "Recently Viewed Meals",
      deals_section_default_title: "Top Deals & Daily Discounts",
      deals_section_default_sub:
        "Premium meals at discounted prices for a limited time",
      top_sellers_default_title: "Top 10 Best Selling Items",
      top_sellers_default_sub:
        "The golden selection of meals loved by our customers",
      menu_page_title: "Full Food Menu",
      menu_page_subtitle:
        "Explore our delicious grills, clay pots, and authentic freshly prepared countryside baked dishes",
      search_food: "Search Dishes:",
      search_food_placeholder:
        "Search by meal name or ingredients (e.g. Kebab, Clay pot, Grills...)",
      sort_menu: "Sort Menu By:",
      newest: "Newest First (Default)",
      price_low: "Price: Low to High",
      price_high: "Price: High to Low",
      best_selling: "Best Selling",
      highest_rated: "Highest Rated",
      add_to_cart: "Add to Order",
      add_to_cart_custom: "Add to Order (Customize)",
      discount_badge: "Discount",
      fresh_meal_daily: "Freshly prepared daily",
      no_dishes_matched: "No matching dishes found",
      error_loading_dishes: "Unable to load dishes from server",
      loading_more_dishes: "Loading more dishes...",
      all_dishes_loaded: "All dishes loaded",
      back_to_menu: "Back to Menu",
      customize_meal: "Customize Meal",
      choose_size: "Choose Size / Portion:",
      addons: "Available Add-ons & Sauces:",
      choose_addons_sauces: "Choose Extra Add-ons & Sauces:",
      price_total: "Total Price:",
      confirm_add_to_cart: "Add to Cart",
      details_badge_top_seller: "Best Seller",
      details_badge_deal: "Today's Deal",
      reviews_count_label: "customer reviews",
      details_quantity: "Quantity:",
      details_buy_now: "Buy Now Directly",
      reviews_title: "Customer Reviews & Dining Experience",
      review_average: "Overall Average Rating",
      taste_quality: "Taste & Food Quality",
      speed_rating: "Delivery Speed",
      service_level: "Service Level",
      add_review: "Add Your Review & Experience",
      meal_rating: "Meal & Taste Rating *",
      delivery_rating: "Delivery Speed Rating *",
      service_rating: "Service Rating *",
      review_notes: "Your Detailed Notes & Comment",
      review_comment_placeholder:
        "Share your honest thoughts about the food and delivery...",
      submit_review: "Submit Review",
      similar_meals: "Suggested Similar Meals",
      no_reviews_yet:
        "No reviews yet for this meal. Be the first to share your experience!",
      no_similar_meals: "No similar recommendations available right now",
      rating_5_stars: "5/5 - Excellent",
      rating_4_stars: "4/5 - Very Good",
      rating_3_stars: "3/5 - Good",
      rating_2_stars: "2/5 - Fair",
      rating_1_stars: "1/5 - Poor",
      speed_very_fast: "5/5 - Very Fast",
      speed_suitable: "4/5 - Suitable",
      speed_medium: "3/5 - Average",
      service_classy: "5/5 - Classy & Respectful",
      service_good: "4/5 - Good",
      cart_title: "Your Food Cart",
      cart_item: "item",
      cart_empty: "Your cart is empty",
      cart_total: "Total Food Price:",
      coupon_prompt: "Have a discount coupon?",
      coupon_apply: "Apply",
      coupon_placeholder: "Enter coupon code (e.g. SAVE20)",
      order_details: "Delivery & GPS Details",
      cart_order_type_label: "Order Type *",
      cart_order_type_dinein: "Dine-in",
      cart_order_type_takeaway: "Takeaway",
      cart_order_type_delivery: "Delivery",
      delivery_area: "Choose Delivery Area *",
      delivery_loading: "Loading delivery areas from database...",
      schedule_time: "Scheduled Collection Time *",
      asap: "As soon as possible (ASAP)",
      one_hour: "Within one hour from now",
      dinner_time: "Dinner time (08:00 PM)",
      customer_name: "Full Name *",
      customer_name_placeholder: "Enter your full name",
      phone: "Contact Phone Number *",
      whatsapp: "WhatsApp Number for Invoices *",
      phone_placeholder: "01012345678",
      table_number: "Table Number",
      table_select_placeholder: "Select a table (inside restaurant)",
      cart_table_loading: "Loading available tables...",
      cart_table_retry: "Retry loading tables",
      table_no_tables: "No tables are currently available",
      table_load_error: "Unable to load tables",
      table_load_error_retry: "Unable to load tables. Please retry.",
      table_word: "Table",
      seats_word: "seats",
      extra_phone: "Additional Phone",
      extra_phone_placeholder: "Alternative phone number (optional)",
      address: "Full Address *",
      address_placeholder: "Area, street, building no., floor...",
      gps: "Set your GPS location:",
      gps_button: "Auto-Detect My GPS Location",
      gps_detecting: "Detecting precise GPS coordinates...",
      gps_detected: "Your GPS location has been detected!",
      notes_placeholder: "e.g. No onions / extra sauce",
      subtotal: "Subtotal:",
      discount: "Applied Discount:",
      delivery_fee: "Delivery Fee:",
      grand_total: "Grand Total:",
      submit_order: "Confirm & Send Order to Kitchen & WhatsApp",
      kitchen_closed_submit_btn: "Kitchen is currently closed for orders",
      kitchen_closed_banner:
        "Sorry! The kitchen is currently closed and not accepting new orders outside working hours.",
      delivery_area_placeholder: "Choose your area to calculate delivery",
      delivery_area_fallback: "General Delivery Service",
      coupon_error_generic: "Unable to apply coupon",
      cart_remove_item: "Remove",
      cart_addons_label: "Add-ons:",
      track_title: "Order History & Live Tracking",
      track_subtitle:
        "Enter your phone number to retrieve all past and current orders and track kitchen preparation in real time",
      track_placeholder: "Your phone number or order code...",
      track_search_btn: "Show Orders",
      track_hint:
        "Enter your phone number and click search to view your orders live from the database",
      track_empty_query:
        "Please enter your full phone number or order code to search",
      track_loading: "Fetching your orders live from database...",
      track_not_found_title: "No orders found associated with this number",
      track_not_found_hint:
        "Make sure you typed the exact phone number used when placing the order, or the order code",
      track_error:
        "An error occurred while fetching orders from server. Please try again.",
      items_prepared: "Prepared Items List:",
      order_addons: "Add-ons:",
      net_total: "Net Total Amount:",
      view_invoice: "View & Save Invoice",
      guest_customer: "Guest Customer",
      status_new: "New, Pending",
      status_reviewed: "Reviewed",
      status_preparing: "Preparing in Kitchen",
      status_ready: "Ready for Pickup",
      status_out_for_delivery: "Out for Delivery",
      status_delivered: "Delivered Successfully",
      status_cancelled: "Cancelled / Rejected",
      order_success: "Your order was registered successfully!",
      order_success_desc:
        "Scan this QR code to verify invoice authenticity and track order progress in real-time",
      invoice_verified: "Certified Electronic Invoice",
      order_number: "Order No.:",
      date: "Date:",
      customer_delivery: "Customer & Delivery Details:",
      customer: "Customer Name:",
      invoice_phone: "Phone:",
      invoice_extra_phone: "Additional Phone:",
      invoice_table: "Table Number:",
      delivery_address: "Delivery Address:",
      gps_location_link: "GPS Location:",
      open_maps: "Open Location on Google Maps",
      invoice_items: "Ordered Meals & Items:",
      item_size: "Item & Size",
      quantity: "Quantity",
      price: "Price",
      total: "Total",
      invoice_loading: "Loading live invoice data...",
      order_status: "Current Kitchen Status:",
      checking: "Checking...",
      download_invoice: "Download Invoice as Image",
      print_pdf: "Print / PDF",
      return_site: "Return to Website",
      invoice_invalid_link:
        "Invoice link is invalid or incomplete. Please open the invoice from your order message or scan the original QR code.",
      invoice_not_found: "No orders found in database to display invoice",
      contact_title: "Contact",
      contact_data: "Official and direct contact details verified in database",
      hotline: "Direct Hotline & WhatsApp:",
      contact_whatsapp_btn: "Chat with Kitchen via WhatsApp Now",
      inquiries: "Orders & Inquiries Phone:",
      working_hours: "Order Reception Hours:",
      working_hours_daily: "Daily from {open} to {close}",
      welcome: "Welcome to Ora",
      welcome_copy:
        "Sign in or create a new account to follow your orders and favourites",
      email: "Email Address *",
      password: "Password *",
      full_name: "Full Name *",
      strong_password: "Strong Password *",
      account_phone: "Phone Number *",
      secure_login: "Secure Sign In",
      create_account: "Create & Activate My Account",
      user_greeting: "Hello, {name}",
      user_greeting_default: "Hello",
      user_profile: "Profile",
      user_settings: "Settings",
      nav_profile: "Profile",
      nav_my_orders: "My Orders",
      nav_settings: "Settings",
      nav_dashboard: "Dashboard",
      nav_logout: "Logout",
      user_profile_modal_title: "User Profile & Account",
      user_profile_name: "Full Name",
      user_profile_email: "Email Address",
      user_profile_phone: "Phone Number",
      user_profile_role: "Account Role & Access",
      user_profile_status: "Account Status",
      user_profile_active: "Active Account",
      role_superadmin: "Super Admin",
      role_staff: "Staff",
      role_admin: "Admin",
      role_client: "Customer",
      role_customer: "Customer",
      role_user: "User",
      admin_dashboard: "Admin Dashboard",
      admin_dashboard_compact: "Dashboard",
      admin_dashboard_entry: "Admin Dashboard",
      sync_permissions: "Refresh Permissions / Live Sync",
      my_orders_track: "Track My Orders",
      mobile_admin_link: "Admin Panel",
      bottom_home: "Home",
      bottom_menu: "Menu",
      bottom_cart: "Cart",
      bottom_orders: "My Orders",
      admin_portal_title: "Abu Qorah Management Portal",
      admin_login_subtitle: "Verifying system owner credentials...",
      admin_login_btn: "Enter Exclusive Admin Dashboard",
      admin_register_owner_notice:
        "No system owner found. Please create the initial primary owner account.",
      admin_name_label: "Owner / Manager Name *",
      admin_secret_code_label: "Management Security Secret Key *",
      admin_secret_code_hint:
        "The server-side security code required to register SuperAdmin",
      admin_create_owner_btn: "Create & Activate Owner Account (SuperAdmin)",
      admin_topbar_user: "Admin Panel [User: {role}]",
      admin_preview_site: "Preview Live Site",
      admin_cloud_sync_active: "Cloud Sync Active",
      admin_main_title: "Abu Qorah Kitchen Management",
      admin_main_desc:
        "Integrated cloud control dashboard with live kitchen broadcasting",
      admin_tab_orders: "Orders & Operations",
      admin_tab_dishes: "Dishes & Items",
      admin_tab_categories: "Menu Categories",
      admin_tab_design: "Site Design & Content",
      admin_tab_coupons: "Coupons & Deals",
      admin_tab_delivery: "Delivery Areas & Fees",
      admin_tab_tables: "Tables",
      admin_tab_reviews: "Customer Reviews",
      admin_tab_users: "Accounts, Staff & Audit",
      admin_settings_contact_title: "Official Contact & Working Hours Settings",
      admin_settings_whatsapp: "Official WhatsApp Number *",
      admin_settings_phone: "Orders & Inquiries Phone *",
      admin_settings_open_time: "Kitchen Opening Time (24H)",
      admin_settings_close_time: "Kitchen Closing Time (24H)",
      admin_settings_manual_open: "Accept Orders Manually (Open / Closed)",
      admin_settings_auto_close:
        "Automatically stop orders outside working hours",
      admin_settings_save_btn: "Save Settings & Hours to Database",
      admin_stat_revenue: "Actual Sales Revenue",
      admin_stat_orders: "Total Completed Orders",
      admin_stat_pending: "Pending Orders",
      admin_stat_preparing: "Preparing Now",
      admin_orders_empty: "No active orders right now",
      admin_orders_empty_desc:
        "All incoming orders will appear here automatically in real time.",
      kds_items_requested: "Ordered Meals",
      kds_items_count: "{count} items",
      kds_total_price: "Total Bill:",
      kds_whatsapp_btn: "WhatsApp",
      kds_print_btn: "Print",
      kds_delete_btn: "Delete",
      kds_order_note: "Note:",
      kds_map_open: "Open Map",
      qz_title: "Automated Thermal Printing Settings (QZ Tray)",
      qz_role_primary: "Primary Printer",
      qz_role_spectator: "Spectator",
      qz_role_spectator_tooltip:
        "This session will not auto-print to prevent duplicate printouts",
      qz_status_connected: "QZ Tray Connected",
      qz_status_connecting: "Connecting to QZ Tray...",
      qz_status_disconnected: "QZ Tray Disconnected",
      qz_notice:
        "Start QZ Tray on your printer host first, then click 'Refresh Printers'.",
      qz_printer_select: "Selected Thermal Printer *",
      qz_printer_placeholder: "-- Choose Printer --",
      qz_printer_type: "Printer Type",
      qz_printer_type_unknown: "Unverified (Safe: prevents printing)",
      qz_printer_type_thermal: "Thermal",
      qz_printer_type_office: "Office A4",
      qz_protocol: "Printing Protocol",
      qz_protocol_unknown: "Unverified (Safe: prevents printing)",
      qz_protocol_raster: "ESC/POS Raster (Recommended for Arabic)",
      qz_protocol_text: "ESC/POS Text (ASCII/CP437 only)",
      qz_paper_size: "Paper Width",
      qz_paper_80mm: "80mm (Standard)",
      qz_paper_58mm: "58mm (Small)",
      qz_copies: "Number of Copies",
      qz_enable_autoprint: "Enable Automated Printing",
      qz_autoprint_new: "Print new orders on arrival",
      qz_print_status_change: "Print on status change",
      qz_cut_paper: "Auto-cut paper",
      qz_beep: "Buzzer / Beep alert",
      qz_margin_bottom: "Bottom Margin (mm)",
      qz_refresh_btn: "Refresh Printers",
      qz_test_btn: "Test Print",
      qz_claim_btn: "Claim Primary Printer Role",
      qz_save_btn: "Save Printing Settings",
      admin_dishes_add_btn: "Add New Dish to Menu",
      admin_dishes_search_placeholder: "Search food dishes...",
      admin_dishes_empty: "No dishes found in database. Add your first dish!",
      dish_available: "Available",
      dish_unavailable: "Unavailable",
      dish_stock: "Stock: {qty}",
      dish_sizes_count: "{count} sizes",
      dish_addons_count: "{count} add-ons",
      dish_status_enable: "Enable",
      dish_status_disable: "Disable",
      dish_modal_add_title: "Add New Dish in MongoDB",
      dish_modal_edit_title: "Edit Dish in MongoDB Database",
      dish_name_ar: "Dish Title in Arabic *",
      dish_category_select: "Category in MongoDB *",
      dish_price_base: "Base Price (EGP) *",
      dish_price_discount: "Discounted Price (Optional)",
      dish_desc_label: "Meal Ingredients Description",
      dish_desc_placeholder: "Describe ingredients and flavors...",
      dish_image_label: "Dish Image",
      dish_upload_tab_file: "Upload from Device",
      dish_upload_tab_url: "Direct URL",
      dish_drop_zone_title: "Click to upload or drag image here",
      dish_drop_zone_sub: "Supports PNG, JPG, WEBP formats",
      dish_url_placeholder: "Paste direct image URL here (https://...)",
      dish_img_success: "Image selected successfully",
      dish_img_remove: "Remove Image",
      dish_sizes_label: "Sizes & Portions (Name:Price, Name:Price)",
      dish_sizes_placeholder: "Quarter:160, Half:320",
      dish_addons_label: "Extra Add-ons (Name:Price, Name:Price)",
      dish_addons_placeholder: "Tahini sauce:15, Extra bread:10",
      dish_save_publish_btn: "Save & Publish Meal",
      dish_save_edit_btn: "Save Changes to MongoDB",
      cat_add_title: "Add New Category & Food in MongoDB",
      cat_name_ar: "Category Name (Arabic) *",
      cat_name_ar_placeholder: "e.g. Claypot Casseroles",
      cat_name_en: "Category Name (English)",
      cat_name_en_placeholder: "e.g. Claypots",
      cat_save_btn: "Create & Save Category in MongoDB",
      cat_list_title: "Current Menu Categories in Database",
      cat_empty:
        "No categories registered in Atlas database. Please add a category!",
      cat_delete_btn: "Delete Category from MongoDB",
      design_theme_title: "Colors & Brand Identity",
      design_primary_color: "Primary Color",
      design_primary_hover: "Primary Hover Color",
      design_secondary_color: "Secondary Color",
      design_gold_light: "Light Gold Color",
      design_dark_color: "Dark Color",
      design_bg_color: "Background Color",
      design_card_bg: "Card Background Color",
      design_text_color: "Text Color",
      design_font_family: "Website Font",
      design_border_radius: "Border Radius (e.g. 20px)",
      design_custom_css: "Custom CSS (Optional for advanced styling)",
      design_content_title: "Site Texts & Content",
      design_brand_name: "Restaurant Name",
      design_brand_tagline: "Brand Tagline",
      design_hero_title: "Hero Main Title",
      design_hero_subtitle: "Hero Subtitle",
      design_hero_btn1: "Hero Button 1 Text",
      design_hero_btn2: "Hero Button 2 Text",
      design_hero_bg: "Hero Background Image URL",
      design_deals_title: "Deals Section Title",
      design_deals_subtitle: "Deals Section Subtitle",
      design_top_title: "Top Sellers Section Title",
      design_top_subtitle: "Top Sellers Section Subtitle",
      design_announcement_text: "Announcement Ticker Text",
      design_announcement_placeholder: "e.g. Special offer for a limited time!",
      design_show_announcement: "Show Announcement Bar",
      design_footer_text: "Footer Copyright Text",
      design_save_btn: "Save Design & Content to Database",
      design_live_preview: "Live Site Preview",
      coupon_admin_title: "Discount Coupons Management in MongoDB",
      coupon_admin_add_btn: "Create New Coupon",
      coupon_th_code: "Coupon Code",
      coupon_th_discount: "Discount Type & %",
      coupon_th_min_order: "Min Order Amount",
      coupon_th_expiry: "Expiration Date",
      coupon_th_uses: "Usage Count",
      coupon_empty: "No discount coupons registered in database",
      coupon_modal_title: "Create New Discount Coupon",
      coupon_code_label: "Coupon Code *",
      coupon_percentage_label: "Discount Percentage (%) *",
      coupon_min_order_label: "Min Order Amount (EGP)",
      coupon_expiry_label: "Expiration Date *",
      coupon_save_btn: "Save Coupon to MongoDB",
      delivery_admin_title: "Delivery Areas & Rates Management",
      delivery_admin_add_btn: "Add New Delivery Area",
      delivery_th_name: "Area / District Name",
      delivery_th_fee: "Delivery Fee",
      delivery_th_min_order: "Min Order Amount",
      delivery_th_time: "Estimated Time",
      delivery_empty: "No delivery areas registered in database",
      delivery_modal_title: "Add Delivery Area & Fee",
      delivery_area_name_label: "Area / District Name *",
      delivery_area_name_placeholder: "e.g. Cairo - Maadi",
      delivery_fee_label: "Delivery Fee (EGP) *",
      delivery_min_order_label: "Min Order Amount (EGP)",
      delivery_save_btn: "Save Area to MongoDB",
      tables_admin_title: "Restaurant Tables Management",
      tables_admin_add_btn: "Add Table",
      tables_th_number: "Table Number",
      tables_th_seats: "Seats",
      tables_th_status: "Status",
      tables_th_notes: "Notes",
      tables_empty: "No tables added yet",
      table_status_available: "Available",
      table_status_reserved: "Reserved",
      table_status_occupied: "Occupied",
      table_modal_add_title: "Add Table",
      table_modal_edit_title: "Edit Table",
      table_number_label: "Table Number *",
      table_seats_label: "Seats Count *",
      table_status_label: "Status",
      table_notes_label: "Notes",
      table_save_btn: "Save",
      reviews_admin_title: "Customer Reviews Moderation",
      reviews_th_user: "Customer Name",
      reviews_th_meal: "Meal",
      reviews_th_rating: "Rating",
      reviews_th_comment: "Comment",
      reviews_th_status: "Status",
      reviews_status_approved: "Approved & Live",
      reviews_status_hidden: "Hidden",
      reviews_action_hide: "Hide",
      reviews_action_approve: "Publish & Approve",
      reviews_empty: "No reviews registered yet",
      users_admin_title: "Accounts, Staff Roles & Ban Controls",
      users_th_user: "Name & Email",
      users_th_role: "Role & Permission",
      users_th_ban: "Account Status",
      users_th_actions: "Actions & Permissions",
      users_empty: "No registered users found",
      users_status_banned: "Banned",
      users_status_active: "Active",
      users_promote_to_staff: "Promote to Staff",
      users_demote_to_client: "Demote to Client",
      users_ban: "Ban Account",
      users_unban: "Unban Account",
      users_delete: "Delete Account",
      users_superadmin_protected: "Owner account protected",
      audit_logs_title: "Security & Audit Logs",
      audit_logs_desc:
        "Displays recent login attempts and sensitive system actions in MongoDB.",
      audit_th_admin: "Admin Name",
      audit_th_email: "Email Used",
      audit_th_action: "Action Taken",
      audit_th_status: "Security Status",
      audit_th_ip: "IP Address",
      audit_th_time: "Timestamp",
      audit_status_success: "Success",
      audit_status_failed: "Failed",
      audit_empty: "No audit records found yet",
      audit_loading: "Loading security audit logs...",
      audit_error:
        "Unable to load audit logs (verify /api/admin/audit-logs endpoint)",
      alert_cart_empty: "Your cart is empty! Add items first.",
      alert_required_fields: "Please complete the required order details.",
      alert_select_table: "Select an available table before checkout.",
      alert_gps_required: "GPS location is required for delivery orders.",
      alert_server_error:
        "A server connection error occurred. Please try again later.",
      alert_gps_unsupported:
        "Your browser does not support automatic GPS detection. You can drag the pin manually.",
      alert_gps_error:
        "Unable to detect your location automatically. You can move the pin manually on the map.",
      alert_login_required: "Please enter your email and password.",
      alert_register_required:
        "All fields are required to create a new account.",
      alert_logout_success: "Logged out successfully.",
      alert_max_order_limit:
        "The maximum allowed quantity for this item is {max} pieces.",
      alert_added_to_cart_success:
        "Successfully added [{title}] to your food cart!",
      alert_review_success:
        "Thank you! Your review has been submitted successfully.",
      alert_review_prompt_name:
        "Please enter your name to confirm your review:",
      alert_dish_not_found: "Meal does not exist or has been removed.",
      alert_account_banned_deleted:
        "Your account has been banned or deleted by system administration.",
      alert_account_role_updated:
        "Congratulations! Your account role has been updated.",
      alert_superadmin_all_fields:
        "Please provide all required fields (Name, Email, and Password).",
      alert_superadmin_secret_required:
        "Please enter the management security secret key!",
      alert_superadmin_create_success:
        "Primary owner account created and secured successfully!",
      alert_admin_unauthorized:
        "Sorry, this account does not have administrator privileges!",
      alert_save_theme_success:
        "Site theme, typography, content, and banners saved successfully to database!",
      alert_save_settings_success:
        "Kitchen working hours and system settings saved successfully!",
      alert_save_qz_success:
        "QZ Tray automated printing settings saved successfully!",
      alert_qz_select_printer_required:
        "Please select a thermal printer from the list before enabling automated printing.",
      alert_qz_safe_protocol_required:
        "For printer protection, enable thermal printing only after selecting 'Thermal' and verified 'ESC/POS'.",
      alert_qz_not_loaded: "Printing module is not loaded yet.",
      alert_qz_not_connected:
        "QZ Tray is not connected. Start QZ Tray on your machine, then click refresh.",
      alert_qz_refresh_success: "Available printers list refreshed.",
      alert_qz_test_success: "Test receipt sent to printer successfully!",
      alert_qz_test_failed: "Failed to send test receipt to printer:",
      alert_qz_claim_required:
        "Enable printing, select a printer, and save settings before claiming primary role.",
      alert_qz_status_update_error: "Unable to update order status on server:",
      alert_qz_status_update_conn_error:
        "Connection error occurred while updating order status.",
      alert_no_whatsapp: "No WhatsApp number registered for this customer.",
      alert_delete_order_confirm:
        "Are you sure you want to permanently delete this order from database and dashboard?",
      alert_delete_dish_confirm:
        "Are you sure you want to permanently delete this dish from database and menu?",
      alert_delete_category_confirm:
        "Are you sure you want to permanently delete this category from database and menu?",
      alert_delete_coupon_confirm:
        "Are you sure you want to permanently delete this coupon?",
      alert_delete_delivery_confirm:
        "Are you sure you want to delete this area from delivery list?",
      alert_delete_table_confirm: "Are you sure you want to delete this table?",
      alert_delete_user_confirm:
        "Are you sure you want to permanently delete this account from database and end its session?",
      alert_delete_review_confirm:
        "Are you sure you want to delete this review?",
      alert_image_invalid: "Please select a valid image file (PNG, JPG, WEBP)!",
      alert_save_table_error: "Unable to save table.",
      alert_update_table_error: "Unable to update table status.",
      alert_delete_table_error: "Unable to delete table.",
      user_guest_welcome: "Welcome, Dear Guest",
      user_guest_prompt: "Sign in to track orders and enjoy a faster experience",
      authentic_taste: "Authentic Traditional Taste",
      appearance: "Appearance",
      theme_light: "Light",
      theme_dark: "Dark",
      language: "Language",
      nav_profile: "My Profile",
      nav_my_orders: "My Orders",
      nav_settings: "Settings",
      nav_dashboard: "Dashboard",
      nav_logout: "Logout",
      user_greeting_default: "Welcome",
      user_greeting: "Hello, {name}",
    },
    en: {
      nav_home: "Home",
      nav_menu: "Menu",
      nav_food_menu: "Food Menu",
      nav_track: "Track Order",
      nav_contact: "Contact Us",
      nav_cart: "Cart",
      nav_login: "Sign In / Create Account",
      login: "Sign In",
      register: "Create Account",
      logout: "Logout",
      close: "Close",
      done: "Done",
      save: "Save",
      edit: "Edit",
      delete: "Delete",
      cancel: "Cancel",
      confirm: "Confirm",
      actions: "Actions",
      loading: "Loading...",
      search: "Search...",
      egp: "EGP",
      all: "All",
      status: "Status",
      notes: "Notes",
      yes: "Yes",
      no: "No",
      details: "Details",
      order_now: "Order Now",
      order_new: "Start a New Order",
      order_meal_now: "Order This Meal Now",
      today_deals: "Today's Deals",
      view_full_menu: "View Full Menu",
      browse_menu: "Browse the Full Menu",
      reorder_prompt:
        "Welcome back — would you like to repeat your last order?",
      reorder_last: "Repeat Last Order",
      stat_years: "Established in",
      stat_rating: "Customer Rating",
      stat_happy: "Happy Customers",
      trust_fast: "Fast delivery within 30 minutes",
      trust_fresh: "Fresh grills made daily",
      trust_safe: "Secure cash on delivery",
      trust_rating: "Rated 4.8 by our customers",
      limited_deals: "Limited Deals",
      popular: "Most Popular",
      customer_rating: "Customer Ratings",
      top_rated: "Top Rated & Popular",
      top_rated_copy:
        "Dishes and meals that received the highest customer ratings",
      recent_viewed: "Recently Viewed Meals",
      deals_section_default_title: "Top Deals & Daily Discounts",
      deals_section_default_sub:
        "Premium meals at discounted prices for a limited time",
      top_sellers_default_title: "Top 10 Best Selling Items",
      top_sellers_default_sub:
        "The golden selection of meals loved by our customers",
      menu_page_title: "Full Food Menu",
      menu_page_subtitle:
        "Explore our delicious grills, clay pots, and authentic freshly prepared countryside baked dishes",
      search_food: "Search Dishes:",
      search_food_placeholder:
        "Search by meal name or ingredients (e.g. Kebab, Clay pot, Grills...)",
      sort_menu: "Sort Menu By:",
      newest: "Newest First (Default)",
      price_low: "Price: Low to High",
      price_high: "Price: High to Low",
      best_selling: "Best Selling",
      highest_rated: "Highest Rated",
      add_to_cart: "Add to Order",
      add_to_cart_custom: "Add to Order (Customize)",
      discount_badge: "Discount",
      fresh_meal_daily: "Freshly prepared daily",
      no_dishes_matched: "No matching dishes found",
      error_loading_dishes: "Unable to load dishes from server",
      loading_more_dishes: "Loading more dishes...",
      all_dishes_loaded: "All dishes loaded",
      back_to_menu: "Back to Menu",
      customize_meal: "Customize Meal",
      choose_size: "Choose Size / Portion:",
      addons: "Available Add-ons & Sauces:",
      choose_addons_sauces: "Choose Extra Add-ons & Sauces:",
      price_total: "Total Price:",
      confirm_add_to_cart: "Add to Cart",
      details_badge_top_seller: "Best Seller",
      details_badge_deal: "Today's Deal",
      reviews_count_label: "customer reviews",
      details_quantity: "Quantity:",
      details_buy_now: "Buy Now Directly",
      reviews_title: "Customer Reviews & Dining Experience",
      review_average: "Overall Average Rating",
      taste_quality: "Taste & Food Quality",
      speed_rating: "Delivery Speed",
      service_level: "Service Level",
      add_review: "Add Your Review & Experience",
      meal_rating: "Meal & Taste Rating *",
      delivery_rating: "Delivery Speed Rating *",
      service_rating: "Service Rating *",
      review_notes: "Your Detailed Notes & Comment",
      review_comment_placeholder:
        "Share your honest thoughts about the food and delivery...",
      submit_review: "Submit Review",
      similar_meals: "Suggested Similar Meals",
      no_reviews_yet:
        "No reviews yet for this meal. Be the first to share your experience!",
      no_similar_meals: "No similar recommendations available right now",
      rating_5_stars: "5/5 - Excellent",
      rating_4_stars: "4/5 - Very Good",
      rating_3_stars: "3/5 - Good",
      rating_2_stars: "2/5 - Fair",
      rating_1_stars: "1/5 - Poor",
      speed_very_fast: "5/5 - Very Fast",
      speed_suitable: "4/5 - Suitable",
      speed_medium: "3/5 - Average",
      service_classy: "5/5 - Classy & Respectful",
      service_good: "4/5 - Good",
      cart_title: "Your Food Cart",
      cart_item: "item",
      cart_empty: "Your cart is empty",
      cart_total: "Total Food Price:",
      coupon_prompt: "Have a discount coupon?",
      coupon_apply: "Apply",
      coupon_placeholder: "Enter coupon code (e.g. SAVE20)",
      order_details: "Delivery & GPS Details",
      cart_order_type_label: "Order Type *",
      cart_order_type_dinein: "Dine-in",
      cart_order_type_takeaway: "Takeaway",
      cart_order_type_delivery: "Delivery",
      delivery_area: "Choose Delivery Area *",
      delivery_loading: "Loading delivery areas from database...",
      schedule_time: "Scheduled Collection Time *",
      asap: "As soon as possible (ASAP)",
      one_hour: "Within one hour from now",
      dinner_time: "Dinner time (08:00 PM)",
      customer_name: "Full Name *",
      customer_name_placeholder: "Enter your full name",
      phone: "Contact Phone Number *",
      whatsapp: "WhatsApp Number for Invoices *",
      phone_placeholder: "01012345678",
      table_number: "Table Number",
      table_select_placeholder: "Select a table (inside restaurant)",
      cart_table_loading: "Loading available tables...",
      cart_table_retry: "Retry loading tables",
      table_no_tables: "No tables are currently available",
      table_load_error: "Unable to load tables",
      table_load_error_retry: "Unable to load tables. Please retry.",
      table_word: "Table",
      seats_word: "seats",
      extra_phone: "Additional Phone",
      extra_phone_placeholder: "Alternative phone number (optional)",
      address: "Full Address *",
      address_placeholder: "Area, street, building no., floor...",
      gps: "Set your GPS location:",
      gps_button: "Auto-Detect My GPS Location",
      gps_detecting: "Detecting precise GPS coordinates...",
      gps_detected: "Your GPS location has been detected!",
      notes_placeholder: "e.g. No onions / extra sauce",
      subtotal: "Subtotal:",
      discount: "Applied Discount:",
      delivery_fee: "Delivery Fee:",
      grand_total: "Grand Total:",
      submit_order: "Confirm & Send Order to Kitchen & WhatsApp",
      kitchen_closed_submit_btn: "Kitchen is currently closed for orders",
      kitchen_closed_banner:
        "Sorry! The kitchen is currently closed and not accepting new orders outside working hours.",
      delivery_area_placeholder: "Choose your area to calculate delivery",
      delivery_area_fallback: "General Delivery Service",
      coupon_error_generic: "Unable to apply coupon",
      cart_remove_item: "Remove",
      cart_addons_label: "Add-ons:",
      track_title: "Order History & Live Tracking",
      track_subtitle:
        "Enter your phone number to retrieve all past and current orders and track kitchen preparation in real time",
      track_placeholder: "Your phone number or order code...",
      track_search_btn: "Show Orders",
      track_hint:
        "Enter your phone number and click search to view your orders live from the database",
      track_empty_query:
        "Please enter your full phone number or order code to search",
      track_loading: "Fetching your orders live from database...",
      track_not_found_title: "No orders found associated with this number",
      track_not_found_hint:
        "Make sure you typed the exact phone number used when placing the order, or the order code",
      track_error:
        "An error occurred while fetching orders from server. Please try again.",
      items_prepared: "Prepared Items List:",
      order_addons: "Add-ons:",
      net_total: "Net Total Amount:",
      view_invoice: "View & Save Invoice",
      guest_customer: "Guest Customer",
      status_new: "New, Pending",
      status_reviewed: "Reviewed",
      status_preparing: "Preparing in Kitchen",
      status_ready: "Ready for Pickup",
      status_out_for_delivery: "Out for Delivery",
      status_delivered: "Delivered Successfully",
      status_cancelled: "Cancelled / Rejected",
      order_success: "Your order was registered successfully!",
      order_success_desc:
        "Scan this QR code to verify invoice authenticity and track order progress in real-time",
      invoice_verified: "Certified Electronic Invoice",
      order_number: "Order No.:",
      date: "Date:",
      customer_delivery: "Customer & Delivery Details:",
      customer: "Customer Name:",
      invoice_phone: "Phone:",
      invoice_extra_phone: "Additional Phone:",
      invoice_table: "Table Number:",
      delivery_address: "Delivery Address:",
      gps_location_link: "GPS Location:",
      open_maps: "Open Location on Google Maps",
      invoice_items: "Ordered Meals & Items:",
      item_size: "Item & Size",
      quantity: "Quantity",
      price: "Price",
      total: "Total",
      invoice_loading: "Loading live invoice data...",
      order_status: "Current Kitchen Status:",
      checking: "Checking...",
      download_invoice: "Download Invoice as Image",
      print_pdf: "Print / PDF",
      return_site: "Return to Website",
      invoice_invalid_link:
        "Invoice link is invalid or incomplete. Please open the invoice from your order message or scan the original QR code.",
      invoice_not_found: "No orders found in database to display invoice",
      contact_title: "Contact",
      contact_data: "Official and direct contact details verified in database",
      hotline: "Direct Hotline & WhatsApp:",
      contact_whatsapp_btn: "Chat with Kitchen via WhatsApp Now",
      inquiries: "Orders & Inquiries Phone:",
      working_hours: "Order Reception Hours:",
      working_hours_daily: "Daily from {open} to {close}",
      welcome: "Welcome to Ora",
      welcome_copy:
        "Sign in or create a new account to follow your orders and favourites",
      email: "Email Address *",
      password: "Password *",
      full_name: "Full Name *",
      strong_password: "Strong Password *",
      account_phone: "Phone Number *",
      secure_login: "Secure Sign In",
      create_account: "Create & Activate My Account",
      user_greeting: "Hello, {name}",
      user_greeting_default: "Hello",
      user_profile: "Profile",
      user_settings: "Settings",
      nav_profile: "Profile",
      nav_my_orders: "My Orders",
      nav_settings: "Settings",
      nav_dashboard: "Dashboard",
      nav_logout: "Logout",
      user_profile_modal_title: "User Profile & Account",
      user_profile_name: "Full Name",
      user_profile_email: "Email Address",
      user_profile_phone: "Phone Number",
      user_profile_role: "Account Role & Access",
      user_profile_status: "Account Status",
      user_profile_active: "Active Account",
      role_superadmin: "Super Admin",
      role_staff: "Staff",
      role_admin: "Admin",
      role_client: "Customer",
      role_customer: "Customer",
      role_user: "User",
      admin_dashboard: "Admin Dashboard",
      admin_dashboard_compact: "Dashboard",
      admin_dashboard_entry: "Admin Dashboard",
      sync_permissions: "Refresh Permissions / Live Sync",
      my_orders_track: "Track My Orders",
      mobile_admin_link: "Admin Panel",
      bottom_home: "Home",
      bottom_menu: "Menu",
      bottom_cart: "Cart",
      bottom_orders: "My Orders",
      admin_portal_title: "Abu Qorah Management Portal",
      admin_login_subtitle: "Verifying system owner credentials...",
      admin_login_btn: "Enter Exclusive Admin Dashboard",
      admin_register_owner_notice:
        "No system owner found. Please create the initial primary owner account.",
      admin_name_label: "Owner / Manager Name *",
      admin_secret_code_label: "Management Security Secret Key *",
      admin_secret_code_hint:
        "The server-side security code required to register SuperAdmin",
      admin_create_owner_btn: "Create & Activate Owner Account (SuperAdmin)",
      admin_topbar_user: "Admin Panel [User: {role}]",
      admin_preview_site: "Preview Live Site",
      admin_cloud_sync_active: "Cloud Sync Active",
      admin_main_title: "Abu Qorah Kitchen Management",
      admin_main_desc:
        "Integrated cloud control dashboard with live kitchen broadcasting",
      admin_tab_orders: "Orders & Operations",
      admin_tab_dishes: "Dishes & Items",
      admin_tab_categories: "Menu Categories",
      admin_tab_design: "Site Design & Content",
      admin_tab_coupons: "Coupons & Deals",
      admin_tab_delivery: "Delivery Areas & Fees",
      admin_tab_tables: "Tables",
      admin_tab_reviews: "Customer Reviews",
      admin_tab_users: "Accounts, Staff & Audit",
      admin_settings_contact_title: "Official Contact & Working Hours Settings",
      admin_settings_whatsapp: "Official WhatsApp Number *",
      admin_settings_phone: "Orders & Inquiries Phone *",
      admin_settings_open_time: "Kitchen Opening Time (24H)",
      admin_settings_close_time: "Kitchen Closing Time (24H)",
      admin_settings_manual_open: "Accept Orders Manually (Open / Closed)",
      admin_settings_auto_close:
        "Automatically stop orders outside working hours",
      admin_settings_save_btn: "Save Settings & Hours to Database",
      admin_stat_revenue: "Actual Sales Revenue",
      admin_stat_orders: "Total Completed Orders",
      admin_stat_pending: "Pending Orders",
      admin_stat_preparing: "Preparing Now",
      admin_orders_empty: "No active orders right now",
      admin_orders_empty_desc:
        "All incoming orders will appear here automatically in real time.",
      kds_items_requested: "Ordered Meals",
      kds_items_count: "{count} items",
      kds_total_price: "Total Bill:",
      kds_whatsapp_btn: "WhatsApp",
      kds_print_btn: "Print",
      kds_delete_btn: "Delete",
      kds_order_note: "Note:",
      kds_map_open: "Open Map",
      qz_title: "Automated Thermal Printing Settings (QZ Tray)",
      qz_role_primary: "Primary Printer",
      qz_role_spectator: "Spectator",
      qz_role_spectator_tooltip:
        "This session will not auto-print to prevent duplicate printouts",
      qz_status_connected: "QZ Tray Connected",
      qz_status_connecting: "Connecting to QZ Tray...",
      qz_status_disconnected: "QZ Tray Disconnected",
      qz_notice:
        "Start QZ Tray on your printer host first, then click 'Refresh Printers'.",
      qz_printer_select: "Selected Thermal Printer *",
      qz_printer_placeholder: "-- Choose Printer --",
      qz_printer_type: "Printer Type",
      qz_printer_type_unknown: "Unverified (Safe: prevents printing)",
      qz_printer_type_thermal: "Thermal",
      qz_printer_type_office: "Office A4",
      qz_protocol: "Printing Protocol",
      qz_protocol_unknown: "Unverified (Safe: prevents printing)",
      qz_protocol_raster: "ESC/POS Raster (Recommended for Arabic)",
      qz_protocol_text: "ESC/POS Text (ASCII/CP437 only)",
      qz_paper_size: "Paper Width",
      qz_paper_80mm: "80mm (Standard)",
      qz_paper_58mm: "58mm (Small)",
      qz_copies: "Number of Copies",
      qz_enable_autoprint: "Enable Automated Printing",
      qz_autoprint_new: "Print new orders on arrival",
      qz_print_status_change: "Print on status change",
      qz_cut_paper: "Auto-cut paper",
      qz_beep: "Buzzer / Beep alert",
      qz_margin_bottom: "Bottom Margin (mm)",
      qz_refresh_btn: "Refresh Printers",
      qz_test_btn: "Test Print",
      qz_claim_btn: "Claim Primary Printer Role",
      qz_save_btn: "Save Printing Settings",
      admin_dishes_add_btn: "Add New Dish to Menu",
      admin_dishes_search_placeholder: "Search food dishes...",
      admin_dishes_empty: "No dishes found in database. Add your first dish!",
      dish_available: "Available",
      dish_unavailable: "Unavailable",
      dish_stock: "Stock: {qty}",
      dish_sizes_count: "{count} sizes",
      dish_addons_count: "{count} add-ons",
      dish_status_enable: "Enable",
      dish_status_disable: "Disable",
      dish_modal_add_title: "Add New Dish in MongoDB",
      dish_modal_edit_title: "Edit Dish in MongoDB Database",
      dish_name_ar: "Dish Title in Arabic *",
      dish_category_select: "Category in MongoDB *",
      dish_price_base: "Base Price (EGP) *",
      dish_price_discount: "Discounted Price (Optional)",
      dish_desc_label: "Meal Ingredients Description",
      dish_desc_placeholder: "Describe ingredients and flavors...",
      dish_image_label: "Dish Image",
      dish_upload_tab_file: "Upload from Device",
      dish_upload_tab_url: "Direct URL",
      dish_drop_zone_title: "Click to upload or drag image here",
      dish_drop_zone_sub: "Supports PNG, JPG, WEBP formats",
      dish_url_placeholder: "Paste direct image URL here (https://...)",
      dish_img_success: "Image selected successfully",
      dish_img_remove: "Remove Image",
      dish_sizes_label: "Sizes & Portions (Name:Price, Name:Price)",
      dish_sizes_placeholder: "Quarter:160, Half:320",
      dish_addons_label: "Extra Add-ons (Name:Price, Name:Price)",
      dish_addons_placeholder: "Tahini sauce:15, Extra bread:10",
      dish_save_publish_btn: "Save & Publish Meal",
      dish_save_edit_btn: "Save Changes to MongoDB",
      cat_add_title: "Add New Category & Food in MongoDB",
      cat_name_ar: "Category Name (Arabic) *",
      cat_name_ar_placeholder: "e.g. Claypot Casseroles",
      cat_name_en: "Category Name (English)",
      cat_name_en_placeholder: "e.g. Claypots",
      cat_save_btn: "Create & Save Category in MongoDB",
      cat_list_title: "Current Menu Categories in Database",
      cat_empty:
        "No categories registered in Atlas database. Please add a category!",
      cat_delete_btn: "Delete Category from MongoDB",
      design_theme_title: "Colors & Brand Identity",
      design_primary_color: "Primary Color",
      design_primary_hover: "Primary Hover Color",
      design_secondary_color: "Secondary Color",
      design_gold_light: "Light Gold Color",
      design_dark_color: "Dark Color",
      design_bg_color: "Background Color",
      design_card_bg: "Card Background Color",
      design_text_color: "Text Color",
      design_font_family: "Website Font",
      design_border_radius: "Border Radius (e.g. 20px)",
      design_custom_css: "Custom CSS (Optional for advanced styling)",
      design_content_title: "Site Texts & Content",
      design_brand_name: "Restaurant Name",
      design_brand_tagline: "Brand Tagline",
      design_hero_title: "Hero Main Title",
      design_hero_subtitle: "Hero Subtitle",
      design_hero_btn1: "Hero Button 1 Text",
      design_hero_btn2: "Hero Button 2 Text",
      design_hero_bg: "Hero Background Image URL",
      design_deals_title: "Deals Section Title",
      design_deals_subtitle: "Deals Section Subtitle",
      design_top_title: "Top Sellers Section Title",
      design_top_subtitle: "Top Sellers Section Subtitle",
      design_announcement_text: "Announcement Ticker Text",
      design_announcement_placeholder: "e.g. Special offer for a limited time!",
      design_show_announcement: "Show Announcement Bar",
      design_footer_text: "Footer Copyright Text",
      design_save_btn: "Save Design & Content to Database",
      design_live_preview: "Live Site Preview",
      coupon_admin_title: "Discount Coupons Management in MongoDB",
      coupon_admin_add_btn: "Create New Coupon",
      coupon_th_code: "Coupon Code",
      coupon_th_discount: "Discount Type & %",
      coupon_th_min_order: "Min Order Amount",
      coupon_th_expiry: "Expiration Date",
      coupon_th_uses: "Usage Count",
      coupon_empty: "No discount coupons registered in database",
      coupon_modal_title: "Create New Discount Coupon",
      coupon_code_label: "Coupon Code *",
      coupon_percentage_label: "Discount Percentage (%) *",
      coupon_min_order_label: "Min Order Amount (EGP)",
      coupon_expiry_label: "Expiration Date *",
      coupon_save_btn: "Save Coupon to MongoDB",
      delivery_admin_title: "Delivery Areas & Rates Management",
      delivery_admin_add_btn: "Add New Delivery Area",
      delivery_th_name: "Area / District Name",
      delivery_th_fee: "Delivery Fee",
      delivery_th_min_order: "Min Order Amount",
      delivery_th_time: "Estimated Time",
      delivery_empty: "No delivery areas registered in database",
      delivery_modal_title: "Add Delivery Area & Fee",
      delivery_area_name_label: "Area / District Name *",
      delivery_area_name_placeholder: "e.g. Cairo - Maadi",
      delivery_fee_label: "Delivery Fee (EGP) *",
      delivery_min_order_label: "Min Order Amount (EGP)",
      delivery_save_btn: "Save Area to MongoDB",
      tables_admin_title: "Restaurant Tables Management",
      tables_admin_add_btn: "Add Table",
      tables_th_number: "Table Number",
      tables_th_seats: "Seats",
      tables_th_status: "Status",
      tables_th_notes: "Notes",
      tables_empty: "No tables added yet",
      table_status_available: "Available",
      table_status_reserved: "Reserved",
      table_status_occupied: "Occupied",
      table_modal_add_title: "Add Table",
      table_modal_edit_title: "Edit Table",
      table_number_label: "Table Number *",
      table_seats_label: "Seats Count *",
      table_status_label: "Status",
      table_notes_label: "Notes",
      table_save_btn: "Save",
      reviews_admin_title: "Customer Reviews Moderation",
      reviews_th_user: "Customer Name",
      reviews_th_meal: "Meal",
      reviews_th_rating: "Rating",
      reviews_th_comment: "Comment",
      reviews_th_status: "Status",
      reviews_status_approved: "Approved & Live",
      reviews_status_hidden: "Hidden",
      reviews_action_hide: "Hide",
      reviews_action_approve: "Publish & Approve",
      reviews_empty: "No reviews registered yet",
      users_admin_title: "Accounts, Staff Roles & Ban Controls",
      users_th_user: "Name & Email",
      users_th_role: "Role & Permission",
      users_th_ban: "Account Status",
      users_th_actions: "Actions & Permissions",
      users_empty: "No registered users found",
      users_status_banned: "Banned",
      users_status_active: "Active",
      users_promote_to_staff: "Promote to Staff",
      users_demote_to_client: "Demote to Client",
      users_ban: "Ban Account",
      users_unban: "Unban Account",
      users_delete: "Delete Account",
      users_superadmin_protected: "Owner account protected",
      audit_logs_title: "Security & Audit Logs",
      audit_logs_desc:
        "Displays recent login attempts and sensitive system actions in MongoDB.",
      audit_th_admin: "Admin Name",
      audit_th_email: "Email Used",
      audit_th_action: "Action Taken",
      audit_th_status: "Security Status",
      audit_th_ip: "IP Address",
      audit_th_time: "Timestamp",
      audit_status_success: "Success",
      audit_status_failed: "Failed",
      audit_empty: "No audit records found yet",
      audit_loading: "Loading security audit logs...",
      audit_error:
        "Unable to load audit logs (verify /api/admin/audit-logs endpoint)",
      alert_cart_empty: "Your cart is empty! Add items first.",
      alert_required_fields: "Please complete the required order details.",
      alert_select_table: "Select an available table before checkout.",
      alert_gps_required: "GPS location is required for delivery orders.",
      alert_server_error:
        "A server connection error occurred. Please try again later.",
      alert_gps_unsupported:
        "Your browser does not support automatic GPS detection. You can drag the pin manually.",
      alert_gps_error:
        "Unable to detect your location automatically. You can move the pin manually on the map.",
      alert_login_required: "Please enter your email and password.",
      alert_register_required:
        "All fields are required to create a new account.",
      alert_logout_success: "Logged out successfully.",
      alert_max_order_limit:
        "The maximum allowed quantity for this item is {max} pieces.",
      alert_added_to_cart_success:
        "Successfully added [{title}] to your food cart!",
      alert_review_success:
        "Thank you! Your review has been submitted successfully.",
      alert_review_prompt_name:
        "Please enter your name to confirm your review:",
      alert_dish_not_found: "Meal does not exist or has been removed.",
      alert_account_banned_deleted:
        "Your account has been banned or deleted by system administration.",
      alert_account_role_updated:
        "Congratulations! Your account role has been updated.",
      alert_superadmin_all_fields:
        "Please provide all required fields (Name, Email, and Password).",
      alert_superadmin_secret_required:
        "Please enter the management security secret key!",
      alert_superadmin_create_success:
        "Primary owner account created and secured successfully!",
      alert_admin_unauthorized:
        "Sorry, this account does not have administrator privileges!",
      alert_save_theme_success:
        "Site theme, typography, content, and banners saved successfully to database!",
      alert_save_settings_success:
        "Kitchen working hours and system settings saved successfully!",
      alert_save_qz_success:
        "QZ Tray automated printing settings saved successfully!",
      alert_qz_select_printer_required:
        "Please select a thermal printer from the list before enabling automated printing.",
      alert_qz_safe_protocol_required:
        "For printer protection, enable thermal printing only after selecting 'Thermal' and verified 'ESC/POS'.",
      alert_qz_not_loaded: "Printing module is not loaded yet.",
      alert_qz_not_connected:
        "QZ Tray is not connected. Start QZ Tray on your machine, then click refresh.",
      alert_qz_refresh_success: "Available printers list refreshed.",
      alert_qz_test_success: "Test receipt sent to printer successfully!",
      alert_qz_test_failed: "Failed to send test receipt to printer:",
      alert_qz_claim_required:
        "Enable printing, select a printer, and save settings before claiming primary role.",
      alert_qz_status_update_error: "Unable to update order status on server:",
      alert_qz_status_update_conn_error:
        "Connection error occurred while updating order status.",
      alert_no_whatsapp: "No WhatsApp number registered for this customer.",
      alert_delete_order_confirm:
        "Are you sure you want to permanently delete this order from database and dashboard?",
      alert_delete_dish_confirm:
        "Are you sure you want to permanently delete this dish from database and menu?",
      alert_delete_category_confirm:
        "Are you sure you want to permanently delete this category from database and menu?",
      alert_delete_coupon_confirm:
        "Are you sure you want to permanently delete this coupon?",
      alert_delete_delivery_confirm:
        "Are you sure you want to delete this area from delivery list?",
      alert_delete_table_confirm: "Are you sure you want to delete this table?",
      alert_delete_user_confirm:
        "Are you sure you want to permanently delete this account from database and end its session?",
      alert_delete_review_confirm:
        "Are you sure you want to delete this review?",
      alert_image_invalid: "Please select a valid image file (PNG, JPG, WEBP)!",
      alert_save_table_error: "Unable to save table.",
      alert_update_table_error: "Unable to update table status.",
      alert_delete_table_error: "Unable to delete table.",
      user_guest_welcome: "Welcome, Dear Guest",
      user_guest_prompt: "Sign in to track orders and enjoy a faster experience",
      authentic_taste: "Authentic Traditional Taste",
      appearance: "Appearance",
      theme_light: "Light",
      theme_dark: "Dark",
      language: "Language",
      nav_profile: "My Profile",
      nav_my_orders: "My Orders",
      nav_settings: "Settings",
      nav_dashboard: "Dashboard",
      nav_logout: "Logout",
      user_greeting_default: "Welcome",
      user_greeting: "Hello, {name}",
    },
  };

  // ================= 4. Language and appearance management =================
  function getLanguage() {
    try {
      return localStorage.getItem(langStorageKey) === "ar" ? "ar" : "en";
    } catch (_) {
      return "en";
    }
  }

  function setLanguage(lang) {
    try {
      const normalized = lang === "en" ? "en" : "ar";
      const previous = getLanguage();
      localStorage.setItem(langStorageKey, normalized);

      applyTranslations();

      window.dispatchEvent(
        new CustomEvent("languageChanged", {
          detail: { language: normalized },
        }),
      );

      // Synchronize the translation tool when desired
      syncGoogleTranslate(normalized, previous !== normalized);
    } catch (_) {}
  }

  function getTheme() {
    try {
      return localStorage.getItem(themeStorageKey) === "dark"
        ? "dark"
        : "light";
    } catch (_) {
      return "light";
    }
  }

  function setTheme(theme) {
    try {
      const normalized = theme === "dark" ? "dark" : "light";
      localStorage.setItem(themeStorageKey, normalized);
      applyTheme();
      window.dispatchEvent(
        new CustomEvent("themeChanged", { detail: { theme: normalized } }),
      );
    } catch (_) {}
  }

  function applyTheme() {
    try {
      const theme = getTheme();
      if (theme === "dark") {
        document.documentElement.setAttribute("data-theme", "dark");
      } else {
        document.documentElement.removeAttribute("data-theme");
      }
      const isAr = getLanguage() === "ar";
      const label =
        theme === "dark"
          ? isAr
            ? "Switch to light mode"
            : "Switch to Light Mode"
          : isAr
            ? "Switch to dark mode"
            : "Switch to Dark Mode";
      const iconHtml =
        theme === "dark"
          ? '<i class="fa-solid fa-sun text-warning"></i>'
          : '<i class="fa-solid fa-moon"></i>';

      const buttons = document.querySelectorAll(
        "#siteThemeToggle, .btn-theme-toggle, .mobile-theme-btn, [data-theme-toggle]"
      );
      buttons.forEach((btn) => {
        btn.innerHTML = iconHtml;
        btn.setAttribute("aria-label", label);
        btn.title = label;
      });

      // Update drawer theme buttons if present
      const lightOption = document.getElementById("drawerThemeLight");
      const darkOption = document.getElementById("drawerThemeDark");
      if (lightOption && darkOption) {
        if (theme === "dark") {
          darkOption.classList.add("active");
          lightOption.classList.remove("active");
        } else {
          lightOption.classList.add("active");
          darkOption.classList.remove("active");
        }
      }
    } catch (error) {}
  }

  function setElementText(element, value) {
    if (!element || typeof value !== "string") return;

    if (element.matches("input[placeholder], textarea[placeholder]")) {
      element.placeholder = value;
      return;
    }

    if (element.tagName === "OPTION") {
      element.text = value;
      return;
    }

    const hasSubElements = element.querySelector(
      "i, svg, .icon, .badge, span.badge, img",
    );
    if (hasSubElements) {
      let replaced = false;
      element.childNodes.forEach((node) => {
        if (
          node.nodeType === Node.TEXT_NODE &&
          node.textContent.trim() !== ""
        ) {
          node.textContent = " " + value + " ";
          replaced = true;
        }
      });
      if (!replaced) {
        element.appendChild(document.createTextNode(" " + value));
      }
    } else {
      element.textContent = value;
    }
  }

  function t(key, params, fallback) {
    const lang = getLanguage();
    const dictionary = translations[lang] || translations.ar;
    let value = dictionary[key];

    if (typeof value !== "string") {
      if (typeof params === "string") return params;
      return fallback !== undefined ? fallback : key;
    }

    if (params && typeof params === "object") {
      for (const [pKey, pVal] of Object.entries(params)) {
        value = value.replace(new RegExp(`\\{${pKey}\\}`, "g"), String(pVal));
      }
    }

    return value;
  }

  // ================= 5. Deep page text scanner (Deep DOM Translator) =================
  const IGNORED_TAGS = new Set([
    "SCRIPT",
    "STYLE",
    "NOSCRIPT",
    "CODE",
    "PRE",
    "SVG",
    "IFRAME",
  ]);

  async function translateAllElements(root = document) {
    const lang = getLanguage();

    // If the language is Arabic, restore only the original text
    if (lang === "ar") {
      restoreOriginalTexts(root);
      return;
    }

    // Check all free text nodes
    const walker = document.createTreeWalker(
      root === document ? document.body : root,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          if (!node.parentElement) return NodeFilter.FILTER_REJECT;
          if (IGNORED_TAGS.has(node.parentElement.tagName))
            return NodeFilter.FILTER_REJECT;
          if (node.parentElement.closest(".no-translate, [data-no-translate]"))
            return NodeFilter.FILTER_REJECT;
          const text = node.textContent.trim();
          if (!text || !containsArabic(text)) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        },
      },
    );

    const nodesToTranslate = [];
    let currentNode;
    while ((currentNode = walker.nextNode())) {
      nodesToTranslate.push(currentNode);
    }

    // Translate text
    for (const node of nodesToTranslate) {
      const original = node.textContent;
      if (!node._origText) {
        node._origText = original;
      }

      const translated = await translateText(original.trim(), "ar", "en");
      if (translated && getLanguage() === "en") {
        node.textContent = original.replace(original.trim(), translated);
      }
    }

    // Translate attributes such as placeholder, title, and alt
    const elementsWithAttrs = (
      root.querySelectorAll ? root : document
    ).querySelectorAll(
      "input[placeholder], textarea[placeholder], [title], [aria-label], img[alt]",
    );

    elementsWithAttrs.forEach(async (el) => {
      if (el.placeholder && containsArabic(el.placeholder)) {
        if (!el.dataset.origPlaceholder)
          el.dataset.origPlaceholder = el.placeholder;
        const res = await translateText(el.placeholder, "ar", "en");
        if (getLanguage() === "en") el.placeholder = res;
      }
      if (el.title && containsArabic(el.title)) {
        if (!el.dataset.origTitle) el.dataset.origTitle = el.title;
        const res = await translateText(el.title, "ar", "en");
        if (getLanguage() === "en") el.title = res;
      }
      if (
        el.getAttribute("aria-label") &&
        containsArabic(el.getAttribute("aria-label"))
      ) {
        if (!el.dataset.origAriaLabel)
          el.dataset.origAriaLabel = el.getAttribute("aria-label");
        const res = await translateText(
          el.getAttribute("aria-label"),
          "ar",
          "en",
        );
        if (getLanguage() === "en") el.setAttribute("aria-label", res);
      }
      if (el.alt && containsArabic(el.alt)) {
        if (!el.dataset.origAlt) el.dataset.origAlt = el.alt;
        const res = await translateText(el.alt, "ar", "en");
        if (getLanguage() === "en") el.alt = res;
      }
    });
  }

  // Restore original text when switching to Arabic
  function restoreOriginalTexts(root = document) {
    const walker = document.createTreeWalker(
      root === document ? document.body : root,
      NodeFilter.SHOW_TEXT,
      null,
    );

    let node;
    while ((node = walker.nextNode())) {
      if (node._origText) {
        node.textContent = node._origText;
      }
    }

    const elements = (root.querySelectorAll ? root : document).querySelectorAll(
      "[data-orig-placeholder], [data-orig-title], [data-orig-aria-label], [data-orig-alt]",
    );

    elements.forEach((el) => {
      if (el.dataset.origPlaceholder)
        el.placeholder = el.dataset.origPlaceholder;
      if (el.dataset.origTitle) el.title = el.dataset.origTitle;
      if (el.dataset.origAriaLabel)
        el.setAttribute("aria-label", el.dataset.origAriaLabel);
      if (el.dataset.origAlt) el.alt = el.dataset.origAlt;
    });
  }

  // ================= 6. Apply all translations =================
  function applyTranslations(rootElement) {
    try {
      const language = getLanguage();
      const dictionary = translations[language] || translations.ar;
      const root =
        rootElement && rootElement.querySelectorAll ? rootElement : document;

      if (root === document) {
        document.documentElement.lang = language;
        document.documentElement.dir = language === "en" ? "ltr" : "rtl";

        const pageTitleEl = document.querySelector("title[data-page-title]");
        if (pageTitleEl) {
          const pageTitleKey = pageTitleEl.dataset.pageTitleKey;
          const pageTitleRaw = pageTitleEl.dataset.pageTitle;
          const translatedPageTitle =
            pageTitleKey && dictionary[pageTitleKey]
              ? dictionary[pageTitleKey]
              : pageTitleRaw;
          const brandName =
            (window.getRestaurantName && window.getRestaurantName()) ||
            (window.restaurantSettings && window.restaurantSettings.name) ||
            (language === "en"
              ? "Abu Qorah Restaurant"
              : "Abu Qoura Traditional Restaurant");
          document.title = `${translatedPageTitle} - ${brandName}`;
        }
      }

      // Apply static dictionary
      root.querySelectorAll("[data-i18n]").forEach((element) => {
        const key = element.dataset.i18n;
        const value = dictionary[key];
        if (typeof value === "string") {
          setElementText(element, value);
        }
      });

      root.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
        const key = element.dataset.i18nPlaceholder;
        const value = dictionary[key];
        if (typeof value === "string") element.placeholder = value;
      });

      root.querySelectorAll("[data-i18n-title]").forEach((element) => {
        const key = element.dataset.i18nTitle;
        const value = dictionary[key];
        if (typeof value === "string") element.title = value;
      });

      root.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
        const key = element.dataset.i18nAriaLabel;
        const value = dictionary[key];
        if (typeof value === "string")
          element.setAttribute("aria-label", value);
      });

      root.querySelectorAll("[data-i18n-alt]").forEach((element) => {
        const key = element.dataset.i18nAlt;
        const value = dictionary[key];
        if (typeof value === "string") element.alt = value;
      });

      const button = document.getElementById("siteLanguageToggle");
      if (button) {
        button.textContent = language === "ar" ? "English" : "Arabic";
        button.setAttribute(
          "aria-label",
          language === "ar"
            ? "Switch language to English"
            : "Change language to Arabic",
        );
      }

      // Run the deep scanner for parts not covered by the dictionary
      translateAllElements(root);
    } catch (error) {}
  }

  // ================= 7. Dynamically observe page changes =================
  function setupMutationObserver() {
    if (!window.MutationObserver) return;

    let debounceTimer = null;
    const observer = new MutationObserver((mutations) => {
      if (getLanguage() !== "en") return;

      let shouldTranslate = false;
      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          shouldTranslate = true;
          break;
        }
      }

      if (shouldTranslate) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          translateAllElements(document.body);
        }, 200);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  // ================= 8. Google Translate integration as an additional safeguard =================
  function getGoogTransCookie() {
    try {
      const match = document.cookie.match(/(?:^|;\s*)googtrans=([^;]*)/);
      return match ? decodeURIComponent(match[1]) : "";
    } catch (_) {
      return "";
    }
  }

  function writeGoogTransCookie(value) {
    try {
      const oneYear = 60 * 60 * 24 * 365;
      const base = `googtrans=${encodeURIComponent(value)}; path=/; max-age=${oneYear}`;
      document.cookie = base;
      document.cookie = `${base}; domain=.${location.hostname}`;
    } catch (_) {}
  }

  function clearGoogTransCookie() {
    try {
      const expired = "expires=Thu, 01 Jan 1970 00:00:00 UTC";
      document.cookie = `googtrans=; path=/; ${expired}`;
      document.cookie = `googtrans=; path=/; domain=.${location.hostname}; ${expired}`;
    } catch (_) {}
  }

  function injectGoogleTranslateWidget() {
    try {
      if (document.getElementById("google_translate_element")) return;

      const container = document.createElement("div");
      container.id = "google_translate_element";
      container.setAttribute(
        "style",
        "position:absolute;top:-9999px;left:-9999px;width:0;height:0;overflow:hidden;",
      );
      document.body.appendChild(container);

      window.googleTranslateElementInit = function () {
        if (!window.google || !window.google.translate) return;
        try {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: "ar",
              includedLanguages: "ar,en",
              autoDisplay: false,
            },
            "google_translate_element",
          );
        } catch (_) {}
      };

      if (!document.getElementById("googleTranslateScript")) {
        const script = document.createElement("script");
        script.id = "googleTranslateScript";
        script.src =
          "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        script.async = true;
        document.body.appendChild(script);
      }
    } catch (_) {}
  }

  function syncGoogleTranslate(lang, shouldReload) {
    try {
      const desired = lang === "en" ? "/ar/en" : "";
      const current = getGoogTransCookie();
      if (current === desired) return;

      if (lang === "en") writeGoogTransCookie(desired);
      else clearGoogTransCookie();

      if (shouldReload) {
        location.reload();
      }
    } catch (_) {}
  }

  // ================= 9. Interface, buttons, and styling =================
  function injectStyles() {
    if (document.getElementById("siteUtilityToggleStyles")) return;
    const style = document.createElement("style");
    style.id = "siteUtilityToggleStyles";
    style.textContent = `
      .site-utility-toggles {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        z-index: 1040;
      }
      .site-language-toggle {
        border: 1px solid var(--brass, var(--primary-color, #a82810));
        background: var(--card-bg, #ffffff);
        color: var(--ink, #1a1816);
        border-radius: 999px;
        padding: 0.35rem 0.85rem;
        font: inherit;
        font-weight: 800;
        font-size: 0.82rem;
        line-height: 1.2;
        white-space: nowrap;
        cursor: pointer;
        transition: all 0.2s ease;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .site-language-toggle:hover {
        background: var(--brass, var(--primary-color, #a82810));
        color: #ffffff;
      }
      .site-theme-toggle {
        border: 1px solid var(--brass, var(--primary-color, #a82810));
        background: var(--card-bg, #ffffff);
        color: var(--ink, #1a1816);
        border-radius: 999px;
        width: 2.3rem;
        height: 2.3rem;
        flex-shrink: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 1rem;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .site-theme-toggle:hover {
        background: var(--brass, var(--primary-color, #a82810));
        color: #ffffff;
      }
      .admin-topbar .site-language-toggle,
      .admin-topbar .site-theme-toggle {
        background: rgba(255, 255, 255, 0.08);
        border-color: var(--brass, #A8792F);
        color: var(--brass-light, #D8B978);
      }
      .admin-topbar .site-language-toggle:hover,
      .admin-topbar .site-theme-toggle:hover {
        background: var(--brass, #A8792F);
        color: #1B1512;
      }
      [dir="ltr"] .modal-header-custom .btn-close {
        right: auto !important;
        left: auto !important;
      }
      .goog-te-banner-frame,
      .goog-te-gadget-icon,
      #google_translate_element,
      .skiptranslate > iframe {
        display: none !important;
        visibility: hidden !important;
        height: 0 !important;
      }
      body {
        top: 0 !important;
        position: static !important;
      }
      .goog-text-highlight {
        background: none !important;
        box-shadow: none !important;
      }
      .goog-tooltip,
      .goog-tooltip:hover {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
  }

  function getToggleWrapper() {
    let wrapper = document.getElementById("siteUtilityToggles");
    if (wrapper) return wrapper;

    const adminActions = document.querySelector(".admin-topbar-actions");
    if (adminActions) {
      wrapper = document.createElement("div");
      wrapper.id = "siteUtilityToggles";
      wrapper.className = "site-utility-toggles me-2";
      adminActions.prepend(wrapper);
      return wrapper;
    }

    // Do not inject extra floating toggles if header already has dedicated buttons
    if (document.querySelector(".main-navbar, .btn-lang-toggle, .mobile-theme-btn")) {
      return null;
    }

    const headerContainer = document.querySelector("header .container");
    if (headerContainer) {
      wrapper = document.createElement("div");
      wrapper.id = "siteUtilityToggles";
      wrapper.className = "site-utility-toggles";
      headerContainer.appendChild(wrapper);
      return wrapper;
    }

    return null;
  }

  function injectLanguageToggle() {
    try {
      const wrapper = getToggleWrapper();
      if (!wrapper || document.getElementById("siteLanguageToggle")) return;
      const button = document.createElement("button");
      button.id = "siteLanguageToggle";
      button.type = "button";
      button.className = "site-language-toggle";
      button.textContent = getLanguage() === "ar" ? "English" : "Arabic";
      button.addEventListener("click", () => {
        const nextLang = getLanguage() === "ar" ? "en" : "ar";
        setLanguage(nextLang);
      });
      wrapper.appendChild(button);
    } catch (error) {}
  }

  function injectThemeToggle() {
    try {
      const wrapper = getToggleWrapper();
      if (!wrapper || document.getElementById("siteThemeToggle")) return;
      const button = document.createElement("button");
      button.id = "siteThemeToggle";
      button.type = "button";
      button.className = "site-theme-toggle";
      button.addEventListener("click", () => {
        const nextTheme = getTheme() === "dark" ? "light" : "dark";
        setTheme(nextTheme);
      });
      wrapper.appendChild(button);
      applyTheme();
    } catch (error) {}
  }

  // Global helper functions for cleaner onclick hooks
  window.toggleSiteTheme = function () {
    const nextTheme = getTheme() === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  };
  window.setSiteTheme = function (theme) {
    setTheme(theme);
  };
  window.toggleSiteLanguage = function () {
    const nextLang = getLanguage() === "ar" ? "en" : "ar";
    setLanguage(nextLang);
  };
  window.setSiteLanguage = function (lang) {
    setLanguage(lang);
  };

  // ================= 10. Expose functions to the external system and initialize =================
  window.SiteI18n = {
    applyTranslations,
    getLanguage,
    setLanguage,
    getTheme,
    setTheme,
    t,
    translations,
    translateText,
    translateAllElements,
    memoryCache,
  };

  document.addEventListener("DOMContentLoaded", () => {
    injectStyles();
    injectLanguageToggle();
    injectThemeToggle();
    applyTranslations();
    applyTheme();
    injectGoogleTranslateWidget();
    setupMutationObserver();

    try {
      const savedLang = getLanguage();
      const desired = savedLang === "en" ? "/ar/en" : "";
      const needsSync = getGoogTransCookie() !== desired;
      const alreadySynced = sessionStorage.getItem("i18nGoogleTranslateSynced");
      if (needsSync && !alreadySynced) {
        sessionStorage.setItem("i18nGoogleTranslateSynced", "1");
        syncGoogleTranslate(savedLang, true);
      }
    } catch (_) {}
  });
})();