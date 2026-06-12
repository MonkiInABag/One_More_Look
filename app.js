const defaultProducts = [
  {
    id: "linen-blazer",
    name: "Linen Blazer - Oat",
    category: "outerwear",
    price: 48,
    size: "M",
    image:
      "https://images.unsplash.com/photo-1520006403909-838d6b92c22e?w=600&h=750&fit=crop&auto=format",
    notes: "Like new condition. Soft tailoring, easy to dress up or down.",
  },
  {
    id: "silk-midi-dress",
    name: "Silk Midi Dress - Burgundy",
    category: "dresses",
    price: 62,
    size: "S",
    image:
      "https://images.unsplash.com/photo-1521335629791-ce4aec67dd15?w=600&h=750&fit=crop&auto=format",
    notes: "Excellent condition with a fluid fit and deep seasonal colour.",
  },
  {
    id: "washed-denim-jacket",
    name: "Washed Denim Jacket",
    category: "outerwear",
    price: 35,
    size: "L",
    image:
      "https://images.unsplash.com/photo-1637228393246-c38a4b3d2011?w=600&h=750&fit=crop&auto=format",
    notes: "Good preloved condition with relaxed fading and a classic cut.",
  },
  {
    id: "merino-turtleneck",
    name: "Merino Turtleneck - Cream",
    category: "tops",
    price: 29,
    size: "XS",
    image:
      "https://images.unsplash.com/photo-1582719188393-bb71ca45dbb9?w=600&h=750&fit=crop&auto=format",
    notes: "Like new knitwear, soft against the skin and ideal for layering.",
  },
];

const defaultSettings = {
  hero:
    "Hand-picked preloved pieces from Cheshire, lovingly checked, honestly described, and priced to find a new home. Because beautiful clothes deserve a second life.",
  about:
    "One More Look is built around careful resale: hand-picked pieces, regular drops, and styling that makes preloved clothing feel exciting again.",
  accent: "#c9a882",
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
const itemImageInput = document.querySelector("#itemImage");
const imageDropzone = document.querySelector("#imageDropzone");
const itemImageFile = document.querySelector("#itemImageFile");
const imagePreview = document.querySelector("#imagePreview");

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
  if (!productGrid || !stockCount) {
    return;
  }

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
  if (!basketCount) {
    return;
  }

  const basketProducts = getBasketProducts();
  const total = pounds(basketTotal());

  basketCount.textContent = basketProducts.length;
  if (basketSubtotal) basketSubtotal.textContent = total;
  if (checkoutSubtotal) checkoutSubtotal.textContent = total;

  if (basketProducts.length === 0) {
    if (basketList) basketList.innerHTML = `<p class="empty-state">Your bag is empty.</p>`;
    if (checkoutItems) {
      checkoutItems.innerHTML = `<p class="empty-state">Add pieces to your bag before checkout.</p>`;
    }
    if (checkoutForm) checkoutForm.querySelector("button[type='submit']").disabled = true;
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

  if (basketList) basketList.innerHTML = basketMarkup;
  if (checkoutItems) checkoutItems.innerHTML = checkoutMarkup;
  if (checkoutForm) checkoutForm.querySelector("button[type='submit']").disabled = false;
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
  const heroText = document.querySelector("#heroText");
  const aboutText = document.querySelector("#aboutText");
  const vintedLink = document.querySelector("#vintedLink");
  const ebayLink = document.querySelector("#ebayLink");
  const settingHero = document.querySelector("#settingHero");
  const settingAbout = document.querySelector("#settingAbout");
  const settingAccent = document.querySelector("#settingAccent");
  const settingVinted = document.querySelector("#settingVinted");
  const settingEbay = document.querySelector("#settingEbay");

  if (heroText) heroText.textContent = settings.hero;
  if (aboutText) aboutText.textContent = settings.about;
  if (vintedLink) vintedLink.href = settings.vinted || "#";
  if (ebayLink) ebayLink.href = settings.ebay || "#";
  if (settingHero) settingHero.value = settings.hero;
  if (settingAbout) settingAbout.value = settings.about;
  if (settingAccent) settingAccent.value = settings.accent;
  if (settingVinted) settingVinted.value = settings.vinted;
  if (settingEbay) settingEbay.value = settings.ebay;
}

function syncAdminState() {
  if (!loginForm || !adminArea || !panelTitle) {
    return;
  }

  const isLoggedIn = store.employeeLoggedIn;
  loginForm.classList.toggle("hidden", isLoggedIn);
  adminArea.classList.toggle("hidden", !isLoggedIn);
  panelTitle.textContent = isLoggedIn ? "Website manager" : "Login";
  if (isLoggedIn) {
    renderStockList();
  }
}

function resetStockForm() {
  if (!stockForm) {
    return;
  }

  stockForm.reset();
  document.querySelector("#itemId").value = "";
  updateImagePreview("");
}

function fillStockForm(item) {
  document.querySelector("#itemId").value = item.id;
  document.querySelector("#itemName").value = item.name;
  document.querySelector("#itemCategory").value = item.category;
  document.querySelector("#itemPrice").value = item.price;
  document.querySelector("#itemSize").value = item.size;
  document.querySelector("#itemImage").value = item.image;
  document.querySelector("#itemNotes").value = item.notes;
  updateImagePreview(item.image);
}

function updateImagePreview(src) {
  if (!imagePreview) {
    return;
  }

  if (!src) {
    imagePreview.classList.add("hidden");
    imagePreview.removeAttribute("src");
    return;
  }

  imagePreview.src = src;
  imagePreview.classList.remove("hidden");
}

function useImageFile(file) {
  if (!file || !file.type.startsWith("image/") || !itemImageInput) {
    return;
  }

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    itemImageInput.value = reader.result;
    updateImagePreview(reader.result);
  });
  reader.readAsDataURL(file);
}

document.querySelector("#employeeOpen")?.addEventListener("click", () => {
  syncAdminState();
  employeePanel.showModal();
});

document.querySelector("#employeeClose")?.addEventListener("click", () => {
  employeePanel.close();
});

document.querySelector("#basketOpen")?.addEventListener("click", () => {
  renderBasket();
  basketPanel.showModal();
});

document.querySelector("#basketClose")?.addEventListener("click", () => {
  basketPanel.close();
});

document.querySelector("#checkoutLink")?.addEventListener("click", () => {
  basketPanel.close();
});

document.querySelector("#clearBasket")?.addEventListener("click", () => {
  store.basket = [];
  renderProducts();
  renderBasket();
});

loginForm?.addEventListener("submit", (event) => {
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

document.querySelector("#logoutButton")?.addEventListener("click", () => {
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

productGrid?.addEventListener("click", (event) => {
  const itemId = event.target.dataset.addBasket;
  if (itemId) {
    addToBasket(itemId);
  }
});

basketList?.addEventListener("click", (event) => {
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

stockForm?.addEventListener("submit", (event) => {
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

stockList?.addEventListener("click", (event) => {
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

document.querySelector("#clearForm")?.addEventListener("click", resetStockForm);

itemImageInput?.addEventListener("input", () => {
  updateImagePreview(itemImageInput.value.trim());
});

itemImageFile?.addEventListener("change", () => {
  useImageFile(itemImageFile.files[0]);
});

imageDropzone?.addEventListener("dragover", (event) => {
  event.preventDefault();
  imageDropzone.classList.add("drag-over");
});

imageDropzone?.addEventListener("dragleave", () => {
  imageDropzone.classList.remove("drag-over");
});

imageDropzone?.addEventListener("drop", (event) => {
  event.preventDefault();
  imageDropzone.classList.remove("drag-over");
  useImageFile(event.dataTransfer.files[0]);
});

settingsForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  store.settings = {
    ...store.settings,
    hero: document.querySelector("#settingHero").value.trim(),
    about: document.querySelector("#settingAbout").value.trim(),
    accent: document.querySelector("#settingAccent").value,
  };
  applySettings();
});

linksForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  store.settings = {
    ...store.settings,
    vinted: document.querySelector("#settingVinted").value.trim() || "#",
    ebay: document.querySelector("#settingEbay").value.trim() || "#",
  };
  applySettings();
});

checkoutForm?.addEventListener("submit", (event) => {
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
