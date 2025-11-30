/***************************************************
 * FISH & CHIPS FULL SYSTEM — FINAL JS (ONE FILE)
 * AUTHOR: ChatGPT (Custom Build for Your Requirements)
 * VERSION: ULTRA-FINAL BUILD
 ***************************************************/

/**************************************
 * 0 — GLOBAL CONSTANTS & STORAGE KEYS
 **************************************/
const ADMIN_PIN = "2004";

const STORE = {
  ITEMS: "fc_items",
  CART: "fc_cart",
  DELIVERY: "fc_delivery",
  HOURS: "fc_hours",
  SALES: "fc_sales"
};

/**************************************
 * 1 — HELPERS
 **************************************/
const $ = (id) => document.getElementById(id);
const formatPrice = (n) => "£" + Number(n || 0).toFixed(2);
const now = () => new Date();

/**************************************
 * 2 — LOCAL STORAGE WRAPPER
 **************************************/
const LS = {
  load(key, fallback) {
    try {
      const x = localStorage.getItem(key);
      if (!x) return fallback;
      return JSON.parse(x);
    } catch { return fallback; }
  },
  save(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

/**************************************
 * 3 — GLOBAL STATE
 **************************************/
let items = LS.load(STORE.ITEMS, []);
let cart = LS.load(STORE.CART, []);
let deliverySettings = LS.load(STORE.DELIVERY, {
  enabled: false,
  eta: 30
});
let weeklyHours = LS.load(STORE.HOURS, {
  Sunday:   { on:false, open:"00:00", close:"00:00" },
  Monday:   { on:true,  open:"12:30", close:"21:30" },
  Tuesday:  { on:true,  open:"12:30", close:"21:30" },
  Wednesday:{ on:true,  open:"12:30", close:"21:30" },
  Thursday: { on:true,  open:"12:30", close:"21:30" },
  Friday:   { on:true,  open:"12:30", close:"21:30" },
  Saturday: { on:true,  open:"12:30", close:"21:30" }
});
let todayStats = LS.load(STORE.SALES, {
  total:0,
  deliveryTotal:0,
  collectionTotal:0,
  orders:0,
  deliveryOrders:0,
  collectionOrders:0
});

/**************************************
 * 4 — STORE OPEN/CLOSE LOGIC
 **************************************/
function isStoreOpenNow() {
  const d = now();
  const day = d.toLocaleString('en-US',{weekday:'long'});
  const rule = weeklyHours[day];
  if (!rule.on) return false;
  const nowStr = d.toTimeString().slice(0,5);
  return (nowStr >= rule.open && nowStr <= rule.close);
}

/**************************************
 * 5 — RENDER SHOP STATUS BADGE
 **************************************/
function updateShopStatus() {
  const el = $("shopStatusBanner");
  if (isStoreOpenNow()) {
    el.textContent = deliverySettings.enabled
      ? "Open — Delivery & Collection"
      : "Open — Collection Only";
  } else {
    el.textContent = "Closed Now";
  }
}

/**************************************
 * 6 — MENU RENDER
 **************************************/
function renderMenu() {
  const grid = $("menuGrid");
  grid.innerHTML = "";

  items.forEach(item => {
    const card = document.createElement("div");
    card.className = "menu-card";
    card.innerHTML = `
      <img class="menu-img" src="${item.img}">
      <div class="menu-body">
        <div class="menu-name">${item.name}</div>
        <div class="menu-price">${item.options ? "From " + formatPrice(Math.min(...item.options.map(o=>o.price))) : formatPrice(item.price)}</div>
        <div class="menu-desc">${item.desc||""}</div>
      </div>
      <button class="quick-add">+</button>
    `;

    /// click opens modal
    card.onclick = (e)=>{
      if (e.target.classList.contains("quick-add")) {
        quickAdd(item, e.target);
      } else {
        openItemModal(item);
      }
    };

    grid.appendChild(card);
  });
}

/**************************************
 * 7 — CART LOGIC
 **************************************/
function saveCart() { LS.save(STORE.CART, cart); }

function cartSummary() {
  let qty = 0, total = 0;
  cart.forEach(c=>{ qty += c.qty; total += c.qty*c.price; });
  $("cartCount").textContent = qty;
  $("cartTotal").textContent = formatPrice(total);
}

function quickAdd(item, btn) {
  // if single price
  if (!item.options) {
    addToCart(item, null, 1, btn);
    return;
  }
  // else select first option automatically
  addToCart(item, item.options[0], 1, btn);
}

function addToCart(item, option, qty, btn) {
  const key = option ? item.id+"_"+option.id : "S_"+item.id;
  let existing = cart.find(c=>c.key===key);

  const price = option ? option.price : item.price;
  const name = option ? `${item.name} (${option.name})` : item.name;

  if (!existing) {
    cart.push({ key, itemId:item.id, optionId:option?option.id:null, qty, price, name });
  } else {
    existing.qty += qty;
  }

  saveCart();
  cartSummary();
  animateFly(btn);
}

/**************************************
 * 8 — FLY ANIMATION (Slow)
 **************************************/
function animateFly(btn) {
  if (!btn) return;
  const bubble = $("cartBubble").getBoundingClientRect();
  const b = btn.getBoundingClientRect();

  const dot = document.createElement("div");
  dot.className = "fly-dot";
  dot.style.left = b.left+"px";
  dot.style.top = b.top+"px";
  document.body.appendChild(dot);

  const dx = bubble.left - b.left;
  const dy = bubble.top - b.top;

  requestAnimationFrame(()=>{
    dot.style.transform = `translate(${dx}px, ${dy}px) scale(0.2)`;
    dot.style.opacity = "0";
  });

  dot.addEventListener("transitionend", ()=> dot.remove() );
}

/**************************************
 * 9 — ITEM MODAL
 **************************************/
let currentItem = null;
let selectedOption = null;

function openItemModal(item) {
  currentItem = item;
  selectedOption = null;

  $("modalImg").src = item.img;
  $("modalName").textContent = item.name;
  $("modalDesc").textContent = item.desc || "";
  $("modalOptions").innerHTML = "";

  if (item.options) {
    $("modalPrice").textContent = "Select an option";
    item.options.forEach(opt=>{
      const d = document.createElement("div");
      d.textContent = `${opt.name} — ${formatPrice(opt.price)}`;
      d.className = "opt-row";

      d.onclick = ()=>{
        document.querySelectorAll(".opt-row").forEach(x=>x.classList.remove("active"));
        d.classList.add("active");
        selectedOption = opt;
        $("modalPrice").textContent = formatPrice(opt.price);
      };
      $("modalOptions").appendChild(d);
    });
  } else {
    $("modalPrice").textContent = formatPrice(item.price);
  }

  // Button visibility
  const open = isStoreOpenNow();

  $("modalCollection").style.display = open ? "inline-block" : "none";
  $("modalDelivery").style.display =
    (open && deliverySettings.enabled) ? "inline-block" : "none";

  $("modalAddCart").style.display =
    (open && (!deliverySettings.enabled ? true : true));

  $("itemModal").classList.add("show");
}

function closeItemModal() {
  $("itemModal").classList.remove("show");
}

/**************************************
 * 10 — DIRECT ORDER (COLLECTION / DELIVERY)
 **************************************/
function directOrder(mode) {
  if (!currentItem) return;
  if (currentItem.options && !selectedOption) {
    alert("Select an option first.");
    return;
  }

  const price = selectedOption ? selectedOption.price : currentItem.price;
  const name  = selectedOption ? `${currentItem.name} (${selectedOption.name})` : currentItem.name;

  // Ask time
  const isDelivery = mode==="delivery";
  const now = new Date();
  let time;
  if (isDelivery) {
    time = new Date(now.getTime() + deliverySettings.eta*60000);
  } else {
    time = new Date(now.getTime() + 10*60000);
  }

  // Save stats
  todayStats.total += price;
  todayStats.orders++;

  if (isDelivery) {
    todayStats.deliveryTotal += price;
    todayStats.deliveryOrders++;
  } else {
    todayStats.collectionTotal += price;
    todayStats.collectionOrders++;
  }

  LS.save(STORE.SALES, todayStats);

  alert(
    `${mode.toUpperCase()} ORDER CONFIRMED\n\n` +
    `${name}\nPrice: ${formatPrice(price)}\nReady at: ${time.toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"})}`
  );

  closeItemModal();
  renderTodayStats();
}

/**************************************
 * 11 — CHECKOUT (WHEN CART HAS ITEMS)
 **************************************/
function openCheckout() {
  const list = $("checkoutList");
  list.innerHTML = "";

  let total = 0;
  cart.forEach(c=>{
    total += c.qty*c.price;

    const row = document.createElement("div");
    row.className="checkout-item";
    row.innerHTML = `
      <span>${c.qty} × ${c.name}</span>
      <span>${formatPrice(c.qty*c.price)}</span>
    `;
    list.appendChild(row);
  });

  $("checkoutTotal").textContent = formatPrice(total);

  $("collectionDeliverySection").innerHTML = `
    <button id="checkoutCollection" class="btn blue">COLLECTION</button>
    ${deliverySettings.enabled ? `<button id="checkoutDelivery" class="btn red">DELIVERY</button>` : ""}
  `;

  $("checkoutCollection").onclick = ()=> checkoutConfirm("collection");
  if (deliverySettings.enabled)
    $("checkoutDelivery").onclick = ()=> checkoutConfirm("delivery");

  $("checkoutModal").classList.add("show");
}

function checkoutConfirm(type) {
  let sum = 0;
  cart.forEach(c=> sum += c.qty*c.price);

  const isDelivery = type==="delivery";

  todayStats.total += sum;
  todayStats.orders++;

  if (isDelivery) {
    todayStats.deliveryTotal += sum;
    todayStats.deliveryOrders++;
  } else {
    todayStats.collectionTotal += sum;
    todayStats.collectionOrders++;
  }

  LS.save(STORE.SALES, todayStats);

  alert(
    `${type.toUpperCase()} ORDER CONFIRMED\nTotal = ${formatPrice(sum)}`
  );

  cart = [];
  saveCart();
  cartSummary();
  closeCheckout();
  renderTodayStats();
}

function closeCheckout() {
  $("checkoutModal").classList.remove("show");
}

/**************************************
 * 12 — SEARCH
 **************************************/
function applySearch() {
  const t = $("searchInput").value.toLowerCase().trim();

  if (t === ADMIN_PIN) {
    openAdmin();
    $("searchInput").value = "";
    return;
  }

  $("searchError").textContent = "";

  if (!t) {
    renderMenu();
    return;
  }

  const found = items.filter(i => i.name.toLowerCase().includes(t));

  if (found.length === 0) {
    $("searchError").textContent = `No items found for "${t}"`;
    renderMenu(); // menu stays!
    return;
  }

  const grid = $("menuGrid");
  grid.innerHTML = "";
  found.forEach(item => {
    const card = document.createElement("div");
    card.className = "menu-card";
    card.innerHTML = `
      <img class="menu-img" src="${item.img}">
      <div class="menu-body">
        <div class="menu-name">${item.name}</div>
        <div class="menu-price">${item.options ? "From " + formatPrice(Math.min(...item.options.map(o=>o.price))) : formatPrice(item.price)}</div>
        <div class="menu-desc">${item.desc||""}</div>
      </div>
      <button class="quick-add">+</button>
    `;
    card.onclick = (e)=>{
      if (e.target.classList.contains("quick-add")) quickAdd(item, e.target);
      else openItemModal(item);
    };
    grid.appendChild(card);
  });
}

/**************************************
 * 13 — ADMIN PANEL
 **************************************/
function openAdmin() {
  $("adminPanel").classList.add("open");
  renderWeeklyHours();
  renderTodayStats();
  renderAdminItems();
  $("deliveryEnabled").checked = deliverySettings.enabled;
  $("deliveryETA").value = deliverySettings.eta;
}

function closeAdmin() {
  $("adminPanel").classList.remove("open");
}

/**************************************
 * ADMIN: WEEKLY HOURS RENDER
 **************************************/
function renderWeeklyHours() {
  const box = $("weeklyHoursContainer");
  box.innerHTML = "";

  for (const day in weeklyHours) {
    const r = weeklyHours[day];
    const row = document.createElement("div");

    row.innerHTML = `
      <label>
        <input type="checkbox" data-day="${day}" class="wh-on" ${r.on?"checked":""}>
        ${day}
      </label>
      <div>
        <input type="time" class="wh-open" data-day="${day}" value="${r.open}" ${r.on?"":"disabled"}>
        <input type="time" class="wh-close" data-day="${day}" value="${r.close}" ${r.on?"":"disabled"}>
      </div>
    `;
    box.appendChild(row);
  }

  // listeners
  document.querySelectorAll(".wh-on").forEach(ch=>{
    ch.onchange = ()=>{
      const d = ch.dataset.day;
      weeklyHours[d].on = ch.checked;
      // enable/disable times
      document.querySelectorAll(`input[data-day="${d}"]`).forEach(x=>{
        if (x.classList.contains("wh-open") || x.classList.contains("wh-close")) {
          x.disabled = !ch.checked;
        }
      });
      LS.save(STORE.HOURS, weeklyHours);
      updateShopStatus();
    };
  });

  document.querySelectorAll(".wh-open").forEach(inp=>{
    inp.onchange = ()=>{
      const d = inp.dataset.day;
      weeklyHours[d].open = inp.value;
      LS.save(STORE.HOURS, weeklyHours);
      updateShopStatus();
    };
  });

  document.querySelectorAll(".wh-close").forEach(inp=>{
    inp.onchange = ()=>{
      const d = inp.dataset.day;
      weeklyHours[d].close = inp.value;
      LS.save(STORE.HOURS, weeklyHours);
      updateShopStatus();
    };
  });
}

/**************************************
 * ADMIN: DELIVERY SETTINGS
 **************************************/
$("deliveryEnabled").onchange = ()=>{
  deliverySettings.enabled = $("deliveryEnabled").checked;
  LS.save(STORE.DELIVERY, deliverySettings);
  updateShopStatus();
};

$("deliveryETA").oninput = ()=>{
  deliverySettings.eta = parseInt($("deliveryETA").value)||30;
  LS.save(STORE.DELIVERY, deliverySettings);
};

/**************************************
 * ADMIN: ADD ITEM
 **************************************/
$("addItemForm").onsubmit = (e)=>{
  e.preventDefault();

  const name = $("itemName").value.trim();
  const img  = $("itemImg").value.trim();
  const desc = $("itemDesc").value.trim();
  const price= $("itemPrice").value.trim();
  const useS = $("useSizes").checked;

  if (!name || !img) return alert("Name & image required");

  const id = Date.now();

  let obj = { id, name, img, desc };

  if (useS) {
    let opts = [];

    if ($("sizeSmall").checked) {
      opts.push({ id:id+"_S", name:"Small", price:Number($("sizeSmallPrice").value) });
    }
    if ($("sizeMedium").checked) {
      opts.push({ id:id+"_M", name:"Medium",price:Number($("sizeMediumPrice").value) });
    }
    if ($("sizeLarge").checked) {
      opts.push({ id:id+"_L", name:"Large", price:Number($("sizeLargePrice").value) });
    }
    if (!opts.length) return alert("Select at least one size");

    obj.options = opts;
  } else {
    obj.price = Number(price);
  }

  items.push(obj);
  LS.save(STORE.ITEMS, items);
  renderMenu();
  renderAdminItems();
  alert("Item added!");
  e.target.reset();
};

/**************************************
 * ADMIN: ITEMS LIST
 **************************************/
function renderAdminItems() {
  const box = $("adminItemsList");
  box.innerHTML = "";

  items.forEach(it=>{
    const row = document.createElement("div");
    row.className="admin-item";
    row.innerHTML = `
      <div>${it.name}</div>
      <div>${it.options ? it.options.length+" sizes" : formatPrice(it.price)}</div>
      <div class="admin-item-actions">
        <button class="btn small gold" data-edit="${it.id}">EDIT</button>
        <button class="btn small red" data-del="${it.id}">DEL</button>
      </div>
    `;
    box.appendChild(row);
  });

  // delete
  document.querySelectorAll("[data-del]").forEach(btn=>{
    btn.onclick = ()=>{
      const id = btn.dataset.del;
      if (!confirm("Delete item?")) return;
      items = items.filter(i=>i.id!=id);
      LS.save(STORE.ITEMS, items);
      renderMenu();
      renderAdminItems();
    };
  });

  // edit (simple price editing)
  document.querySelectorAll("[data-edit]").forEach(btn=>{
    btn.onclick = ()=>{
      const id = btn.dataset.edit;
      const it = items.find(x=>x.id==id);
      if (!it) return;

      if (!it.options) {
        const np = prompt("New price:", it.price);
        if (!np) return;
        it.price = Number(np);
        LS.save(STORE.ITEMS, items);
        renderMenu();
        renderAdminItems();
      } else {
        alert("Multi-size editing not supported in this build.");
      }
    };
  });
}

/**************************************
 * ADMIN: TODAY STATS
 **************************************/
function renderTodayStats() {
  const el = $("todayStats");
  el.innerHTML = `
    Total Revenue: ${formatPrice(todayStats.total)}<br>
    Delivery Total: ${formatPrice(todayStats.deliveryTotal)}<br>
    Collection Total: ${formatPrice(todayStats.collectionTotal)}<br>
    Orders: ${todayStats.orders}<br>
    Delivery Orders: ${todayStats.deliveryOrders}<br>
    Collection Orders: ${todayStats.collectionOrders}<br>
    Platform (7%): ${formatPrice(todayStats.collectionTotal*0.07)}<br>
    Restaurant (93% Collection + 100% Delivery):
       ${formatPrice(todayStats.collectionTotal*0.93 + todayStats.deliveryTotal)}
  `;
}

/**************************************
 * EVENT LISTENERS
 **************************************/
$("searchInput").oninput = applySearch;
$("modalClose").onclick = closeItemModal;
$("checkoutClose").onclick = closeCheckout;

$("modalAddCart").onclick = ()=>{
  if (!currentItem) return;
  if (currentItem.options && !selectedOption) return alert("Select an option first.");
  addToCart(currentItem, selectedOption, 1, $("modalAddCart"));
  closeItemModal();
};

$("modalCollection").onclick = ()=> directOrder("collection");
$("modalDelivery").onclick = ()=> directOrder("delivery");

$("cartBubble").onclick = ()=>{
  if (cart.length === 0) return alert("Cart empty.");
  openCheckout();
};

$("adminClose").onclick = closeAdmin;

/**************************************
 * INIT
 **************************************/
$("year").textContent = new Date().getFullYear();
updateShopStatus();
renderMenu();
cartSummary();
renderTodayStats();

console.log("FISH & CHIPS FULL SYSTEM LOADED ✔");
