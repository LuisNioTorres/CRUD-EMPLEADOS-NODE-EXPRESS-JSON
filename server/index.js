// 1. Usar las dependencias instaladas: Express y Cors.
import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import Joi from 'joi';

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
        if(!usersArray || !Array.isArray(usersArray) ) throw new Error("No hay usuarios");
        //Retornar la dirección a memoria de la propiedad users de mi objeto data
        //Retornar en formato JSON el arreglo de users
        return res.json(usersArray);
    } catch (err) {
        next(err);
    }
});


//4.2 POST DE USUARIOS
app.post('/users', async (req,res,next) => {
    try{
        //Este mismo newUser lo conseguimos en value de la validación de Joi
        //const newUser = req.body;
        const {error, value} = userSchema.validate(req.body);
        if(error) throw new Error(error.details[0].message);
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
app.put('/db.json', async (req,res,next) => {
    //1. NECESITO OBTENER EL ARREGLO DE USUARIOS ACTUAL
    const data = readFile('db.json','utf8');
    const usersArray = getUsersArray(data);
    const idUserParam = req.params.id;
    //2. NECESITO OBTENER EL ID DEL USUARIO A ACTUALIZAR
    const actualizadoUsuario = req.body;
    const {id,name,email} = req.body;
    //Validar que el id pasado en la URL coincida con el usuario que te envia el body
    if(idUserParam !== id) throw new Error({message : "El id de params debe ser igual al del usersrray"});
    //3. Buscar (por su ID) el objeto a actualizar dentro de mi arreglo
    const index = usersArray.findIndex(user => user.id == idUserParam );
    //Validar que ese usuario se encuentre en la 
    //4. Actualizar el usuario que corresponda dentro de mi ARREGLO data
    usersArray[index]
})


//5. MiddleWare de Errores
//Cada error que podamos encontrar en nuestro código, la mayoría manda un message de error.
//Ese message se lo muestra según el error que exista.
//Pero también podemos crear nuestros casos de error, como que data.users se encuentra vacío
app.use((err,req,res,next) => {
    console.log("ERROR!", err);
    res.status(err.status || 500).json({
        message : err.message || "Error interno del servidor"
    });
});

// Colocar al servidor app en modo de escucha.
app.listen(port, () => {
    console.log("Servidor escuchando el puerto " + port );
});



