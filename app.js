// Gudang Sunyi - CRUD Barang di LocalStorage
const STORAGE_KEY = "gudang_sunyi_v1";

let items = [];
let editId = null;

const listEl = document.getElementById("itemList");
const searchInput = document.getElementById("search");
const newBtn = document.getElementById("newBtn");
const clearAll = document.getElementById("clearAll");

const form = document.getElementById("itemForm");
const formTitle = document.getElementById("formTitle");
const nameInput = document.getElementById("itemName");
const qtyInput = document.getElementById("itemQty");
const catInput = document.getElementById("itemCategory");
const noteInput = document.getElementById("itemNote");
const cancelBtn = document.getElementById("cancelBtn");

function loadData(){
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    items = raw ? JSON.parse(raw) : [];
  } catch {
    items = [];
  }
}

function saveData(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function renderList(filter=""){
  listEl.innerHTML = "";
  const filtered = items
    .filter(it => it.name.toLowerCase().includes(filter) || it.category.toLowerCase().includes(filter))
    .sort((a,b)=>b.created - a.created);

  if(filtered.length===0){
    listEl.innerHTML = `<div style="padding:10px;color:#94a3b8;font-style:italic;">Tidak ada barang disimpan...</div>`;
    return;
  }

  for(const it of filtered){
    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `
      <div><strong>${escape(it.name)}</strong></div>
      <div class="meta">
        <span>${it.qty} unit • ${escape(it.category || "-")}</span>
        <small>${new Date(it.created).toLocaleDateString()}</small>
      </div>
      <div style="margin-top:6px;font-size:.9rem;color:#cbd5e1;">${escape(it.note || "")}</div>
    `;
    div.onclick = ()=>editItem(it.id);
    listEl.appendChild(div);
  }
}

function escape(s){
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c]));
}

function newItem(){
  formTitle.textContent = "Tambah Barang";
  form.reset();
  editId = null;
}

function editItem(id){
  const it = items.find(x=>x.id===id);
  if(!it) return;
  formTitle.textContent = "Edit Barang";
  nameInput.value = it.name;
  qtyInput.value = it.qty;
  catInput.value = it.category;
  noteInput.value = it.note;
  editId = id;
}

function deleteItem(id){
  if(!confirm("Hapus barang ini?")) return;
  items = items.filter(x=>x.id!==id);
  saveData();
  renderList(searchInput.value.trim().toLowerCase());
}

form.onsubmit = e=>{
  e.preventDefault();
  const name = nameInput.value.trim();
  const qty = parseInt(qtyInput.value);
  const cat = catInput.value.trim();
  const note = noteInput.value.trim();

  if(!name || qty<=0) return alert("Nama dan jumlah wajib diisi.");

  if(editId){
    const idx = items.findIndex(x=>x.id===editId);
    if(idx>-1){
      items[idx] = {...items[idx], name, qty, category:cat, note, updated:Date.now()};
    }
  } else {
    const id = cryptoRandomId();
    items.push({id, name, qty, category:cat, note, created:Date.now(), updated:Date.now()});
  }

  saveData();
  renderList(searchInput.value.trim().toLowerCase());
  form.reset();
  formTitle.textContent = "Tambah Barang";
  editId = null;
};

cancelBtn.onclick = ()=>{ form.reset(); formTitle.textContent="Tambah Barang"; editId=null; };

newBtn.onclick = newItem;
clearAll.onclick = ()=>{
  if(confirm("Hapus semua data barang?")){
    items = [];
    saveData();
    renderList();
  }
};
searchInput.oninput = e=>renderList(e.target.value.trim().toLowerCase());

function cryptoRandomId(){
  return ([1e7]+-1e3+-4e3+-8e3+-1e11)
    .replace(/[018]/g,c=>(c^crypto.getRandomValues(new Uint8Array(1))[0]&15>>c/4).toString(16));
}

// init
loadData();
renderList();
