const defaultProducts = [
  {
    id: "denim-jacket",
    name: "Washed Denim Jacket",
    category: "outerwear",
    price: 32,
    size: "UK 10 / M",
    image:
      "https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=900&q=80",
    notes: "Relaxed fit with soft fading and light vintage wear.",
  },
  {
    id: "cream-knit",
    name: "Cream Cable Knit",
    category: "tops",
    price: 24,
    size: "S / M",
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
    notes: "Cosy knit, great condition, easy winter layering piece.",
  },
  {
    id: "tailored-trousers",
    name: "Tailored Black Trousers",
    category: "bottoms",
    price: 20,
    size: "W28",
    image:
      "https://images.unsplash.com/photo-1506629905607-d405d7d3b0d2?auto=format&fit=crop&w=900&q=80",
    notes: "Straight-leg fit with a clean smart-casual shape.",
  },
  {
    id: "mini-bag",
    name: "Chocolate Mini Bag",
    category: "accessories",
    price: 18,
    size: "One size",
    image:
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=80",
    notes: "Compact shoulder bag with gold-tone hardware.",
  },
];

const defaultSettings = {
  hero:
    "Giving quality clothes a second look with curated drops, honest condition notes, and affordable finds.",
  about:
    "One More Look is built around simple, careful resale: handpicked pieces, regular drops, and styling that makes preloved clothing feel exciting again.",
  accent: "#a95f55",
  vinted: "#",
  ebay: "#",
};

const store = {
  get products() {
    return JSON.parse(localStorage.getItem("oml-products")) || defaultProducts;
  },
  set products(value) {
    localStorage.setItem("oml-products", JSON.stringify(value));
  },
  get basket() {
    return JSON.parse(localStorage.getItem("oml-basket")) || [];
  },
  set basket(value) {
    localStorage.setItem("oml-basket", JSON.stringify(value));
  },
  get settings() {
    return { ...defaultSettings, ...(JSON.parse(localStorage.getItem("oml-settings")) || {}) };
  },
  set settings(value) {
    localStorage.setItem("oml-settings", JSON.stringify(value));
  },
  get employeeLoggedIn() {
    return localStorage.getItem("oml-employee") === "true";
  },
  set employeeLoggedIn(value) {
    localStorage.setItem("oml-employee", String(value));
  },
};

const productGrid = document.querySelector("#productGrid");
const stockList = document.querySelector("#stockList");
const stockCount = document.querySelector("#stockCount");
const employeePanel = document.querySelector("#employeePanel");
const loginForm = document.querySelector("#loginForm");
const adminArea = document.querySelector("#adminArea");
const loginMessage = document.querySelector("#loginMessage");
const panelTitle = document.querySelector("#panelTitle");
const stockForm = document.querySelector("#stockForm");
const settingsForm = document.querySelector("#settingsForm");
const linksForm = document.querySelector("#linksForm");
const basketPanel = document.querySelector("#basketPanel");
const basketList = document.querySelector("#basketList");
const basketCount = document.querySelector("#basketCount");
const basketSubtotal = document.querySelector("#basketSubtotal");
const checkoutItems = document.querySelector("#checkoutItems");
const checkoutSubtotal = document.querySelector("#checkoutSubtotal");
const checkoutForm = document.querySelector("#checkoutForm");
const checkoutMessage = document.querySelector("#checkoutMessage");

let activeFilter = "all";

function pounds(value) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(value);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function makeId(name) {
  return `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${Date.now()}`;
}

function getBasketProducts() {
  const products = store.products;
  return store.basket
    .map((id) => products.find((product) => product.id === id))
    .filter(Boolean);
}

function basketTotal() {
  return getBasketProducts().reduce((total, item) => total + Number(item.price), 0);
}

function renderProducts() {
  const products = store.products;
  const basketIds = store.basket;
  const visibleProducts =
    activeFilter === "all" ? products : products.filter((item) => item.category === activeFilter);

  stockCount.textContent = products.length;

  if (visibleProducts.length === 0) {
    productGrid.innerHTML = `<p class="empty-state">No pieces in this category yet.</p>`;
    return;
  }

  productGrid.innerHTML = visibleProducts
    .map(
      (item) => {
        const inBasket = basketIds.includes(item.id);
        return `
        <article class="product-card">
          <figure>
            <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" loading="lazy">
          </figure>
          <div class="product-body">
            <div class="product-line">
              <h3>${escapeHtml(item.name)}</h3>
              <span class="price">${pounds(item.price)}</span>
            </div>
            <span class="pill">${escapeHtml(item.size)}</span>
            <p>${escapeHtml(item.notes)}</p>
            <button class="button primary" type="button" data-add-basket="${escapeHtml(item.id)}" ${
              inBasket ? "disabled" : ""
            }>
              ${inBasket ? "In basket" : "Add to basket"}
            </button>
          </div>
        </article>
      `;
      },
    )
    .join("");
}

function renderBasket() {
  const basketProducts = getBasketProducts();
  const total = pounds(basketTotal());

  basketCount.textContent = basketProducts.length;
  basketSubtotal.textContent = total;
  checkoutSubtotal.textContent = total;

  if (basketProducts.length === 0) {
    basketList.innerHTML = `<p class="empty-state">Your basket is empty.</p>`;
    checkoutItems.innerHTML = `<p class="empty-state">Add pieces to your basket before checkout.</p>`;
    checkoutForm.querySelector("button[type='submit']").disabled = true;
    return;
  }

  const basketMarkup = basketProducts
    .map(
      (item) => `
        <article class="basket-item">
          <img src="${escapeHtml(item.image)}" alt="">
          <div>
            <h4>${escapeHtml(item.name)}</h4>
            <p>${escapeHtml(item.size)} &middot; ${pounds(item.price)}</p>
          </div>
          <button class="basket-remove" type="button" data-remove-basket="${escapeHtml(item.id)}">Remove</button>
        </article>
      `,
    )
    .join("");

  const checkoutMarkup = basketProducts
    .map(
      (item) => `
        <article class="summary-item">
          <img src="${escapeHtml(item.image)}" alt="">
          <div>
            <h4>${escapeHtml(item.name)}</h4>
            <p>${escapeHtml(item.size)}</p>
          </div>
          <strong>${pounds(item.price)}</strong>
        </article>
      `,
    )
    .join("");

  basketList.innerHTML = basketMarkup;
  checkoutItems.innerHTML = checkoutMarkup;
  checkoutForm.querySelector("button[type='submit']").disabled = false;
}

function addToBasket(id) {
  if (store.basket.includes(id)) {
    return;
  }

  store.basket = [...store.basket, id];
  renderProducts();
  renderBasket();
}

function removeFromBasket(id) {
  store.basket = store.basket.filter((itemId) => itemId !== id);
  renderProducts();
  renderBasket();
}

function renderStockList() {
  const products = store.products;

  if (products.length === 0) {
    stockList.innerHTML = `<p class="empty-state">No stock added yet.</p>`;
    return;
  }

  stockList.innerHTML = products
    .map(
      (item) => `
        <article class="stock-row">
          <img src="${escapeHtml(item.image)}" alt="">
          <div>
            <h3>${escapeHtml(item.name)}</h3>
            <p>${pounds(item.price)} &middot; ${escapeHtml(item.size)} &middot; ${escapeHtml(item.category)}</p>
          </div>
          <div class="row-actions">
            <button type="button" data-edit="${escapeHtml(item.id)}">Edit</button>
            <button type="button" data-delete="${escapeHtml(item.id)}">Delete</button>
          </div>
        </article>
      `,
    )
    .join("");
}

function applySettings() {
  const settings = store.settings;
  document.documentElement.style.setProperty("--accent", settings.accent);
  document.querySelector("#heroText").textContent = settings.hero;
  document.querySelector("#aboutText").textContent = settings.about;
  document.querySelector("#vintedLink").href = settings.vinted || "#";
  document.querySelector("#ebayLink").href = settings.ebay || "#";
  document.querySelector("#settingHero").value = settings.hero;
  document.querySelector("#settingAbout").value = settings.about;
  document.querySelector("#settingAccent").value = settings.accent;
  document.querySelector("#settingVinted").value = settings.vinted;
  document.querySelector("#settingEbay").value = settings.ebay;
}

function syncAdminState() {
  const isLoggedIn = store.employeeLoggedIn;
  loginForm.classList.toggle("hidden", isLoggedIn);
  adminArea.classList.toggle("hidden", !isLoggedIn);
  panelTitle.textContent = isLoggedIn ? "Website manager" : "Login";
  if (isLoggedIn) {
    renderStockList();
  }
}

function resetStockForm() {
  stockForm.reset();
  document.querySelector("#itemId").value = "";
}

function fillStockForm(item) {
  document.querySelector("#itemId").value = item.id;
  document.querySelector("#itemName").value = item.name;
  document.querySelector("#itemCategory").value = item.category;
  document.querySelector("#itemPrice").value = item.price;
  document.querySelector("#itemSize").value = item.size;
  document.querySelector("#itemImage").value = item.image;
  document.querySelector("#itemNotes").value = item.notes;
}

document.querySelector("#employeeOpen").addEventListener("click", () => {
  syncAdminState();
  employeePanel.showModal();
});

document.querySelector("#employeeClose").addEventListener("click", () => {
  employeePanel.close();
});

document.querySelector("#basketOpen").addEventListener("click", () => {
  renderBasket();
  basketPanel.showModal();
});

document.querySelector("#basketClose").addEventListener("click", () => {
  basketPanel.close();
});

document.querySelector("#checkoutLink").addEventListener("click", () => {
  basketPanel.close();
});

document.querySelector("#clearBasket").addEventListener("click", () => {
  store.basket = [];
  renderProducts();
  renderBasket();
});

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const password = document.querySelector("#employeePassword").value;

  if (password !== "onemorelook") {
    loginMessage.textContent = "That password is not right for this demo.";
    return;
  }

  store.employeeLoggedIn = true;
  loginForm.reset();
  syncAdminState();
});

document.querySelector("#logoutButton").addEventListener("click", () => {
  store.employeeLoggedIn = false;
  syncAdminState();
});

document.querySelectorAll(".filter").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelector(".filter.active").classList.remove("active");
    button.classList.add("active");
    activeFilter = button.dataset.filter;
    renderProducts();
  });
});

productGrid.addEventListener("click", (event) => {
  const itemId = event.target.dataset.addBasket;
  if (itemId) {
    addToBasket(itemId);
  }
});

basketList.addEventListener("click", (event) => {
  const itemId = event.target.dataset.removeBasket;
  if (itemId) {
    removeFromBasket(itemId);
  }
});

document.querySelectorAll(".tab").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelector(".tab.active").classList.remove("active");
    button.classList.add("active");
    document.querySelectorAll(".admin-tab").forEach((tab) => tab.classList.add("hidden"));
    document.querySelector(`#${button.dataset.tab}Tab`).classList.remove("hidden");
  });
});

stockForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const id = document.querySelector("#itemId").value;
  const name = document.querySelector("#itemName").value.trim();
  const nextItem = {
    id: id || makeId(name),
    name,
    category: document.querySelector("#itemCategory").value,
    price: Number(document.querySelector("#itemPrice").value),
    size: document.querySelector("#itemSize").value.trim(),
    image: document.querySelector("#itemImage").value.trim(),
    notes: document.querySelector("#itemNotes").value.trim(),
  };

  const products = store.products;
  store.products = id
    ? products.map((item) => (item.id === id ? nextItem : item))
    : [nextItem, ...products];

  resetStockForm();
  renderProducts();
  renderStockList();
});

stockList.addEventListener("click", (event) => {
  const editId = event.target.dataset.edit;
  const deleteId = event.target.dataset.delete;

  if (editId) {
    const item = store.products.find((product) => product.id === editId);
    if (item) {
      fillStockForm(item);
      stockForm.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  if (deleteId) {
    store.products = store.products.filter((product) => product.id !== deleteId);
    store.basket = store.basket.filter((itemId) => itemId !== deleteId);
    renderProducts();
    renderStockList();
    renderBasket();
  }
});

document.querySelector("#clearForm").addEventListener("click", resetStockForm);

settingsForm.addEventListener("submit", (event) => {
  event.preventDefault();
  store.settings = {
    ...store.settings,
    hero: document.querySelector("#settingHero").value.trim(),
    about: document.querySelector("#settingAbout").value.trim(),
    accent: document.querySelector("#settingAccent").value,
  };
  applySettings();
});

linksForm.addEventListener("submit", (event) => {
  event.preventDefault();
  store.settings = {
    ...store.settings,
    vinted: document.querySelector("#settingVinted").value.trim() || "#",
    ebay: document.querySelector("#settingEbay").value.trim() || "#",
  };
  applySettings();
});

checkoutForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const basketProducts = getBasketProducts();

  if (basketProducts.length === 0) {
    checkoutMessage.textContent = "Your basket is empty.";
    return;
  }

  const orderNumber = `OML-${Date.now().toString().slice(-6)}`;
  checkoutMessage.textContent = `Order request ${orderNumber} saved. Payment setup can be connected next.`;
  store.basket = [];
  checkoutForm.reset();
  renderProducts();
  renderBasket();
});

applySettings();
renderProducts();
renderBasket();
syncAdminState();
