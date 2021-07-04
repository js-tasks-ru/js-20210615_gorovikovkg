
class Tooltip {
  static made = false
  static result
  constructor() {
    if (!Tooltip.made) {
      Tooltip.made = true;
      Tooltip.result = {
        initialize() {
          const target = document.querySelector("[data-tooltip]");
          if (!target) throw new Error("Cannot initialize a tooltip, there is no data-tooltip elements");
          let mouseMoveObserving = false;
          this.over = function (event) {
            this.element.textContent = event.target.closest("[data-tooltip]").dataset.tooltip;
          }.bind(this);
          this.move = function (event) {
            this.element.style.left = event.clientX + 5 + "px";
            this.element.style.top = event.clientY + 5 + "px";
          }.bind(this);
          this.out = function (event) {
            if ((!target.contains(event.target) || target === event.target) && mouseMoveObserving === true) {
              mouseMoveObserving = false;
              target.removeEventListener("pointermove", this.move);
              this.element.remove();
              target.addEventListener("pointerover", this.firstEnter, {once: true, capture: true, passive: true});
            }
          }.bind(this);
          this.firstEnter = function (event) {
            mouseMoveObserving = true;
            document.body.append(this.element);
            target.addEventListener("pointermove", this.move);
            this.move({clientX: event.clientX, clientY: event.clientY});
          }.bind(this);
          target.addEventListener("pointerover", this.firstEnter, {once: true, capture: true, passive: true});
          this.element = document.createElement("div");
          this.element.classList.add("tooltip");
          target.addEventListener("pointerover", this.over);
          target.addEventListener("pointerout", this.out);
          this.destroy = function () {
            target.removeEventListener("pointerover", this.over);
            target.removeEventListener("pointerover", this.out);
            if (mouseMoveObserving) target.removeEventListener("pointermove", this.move);
            else target.removeEventListener("pointerover", this.firstEnter);
          };
        },
        render() {
          document.body.append(this.element);
        }
      };
    }
    return Tooltip.result;
  }
}
export default Tooltip;
