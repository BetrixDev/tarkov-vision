from fastapi import FastAPI, UploadFile
from pydantic import BaseModel
from typing import List
import json
import numpy as np
from ultralytics import YOLO
from io import BytesIO
from PIL import Image
import imagehash
import easyocr
import Levenshtein

text_reader = easyocr.Reader(["en"])
inventory_cell_model = YOLO("model.pt")

app = FastAPI()


class HashItem(BaseModel):
    itemId: str
    hash: str
    shortName: str


with open("hashes.json", "r") as f:
    all_hashes = json.load(f)
    stored_hashes = {item["item_id"]: item for item in all_hashes}

    for item in stored_hashes.values():
        item["hash"] = imagehash.hex_to_hash(item["hash"])
        item["shortName"] = item["short_name"]

HASH_LIST = list(stored_hashes.values())

HASH_ARRAY = np.array([h["hash"] for h in HASH_LIST])


def cutout_image(image: Image.Image, bbox: List[int]) -> Image.Image:
    return image.crop(bbox)


def get_closest_hashes(hash: imagehash.ImageHash) -> List[HashItem]:
    distances = np.array([hash - h for h in HASH_ARRAY])
    closest_indices = np.argpartition(distances, 1000)[:1000]
    closest_indices = closest_indices[np.argsort(distances[closest_indices])]
    return [HASH_LIST[i] for i in closest_indices]


def get_closest_hash_by_short_name(
    short_name: str, hash_list: List[HashItem]
) -> HashItem:
    lower_input = short_name.lower()

    return min(
        hash_list,
        key=lambda item: Levenshtein.distance(item["shortName"].lower(), lower_input),
    )


def get_short_name_match(short_name: str) -> HashItem | None:
    matches = [h for h in HASH_LIST if h["shortName"].lower() == short_name.lower()]

    if len(matches) > 1 or len(matches) == 0:
        return None

    return matches[0]


def get_detected_short_name_from_iamge(detected_text):
    top_right_text = ""
    max_x = float("-inf")
    min_y = float("inf")

    for detection in detected_text:
        bbox = detection[0]
        x = bbox[1][0]
        y = bbox[0][1]

        if x > max_x or (x == max_x and y < min_y):
            max_x = x
            min_y = y
            top_right_text = detection[1]

    if len(top_right_text) == 0:
        return top_right_text

    return None


def get_average_hash_from_image(image: Image):
    image = image.convert("L")
    image = image.resize((128, 128))

    return imagehash.average_hash(image, hash_size=128)


@app.get("/")
async def root():
    return {"message": "Eye service is running"}


@app.post("/detect")
async def detect(image: UploadFile):
    image = Image.open(BytesIO(await image.read()))
    results = inventory_cell_model.predict(image)

    detections = []

    for r in results:
        boxes = r.boxes
        for box in boxes:
            # Skip if confidence for detection of inventory cell is below 80%
            if box.conf[0].item() < 0.8:
                continue

            b = box.xyxy[0].tolist()

            cutout = cutout_image(image, b)

            best_hash_match = None

            # Try to find item using exact match for short name
            detected_text = text_reader.readtext(np.array(cutout))
            detected_short_name = get_detected_short_name_from_iamge(detected_text)

            if detected_short_name:
                short_name_match = get_short_name_match(detected_short_name)

                if short_name_match:
                    best_hash_match = short_name_match

            # If no short name match, try to find item using average hash
            if not best_hash_match:
                avg_hash = get_average_hash_from_image(cutout)
                closest_hashes = get_closest_hashes(avg_hash)

                if len(closest_hashes) > 0:
                    if detected_short_name:
                        best_hash_match = get_closest_hash_by_short_name(
                            detected_short_name, closest_hashes
                        )
                    else:
                        best_hash_match = closest_hashes[0]

            if not best_hash_match:
                continue

            bounding_box = {
                "x": round(b[0], 0),
                "y": round(b[1], 0),
                "width": round(b[2] - b[0], 0),
                "height": round(b[3] - b[1], 0),
            }

            detections.append(
                {"boundingBox": bounding_box, "detectedItemId": best_hash_match["item_id"]}
            )

    return {"detections": detections}
