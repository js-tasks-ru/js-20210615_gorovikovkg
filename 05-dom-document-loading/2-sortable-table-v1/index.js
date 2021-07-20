export default class SortableTable {
  constructor(headerConfig = [], data = []) {
    this.headers = [];
    this.subElements = {};
    this.subElements.head = this.makeHeader(headerConfig);
    this.subElements.body = this.makeBody(data.data);
    this.element = document.createElement("div");
    this.element.innerHTML = `<div data-element="productsContainer" class="products-list__container">
  <div class="sortable-table"></div></div>`;
    this.element = this.element.firstElementChild;
    this.element.firstElementChild.append(this.subElements.head, this.subElements.body);
    this.arrow = this.makeArrow();
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
  sort(field, order) {
    const rows = Array.from(this.subElements.body.children);
    const orders = {
      "asc": 1,
      "desc": -1
    };
    this.headers[field].elem.append(this.arrow);
    this.subElements.head.querySelector("[data-order]")?.removeAttribute("data-order");
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
    this.element = null;
  }
}

