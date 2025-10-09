// 1. Usar las dependencias instaladas: Express y Cors.
import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import Joi from 'joi';
import { read } from 'fs';

// *********** VARIABLES ***********//
const port = 4000;


// OBJETO BASE PARA VALIDACIÓN DEL USER EN POST
const userSchema = Joi.object({
    id : Joi.number().required(),
    nombre : Joi.string().min(3).required(),
    email : Joi.string().email().required()
});


// 2 . Crear el servidor con Express
const app = express();

// 3. Usar CORS y Express.json en mi servidor app.
app.use(cors());
app.use(express.json());


async function readFile (path, options) {
    //Se lee como STRING mi db.json
    const file = await fs.readFile(path,options);
    //Ese string se transforma en objeto JS
    const data = JSON.parse(file);
    //Return ese objeto JS
    return data;
}

async function writeFile(path, data) {
    data = JSON.stringify(data,null,2);
    await fs.writeFile(path,data);
}

function getUsersArray (data) {
    //Obtener el arreglo de la propiedad USERS de mi objetoJS data
    const usersArray = data.users;
    return usersArray;
}

// 4. Empezar con el CRUD.
// 4.1 Empezar con GET.
app.get('/users', async (req,res,next)  => {
    try {
        //1. Obtener el arreglo de usuarios actuales
        const data = await readFile('db.json','utf8');
        const usersArray = getUsersArray(data);
        //Validar la informacion data del servidor
        if(!usersArray || !Array.isArray(usersArray) || usersArray.length < 1) {
            const error = new Error('No se encontró información');
            error.status = 500;
            throw error;
        };
        //Retornar la dirección a memoria de la propiedad users de mi objeto data
        //Retornar en formato JSON el arreglo de users
        return res.status(200).json(usersArray);
    } catch (err) {
        next(err);
    }
});

//AHORA UN GET PERO EN LA URL SE PASA EL PARAMETRO ID PARA RECUPERAR UN USER DETERMINADO
app.get('/users/:id', async (req,res,next) => {
    try { 
    //Verifica que el id a editar exista
    const id_editar = Number(req.params.id);
    if(isNaN (id_editar)) {
        const err = new Error("El id no es un numero");
        throw err;
    };
    //Conseguir mi arreglo Users de mi db.json
    const data = await readFile('db.json', 'utf8');
    const usersArray = getUsersArray(data);
    const find = usersArray.find(user => user.id == id_editar);
    if(!find) {
        const err = new Error("El id a editar no se encuentra en la db");
        throw err;
    }
    return res.status(200).json(find);
    } 
    catch (err) {
        next(err);
    } 
});


//4.2 POST DE USUARIOS
app.post('/users', async (req,res,next) => {
    try{
        //Este mismo newUser lo conseguimos en value de la validación de Joi
        //const newUser = req.body;
        const {error, value} = userSchema.validate(req.body);
        if(error) { 
            console.log("ENTRO AL IF DE POST");
            const err = new Error ("Formato incorrecto del nuevo usuario");
            err.status = 400;
            err.details = error.details[0].message;
            throw err ;
        }
        //El newUser todo  bien seguir normalmente
        //1. Obtener el arreglo de usuarios actuales
        const data = await readFile('db.json','utf8');
        const usersArray = getUsersArray(data);
        //2. Obtener en objetoJS el nuevo usuario, que es lo que devuelve VALUE de JOI
        //3. Modificar mi arreglo original (de la propiedad users), hacerle push este nuevo objeto
        usersArray.push(value);
        // 4. Sobreescribir mi db.json original, pero debo sobreescribir todo!, por eso paso como parámetro mi data
        await writeFile('db.json',data);
        // 5. Return mi arreglo de users
        return res.json(data);
    } catch (err) {
        next(err);
    }
});

//4.3 PUT
app.put('/users/:id', async (req,res,next) => {
    const err = new Error();
    try{
    // 1. Validación con Joi del Objeto que se envía en req.body
    const {error,value} = userSchema.validate(req.body);
    if(error) {
        err.message = "El user está mal ingresado";
        err.status = 400;
        err.details = error.details[0].message;
        throw err;
    };
    //Obtener el id de la URL , y el id del req.body
    const idParams = Number(req.params.id);
    const {id,nombre,email} = value;
    if(idParams !== id) {
        err.message = "El id de la URL no coincide con el de usuario";
        err.status = 400;
        throw err;
    }

    // Todo bien -> Obtener UsersArray actual
    const data = await readFile('db.json','utf8');
    const usersArray = getUsersArray(data);
    //Buscar el id que me pasaron en mi arreglo de usuarios 
    const index = usersArray.findIndex( user => user.id == idParams);
    //Validar que realmente se encuentra en mi arreglo
    if(index == -1) { 
        err.message = "El id del user no se encuentra en la bd";
        err.status = 400;
        throw err;
    }
    //Sí se encuentra el user en mi arreglo, simplemente modificar ese user con sus nuevos valores
    usersArray[index] = {...usersArray[index], ...value};
    //Sobreescribir mi db.json
    await writeFile('db.json',data);
    //Por ahora, devolver mi usersArray, observar que el user se ha editado 
    return res.json(data);
    } 
    catch (err) {
        next(err);
    }
});

//4.4 DELETE
app.delete('/users/:id', async (req,res,next) => {
    try{
    const id_eliminar = Number(req.params.id);
    //Obtener mi userArray
    const data =  await readFile('db.json','utf8');
    let usersArray = getUsersArray(data);
    //Validar id de req.params a eliminar, el id debe pertenecer a un user de mi arreglo de usuarios
    const index = usersArray.findIndex( user => user.id == id_eliminar);
    if(index == -1) throw new Error("El id del usuario a eliminar no se encuentra");
    //Modificar el arreglo original , realizando filter, solo los usuarios que no tengan el id a eliminar se quedan
    //Así no se modifica (abajo) porque cambiaria la direccion de usersArray, ya no apunta al data.users que es el original
    //usersArray = usersArray.filter( user => user.id !== id_eliminar);
    data.users = usersArray.filter( user => user.id !== id_eliminar);
    await writeFile('db.json', data);
    //Return del arreglo finalmente modificado
    return res.json(data);
    } 
    catch (err) {
        next(err);
    }
})

//5. MiddleWare de Errores
//Cada error que podamos encontrar en nuestro código, la mayoría manda un message de error.
//Ese message se lo muestra según el error que exista.
//Pero también podemos crear nuestros casos de error, como que data.users se encuentra vacío
app.use((err,req,res,next) => {
    res.status(err.status || 500).json({
        message : err.message || "Error interno del servidor",
        status : err.status || 500,
        details : err.details || null
    });
});


// Colocar al servidor app en modo de escucha.
app.listen(port, () => {
    console.log("Servidor escuchando el puerto " + port );
});



