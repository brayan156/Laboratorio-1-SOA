const espacio = require('./clases/espacio.js')
const reservacion = require('./clases/reservacion.js')

const { response } = require('express');
const express = require('express');
const app = express();
const PORT = 8080;

app.use(express.json());

app.use(function (req, res, next) {
    res.status(405).send({
    respuesta:"metodo no permitido"
    })
})


const stateSpaces = {
    FREE: 'free',
    INUSE: 'in-use'
}

const tipo_espacios = {
    REGULAR: "regular",
    PREFERENCIAL: "preferencial",
    PROFESOR: "profesor"

}



var espacios = []
espacios.push(new espacio(tipo_espacios.REGULAR))
espacios.push(new espacio(tipo_espacios.PROFESOR))
espacios.push(new espacio(tipo_espacios.PREFERENCIAL))
let so = new espacio(tipo_espacios.REGULAR)
so.state = stateSpaces.INUSE
espacios.push(so)


var reservaciones = []
reservaciones.push(new reservacion (4,"2A"))


app.get('/spaces', (req, res) => {
    const spaces = req.query.state;
    if (!spaces) {
        res.status(200).send(espacios) 
    } else {
        switch (spaces) {
            case stateSpaces.FREE:
                res.status(200).send(espacios.filter(e => e.state == stateSpaces.FREE))
            case stateSpaces.INUSE:
                res.status(200).send(espacios.filter(e => e.state == stateSpaces.INUSE))
            default:
                res.status(409).send({
                    state: spaces,
                    text: 'state invalido',

                })
        }
    }
})

app.get('/spaces/:id', (req, res) => {
    const { id } = req.params;
    let  espacio= espacios.filter(e => e.id == id)[0]
    if (!espacio) {
        res.status(404).send({
            respuesta: "espacio no encontrado"
        })
    } else {
        res.status(200).send(espacio)
    }
})



app.post('/spaces', (req, res) => {
    const  tipo  = req.body.tipo;
    let nuevo_espacio = new espacio(tipo)
    espacios.push(nuevo_espacio)
    res.status(200).send({
        respuesta: "espacio creado exitosamente",
        espacio: nuevo_espacio
    })
})

app.put('/spaces/:id', (req, res) => {
    const { id } = req.params;
    const espacio_modificado = req.body
    if (espacio_modificado.id != id) {
        res.status(400).send({
            respuesta: "el id enviado y el id del objeto deben coincidir"
        })
    } else {
        let index = espacios.findIndex(e => e.id == id)
        if (index==-1) {
            res.status(404).send({
                respuesta: "espacio no encontrado"
            })
        } else {
            espacios[index] = espacio_modificado
            res.status(200).send({
                respuesta: "el espacio ha sido modificado",
                espacio: espacios[index]
            })
        }
    }
})

app.delete('/spaces/:id', (req, res) => {
    const { id } = req.params;
    let index = espacios.findIndex(e => e.id == id)
    if (index == -1) {
        res.status(409).send({
            respuesta: "espacio no encontrado"
        })
    } else if (espacios[index].state == stateSpaces.INUSE) {
        res.status(409).send({
            respuesta: "el espacio esta ocupado, no se puede eliminar"
        })
    } else {
        espacios.splice(index, 1)
        res.status(200).send(espacios.filter(e => e.id == id))
    }
})


app.get('/reservations', (req, res) => {
    res.status(200).send(reservaciones)
})


app.post('/reservations', (req, res) => {
    const placa = req.body.placa;
    let espacio_libre = espacios.filter(e => e.state == stateSpaces.FREE)[0]
    if (!espacio_libre) {
        res.status(409).send({
            respuesta: "no hay espacios disponibles"
        })
    } else {
        let nueva_reservacion = new reservacion(espacio_libre.id, placa)
        reservaciones.push(nueva_reservacion)
        let index = espacios.findIndex(e => espacio_libre.id == e.id)
        espacios[index].state = stateSpaces.INUSE
        res.status(200).send({
            respuesta: "espacio reservado exitosamente",
            espacio: nueva_reservacion
        })
    }
})


app.delete('/reservations/:id', (req, res) => {
    const { id } = req.params;
    let index = reservaciones.findIndex(r => r.idEspacio == id)
    if (index == -1) {
        res.status(409).send({
            respuesta: "espacio no encontrado"
        })
    } else {
        reservaciones.splice(index, 1)
        res.status(200).send(reservaciones.filter(e => e.idEspacio == id))
    }
})


app.listen(
    PORT,
    () => console.log(`I'm a big creature listening on http://localhost:${PORT}`)
)