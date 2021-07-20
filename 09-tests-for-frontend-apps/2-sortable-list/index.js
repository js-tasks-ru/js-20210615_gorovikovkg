export default class SortableList {
  deleteHandle = (item) => {
    item.closest(".sortable-list__item").remove();
  };

  grabHandle = (item, event) => {
    const target = item.closest(".sortable-list__item");
    this.giveStylesBeforeDrag(target);
    const holder = this.appendHolder(target, getComputedStyle(target).width, getComputedStyle(target).height);
    target.classList.add("sortable-list__item_dragging");
    const xStart = event.clientX;
    const yStart = event.clientY;
    const xDifference = xStart-parseFloat(target.style.left);
    const yDifference = yStart-parseFloat(target.style.top);

    const onMove = (event) =>{
      target.style.left = event.clientX-xDifference+"px";
      target.style.top = event.clientY-yDifference+"px";
      this.scrollIfOutOfWindow(target);
      const elements = document.elementsFromPoint(parseFloat(target.style.left)+target.getBoundingClientRect().width/2,
        parseFloat(target.style.top)+target.getBoundingClientRect().height/2);
      for (const i of elements) {
        if (i.closest(".sortable-list__placeholder") || !this.element.contains(i)) break;
        if (target.contains(i)) continue;
        else if (i.closest(".sortable-list__item")) this.replace(i.closest(".sortable-list__item"), holder);
      }
    };

    const onUp = () =>{
      document.removeEventListener("pointermove", onMove);
      this.replace(target, holder);
      holder.remove();
      this.removeStylesAfterDrag(target);
    };

    document.addEventListener("pointerup", onUp, {once: true});
    document.addEventListener("pointermove", onMove);
  };

  giveStylesBeforeDrag(target) {
    target.style.left = target.getBoundingClientRect().left+"px";
    target.style.top = target.getBoundingClientRect().top+"px";
    target.style.width = getComputedStyle(target).width;
  }

  removeStylesAfterDrag(target) {
    target.style.left = "";
    target.style.top = "";
    target.style.width = "";
    target.classList.remove("sortable-list__item_dragging");
  }

  scrollIfOutOfWindow(target) {
    if (target.getBoundingClientRect().top < 0) target.scrollIntoView(true);
    else if (target.getBoundingClientRect().bottom > innerHeight) target.scrollIntoView(false);
  }

  createPlace(el, untouchable) {
    return el.previousSibling && el.previousSibling !== untouchable ? [el.previousSibling, "afterend"] :
      el.nextSibling && el.nextSibling !== untouchable ? [el.nextSibling, "beforebegin"] :
        [el.parentNode, "afterbegin"];
  }

  replace(el1, el2) {
    const place1 = this.createPlace(el1, el2);
    const place2 = this.createPlace(el2, el1);
    place1[0].insertAdjacentElement(place1[1], el2);
    place2[0].insertAdjacentElement(place2[1], el1);
    console.log(el1, el2, place1[0], place2[0]);
  }

  constructor({items, holder = null}) {
    this.render(items, holder);
  }

  render(items, holder) {
    this.createContainer(holder);
    this.initializeItems(items);
    this.items = items;
    this.initListeners();
  }

  initializeItems(items) {
    if (!items[Symbol.iterator]) throw new Error(`Invalid arguments, items: ${items} are not iterable`);
    for (let i = 0; i < items.length; i++) {
      items[i].classList.add("sortable-list__item");
      this.element.append(items[i]);
    }
  }

  createContainer(el) {
    if (!el) this.element = document.createElement("div");
    else this.element = el;
    this.element.classList.add("sortable-list");
  }

  initListeners() {
    this.element.addEventListener("pointerdown", event=>{
      // if (!event.isPrimary) return;
      const target = event.target.closest("[data-grab-handle], [data-delete-handle]");
      if (!target) return;
      if (target.dataset.hasOwnProperty("grabHandle")) this.grabHandle(target, event);
      else this.deleteHandle(target);
    });
  }

  appendHolder(target, width, height) {
    const el = document.createElement("div");
    el.className = "sortable-list__placeholder";
    el.style.cssText = `width: ${width}; height: ${height};`;
    target.replaceWith(el);
    this.element.append(target);
    return el;
  }

  remove(){
    this.element.remove();
  }

  destroy(){
    this.element.remove();
    this.element = null;
  }
}
