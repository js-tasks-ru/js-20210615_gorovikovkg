import SortableList from './../2-sortable-list/index.js';
// import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  subElements = {};
  listeners = [
    {
      event: "pointerdown",
      element: "uploadImage",
      func: ()=>{
        // adding file input and clicking it
        document.body.insertAdjacentHTML("beforeend", `<input type="file" name="fakeFileChose" style="display: none;">`);
        document.body.lastElementChild.addEventListener("input", (event)=>{
          const files = event.target.files;
          for (let i = 0; i < files.length; i++) this.addImage(URL.createObjectURL(files[i]), files[i].name, files[i]);
          event.target.remove();
        });
        document.body.lastElementChild.click();
      }
    },
    {
      event: "pointerdown",
      element: "images",
      func: (event)=>{
        const deleter = event.target.closest(`[data-delete-handle=""]`);
        if (deleter) deleter.closest(".products-edit__imagelist-item").remove();
      }
    },
    {
      event: "submit",
      element: "form",
      func: async (event)=>{
        event.preventDefault();
        if (this.inSubmitProccess) return;
        this.inSubmitProccess = true;
        await this.save();
        this.inSubmitProccess = false;
      }
    }
  ];

  constructor (productId) {
    this.productId = productId;
  }

  async save(){
    await this.uploadImages();
    const result = {};
    const images = [];
    for (let i of Array.from(this.subElements.images.children)){
      images.push({
        source: i.querySelector(`[name="source"]`).value,
        url: i.querySelector(`[name="url"]`).value
      });
    }

    result.images = images;
    result.title = this.subElements.title.value;
    result.description = this.subElements.description.value;
    result.subcategory = this.subElements.subcategory.selectedOptions[0].value;
    result.price = Number(this.subElements.price.value);
    result.discount = Number(this.subElements.discount.value);
    result.quantity = Number(this.subElements.quantity.value);
    result.status = this.subElements.status.selectedIndex;

    if (this.productId)
      for (let i in result){
        this.productData[i] = result[i];
      }
    else this.productData = {...result, id: result.title};

    await this.sendProductData(this.productData);
    if (!this.productId) {
      this.productId = result.title;
      this.element.dispatchEvent(new CustomEvent("product-saved", {detail: {productData: this.productData}}));
    }
    else this.element.dispatchEvent(new CustomEvent("product-updated", {detail: {productData: this.productData}}));
  }

  async render () {
    this.createTemplate();
    this.createSubElementsNavigation();
    this.initListeners();
    if (this.productId){
      const [categories, data] = await Promise.all([this.getCategories(), this.getProductData(this.productId)]);
      this.productData = data[0];
      this.categories = categories;
      this.renderCategories();
      this.renderInner(data[0]);
    }
    else {
      this.categories = await this.getCategories();
    }
    this.renderCategories();
    return this.element;
  }

  async uploadImages(){
    const url = new URL("https://api.imgur.com/3/image");
    await Promise.allSettled(
      await Array.from(this.subElements.images.children).filter((item)=>{
        return !!item.file;
      }).map(item=>{
        const data = new FormData();
        data.append("image", item.file);
        return fetchJson(url, {
          method: "POST",
          body: data,
          headers: {
            Authorization: "Client-ID "+IMGUR_CLIENT_ID,
          },
          referrer: ""
        }).then((result)=>{
          item.querySelector(`[name="url"]`).value = result.data.link;
          item.file = null;
          return result;
        });
      })
    );
  }

  async sendProductData(data){
    const url = BACKEND_URL+"/api/rest/products";
    await fetchJson(url, {
      method: this.productId ? "PATCH" : "PUT",
      body: new Blob([JSON.stringify([data])], {type: "application/json"})
    });
  }

  createTemplate(){
    this.element = document.createElement("div");
    this.element.className = "product-form";
    this.element.innerHTML = `<form data-element="productForm" class="form-grid">
      <div class="form-group form-group__half_left">
        <fieldset>
          <label class="form-label">Название товара</label>
          <input required="" type="text" name="title" class="form-control" placeholder="Название товара">
        </fieldset>
      </div>
      <div class="form-group form-group__wide">
        <label class="form-label">Описание</label>
        <textarea required="" class="form-control" name="description" data-element="productDescription" placeholder="Описание товара"></textarea>
      </div>
      <div class="form-group form-group__wide" data-element="sortable-list-container">
        <label class="form-label">Фото</label>
        <div data-element="imageListContainer"><ul class="sortable-list"></ul></div>
        <button type="button" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
      </div>
      <div class="form-group form-group__half_left">
        <label class="form-label">Категория</label>
        <select class="form-control" name="subcategory" id="subcategory">
        </select>
      </div>
      <div class="form-group form-group__half_left form-group__two-col">
        <fieldset>
          <label class="form-label">Цена ($)</label>
          <input required="" type="number" name="price" class="form-control" placeholder="100">
        </fieldset>
        <fieldset>
          <label class="form-label">Скидка ($)</label>
          <input required="" type="number" name="discount" class="form-control" placeholder="0">
        </fieldset>
      </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Количество</label>
        <input required="" type="number" class="form-control" name="quantity" placeholder="1">
      </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Статус</label>
        <select class="form-control" name="status">
          <option value="0">Неактивен</option>
          <option value="1">Активен</option>
        </select>
      </div>
      <div class="form-buttons">
        <button type="submit" name="save" class="button-primary-outline">
          Сохранить товар
        </button>
      </div>
    </form>`;
  }

  createSubElementsNavigation(){
    const s = this.subElements;
    const e = this.element;
    s.title = e.querySelector(`[name="title"]`);
    s.description = e.querySelector(`[name="description"]`);
    s.images = e.querySelector(".sortable-list");
    s.uploadImage = e.querySelector(`[name="uploadImage"]`);
    s.subcategory = e.querySelector(`[name="subcategory"]`);
    s.price = e.querySelector(`[name="price"]`);
    s.discount = e.querySelector(`[name="discount"]`);
    s.quantity = e.querySelector(`[name="quantity"]`);
    s.status = e.querySelector(`[name="status"]`);
    s.form = e.querySelector(`[data-element="productForm"]`);
    s.productForm = {
      querySelector(selector) {
        return s.form.querySelector(`[name="${selector.replace("#", "")}"]`);
      }
    };
    s.imageListContainer = s.images;
  }

  createImageSlot(url, src, file) {
    const result = document.createElement("div");
    result.innerHTML = `<li class="products-edit__imagelist-item sortable-list__item" style="">
          <input type="hidden" name="url" value="${url}">
          <input type="hidden" name="source" value="${src}">
          <span>
        <img src="icon-grab.svg" data-grab-handle="" alt="grab">
        <img class="sortable-table__cell-img" alt="Image" src="${url || src}">
        <span>${src}</span>
      </span>
          <button type="button">
            <img src="icon-trash.svg" data-delete-handle="" alt="delete">
          </button></li>`;
    if (file) result.firstElementChild.file = file;
    return result.firstElementChild;
  }

  addImage(url, src, file){
    this.subElements.images.append(this.createImageSlot(url, src, file));
  }

  initListeners(){
    for (let i of this.listeners) this.subElements[i.element].addEventListener(i.event, i.func, i.options);
  }

  async getProductData(productId){
    const url = new URL(BACKEND_URL+"/api/rest/products");
    url.searchParams.set("id", productId);
    try{
      return await fetchJson(url);
    }
    catch (e){
      return [];
    }
  }

  getCategories(){
    return fetchJson(BACKEND_URL+"/api/rest/categories?_sort=weight&_refs=subcategory");
  }

  renderInner(obj){
    for (let i in this.subElements) obj[i] ? this.subElements[i].value = obj[i] : false;
    this.subElements.images.value = undefined;
    for (let i of obj.images || []) this.addImage(i.url, i.source);
    new SortableList({
      items: Array.from(this.subElements.images.children),
      holder: this.subElements.images
    });
    this.subElements.status.selectedIndex = obj.status;
    this.subElements.discount.value = obj.discount;
    this.subElements.subcategory.querySelector(`[value="${obj.subcategory}"]`).selected = true;
  }

  renderCategories() {
    for (const category of this.categories) {
      for (const child of category.subcategories) {
        this.subElements.subcategory.insertAdjacentHTML("beforeend", `<option value="${child.id}">${category.title} > ${child.title}</option>`)
      }
    }
  }

  destroy(){
    this.element?.remove();
    this.element = null;
    this.subElements = null;
  }
  remove(){
    this.element?.remove();
  }
}

