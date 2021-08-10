class espacio {

    constructor(tipo) {
        this.id = espacio.crearid()
        this.state = "free"
        this.tipo =tipo
    }

    static crearid() {
    if (!this.nuevoid) this.nuevoid = 1
    else this.nuevoid++
    return this.nuevoid
    }
}
module.exports = espacio