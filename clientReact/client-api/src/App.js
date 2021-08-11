import logo from './logo.svg';
import React from "react";
import './App.css';
import "bootstrap/dist/css/bootstrap.min.css";
import { Table, Button, Container, Modal, ModalBody, ModalHeader, FormGroup, ModalFooter, InputGroup } from "reactstrap";


let reservacion = {
  placa: Number,
  hora: String,
  id_espacio: Number
}

let espacio = {
  id: Number,
  estado: String,
  dato: String
}

let reservaciones = []

let espacios = []

class App extends React.Component {
  state = {
    data: { reservaciones: [], espacios: [] },
    modalActualizarEspacio: false,
    modalInsertarEspacio: false,
    modalInsertarReservacion: false,
    modalActualizarReservacion: false,
    form: {
      dato: ""
    },
  };


  componentDidMount() {
    this.setInit();
  }

  async searchByID(){
    console.log("search ", this.state.form.search)
    const spaces = await this.getSpace(this.state.form.search);
    if (spaces.respuesta) {
      window.confirm("Respuesta del server: " + spaces.respuesta);
      this.setInit();
    }
    const reservations = await this.getReservations();
    this.setState({
      data: {
        reservaciones: reservations,
        espacios: [spaces]
      }
    })
  }

  async setInit() {
    const spaces = await this.getSpaces();
    const reservations = await this.getReservations();
    this.setState({
      data: {
        reservaciones: reservations,
        espacios: spaces
      }
    })
  }

  //Metodos del Spaces


  async getSpaces() {
    const rawResponse = await fetch("http://localhost:8080/spaces");
    const parsedResponse = await rawResponse.json();
    console.log('espacios: ', parsedResponse);
    return parsedResponse;
  }

  async getReservations() {
    const rawResponse = await fetch("http://localhost:8080/reservations");
    const parsedResponse = await rawResponse.json();
    console.log("reservaciones ", parsedResponse);
    return parsedResponse;
  }

  async getSpace(id) {
    const rawResponse = await fetch(`http://localhost:8080/spaces/${id}`);
    const parsedResponse = await rawResponse.json();
    return parsedResponse;
  }

  async postSpace(dato) {
    const rawResponse = await fetch(`http://localhost:8080/spaces`, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tipo: dato
      })
    });
    const parsedResponse = await rawResponse.json();
    return parsedResponse;
  }

  async putSpace(id, dato) {
    const rawResponse = await fetch(`http://localhost:8080/spaces/${id}`, {
      method: 'PUT',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dato)
    });
    const parsedResponse = await rawResponse.json();
    return parsedResponse;
  }

  async deleteSpace(id) {
    const rawResponse = await fetch(`http://localhost:8080/spaces/${id}`, {
      method: 'DELETE',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    const parsedResponse = await rawResponse.json();
    return parsedResponse;
  }



  async postReservation(dato) {
    const rawResponse = await fetch(`http://localhost:8080/reservations`, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        placa: dato
      })
    });
    const parsedResponse = await rawResponse.json();
    return parsedResponse;
  }

  async deleteReservation(id) {
    const rawResponse = await fetch(`http://localhost:8080/reservations/${id}`, {
      method: 'DELETE',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    const parsedResponse = await rawResponse.json();
    return parsedResponse;
  }


  mostrarModalActualizarEspacio = (dato) => {
    this.setState({
      form: dato,
      modalActualizarEspacio: true,
    });
  };

  cerrarModalActualizarEspacio = () => {
    this.setState({ modalActualizarEspacio: false });
  };

  mostrarModalInsertarEspacio = () => {
    this.setState({
      modalInsertarEspacio: true,
    });
  };

  cerrarModalInsertarEspacio = () => {
    this.setState({ modalInsertarEspacio: false });
  };

  mostrarModalInsertarReservacion() {
    this.setState({ modalInsertarReservacion: true });
  }

  cerrarModalInsertarReservacion() {
    this.setState({ modalInsertarReservacion: false });
  }


  async insertarEspacio() {
    console.log(this.state.form);
    const res = await this.postSpace(this.state.form.tipo);
    if (res.respuesta) {
      window.confirm("Respuesta del server: " + res.respuesta);
    }
    const spaces = await this.getSpaces();
    this.setState({ data: { espacios: spaces, reservaciones: this.state.data.reservaciones }, modalInsertarEspacio: false });
  }

 

  async editarEspacio() {
    const res = await this.putSpace(this.state.form.id, this.state.form);
    if (res.respuesta) {
      window.confirm("Respuesta del server: " + res.respuesta);
    }
    const spaces = await this.getSpaces();
    this.setState({ data: { espacios: spaces, reservaciones: this.state.data.reservaciones }, modalActualizarEspacio: false });
  };

  async eliminarEspacio(dato) {
    const res = await this.deleteSpace(dato.id);
    if (res.respuesta) {
      window.confirm("Respuesta del server: " + res.respuesta);
    }
    const spaces = await this.getSpaces();
    this.setState({ data: { espacios: spaces, reservaciones: this.state.data.reservaciones } });
  }

  async insertarReservacion() {
    const res = await this.postReservation(this.state.form.placa);
    if (res.respuesta) {
      window.confirm("Respuesta del server: " + res.respuesta);
    }
    const reservations = await this.getReservations();
    this.cerrarModalInsertarReservacion();
    this.setState({ data: { espacios: this.state.data.espacios, reservaciones: reservations }, modalInsertarReservacion: false });
  }


  async eliminarReservacion(dato) {
    console.log("reservacion, ", dato)
    const res = await this.deleteReservation(dato.idEspacio);
    if (res.respuesta) {
      window.confirm("Respuesta del server: " + res.respuesta);
    }
    const reservations = await this.getReservations();
    this.setState({ data: { espacios: this.state.data.espacios, reservaciones: reservations } });
  }


  handleChange = (e) => {
    this.setState({
      form: {
        ...this.state.form,
        [e.target.name]: e.target.value,
      },
    });
  };


  

  render() {
    return (
      <>
        <Container>
          <br />
          <InputGroup className="mb-3">
          <Button color="success" onClick={() => this.setInit()}>Reset</Button> {" "}
          <Button color="success" onClick={() => this.mostrarModalInsertarEspacio()}>New parking space</Button> {" "}
          <Button color="success" onClick={() => this.mostrarModalInsertarReservacion()}>New reservation</Button> {" "}
          <p></p>
          
          <input placeholder="Search space by ID"  type="number" step="1"  className="form-control"
                name="search"
                onChange={this.handleChange}/>
            <Button variant="outline-secondary" id="button-addon1" onClick={() => this.searchByID()} >
              Search
            </Button>
          </InputGroup>
          <br />
          <br />
          <Table>
            <thead>
              <tr>
                <th>ID</th>
                <th>State</th>
                <th>Data</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {this.state.data.espacios.map((dato) => (
                <tr key={dato.id}>
                  <td>{dato.id}</td>
                  <td>{dato.state}</td>
                  <td>{dato.tipo}</td>
                  <td>
                    <Button color="primary" onClick={() => this.mostrarModalActualizarEspacio(dato)}>Edit</Button>{" "}
                    <Button color="danger" onClick={() => this.eliminarEspacio(dato)}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Container>

        <Modal isOpen={this.state.modalActualizarEspacio}>
          <ModalHeader>
            <div><h3>Edit Space</h3></div>
          </ModalHeader>

          <ModalBody>
            <FormGroup>
              <label>
                Description:
              </label>
              <input
                className="form-control"
                name="tipo"
                type="text"
                onChange={this.handleChange}
              />
            </FormGroup>
          </ModalBody>

          <ModalFooter>
            <Button color="primary" onClick={() => this.editarEspacio()} >Editar </Button>
            <Button color="danger" onClick={() => this.cerrarModalActualizarEspacio()}>Cancelar </Button>
          </ModalFooter>
        </Modal>

        <Modal isOpen={this.state.modalInsertarEspacio}>
          <ModalHeader>
            <div><h3>New parking space</h3></div>
          </ModalHeader>

          <ModalBody>
            <FormGroup>
              <label>
                Description:
              </label>
              <input
                className="form-control"
                name="tipo"
                type="text"
                onChange={this.handleChange}
              />
            </FormGroup>
          </ModalBody>

          <ModalFooter>
            <Button color="primary" onClick={() => this.insertarEspacio()} >Create</Button>
            <Button className="btn btn-danger" onClick={() => this.cerrarModalInsertarEspacio()} >Cancel </Button>
          </ModalFooter>
        </Modal>



        <Container>
          <br />
          <Table>
            <thead>
              <tr>
                <th>Plate</th>
                <th>check-in</th>
                <th>Parking space id</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {this.state.data.reservaciones.map((dato) => (
                <tr key={dato.placa}>
                  <td>{dato.placa}</td>
                  <td>{dato.hora}</td>
                  <td>{dato.idEspacio}</td>
                  <td>
                    <Button color="danger" onClick={() => this.eliminarReservacion(dato)}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Container>

        <Modal isOpen={this.state.modalInsertarReservacion}>
          <ModalHeader>
            <div><h3>New reservation</h3></div>
          </ModalHeader>

          <ModalBody>
            <FormGroup>
              <label>
                Description:
              </label>
              <input
                className="form-control"
                name="placa"
                type="text"
                onChange={this.handleChange}
              />
            </FormGroup>
          </ModalBody>

          <ModalFooter>
            <Button color="primary" onClick={() => this.insertarReservacion()} >Create</Button>
            <Button className="btn btn-danger" onClick={() => this.cerrarModalInsertarReservacion()} >Cancel </Button>
          </ModalFooter>
        </Modal>
      </>

    );

  }
}


export default App;