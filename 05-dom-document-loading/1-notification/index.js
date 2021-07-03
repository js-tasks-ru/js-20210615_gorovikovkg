export default class NotificationMessage {
  static actualMessage
  static removeMessage() {
    this.actualMessage.remove();
    clearTimeout(this.actualMessage.removeTimeout);
    this.actualMessage = null;
  }
  constructor(message = "", {duration = 2000, type = "success"} = {}) {
    this.element = document.createElement("div");
    this.createInner(message, {duration, type});
  }
  createInner(message = '', {duration = 2000, type = "success"} = {}) {
    this.element.innerHTML = `
    <div class="notification ${type}" style="--value:${duration / 1000}s">
      <div class="timer"></div>
      <div class="inner-wrapper">
        <div class="notification-header">${type}</div>
        <div class="notification-body">${message}</div>
      </div>
    </div>`;
    this.element = this.element.firstElementChild;
    this.duration = duration;
  }
  show(target = document.body) {
    if (NotificationMessage.actualMessage) {
      NotificationMessage.removeMessage();
    }
    NotificationMessage.actualMessage = this.element;
    this.element.removeTimeout = setTimeout(()=>{
      this.remove();
    }, this.duration);
    target.append(this.element);
  }
  destroy() {
    this?.element?.remove();
    clearTimeout(this?.element?.removeTimeout);
    this.element = null;
  }
  remove() {
    this.element.remove();
  }
}
