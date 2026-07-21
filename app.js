const defaultProducts = [
  {
    id: "linen-blazer",
    name: "Linen Blazer - Oat",
    category: "outerwear",
    price: 48,
    size: "M",
    image:
      "https://images.unsplash.com/photo-1520006403909-838d6b92c22e?w=600&h=750&fit=crop&auto=format",
    colour: "Beige",
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
    colour: "Red",
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
    colour: "Blue",
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
    colour: "Cream",
    notes: "Like new knitwear, soft against the skin and ideal for layering.",
  },
];

const defaultSettings = {
  hero:
    "Hand-picked preloved pieces from Cheshire, lovingly checked, honestly described, and priced to find a new home. Because beautiful clothes deserve a second life.",
  about:
    "One More Look is built around careful resale: hand-picked pieces, regular drops, and styling that makes preloved clothing feel exciting again.",
  contact:
    "Use this page for buyer questions, seller enquiries, sizing help, delivery questions, or anything you want to ask One More Look.",
  how:
    "Browse honest preloved listings, or send in your own quality pieces for one more look. Both routes live here, with the same careful standard.",
  sell:
    "Send us your best preloved pieces and we will help them find another home. Payment details and seller accounts can be connected properly later.",
  learn:
    "Learn how One More Look checks, prices, lists, and sells preloved pieces with care. This page can be updated from the employee area whenever your process changes.",
  brands: "Ralph Lauren\nLevi's\nZara\nNike\nAdidas\nMango\nH&M\nCarhartt",
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
const pagesForm = document.querySelector("#pagesForm");
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
const itemExtraImages = document.querySelector("#itemExtraImages");
const galleryDropzone = document.querySelector("#galleryDropzone");
const itemGalleryFiles = document.querySelector("#itemGalleryFiles");
const galleryPreview = document.querySelector("#galleryPreview");
const itemAdPreview = document.querySelector("#itemAdPreview");
const productDetail = document.querySelector("#productDetail");
const menuToggle = document.querySelector("#menuToggle");
const siteNav = document.querySelector("#siteNav");
const sortSelect = document.querySelector("#sortSelect");
const heroSlideshow = document.querySelector("#heroSlideshow");
let activeFilter = "all";
let activeSort = "newest";
const activeSizes = new Set();
const activeColours = new Set();
let uploadedGalleryImages = [];
let heroSlideIndex = 0;
let heroSlideTimer;

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

function productImages(item) {
  return [item.image, ...(item.images || [])].filter(Boolean);
}

function matchesSelectedSizes(item) {
  if (activeSizes.size === 0) {
    return true;
  }

  const itemSize = String(item.size || "").toLowerCase();
  const compactItemSize = itemSize.replace(/\s+/g, "");
  return [...activeSizes].some((size) => {
    const selectedSize = size.toLowerCase();
    return itemSize.includes(selectedSize) || compactItemSize.includes(selectedSize);
  });
}

function matchesSelectedColours(item) {
  if (activeColours.size === 0) {
    return true;
  }

  const colour = String(item.colour || "").toLowerCase();
  return [...activeColours].some((selected) => colour.includes(selected.toLowerCase()));
}

function basketTotal() {
  return getBasketProducts().reduce((total, item) => total + Number(item.price), 0);
}

function renderHeroSlideshow() {
  if (!heroSlideshow) {
    return;
  }

  const products = store.products.filter((item) => item.image);

  if (products.length === 0) {
    heroSlideshow.innerHTML = `
      <div class="hero-slide active">
        <img src="https://images.unsplash.com/photo-1595991209266-711c557ac7c4?w=900&h=1100&fit=crop&auto=format" alt="Curated vintage clothing inside a boutique">
        <div class="hero-slide-caption">
          <strong>New arrivals every Friday</strong>
          <span>Fresh preloved pieces coming soon</span>
        </div>
      </div>
    `;
    return;
  }

  heroSlideIndex = Math.min(heroSlideIndex, products.length - 1);
  heroSlideshow.innerHTML = products
    .map(
      (item, index) => `
        <a class="hero-slide ${index === heroSlideIndex ? "active" : ""}" href="product.html?id=${encodeURIComponent(item.id)}">
          <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}">
          <div class="hero-slide-caption">
            <strong>${escapeHtml(item.name)}</strong>
            <span>${pounds(item.price)} &middot; ${escapeHtml(item.size)}</span>
          </div>
        </a>
      `,
    )
    .join("");

  window.clearInterval(heroSlideTimer);
  if (products.length > 1) {
    heroSlideTimer = window.setInterval(() => {
      const slides = [...heroSlideshow.querySelectorAll(".hero-slide")];
      if (slides.length === 0) return;
      slides[heroSlideIndex]?.classList.remove("active");
      heroSlideIndex = (heroSlideIndex + 1) % slides.length;
      slides[heroSlideIndex]?.classList.add("active");
    }, 4200);
  }
}

function renderProducts() {
  if (!productGrid) {
    return;
  }

  const products = store.products;
  const basketIds = store.basket;
  let visibleProducts =
    activeFilter === "all" ? products : products.filter((item) => item.category === activeFilter);

  visibleProducts = visibleProducts.filter(matchesSelectedSizes);
  visibleProducts = visibleProducts.filter(matchesSelectedColours);

  visibleProducts = [...visibleProducts].sort((a, b) => {
    if (activeSort === "low-high") return Number(a.price) - Number(b.price);
    if (activeSort === "high-low") return Number(b.price) - Number(a.price);
    return 0;
  });

  if (stockCount) stockCount.textContent = products.length;

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
          <a class="product-link" href="product.html?id=${encodeURIComponent(item.id)}">
            <figure>
              <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" loading="lazy">
            </figure>
            <div class="product-body">
              <div class="product-line">
                <h3>${escapeHtml(item.name)}</h3>
                <span class="price">${pounds(item.price)}</span>
              </div>
              <span class="pill">${escapeHtml(item.size)}</span>
              ${item.colour ? `<span class="pill">${escapeHtml(item.colour)}</span>` : ""}
              <p>${escapeHtml(item.notes)}</p>
            </div>
          </a>
          <div class="product-body product-action-row">
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

function renderProductDetail() {
  if (!productDetail) {
    return;
  }

  const id = new URLSearchParams(window.location.search).get("id");
  const item = store.products.find((product) => product.id === id);

  if (!item) {
    productDetail.innerHTML = `
      <div class="empty-state">
        This item could not be found. <a href="index.html#shop">Back to shop</a>
      </div>
    `;
    return;
  }

  const images = productImages(item);
  productDetail.innerHTML = `
    <div class="product-gallery">
      ${images
        .map(
          (src, index) => `
            <img src="${escapeHtml(src)}" alt="${escapeHtml(item.name)} photo ${index + 1}">
          `,
        )
        .join("")}
    </div>
    <div class="product-detail-copy">
      <p class="eyebrow">${escapeHtml(item.category)}</p>
      <h1>${escapeHtml(item.name)}</h1>
      <p class="detail-price">${pounds(item.price)}</p>
      <span class="pill">${escapeHtml(item.size)}</span>
      ${item.colour ? `<span class="pill">${escapeHtml(item.colour)}</span>` : ""}
      <p>${escapeHtml(item.notes)}</p>
      <button class="button primary" type="button" data-detail-add="${escapeHtml(item.id)}">
        ${store.basket.includes(item.id) ? "In basket" : "Add to basket"}
      </button>
      <a class="text-link" href="index.html#shop">Back to collection</a>
    </div>
  `;
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
  renderHeroSlideshow();
}

function removeFromBasket(id) {
  store.basket = store.basket.filter((itemId) => itemId !== id);
  renderProducts();
  renderBasket();
  renderHeroSlideshow();
}

function renderStockList() {
  if (!stockList) {
    return;
  }

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
  const vintedLink = document.querySelector("#vintedLink");
  const ebayLink = document.querySelector("#ebayLink");

  const setText = (selector, value) => {
    const element = document.querySelector(selector);
    if (element) element.textContent = value;
  };

  const setValue = (selector, value) => {
    const element = document.querySelector(selector);
    if (element) element.value = value;
  };

  const brandsList = document.querySelector("#brandsList");

  setText("#heroText", settings.hero);
  setText("#aboutText", settings.about);
  setText("#contactText", settings.contact);
  setText("#howText", settings.how);
  setText("#sellText", settings.sell);
  setText("#learnText", settings.learn);

  if (brandsList) {
    const brands = String(settings.brands || "")
      .split(/\r?\n/)
      .map((brand) => brand.trim())
      .filter(Boolean);

    brandsList.innerHTML = brands.length
      ? brands.map((brand) => `<span>${escapeHtml(brand)}</span>`).join("")
      : `<p class="empty-state">No brands added yet.</p>`;
  }

  if (vintedLink) vintedLink.href = settings.vinted || "#";
  if (ebayLink) ebayLink.href = settings.ebay || "#";

  setValue("#settingHero", settings.hero);
  setValue("#settingAbout", settings.about);
  setValue("#settingAccent", settings.accent);
  setValue("#settingVinted", settings.vinted);
  setValue("#settingEbay", settings.ebay);
  setValue("#settingHomePage", settings.hero);
  setValue("#settingAboutPage", settings.about);
  setValue("#settingContactPage", settings.contact);
  setValue("#settingHowPage", settings.how);
  setValue("#settingSellPage", settings.sell);
  setValue("#settingLearnPage", settings.learn);
  setValue("#settingBrands", settings.brands);
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
  uploadedGalleryImages = [];
  updateImagePreview("");
  updateGalleryPreview();
  renderAdminPreview();
}

function fillStockForm(item) {
  document.querySelector("#itemId").value = item.id;
  document.querySelector("#itemName").value = item.name;
  document.querySelector("#itemCategory").value = item.category;
  document.querySelector("#itemPrice").value = item.price;
  document.querySelector("#itemSize").value = item.size;
  document.querySelector("#itemColour").value = item.colour || "";
  document.querySelector("#itemImage").value = item.image;
  document.querySelector("#itemExtraImages").value = (item.images || []).join("\n");
  document.querySelector("#itemNotes").value = item.notes;
  uploadedGalleryImages = [];
  updateImagePreview(item.image);
  updateGalleryPreview();
  renderAdminPreview();
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

function updateGalleryPreview() {
  if (!galleryPreview) {
    return;
  }

  const urls = getExtraImageUrls();
  const allImages = [...urls, ...uploadedGalleryImages];

  if (allImages.length === 0) {
    galleryPreview.innerHTML = "";
    return;
  }

  galleryPreview.innerHTML = allImages
    .map((src) => `<img src="${escapeHtml(src)}" alt="Extra item preview">`)
    .join("");
}

function getExtraImageUrls() {
  return (itemExtraImages?.value || "")
    .split(/\r?\n/)
    .map((url) => url.trim())
    .filter(Boolean);
}

function renderAdminPreview() {
  if (!itemAdPreview) {
    return;
  }

  const name = document.querySelector("#itemName")?.value.trim() || "Item preview";
  const price = Number(document.querySelector("#itemPrice")?.value || 0);
  const size = document.querySelector("#itemSize")?.value.trim() || "Size";
  const colour = document.querySelector("#itemColour")?.value.trim();
  const notes = document.querySelector("#itemNotes")?.value.trim() || "Condition and item notes will preview here.";
  const image = itemImageInput?.value.trim();

  itemAdPreview.innerHTML = `
    <p class="eyebrow">Listing preview</p>
    <div class="preview-card">
      ${image ? `<img src="${escapeHtml(image)}" alt="">` : `<div class="preview-placeholder">No image yet</div>`}
      <div>
        <div class="product-line">
          <h3>${escapeHtml(name)}</h3>
          <span class="price">${price ? pounds(price) : "GBP 0"}</span>
        </div>
        <span class="pill">${escapeHtml(size)}</span>
        ${colour ? `<span class="pill">${escapeHtml(colour)}</span>` : ""}
        <p>${escapeHtml(notes)}</p>
      </div>
    </div>
  `;
}

function useImageFile(file) {
  if (!file || !file.type.startsWith("image/") || !itemImageInput) {
    return;
  }

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    itemImageInput.value = reader.result;
    updateImagePreview(reader.result);
    renderAdminPreview();
  });
  reader.readAsDataURL(file);
}

function useGalleryFiles(files) {
  [...files].filter((file) => file.type.startsWith("image/")).forEach((file) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      uploadedGalleryImages.push(reader.result);
      updateGalleryPreview();
    });
    reader.readAsDataURL(file);
  });
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

menuToggle?.addEventListener("click", () => {
  const isOpen = siteNav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
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

document.querySelectorAll(".size-filter").forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    if (checkbox.checked) {
      activeSizes.add(checkbox.value);
    } else {
      activeSizes.delete(checkbox.value);
    }
    renderProducts();
  });
});

document.querySelectorAll(".colour-filter").forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    if (checkbox.checked) {
      activeColours.add(checkbox.value);
    } else {
      activeColours.delete(checkbox.value);
    }
    renderProducts();
  });
});

sortSelect?.addEventListener("change", () => {
  activeSort = sortSelect.value;
  renderProducts();
});

document.querySelectorAll("[data-menu-filter]").forEach((link) => {
  link.addEventListener("click", () => {
    const filter = link.dataset.menuFilter;
    const button = document.querySelector(`.filter[data-filter="${filter}"]`);
    if (button) button.click();
  });
});

productGrid?.addEventListener("click", (event) => {
  const itemId = event.target.dataset.addBasket;
  if (itemId) {
    addToBasket(itemId);
  }
});

productDetail?.addEventListener("click", (event) => {
  const itemId = event.target.dataset.detailAdd;
  if (itemId) {
    addToBasket(itemId);
    renderProductDetail();
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
    colour: document.querySelector("#itemColour").value.trim(),
    image: document.querySelector("#itemImage").value.trim(),
    images: [...getExtraImageUrls(), ...uploadedGalleryImages],
    notes: document.querySelector("#itemNotes").value.trim(),
  };

  const products = store.products;
  store.products = id
    ? products.map((item) => (item.id === id ? nextItem : item))
    : [nextItem, ...products];

  resetStockForm();
  renderProducts();
  renderHeroSlideshow();
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
    renderHeroSlideshow();
  }
});

document.querySelector("#clearForm")?.addEventListener("click", resetStockForm);

itemImageInput?.addEventListener("input", () => {
  updateImagePreview(itemImageInput.value.trim());
  renderAdminPreview();
});

itemImageFile?.addEventListener("change", () => {
  useImageFile(itemImageFile.files[0]);
});

itemExtraImages?.addEventListener("input", () => {
  updateGalleryPreview();
});

stockForm?.addEventListener("input", renderAdminPreview);

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

itemGalleryFiles?.addEventListener("change", () => {
  useGalleryFiles(itemGalleryFiles.files);
});

galleryDropzone?.addEventListener("dragover", (event) => {
  event.preventDefault();
  galleryDropzone.classList.add("drag-over");
});

galleryDropzone?.addEventListener("dragleave", () => {
  galleryDropzone.classList.remove("drag-over");
});

galleryDropzone?.addEventListener("drop", (event) => {
  event.preventDefault();
  galleryDropzone.classList.remove("drag-over");
  useGalleryFiles(event.dataTransfer.files);
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

pagesForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  store.settings = {
    ...store.settings,
    hero: document.querySelector("#settingHomePage").value.trim(),
    about: document.querySelector("#settingAboutPage").value.trim(),
    contact: document.querySelector("#settingContactPage").value.trim(),
    how: document.querySelector("#settingHowPage").value.trim(),
    sell: document.querySelector("#settingSellPage").value.trim(),
    learn: document.querySelector("#settingLearnPage").value.trim(),
    brands: document.querySelector("#settingBrands").value.trim(),
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
renderHeroSlideshow();
renderProductDetail();
renderAdminPreview();
syncAdminState();
