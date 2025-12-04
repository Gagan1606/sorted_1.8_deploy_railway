import sys
import json
import base64
import face_recognition
import io 
from PIL import Image
import numpy as np

def embed_from_bytes(image_bytes):

    # bio = io.BytesIO(image_bytes)  
    # img_pil = Image.open(bio).convert("RGB")      
    # img = np.array(img_pil, dtype="uint8") 
    pil_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = np.array(pil_img)
    # img = face_recognition.load_image_file(bio)

    print("type(img):", type(img), file=sys.stderr)
    print("img dtype:", getattr(img, 'dtype', 'N/A'), file=sys.stderr)
    print("img shape:", getattr(img, 'shape', 'N/A'), file=sys.stderr)
    print("img max/min:", getattr(img, 'max', lambda : 'N/A')(), getattr(img, 'min', lambda : 'N/A')(), file=sys.stderr)
    if img is None or img.size == 0 or img.dtype != np.uint8 or len(img.shape) != 3 or img.shape[2] != 3:
     print("DEBUG: Bad image array - dtype:", getattr(img, 'dtype', type(img)), "shape:", getattr(img, 'shape', 'N/A'), file=sys.stderr)
     raise RuntimeError("Unsupported image type after pre-processing")


    boxes = face_recognition.face_locations(img, model="hog")  
    encodings = face_recognition.face_encodings(img, boxes)


    faces = []
    for box, enc in zip(boxes, encodings):
        faces.append({
            "box": list(box),                 # (top, right, bottom, left)
            "embedding": list(map(float, enc))  # 128‑D vector
        })
    return faces

if __name__ == "__main__":
    b64 = sys.stdin.read()
    img_bytes = base64.b64decode(b64)
    faces = embed_from_bytes(img_bytes)
    print(json.dumps(faces))

# ``` :contentReference[oaicite:2]{index=2}  

    # # Expect base64 image on stdin, return JSON
    # b64 = sys.stdin.read()
    # img_bytes = base64.b64decode(b64)
    # # Write temp file in memory
    # import io
    # f = io.BytesIO(img_bytes)
    # f.name = "temp.jpg"         # face_recognition needs a name hint
    # faces = embed_from_bytes(f)
    # print(json.dumps(faces))
