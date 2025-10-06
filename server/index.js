// 1. Usar las dependencias instaladas: Express y Cors.
import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';


// *********** VARIABLES ***********//
const port = 5000;

// 2 . Crear el servidor con Express
const app = express();

// 3. Usar CORS y Express.json en mi servidor app.
app.use(cors());
app.use(express.json());


// 4. Empezar con el CRUD.
// 4.1 Empezar con GET.
app.get('/users', async (req,res)  => {
    try {
        //Leer un string db.json()
        const file = await fs.readFile('db.json', 'utf-8');
        //Como devuelve un string debo convertir primero a objeto JS
        const data = JSON.parse(file);

        //Validar la informacion data del servidor
        if(!data || data.length < 1 ) return res.status(404).json({message : "No encontramos información de usuarios."})
        //Retornar la dirección a memoria de la propiedad users de mi objeto data
        //Retornar en formato JSON
        res.json(data.users);
    } catch (err) {
        return res.status(500).json({message : err.message})
    }
});


// Colocar al servidor app en modo de escucha.
app.listen(port, () => {
    console.log("Servidor escuchando el puerto " + port );
});



