import json
import os
import imagehash
from PIL import Image
from concurrent.futures import ThreadPoolExecutor, as_completed

print("Generating hashes from icon dataset...")

CACHE_DIR = os.path.join(os.getcwd(), "apps", "hasher", "cache")
GENERATED_ICONS_DIR = os.path.join(CACHE_DIR, "generatedIcons")


with open(os.path.join(CACHE_DIR, "itemLookup.json"), "r") as f:
    item_lookup = json.load(f)


class HashData:
    def __init__(self, item_id: str, hash_value: str, short_name: str):
        self.item_id = item_id
        self.hash = hash_value
        self.short_name = short_name

    def to_json(self):
        return {
            "item_id": self.item_id,
            "hash": self.hash,
            "short_name": self.short_name,
        }


def process_file(file: str) -> HashData:
    if not file.endswith(".png"):
        return None

    item_id = file.split(".")[0].split("-")[0]
    icon_path = os.path.join(GENERATED_ICONS_DIR, file)

    with Image.open(icon_path) as icon_buffer:
        icon_buffer = icon_buffer.convert("L")
        icon_buffer = icon_buffer.resize((128, 128))

        avg_hash = imagehash.average_hash(icon_buffer, hash_size=128)
        return HashData(item_id, str(avg_hash), item_lookup[item_id]["shortName"])


files = [f for f in os.listdir(GENERATED_ICONS_DIR) if f.endswith(".png")]

hash_data = []

with ThreadPoolExecutor(max_workers=os.cpu_count() * 2) as executor:
    future_to_file = {executor.submit(process_file, file): file for file in files}

    for future in as_completed(future_to_file):
        result = future.result()
        if result:
            hash_data.append(result)

with open(os.path.join(os.getcwd(), "hashes.json"), "w") as file:
    json.dump([h.to_json() for h in hash_data], file, indent=2)
