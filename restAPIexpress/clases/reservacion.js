class reservacion {

    constructor(idEspacio, placa) {
        this.idEspacio = idEspacio
        this.placa = placa
        this.hora = new Date().getHours() + ":"+ new Date().getMinutes()
    }

}
module.exports = reservacion