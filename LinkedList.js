class LinkedListEntry {
    constructor(item, prev){
        this.item = item;
        this.prev = prev;
        this.next = null;
    }
}

class LinkedList {
    #first = null;
    #last = null;

    append(item){
        let entry = new LinkedListEntry(item, this.#last);

        if(this.#first === null){
            this.#first = entry;
        } else {
            this.#last.next = entry;
        }
        this.#last = entry;

        return entry;
    }
}