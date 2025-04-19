const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors'); 
const app = express();
const PORT = 3000;

// Endpoint para obtener las categorías (directorios dentro de la carpeta "models")
app.use(cors());
app.get('/getCategories', (req, res) => {
    const modelsPath = path.join(__dirname, '../models');
    
    // Lee el contenido de la carpeta "models" y filtra solo los directorios
    fs.readdir(modelsPath, { withFileTypes: true }, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Error leyendo la carpeta de modelos.' });
        }

        // Filtra solo los nombres de los directorios
        const directories = files
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

        res.json({ categories: directories });
    });
});


app.get('/getSubdirectories/:directoryName', (req, res) => {
    const { directoryName } = req.params;
    const directoryPath = path.join(__dirname, '../models', directoryName);

    // Verifica que el directorio exista
    if (!fs.existsSync(directoryPath)) {
        return res.status(404).json({ error: 'Directorio no encontrado.' });
    }

    // Lee el contenido del directorio y filtra solo los subdirectorios
    fs.readdir(directoryPath, { withFileTypes: true }, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Error leyendo el directorio.' });
        }

        const subdirectories = files
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

        res.json({ subdirectories });
    });
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
