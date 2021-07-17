export default class RangePicker {
  months = [
    "январь",
    "февраль",
    "март",
    "апрель",
    "май",
    "июнь",
    "июль",
    "август",
    "сентябрь",
    "октябрь",
    "ноябрь",
    "декабрь"
  ]
  subElements = {};
  inputHTML = `
    <div class="rangepicker__input" data-element="input">
      <span data-element="from"></span> -
      <span data-element="to"></span>
    </div>`;

  selectDefaultHTML = `
    <div class="rangepicker__selector" data-element="selector">
        <div class="rangepicker__selector-arrow"></div>
        <div class="rangepicker__selector-control-left"></div>
        <div class="rangepicker__selector-control-right"></div>
    </div>`;

  calendarHTML = `      <div class="rangepicker__calendar">
        <div class="rangepicker__month-indicator">
          <time datetime=""></time>
        </div>
        <div class="rangepicker__day-of-week">
          <div>Пн</div>
          <div>Вт</div>
          <div>Ср</div>
          <div>Чт</div>
          <div>Пт</div>
          <div>Сб</div>
          <div>Вс</div>
        </div>
        <div class="rangepicker__date-grid"></div>
      </div>`;

  buttonHTML = `
    <button type="button" class="rangepicker__cell"></button>`;

  actualDateRange;

  static DateRange = class{
    constructor(date1, date2) {
      this.from = date1;
      this.to = date2;
      return new Proxy(this, {
        has(obj, date){
          if (obj.fromTime < date && obj.toTime > date) return true;
        }
      })
    }

    get fromTime(){
      return this.from.getTime();
    }

    get toTime(){
      return this.to.getTime();
    }

  }

  constructor({from, to}){
    this.render(from, to);
  }

  render(from, to){
    this.createElement();
    this.rangeChose(from, to);
    this.changeCalendars(to.getMonth()-1, to.getFullYear());
    this.initEventListeners();
    this.close();
  }

  rangeChose(from, to){
    this.setDateRange(from, to);
    this.renderFullData();
    this.element.dispatchEvent(new CustomEvent("date-select", {detail: {from, to}}));
  }

  setDateRange(from, to){
    this.actualDateRange = new RangePicker.DateRange(from, to);
  }

  removeDateRange(){
    this.actualDateRange = null;
  }

  renderMonths(){
    this.subElements.leftDateTime.innerHTML = this.months[this.actualCalendare[0]];
    this.subElements.rightDateTime.innerHTML = this.months[this.actualCalendare[0]+1 === 12 ? 0: this.actualCalendare[0]+1];
  }

  renderFullData(){
    this.subElements.fromFD.innerHTML = this.actualDateRange.from.toLocaleDateString("ru");
    this.subElements.toFD.innerHTML = this.actualDateRange.to.toLocaleDateString("ru");
  }

  createElement() {
    this.element = document.createElement("div");
    this.element.className = "rangepicker rangepicker_open";
    this.element.append(elementFromHTML(this.inputHTML));
    this.element.append(elementFromHTML(this.selectDefaultHTML));
    this.createCalendars();
    this.createSubElementsNavigation();
  }

  createCalendars() {
    this.element.querySelector(".rangepicker__selector").append(elementFromHTML(this.calendarHTML));
    this.element.querySelector(".rangepicker__selector").append(elementFromHTML(this.calendarHTML));
  }

  createSubElementsNavigation(){
    this.subElements.input = this.element.firstElementChild;
    this.subElements.selector = this.element.lastElementChild;
    this.subElements.leftDateTime = this.element.querySelectorAll(".rangepicker__calendar")[0].querySelector("time");
    this.subElements.rightDateTime = this.element.querySelectorAll(".rangepicker__calendar")[1].querySelector("time");
    this.subElements.leftGrid = this.element.querySelectorAll(".rangepicker__calendar")[0].querySelector(".rangepicker__date-grid");
    this.subElements.rightGrid = this.element.querySelectorAll(".rangepicker__calendar")[1].querySelector(".rangepicker__date-grid");
    this.subElements.fromFD = this.element.querySelector(`[data-element="from"]`);
    this.subElements.toFD = this.element.querySelector(`[data-element="to"]`);
    this.subElements.leftArrow = this.element.querySelector(".rangepicker__selector-control-left");
    this.subElements.rightArrow = this.element.querySelector(".rangepicker__selector-control-right");
  }

  changeCalendars(firstMonth = this.actualCalendare[0], year = this.actualCalendare[1]) {
    const date = new Date(year, firstMonth, 1);
    this.actualCalendare = [date.getMonth(), date.getFullYear()];
    this.changeCalendar("left", this.actualCalendare[0], this.actualCalendare[1]);
    this.changeCalendar("right", this.actualCalendare[0]+1 === 12 ? 0 : this.actualCalendare[0]+1, this.actualCalendare[1]);
    this.renderMonths();
  }

  initEventListeners(){
    this.subElements.leftArrow.addEventListener("click", ()=>{
      this.changeCalendars(this.actualCalendare[0]-1, this.actualCalendare[1]);
    });

    this.subElements.rightArrow.addEventListener("click", ()=>{
      this.changeCalendars(this.actualCalendare[0]+1, this.actualCalendare[1]);
    });

    this.onClick = function (event){
      const target = event.target.closest(".rangepicker__cell");
      if (!target) return;
      this.chose(target);
    }.bind(this);

    this.subElements.selector.addEventListener("click", this.onClick);

    this.subElements.input.addEventListener("click", ()=>{
      if (this.template) this.open();
      else this.close();
    });
  }

  chose(target){
    if (this.firstSpot) {
      const date1 = this.firstSpot.getTime() >= new Date(target.dataset.value).getTime() ? new Date(target.dataset.value) : this.firstSpot;
      const date2 = !(this.firstSpot.getTime() >= new Date(target.dataset.value).getTime()) ? new Date(target.dataset.value) : this.firstSpot
      this.rangeChose(date1, date2);
      this.changeCalendars();
      this.firstSpot = null;
    }
    else {
      this.removeDateRange();
      this.subElements.selector.querySelectorAll(".rangepicker__cell").forEach((cell)=>{
        cell.className = "rangepicker__cell";
      });
      this.firstSpot = new Date(target.dataset.value);
      target.classList.add("rangepicker__selected-from");
    }
  }

  changeCalendar(calendar, month, year) {
    this.subElements[calendar + "Grid"].innerHTML = "";
    for (let i = 1; ; i++) {
      const date = new Date(year, month, i);
      if (date.getMonth() !== month) break;
      else this.subElements[calendar + "Grid"].insertAdjacentHTML("beforeend", this.buttonHTML);
      this.createButtonStyles(this.subElements[calendar + "Grid"].lastElementChild, date);
    }
    this.subElements[calendar + "Grid"].firstElementChild.style = `--start-from: ${new Date(year, month, 1).getDay() ? new Date(year, month, 1).getDay() : 7};`;
  }

  createButtonStyles(button, date){
    if (this.actualDateRange && (date.getTime() in this.actualDateRange))
      button.classList.add("rangepicker__selected-between");
    else if (this.actualDateRange && (this.actualDateRange.fromTime === date.getTime()))
      button.classList.add("rangepicker__selected-from");
    else if (this.actualDateRange && (this.actualDateRange.toTime === date.getTime()))
      button.classList.add("rangepicker__selected-to");
    button.dataset.value = date.toISOString();
    button.innerHTML = date.getDate();
  }

  remove(){
    this.element.remove();
  }

  destroy(){
    this.element.remove();
    this.subElements = null;
    this.element = null;
  }

  close(){
    this.template = document.createElement("template");
    for (let i of Array.from(this.subElements.selector.children)) {
      this.template.append(i);
    }
    this.subElements.selector.removeEventListener("click", this.onClick);
    this.subElements.selector.style.display = "none";
    this.subElements.selector.innerHTML = "";
    this.element.classList.remove( "rangepicker_open");
  }

  open() {
    this.element.classList.add("rangepicker_open");
    this.subElements.selector.append(...Array.from(this.template.children));
    this.subElements.selector.addEventListener("click", this.onClick);
    this.subElements.selector.style.display = "";
    this.template = null;
  }
}

const element = document.createElement("div");
function elementFromHTML(html){
  element.innerHTML = "";
  element.insertAdjacentHTML("beforeend", html);
  return element.firstElementChild;
}

