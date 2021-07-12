import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  headers = [];
  subElements = {};
  arrow = this.makeArrow();
  sortData = {}

  constructor(headersConfig, {
    sortable: {id = "title", order = "asc"} = {},
    url,
  } = {}) {
    this.url = url;
    const isDone = new Promise((resolve, reject)=>{
      this.render = () => isDone;
      this.create(id, order, url, headersConfig, resolve, reject);
    })
  }

  async create(id, order, url, headersConfig, onSuccess, onFail){
    try{
      this.subElements.header = this.makeHeader(headersConfig);
      this.element = document.createElement("div");
      this.element.innerHTML = `<div data-element="productsContainer" class="products-list__container">
  <div class="sortable-table"></div></div>`;
      this.element = this.element.firstElementChild;
      this.element.firstElementChild.append(this.subElements.header);
      this.subElements.body = this.makeBody(await this.getData(0, 30, order, id, url));
      this.sortData.order = order;
      this.sortData.id = id;
      this.element.firstElementChild.append(this.subElements.body);
      this.initListeners();
      onSuccess(true);
    }
    catch (e){
      onFail(e);
    }
  }


  async getData(from, to, order, sort, url){
    try {
      this.isLooking = true;
      const result = await fetchJson(new URL(BACKEND_URL+"/"+url+"/?_sort="+sort+"&_order="+order+"&_start="+from+"&_end="+to));
      return result;
    }
    catch (e){
      this.isLooking = false;
      return [];
    }
  }

  initListeners(){
    this.reactOnTab = function(event){
      const target = event.target.closest(".sortable-table__cell");
      if (target && target.getAttribute("data-sortable") === "true"){
        this.sortData.order = target.dataset.order === "desc" ? "asc" : "desc";
        this.sortData.id = target.dataset.id;
        this.sortOnClient(target.dataset.id, this.sortData.order);
        this.sortOnServer("title", "desc"); // В тестах требуется сортировка и на сервере и на клиентской стороне одновременно, поэтому пришлось вызывать сортировку на сервере совмество с сортировкой на клиенте
      }
    }.bind(this);
    this.subElements.header.addEventListener("pointerdown", this.reactOnTab);
    this.reactOnScroll = function () {
      if ((this.subElements.body.getBoundingClientRect().bottom - window.innerHeight < window.innerHeight / 15) && !this.isLooking) this.sortOnServer();
    }.bind(this);
    window.addEventListener("scroll", this.reactOnScroll);
    this.setSizeOfRow = function(){ // Нужно для того что бы мы могли точно высчитать количество элементов которые будем запрашивать с сервера
      if (this.subElements.body.firstElementChild) this.sizeOfRow = this.subElements.body?.firstElementChild.getBoundingClientRect().height;
      else this.sizeOfRow = 70;
    }.bind(this);
    this.setSizeOfRow();
    window.addEventListener("resize", this.setSizeOfRow);
  }

  sortOnServer(removeAll){
    let from;
    if (removeAll) from = 0;
    else from = this.subElements.body.children.length;
    this.getData(from, this.subElements.body.children.length+Math.floor(window.innerHeight/this.sizeOfRow), this.sortData.order, this.sortData.id, this.url)//запрашиваем данных чуть меньше чем на один innerHeight
      .then((result)=>{
        for (let i = from; i< this.subElements.body.children.length; i++) this.subElements.body.children[i].remove();
        this.subElements.body.append(...Array.from(this.makeBody(result).children));
      });
  }

  makeArrow() {
    const div = document.createElement("div");
    div.innerHTML = `<span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>`;
    return div.firstElementChild;
  }

  makeHeader(config) {
    const elem = document.createElement('div');
    elem.innerHTML = `<div data-element="header" class="sortable-table__header sortable-table__row"></div>`;
    config.forEach((item, num) => {
      const element = this.createHeader(item, num);
      elem.firstElementChild.insertAdjacentHTML("beforeend", element);
      this.headers[this.headers.length-1].elem = elem.firstElementChild.lastElementChild;
    });
    return elem.firstElementChild;
  }

  createHeader({id, title = "", sortable = false, sortType = "string", template} = {}, num){
    this.headers.push({sortType, template, id, num});
    this.headers[id] = this.headers[this.headers.length-1];
    return `<div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}">
        <span>${title}</span>
      </div>`;
  }

  makeBody(data) {
    const elem = document.createElement('div');
    elem.innerHTML = `<div data-element="body" class="sortable-table__body"></div>`;
    data.forEach(item =>{
      elem.firstElementChild.insertAdjacentHTML("beforeend",this.makeRow(item));
    });
    return elem.firstElementChild;
  }

  makeRow(data) {
    return " <a href=\"#\" class=\"sortable-table__row\">"+this.headers.map(info =>{
      return (info.template ? info.template(data[info.id]) : `<div class="sortable-table__cell">${data[info.id]}</div>`);
    }).join("")+"</a>";
  }

  sortOnClient(field, order) {
    const rows = Array.from(this.subElements.body.children);
    const orders = {
      "asc": 1,
      "desc": -1
    };
    this.headers[field].elem.append(this.arrow);
    this.subElements.header.querySelector("[data-order]")?.removeAttribute("data-order");
    this.headers[field].elem.setAttribute("data-order", order);
    let collator;
    if (this.headers[field] === undefined) throw new Error("This table does not have field " + field)
    if (this.headers[field].sortType === "string") {
      collator = new Intl.Collator(['ru', "en"], {caseFirst: "upper"});
    }
    else if (this.headers[field].sortType === "number"){
      collator = new Intl.Collator(['ru', "en"], {numeric: true});
    }
    else throw new Error("Invalid order argument, expected asc or desc but recived " + order);
    rows.sort((a, b) =>{
      return orders[order] * collator.compare(a.children[this.headers[field].num].textContent, b.children[this.headers[field].num].textContent);
    });
    rows.forEach(item => this.subElements.body.append(item));
  }

  destroy() {
    this.element?.remove();
    this.subElements.header.removeEventListener("pointerdown", this.reactOnTab);
    window.removeEventListener("scroll", this.reactOnScroll);
    window.removeEventListener("resize", this.setSizeOfRow);
    this.element = null;
  }
}
