class DOMElement {
    #element;
    #elements = [];
    #event_listeners = []

    constructor(id) {
        this.#element = id instanceof HTMLElement ? id : document.getElementById(id);
    }
    appendChild(element) {
        this.#elements.push(element);
        this.#element.appendChild(element);
    }
    addEventListener(type, listener) {
        this.#element.addEventListener(type, listener);

        this.#event_listeners.push([type, listener]);
    }
    br(n = 1) {
        for (let i = 0; i < n; i++) {
            let br = document.createElement('br');
            this.appendChild(br);
        }
    }
    clear() {
        for (let element of this.#elements) {
            this.#element.removeChild(element);
        }
        this.#elements.length = 0;
        this.#element.scrollTop = 0;

        for (let event_listener of this.#event_listeners) {
            this.#element.removeEventListener(...event_listener);
        }
    }
    scrollbar_visible() {
        return this.element.scrollHeight > this.element.clientHeight
    }
    get element() {
        return this.#element;
    }
}