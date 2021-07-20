import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';
export default class ColumnChart {
  subElements = {};
  constructor(obj = {}) {
    this.create(obj);
  }
  create({url, range, label = "untitled", value = 0, link, formatHeading = (data) => data}){
    this.element = document.createElement("div");
    this.element.classList.add("column-chart");
    this.element.style.cssText = "--chart-height: 50";
    this.createInner(label, value, link, formatHeading);
    this.subElements.body = this.element.querySelector(`[data-element="body"]`);
    this.update = this.update.bind(this, url);
    if (range && url) this.update(range.from, range.to);
    else this.element.classList.add("column-chart_loading");
  }
  chartHeight = 50;
  async update(url, from, to){
    this.element.classList.add("column-chart_loading");
    try {
      const result = await fetchJson(new URL(BACKEND_URL+"/"+url+"?"+"from="+from.toISOString()+"&to="+to.toISOString()));
      this.subElements.body.innerHTML = this.createColons(Object.values(result));
      this.element.className = "column-chart";
      return result;
    } catch (error) {
      return error;
    }
  }
  createColons(data){
    if (!data.length) return "";
    let result = "";
    for (let {percent, value} of getColumnProps(data)){
      result+=`<div style="--value: ${value}" data-tooltip="${percent}"></div>`
    }
    return result;
  }
  createInner(label, value, link, formatHeading){
    this.element.innerHTML = `
      <div class="column-chart__title">
        Total ${label}
        ${link ? `<a class="column-chart__link" href="${link}">View all</a>`:""}
      </div>
      <div class="column-chart__container">
        <div data-element="header" class="column-chart__header">
          ${formatHeading(value)}
        </div>
        <div data-element="body" class="column-chart__chart"></div>
      </div>
        `;
  }
  destroy() {
    this.element?.remove();
    this.element = null;
  }
  remove() {
    this.element?.remove();
  }
}
function getColumnProps(data) {
  const maxValue = Math.max(...data);
  const scale = 50 / maxValue;

  return data.map(item => {
    return {
      percent: (item / maxValue * 100).toFixed(0) + '%',
      value: String(Math.floor(item * scale))
    };
  });
}
