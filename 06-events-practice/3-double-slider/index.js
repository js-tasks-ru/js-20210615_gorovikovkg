import sum from "../../01-intro/1-sum";


export default class DoubleSlider {
  constructor({min = 100, max = 200, formatValue = (a) => a, selected: {from = min, to = max} = {}} = {}) {
    this.element = this.render(from, to, formatValue);
    this.min = min;
    this.max = max;
    this.from = from;
    this.to = to;
    this.format = formatValue;
    this.subElements = {
      right: this.element.querySelector(".range-slider__thumb-right"),
      left: this.element.querySelector(".range-slider__thumb-left"),
      rangeInner: this.element.querySelector(".range-slider__inner"),
      range: this.element.querySelector(".range-slider__progress"),
      from: this.element.querySelector("span:first-of-type"),
      to: this.element.querySelector(".range-slider > span:last-of-type")
    };
    this.renderPositionByValues();
    this.pointerdown = (event) =>{
      if (event.target === this.subElements.right) {
        document.dispatchEvent(new MouseEvent("pointerup"));
        document.addEventListener("pointermove", this.moveRight);
        document.addEventListener("pointerup", this.upRight, {once: true});
      }
      else if (event.target === this.subElements.left){
        document.dispatchEvent(new MouseEvent("pointerup"));
        document.addEventListener("pointermove", this.moveLeft);
        document.addEventListener("pointerup", this.upLeft, {once: true});
      }
    };
    this.moveLeft = (event) =>{
      const prevLeft = parseFloat(this.subElements.range.style.left);
      this.subElements.range.style.left = Math.max(event.clientX - this.subElements.rangeInner.getBoundingClientRect().left,0)+"px";
      this.subElements.range.style.width = parseFloat(this.subElements.range.style.width)+(prevLeft-parseFloat(this.subElements.range.style.left))+"px";
      this.renderValuesByPositions();
    };
    this.moveRight = (event) =>{
      this.subElements.range.style.width = Math.min(Math.max(event.clientX - this.subElements.rangeInner.getBoundingClientRect().left - parseFloat(this.subElements.range.style.left), 0), this.subElements.rangeInner.getBoundingClientRect().width-parseFloat(this.subElements.range.style.left))+"px";
      this.renderValuesByPositions();
    };
    this.upRight = (event) => {
      document.removeEventListener("pointermove", this.moveRight);
    };
    this.upLeft = (event) =>{
      document.removeEventListener("pointermove", this.moveLeft);
    };
    this.subElements.rangeInner.addEventListener("pointerdown", this.pointerdown);
  }
  render(from, to, format) {
    const elem = document.createElement("div");
    elem.innerHTML = `<div class="range-slider">
    <span data-element="from">${format(from)}</span>
    <div class="range-slider__inner">
      <span class="range-slider__progress">
      <span class="range-slider__thumb-left"></span>
      <span class="range-slider__thumb-right"></span>
        </span>

    </div>
    <span data-element="to">${format(to)}</span>
  </div>`;
    return elem.firstElementChild;
  }
  renderValuesByPositions() {
    this.from = Number(((parseFloat(this.subElements.range.style.left))/this.subElements.rangeInner.getBoundingClientRect().width*(this.max - this.min)+this.min).toFixed(0));
    this.subElements.from.textContent = this.format(this.from);
    this.to = Number(((parseFloat(this.subElements.range.style.left)+parseFloat(this.subElements.range.style.width))/this.subElements.rangeInner.getBoundingClientRect().width*(this.max - this.min)+this.min).toFixed(0));
    this.subElements.to.textContent = this.format(this.to);
    this.element.dispatchEvent(new CustomEvent("range-select", {detail: { from: this.from, to: this.to }}));
  }
  renderPositionByValues() {
    this.subElements.range.style.width = (this.to - this.from) / (this.max - this.min) * this.subElements.rangeInner.getBoundingClientRect().width + "px";
    this.subElements.range.style.left = (this.from - this.min) / (this.max - this.min) * this.subElements.rangeInner.getBoundingClientRect().width + "px";
  }
  destroy(){
    document.dispatchEvent(new MouseEvent("pointerup"));
    this.subElements.rangeInner.removeEventListener("pointerdown", this.pointerdown);
    this.element?.remove();
    this.element = null;
  }
}
