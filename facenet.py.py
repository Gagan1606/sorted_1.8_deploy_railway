# requirements.txt: deepface, fastapi, uvicorn, pillow
from fastapi import FastAPI, UploadFile
from deepface import DeepFace
import numpy as np
from PIL import Image

app = FastAPI()

@app.post("/face-embed")
async def get_embeddings(file: UploadFile):
    img = np.array(Image.open(file.file))
    embedding = DeepFace.represent(img, model_name="Facenet", enforce_detection=False)
    return {"embedding": embedding[0]["embedding"]}
