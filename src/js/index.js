
//VARIABLES
const tbody_tabla_usuarios = document.querySelector('.tbody-tabla-usuarios');
const input_nombre_usuario = document.querySelector('#nombre-usuario');
const input_email_usuario = document.querySelector('#email-usuario');
const input_id_usuario = document.querySelector('#id-usuario');
const boton_enviar_usuario = document.querySelector('#boton-enviar-usuario');
const boton_editar_usuario = document.querySelector('#boton-editar-usuario');
const info_usuario = document.querySelector('.info-usuario');
const inputs_info_usuario = document.querySelectorAll('.input');
const main = document.querySelector('main');
/*let arregloUsuarios = [
    {
        id : 1,
        nombre : "LUIS",
        email: "email.com"    
    },
    {
        id : 2,
        nombre : "KIRKBY",
        email: "HOLAemail.com"    
    }
];

*/

//CLASES, FUNCIONES

class User {
    constructor (id,nombre,email) {
        this.id = id,
        this.nombre = nombre,
        this.email = email
    }
}

class UI {

    static async renderUsuarios () {
        UI.desactivarBoton(boton_editar_usuario);
        const arregloUsuarios = await Server.getUsers();
        UI.showUsers(arregloUsuarios);
    }

    static showUsers (arregloUsuarios) {
        tbody_tabla_usuarios.innerHTML = arregloUsuarios.map(usuario =>{
            return  ` 
                <tr>

                <td> ${usuario.id} </td>
                <td> ${usuario.nombre} </td>
                <td> ${usuario.email} </td> 
                <td> 
                    <button type="button" class="btn btn-primary boton-opcion boton-ver-mas" data-id="${usuario.id}" onclick="UI.showModal(${usuario.id})">
                    VER MaaS
                    </button>
                    <button type="button" class="btn btn-warning boton-opcion boton-editar" data-id="${usuario.id}">EDITAR</button>
                    <button type="button" class="btn btn-danger boton-opcion boton-eliminar" data-id="${usuario.id}">ELIMINAR</button>
                </td>

                </tr>
            `
        }).join("");
    }

        static showModal = async (e) =>  {
        const usuario = await Server.getUserById(e);
        const arreglo_inputs_modal = {
            id : "perfil-id-usuario",
            nombre : "perfil-nombre-usuario",
            email : "perfil-email-usuario"
        }

        Object.entries(arreglo_inputs_modal).forEach(([key,value]) => {
            const input = document.getElementById(value);
            input.value = usuario[key];
        })
         
        const myModal = new bootstrap.Modal("#exampleModal");
        myModal.show();
    }

    static cleanInputs () {
        inputs_info_usuario.forEach(input => {
            input.value = ' ';
        });
    }

    static activarBoton (boton) {
        boton.classList.remove('disabled');
    }

    static desactivarBoton (boton) {
        boton.classList.add('disabled');
    }

    static desactivarInput(input){
        input.disabled = true;
    }

    static showInformationUser (usuario) {
        /*input_id_usuario.value = id;
        input_nombre_usuario.value = name;
        input_email_usuario.value = email;
*/
        const arreglo_inputs = {
            id : "id-usuario",
            nombre : "nombre-usuario",
            email : "email-usuario"
        }

        Object.entries(arreglo_inputs).forEach(([key, value]) => {
            let input = document.getElementById(value);
            input.value = usuario[key];
        });

    }

    static activeModeEdition () {
        UI.activarBoton(boton_editar_usuario);
        UI.desactivarBoton(boton_enviar_usuario);
        UI.desactivarInput(input_id_usuario);
    }

    static showErrorMessage (message,status) {
            const mensaje__error = document.createElement('div');
            mensaje__error.className = 'mensaje__error';
            const titulo__error = document.createElement('h2');
            titulo__error.textContent = `ERROR: ${message} , STATUS : ${status ? status : "404"} `;
            mensaje__error.append(titulo__error);
            main.appendChild(mensaje__error);
    }
    
}

class App {

    static createUserFromInputs () {
        const idUsuario = input_id_usuario.value;
        const nombreUsuario = input_nombre_usuario.value;
        const emailUsuario = input_email_usuario.value;
        const newUser = new User(idUsuario,nombreUsuario,emailUsuario);
        return newUser;
    }

    static listenBotonEnviarUser () {
        boton_enviar_usuario.addEventListener('click', () =>{
            App.postUser();
        })
    }

    static listenInfoUserButtons () {
        info_usuario.addEventListener('click', (e) => {
            if(e.target.id == 'boton-enviar-usuario') {
                Server.postUser();
            }

            if(e.target.id == 'boton-editar-usuario') {
                Server.putUser();
            }
        })
    }

    static listenTableButtons () {
        tbody_tabla_usuarios.addEventListener('click', async (e) =>{
            if(e.target.classList.contains('boton-editar')){
                //let userEditar = arregloUsuarios.find(usuario => usuario.id == e.target.dataset.id);
                UI.activeModeEdition();
                let userEditar = await Server.getUserById(e.target.dataset.id);
                UI.showInformationUser(userEditar);
            };

            if(e.target.classList.contains('boton-eliminar')) {
                //let userEditar = arregloUsuarios.find(usuario => usuario.id == e.target.dataset.id);
                let userEditar = await Server.getUserById(e.target.dataset.id);
                UI.showInformationUser(userEditar);
                setTimeout(()=> {
                    if(confirm("DESEAS ELIMINAR EL USUARIO??")) {
                        //return App.deleteUser(input_id_usuario);
                        return Server.deleteUser(Number(input_id_usuario.value));
                    }
                    UI.cleanInputs();
                },200);
            }
        })
    }

    /*static postUser () {
        const newUser = App.createUserFromInputs();
        arregloUsuarios.push(newUser);
        UI.showUsers();
    }

    static putUser () {
        const newUser = App.createUserFromInputs();
        arregloUsuarios = arregloUsuarios.map( usuario => 
            usuario.id == newUser.id ? newUser : usuario
        );
        UI.cleanInputs();
        UI.showUsers();
    }

    static deleteUser (id_usuario_eliminar) { 
        const id_eliminar = Number(id_usuario_eliminar.value);
        arregloUsuarios = arregloUsuarios.filter(usuario => usuario.id !== id_eliminar);
        UI.showUsers();
    }
    */
}

class Server {
    static async getUsers () {
        try {
            let resApi = await fetch('http://localhost:5000/users');
            if(!resApi.ok) throw {message : "ERROR AL FETCH", status : resApi.status}
            return await resApi.json();
        }
        catch (err) {
            UI.showErrorMessage(err.message, err.status);
            return [];
        }
    }

    static async postUser () {
        const newUser = App.createUserFromInputs();
        const resApi = await fetch('http://localhost:5000/users', {
            method: 'POST',
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(newUser)
        });
        UI.renderUsuarios();
    }

    static async putUser () {
        const newUser = App.createUserFromInputs();
        const resApi = await fetch(`http://localhost:5000/users/${newUser.id}`, ({
            method : 'PUT',
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(newUser)
        }));
        UI.cleanInputs();
        UI.renderUsuarios();
    }

    static async getUserById (idUsuario) {
        const resApi = await fetch(`http://localhost:5000/users/${idUsuario}`);
        const usuario = await resApi.json();
        return usuario;
    }

    static async deleteUser (id_eliminar) {
        const resApi = await fetch(`http://localhost:5000/users/${id_eliminar}`, ({
            method: 'DELETE',
            headers: {"Content-Type": "application/json"}
        }));
        UI.cleanInputs();
        UI.renderUsuarios();
    }
}

//EJECUCION DE CODIGO

UI.renderUsuarios();
App.listenInfoUserButtons();
App.listenTableButtons();

