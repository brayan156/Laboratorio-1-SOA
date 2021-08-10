const { response } = require('express');
const express = require('express');
const app = express();
const PORT = 8080;

app.use(express.json());

const stateSpaces = {
    FREE: 'free',
    INUSE: 'in-use'
}

app.get('/tshirt', (req, res) => {
    const  spaces  = req.query.state;
    switch (spaces) {
        case stateSpaces.FREE:
            res.status(200).send({
                thshirt: '👕',
                text: 'free boy',
        
            })
        case stateSpaces.INUSE:
            res.status(200).send({
                thshirt: '👕',
                text: 'busy boy',
        
            })
        default:
            res.status(418).send({
                thshirt: spaces,
                text: 'wrong state',
        
            })
    }
    

    console.log(params);
    
})

app.post('/tshirt/:id', (req, res) => {
    const { id } = req.params;
    const { body } = req.body;

    if (!body) {
        res.status(404).send({
            message: 'we need a logo!!!',
            status: '404'
        })
    } else {
        res.status(200).send({
            tshirt: `👕 with your ${body} and ID of ${id}`
        })
    }
})

app.listen(
    PORT,
    () => console.log(`I'm a big creature listening on http://localhost:${PORT}`)
)