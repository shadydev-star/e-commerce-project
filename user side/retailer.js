// js/retailer.js
import { db } from "../firebase-config.js";

const productGrid = document.getElementById("productGrid");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");

let allProducts = []; // This will hold Firestore data

function renderProducts(list) {
  productGrid.innerHTML = "";
  list.forEach(product => {
    const item = document.createElement("div");
    item.className = "product-card";
    item.innerHTML = `
      <img src="${product.img}" alt="${product.name}" />
      <h3>${product.name}</h3>
      <p>$${product.price.toFixed(2)}</p>
      <button class="add-btn" data-id="${product.id}">Add to Cart</button>
    `;
    productGrid.appendChild(item);
  });
}

function filterProducts() {
  const search = searchInput.value.toLowerCase();
  const category = categoryFilter.value;

  const filtered = allProducts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search);
    const matchesCategory = category === "all" || p.category === category;
    return matchesSearch && matchesCategory;
  });

  renderProducts(filtered);
}

// Load products from Firestore
db.collection("products").get().then(snapshot => {
  allProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  renderProducts(allProducts);
});

// Filter inputs
searchInput.addEventListener("input", filterProducts);
categoryFilter.addEventListener("change", filterProducts);

// CART FUNCTIONS
function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function updateCartCount() {
  const cart = getCart();
  const total = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.getElementById("cartCount").textContent = total;
}

function addToCart(productId) {
  const cart = getCart();
  const product = allProducts.find(p => p.id === productId);
  const existingItem = cart.find(item => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  saveCart(cart);
  updateCartCount();
}

// Attach button listeners
productGrid.addEventListener("click", (e) => {
  if (e.target.classList.contains("add-btn")) {
    const id = e.target.dataset.id;
    addToCart(id);
  }
});

// On page load
updateCartCount();
