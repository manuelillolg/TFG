from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI()
origins = [
    "http://localhost:4200",  # La URL de tu frontend Angular
    # Añade otros orígenes si es necesario
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Montar la carpeta static para servir los proyectos de three.js
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
def read_root():
    return {"message": "Welcome to the Three.js Projects Server"}

@app.get("/api/projects")
def list_projects():
    try:
        # Listar todos los archivos y carpetas en la carpeta `static`
        all_items = os.listdir("static")
        
        # Filtrar los elementos que no queremos incluir
        projects = [item for item in all_items if item not in ("libs", "favicon.ico")]
        
        # Retornar los proyectos filtrados
        return {"projects": projects}
    
    except Exception as e:
        # Manejar cualquier excepción y retornar un error 500
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/project/{project_name}")
def serve_project(project_name: str):
    project_path = os.path.join("static", project_name, "index.html")
    if not os.path.exists(project_path):
        raise HTTPException(status_code=404, detail="Project not found")
    return FileResponse(project_path)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

