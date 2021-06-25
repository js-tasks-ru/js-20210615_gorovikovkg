// А будем ли мы реализовывать такие вещи с помощью кастомных элементов и вообще проходить их?
export default class ColumnChart {
    constructor(obj = {}) {
        this.element = document.createElement("div");
        this.element.classList.add("column-chart");
        this.element.style.cssText = "--chart-height: 50";
        this.update(obj);
    }
    chartHeight = 50;
    update({data = [], label = "untitled", value = 0, link, formatHeading = (data) => data}){
      const colons = makeColons(data);
      this.element.innerHTML = `
      <div class="column-chart__title">
        Total ${label}
        ${link ? `<a class="column-chart__link" href="${link}">View all</a>`:""}
      </div>
      <div class="column-chart__container">
        <div data-element="header" class="column-chart__header">
          ${formatHeading(value)}
        </div>
        <div data-element="body" class="column-chart__chart">
            ${colons}
         </div>
      </div>
        `;
      if (!data.length) this.element.classList.add("column-chart_loading");
      else this.element.className = "column-chart";
    }
    destroy() {
      this.element.remove();
      delete this.element;
    }
    remove() {
      this.element.remove();
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
function makeColons(data){
  if (!data.length) return "";
  let result = "";
  for (let {percent, value} of getColumnProps(data)){
    result+=`<div style="--value: ${value}" data-tooltip="${percent}"></div>`
  }
  return result;
}
