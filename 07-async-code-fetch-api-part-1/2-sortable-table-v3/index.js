import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';


// Это мое решение, я так и не смог разобраться с ошибкой которую описывал вам в Slack

// export default class SortableTable {
//   headers = [];
//   subElements = {};
//   arrow = this.makeArrow();
//   sortData = {}
//
//   constructor(headersConfig, {
//     sortable: {id = "title", order = "asc"} = {},
//     url,
//     isSortLocally
//   } = {}) {
//     this.url = BACKEND_URL+"/"+url
//     this.isSortLocally = isSortLocally;
//     const isDone = new Promise((resolve, reject)=>{
//       this.render = () => isDone;
//       this.create(id, order, url, headersConfig, resolve, reject);
//     })
//   }
//
//   async create(id, order, url, headersConfig, onSuccess, onFail){
//     try{
//       this.subElements.header = this.makeHeader(headersConfig);
//       this.element = document.createElement("div");
//       this.element.innerHTML = `<div data-element="productsContainer" class="products-list__container">
//   <div class="sortable-table"></div></div>`;
//       this.element = this.element.firstElementChild;
//       this.element.firstElementChild.append(this.subElements.header);
//       this.subElements.body = this.makeBody(await this.getData(0, 30, order, id, url));
//       this.sortData.order = order;
//       this.sortData.id = id;
//       this.element.firstElementChild.append(this.subElements.body);
//       this.initListeners();
//       onSuccess(true);
//     }
//     catch (e){
//       onFail(e);
//     }
//   }
//
//
//   async getData(from, to, order, sort){
//     try {
//       this.isLooking = true;
//       const url = new URL(this.url);
//       url.searchParams.set("_sort", sort);
//       url.searchParams.set("_order", order);
//       url.searchParams.set("_start", from);
//       url.searchParams.set("_end", to);
//       const result = await fetchJson(url.toString());
//       this.isLooking = false;
//       return result;
//     }
//     catch (e){
//       this.isLooking = false;
//       return [];
//     }
//   }
//
//   initListeners(){
//     this.reactOnTab = function(event){
//       const target = event.target.closest(".sortable-table__cell");
//       if (target && target.getAttribute("data-sortable") === "true"){
//         this.sortData.order = target.dataset.order === "desc" ? "asc" : "desc";
//         this.sortData.id = target.dataset.id;
//         if (this.isSortLocally) this.sortOnClient(target.dataset.id, this.sortData.order);
//         else this.sortOnServer("title", "desc");
//       }
//     }.bind(this);
//     this.subElements.header.addEventListener("pointerdown", this.reactOnTab);
//     this.reactOnScroll = function () {
//       console.log(this.isLooking);
//       if ((this.subElements.body.getBoundingClientRect().bottom - window.innerHeight < window.innerHeight / 15) && !this.isLooking) this.sortOnServer();
//     }.bind(this);
//     window.addEventListener("scroll", this.reactOnScroll);
//     this.setSizeOfRow = function(){ // Нужно для того что бы мы могли точно высчитать количество элементов которые будем запрашивать с сервера
//       if (this.subElements.body.firstElementChild) this.sizeOfRow = this.subElements.body?.firstElementChild.getBoundingClientRect().height;
//       else this.sizeOfRow = 70;
//     }.bind(this);
//     this.setSizeOfRow();
//     window.addEventListener("resize", this.setSizeOfRow);
//   }
//
//   sortOnServer(removeAll){
//     let from;
//     if (removeAll) from = 0;
//     else from = this.subElements.body.children.length;
//     this.getData(from, this.subElements.body.children.length+Math.floor(window.innerHeight/this.sizeOfRow), this.sortData.order, this.sortData.id)//запрашиваем данных чуть меньше чем на один innerHeight
//       .then((result)=>{
//         for (let i = from; i< this.subElements.body.children.length; i++) this.subElements.body.children[i].remove();
//         this.subElements.body.append(...Array.from(this.makeBody(result).children));
//       });
//   }
//
//   makeArrow() {
//     const div = document.createElement("div");
//     div.innerHTML = `<span data-element="arrow" class="sortable-table__sort-arrow">
//           <span class="sort-arrow"></span>
//         </span>`;
//     return div.firstElementChild;
//   }
//
//   makeHeader(config) {
//     const elem = document.createElement('div');
//     elem.innerHTML = `<div data-element="header" class="sortable-table__header sortable-table__row"></div>`;
//     config.forEach((item, num) => {
//       const element = this.createHeader(item, num);
//       elem.firstElementChild.insertAdjacentHTML("beforeend", element);
//       this.headers[this.headers.length-1].elem = elem.firstElementChild.lastElementChild;
//     });
//     return elem.firstElementChild;
//   }
//
//   createHeader({id, title = "", sortable = false, sortType = "string", template} = {}, num){
//     this.headers.push({sortType, template, id, num});
//     this.headers[id] = this.headers[this.headers.length-1];
//     return `<div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}">
//         <span>${title}</span>
//       </div>`;
//   }
//
//   makeBody(data) {
//     const elem = document.createElement('div');
//     elem.innerHTML = `<div data-element="body" class="sortable-table__body"></div>`;
//     data.forEach(item =>{
//       elem.firstElementChild.insertAdjacentHTML("beforeend",this.makeRow(item));
//     });
//     return elem.firstElementChild;
//   }
//
//   makeRow(data) {
//     return " <a href=\"#\" class=\"sortable-table__row\">"+this.headers.map(info =>{
//       return (info.template ? info.template(data[info.id]) : `<div class="sortable-table__cell">${data[info.id]}</div>`);
//     }).join("")+"</a>";
//   }
//
//   sortOnClient(field, order) {
//     const rows = Array.from(this.subElements.body.children);
//     const orders = {
//       "asc": 1,
//       "desc": -1
//     };
//     this.headers[field].elem.append(this.arrow);
//     this.subElements.header.querySelector("[data-order]")?.removeAttribute("data-order");
//     this.headers[field].elem.setAttribute("data-order", order);
//     let collator;
//     if (this.headers[field] === undefined) throw new Error("This table does not have field " + field)
//     if (this.headers[field].sortType === "string") {
//       collator = new Intl.Collator(['ru', "en"], {caseFirst: "upper"});
//     }
//     else if (this.headers[field].sortType === "number"){
//       collator = new Intl.Collator(['ru', "en"], {numeric: true});
//     }
//     else throw new Error("Invalid order argument, expected asc or desc but recived " + order);
//     rows.sort((a, b) =>{
//       return orders[order] * collator.compare(a.children[this.headers[field].num].textContent, b.children[this.headers[field].num].textContent);
//     });
//     rows.forEach(item => this.subElements.body.append(item));
//   }
//
//   destroy() {
//     this.element?.remove();
//     this.subElements.header.removeEventListener("pointerdown", this.reactOnTab);
//     window.removeEventListener("scroll", this.reactOnScroll);
//     window.removeEventListener("resize", this.setSizeOfRow);
//     this.element = null;
//   }
// }

export default class SortableTable {
  element;
  subElements = {};
  data = [];
  loading = false;
  step = 20;
  start = 1;
  end = this.start + this.step;

  onWindowScroll = async() => {
    const { bottom } = this.element.getBoundingClientRect();
    const { id, order } = this.sorted;

    if (bottom < document.documentElement.clientHeight && !this.loading && !this.isSortLocally) {
      this.start = this.end;
      this.end = this.start + this.step;

      this.loading = true;

      const data = await this.loadData(id, order, this.start, this.end);
      this.update(data);

      this.loading = false;
    }
  };

  onSortClick = event => {
    const column = event.target.closest('[data-sortable="true"]');
    const toggleOrder = order => {
      const orders = {
        asc: 'desc',
        desc: 'asc'
      };

      return orders[order];
    };

    if (column) {
      const { id, order } = column.dataset;
      const newOrder = toggleOrder(order);

      this.sorted = {
        id,
        order: newOrder
      };

      column.dataset.order = newOrder;
      column.append(this.subElements.arrow);

      if (this.isSortLocally) {
        this.sortOnClient(id, newOrder);
      } else {
        this.sortOnServer(id, newOrder);
      }
    }
  };

  constructor(headersConfig = [], {
    url = '',
    sorted = {
      id: headersConfig.find(item => item.sortable).id,
      order: 'asc'
    },
    isSortLocally = false,
    step = 20,
    start = 1,
    end = start + step
  } = {}) {

    this.headersConfig = headersConfig;
    this.url = new URL(url, BACKEND_URL);
    this.sorted = sorted;
    this.isSortLocally = isSortLocally;
    this.step = step;
    this.start = start;
    this.end = end;

    this.render();
  }

  async render() {
    const {id, order} = this.sorted;
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.getTable();

    const element = wrapper.firstElementChild;

    this.element = element;
    this.subElements = this.getSubElements(element);

    const data = await this.loadData(id, order, this.start, this.end);

    this.renderRows(data);
    this.initEventListeners();
  }

  async loadData(id, order, start = this.start, end = this.end) {
    this.url.searchParams.set('_sort', id);
    this.url.searchParams.set('_order', order);
    this.url.searchParams.set('_start', start);
    this.url.searchParams.set('_end', end);

    this.element.classList.add('sortable-table_loading');

    const data = await fetchJson(this.url.toString());

    this.element.classList.remove('sortable-table_loading');

    return data;

  sortData(id, order) {
    const arr = [...this.data];
    const column = this.headersConfig.find(item => item.id === id);
    const {sortType, customSorting} = column;
    const direction = order === 'asc' ? 1 : -1;

    return arr.sort((a, b) => {
      switch (sortType) {
      case 'number':
        return direction * (a[id] - b[id]);
      case 'string':
        return direction * a[id].localeCompare(b[id], 'ru');
      case 'custom':
        return direction * customSorting(a, b);
      default:
        return direction * (a[id] - b[id]);
      }
    });
  }
  

  addRows(data) {
    this.data = data;

    this.subElements.body.innerHTML = this.getTableRows(data);
  }

  update(data) {
    const rows = document.createElement('div');

    this.data = [...this.data, ...data];
    rows.innerHTML = this.getTableRows(data);

    this.subElements.body.append(...rows.childNodes);
  }

  getTableHeader() {
    return `<div data-element="header" class="sortable-table__header sortable-table__row">
       ${this.headersConfig.map(item => this.getHeaderRow(item)).join('')}
     </div>`;
  }

  getHeaderRow({id, title, sortable}) {
    const order = this.sorted.id === id ? this.sorted.order : 'asc';

    return `
       <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" data-order="${order}">
         <span>${title}</span>
         ${this.getHeaderSortingArrow(id)}
       </div>
     `;
  }

  getHeaderSortingArrow(id) {
    const isOrderExist = this.sorted.id === id ? this.sorted.order : '';

    return isOrderExist
      ? `<span data-element="arrow" class="sortable-table__sort-arrow">
           <span class="sort-arrow"></span>
         </span>`
      : '';
  }

  getTableBody(data) {
    return `
       <div data-element="body" class="sortable-table__body">
         ${this.getTableRows(data)}
       </div>`;
  }

  getTableRows(data) {
    return data.map(item => `
       <div class="sortable-table__row">
         ${this.getTableRow(item, data)}
       </div>`
    ).join('');
  }

  getTableRow(item) {
    const cells = this.headersConfig.map(({id, template}) => {
      return {
        id,
        template
      };
    });

    return cells.map(({id, template}) => {
      return template
        ? template(item[id])
        : `<div class="sortable-table__cell">${item[id]}</div>`;
    }).join('');
  }

  getTable() {
    return `
       <div class="sortable-table">
         ${this.getTableHeader()}
         ${this.getTableBody(this.data)}
         <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
         <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
           No products
         </div>
       </div>`;
  }

  initEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.onSortClick);
    document.addEventListener('scroll', this.onWindowScroll);
  }

  sortOnClient(id, order) {
    const sortedData = this.sortData(id, order);

    this.subElements.body.innerHTML = this.getTableRows(sortedData);
  }

  async sortOnServer(id, order) {
    const start = 1;
    const end = start + this.step;
    const data = await this.loadData(id, order, start, end);

    this.renderRows(data);
  }

  renderRows(data) {
    if (data.length) {
      this.element.classList.remove('sortable-table_empty');
      this.addRows(data);
    } else {
      this.element.classList.add('sortable-table_empty');
    }
  }


  addRows(data) {
    this.data = data;

    this.subElements.body.innerHTML = this.getTableRows(data);
  }

  update(data) {
    const rows = document.createElement('div');

    this.data = [...this.data, ...data];
    rows.innerHTML = this.getTableRows(data);

    this.subElements.body.append(...rows.childNodes);
  }

  getTableHeader() {
    return `<div data-element="header" class="sortable-table__header sortable-table__row">
      ${this.headersConfig.map(item => this.getHeaderRow(item)).join('')}
    </div>`;
  }

  getHeaderRow({id, title, sortable}) {
    const order = this.sorted.id === id ? this.sorted.order : 'asc';

    return `
      <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" data-order="${order}">
        <span>${title}</span>
        ${this.getHeaderSortingArrow(id)}
      </div>
    `;
  }

  getHeaderSortingArrow(id) {
    const isOrderExist = this.sorted.id === id ? this.sorted.order : '';

    return isOrderExist
      ? `<span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>`
      : '';
  }

  getTableBody(data) {
    return `
      <div data-element="body" class="sortable-table__body">
        ${this.getTableRows(data)}
      </div>`;
  }

  getTableRows(data) {
    return data.map(item => `
      <div class="sortable-table__row">
        ${this.getTableRow(item, data)}
      </div>`
    ).join('');
  }

  getTableRow(item) {
    const cells = this.headersConfig.map(({id, template}) => {
      return {
        id,
        template
      };
    });

    return cells.map(({id, template}) => {
      return template
        ? template(item[id])
        : `<div class="sortable-table__cell">${item[id]}</div>`;
    }).join('');
  }

  getTable() {
    return `
      <div class="sortable-table">
        ${this.getTableHeader()}
        ${this.getTableBody(this.data)}

        <div data-element="loading" class="loading-line sortable-table__loading-line"></div>

        <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
          No products
        </div>
      </div>`;
  }

  initEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.onSortClick);
    document.addEventListener('scroll', this.onWindowScroll);
  }

  sortOnClient(id, order) {
    const sortedData = this.sortData(id, order);

    this.subElements.body.innerHTML = this.getTableRows(sortedData);
  }

  async sortOnServer(id, order) {
    const start = 1;
    const end = start + this.step;
    const data = await this.loadData(id, order, start, end);

    this.renderRows(data);
  }

  renderRows(data) {
    if (data.length) {
      this.element.classList.remove('sortable-table_empty');
      this.addRows(data);
    } else {
      this.element.classList.add('sortable-table_empty');
    }
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  remove() {
    this.element.remove();
    document.removeEventListener('scroll', this.onWindowScroll);
  }

  destroy() {
    this.remove();
    this.subElements = {};
  }
}
