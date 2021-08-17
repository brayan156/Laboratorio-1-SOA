const espacio = require('./clases/espacio.js')
const reservacion = require('./clases/reservacion.js')

const stateSpaces = require('./Enums/stateSpaces.js')
const tipo_espacios = require('./Enums/tipo_espacios.js')

const { response } = require('express');
const express = require('express');
var bodyParser = require("body-parser");
var swaggerJsdoc = require("swagger-jsdoc");
var swaggerUi = require("swagger-ui-express");
var cors = require('cors');
const app = express();
const PORT = 8080;

const https= require('https')
const path = require('path')
const fs =require ('fs')




app.use(cors({
    origin: 'http://localhost:3000'}))
app.use(express.json());

//se restringe el content-type a solo json
app.use(function (req, res, next) {
    if (req.headers['content-type'] != "application/json" && req.headers['content-type']) {
        res.status(406).send({
            respuesta: "content-type incorrecto, solo se acepta application/json"
        })
    } else {
        next()
    }
})

//creacion de las lista de los datos
var espacios = []
espacios.push(new espacio(tipo_espacios.REGULAR))
espacios.push(new espacio(tipo_espacios.PROFESOR))
espacios.push(new espacio(tipo_espacios.PREFERENCIAL))
let so = new espacio(tipo_espacios.REGULAR)
so.state = stateSpaces.INUSE
espacios.push(so)


var reservaciones = []
reservaciones.push(new reservacion (4,"2A"))
reservaciones.push(new reservacion (5,"3A"))



//metodos aceptados con sus respectivos errores y respuestas
app.get('/spaces', paginatedResults(espacios),(req, res) => {
    const spaces = req.query.state;
    var espaciosTmp = res.paginatedResults
    // var espaciosTmp = espacios

    if (!spaces) {
        res.status(200).send(espaciosTmp) 
    } else {
        switch (spaces) {
            case stateSpaces.FREE:
                res.status(200).send(espaciosTmp.filter(e => e.state == stateSpaces.FREE))
            case stateSpaces.INUSE:
                res.status(200).send(espaciosTmp.filter(e => e.state == stateSpaces.INUSE))
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
        res.status(409).send({
            respuesta: "espacio no encontrado"
        })
    } else {
        res.status(200).send(espacio)
    }
})


//metodo post de spaces: recibe en el body el tipo del objeto de la forma tipo:"tipo de espacio"
app.post('/spaces', (req, res) => {
    const tipo = req.body.tipo;
    if (!tipo) {
        res.status(400).send({
            respuesta: "debe enviar el tipo de espacio como tipo:"
        })
    } else {
        let nuevo_espacio = new espacio(tipo)
        espacios.push(nuevo_espacio)
        res.status(200).send({
            respuesta: "espacio creado exitosamente",
            espacio: nuevo_espacio
        })
    }
})

//metodo put de spaces: requiere del id del objeto a modificar y el objeto completo con las modificaciones realizadas
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


app.get('/reservations', paginatedResults(reservaciones), (req, res) => {
    res.status(200).send(res.paginatedResults)
})


//metodo post de reservation: en el body se debe enviar el atributo placa:"numero de placa"
app.post('/reservations', (req, res) => {
    const placa = req.body.placa;
    if (!placa) {
        res.status(400).send({
            respuesta: "debe enviar la placa del vehiculo como placa:"
        })
    } else {
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
    }
})

//elimina la reservacion por medio del id del espacio asignado
app.delete('/reservations/:id', (req, res) => {
    const { id } = req.params;
    let index = reservaciones.findIndex(r => r.idEspacio == id)
    if (index == -1) {
        res.status(409).send({
            respuesta: "espacio no encontrado"
        })
    } else {

        reservaciones.splice(index, 1)
        let index_espacio = espacios.findIndex(e => e.id == id)
        espacios[index_espacio].state = stateSpaces.FREE
        res.status(200).send(reservaciones.filter(e => e.idEspacio == id))
    }
})

//se envia el error 405 para los metodos no contemplados aun
app.all('/reservations', (req, res) => {
    res.status(405).send({
        respuesta:"metodo no permitido"
    })
})
app.all('/spaces', (req, res) => {
    res.status(405).send({
        respuesta:"metodo no permitido"
    })
})
app.all('/reservations/:id', (req, res) => {
    res.status(405).send({
        respuesta: "metodo no permitido"
    })
})
app.all('/spaces/:id', (req, res) => {
    res.status(405).send({
        respuesta: "metodo no permitido"
    })
})

/**
 * Funcion para la paginacion simple
 * 
 * @param {*} object 
 * @returns 
 */
function paginatedResults(object){
    return (req, res, next) => {
        var objectTmp = object;


        const page = parseInt(req.query.page)
        const limit = parseInt(req.query.limit)


        const fields = req.query;
        console.log(fields);
        const startIndex = (page-1)*limit
        const endIndex = page *limit

        var result = {}

        if (fields.placa){
            objectTmp =  object.filter(function(obj) {
                return obj.placa == req.query.placa;
            });
        }

        if (fields.hora){
            objectTmp =  object.filter(function(obj) {
                return obj.hora == req.query.hora;
            });
        }

        if (fields.idEspacio){
            if (fields.idEspacio.gte){
                objectTmp =  object.filter(function(obj) {
                return obj.idEspacio >= parseInt(fields.idEspacio.gte); 
            });} 
        }

        if (fields.idEspacio){
            if (fields.idEspacio.lte){
                objectTmp =  object.filter(function(obj) {
                return obj.idEspacio <= parseInt(fields.idEspacio.lte); 
            });} 
        }

        if (fields.state){
            objectTmp =  object.filter(function(obj) {
                return obj.state == req.query.state;
            });
        }

        if (fields.tipo){
            objectTmp =  object.filter(function(obj) {
                return obj.tipo == req.query.tipo;
            });
        }

        if (fields.id){
            if (fields.id.gte){
                objectTmp =  object.filter(function(obj) {
                return obj.id >= parseInt(fields.id.gte); 
            });} 
        }

        if (fields.id){
            if (fields.id.lte){
                objectTmp =  object.filter(function(obj) {
                return obj.id <= parseInt(fields.id.lte); 
            });} 
        }

        if (endIndex < object.length){
            result.next = {
                page : page +1,
                limit : limit
            }
        }

        if (startIndex > 0){
            result.prev = {
                page:page -1,
                limit: limit
            }
        }

        if (!page || !limit){
            result.results = objectTmp
        } else {
            result.results = objectTmp.slice(startIndex, endIndex);
        }
        res.paginatedResults = result
        next()
    }
}

const sslServer = https.createServer(
    {
        key: fs.readFileSync("./certificado/cert.key"),
        cert: fs.readFileSync("./certificado/cert.pem")
    },
    app
)

sslServer.listen(
    3443,
    () => console.log("secure listening in https://localhost:3443")
)

const options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "LogRocket Express API with Swagger",
        version: "0.1.0",
        description:
          "This is a simple CRUD API application made with Express and documented with Swagger",
        license: {
          name: "MIT",
          url: "https://spdx.org/licenses/MIT.html",
        },
        contact: {
          name: "LogRocket",
          url: "https://logrocket.com",
          email: "info@email.com",
        },
      },
      servers: [
        {
          url: "http://localhost:8080/api",
        },
      ],
    },
    apis: ["./routes/books.js"],
  };
  
  const specs = swaggerJsdoc(options);
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(specs)
  );

app.listen(
    PORT,
    () => console.log(`I'm a wild creature listening on http://localhost:${PORT}`)
)