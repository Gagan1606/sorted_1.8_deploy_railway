import sys
import json
import os
from imagededup.methods import PHash

def dedup_images(image_dir):
    # print('entered py file')
    if not os.path.isdir(image_dir):
        return {'error': 'Directory not found'}

    encoder = PHash()
    encodings = encoder.encode_images(image_dir=image_dir)
    duplicates = encoder.find_duplicates(encoding_map=encodings, max_distance_threshold=14)
    return duplicates

if __name__ == "__main__":
    image_dir = sys.argv[1]
    result = dedup_images(image_dir)
    print(json.dumps(result))











# import sys, json, os, shutil
# from pathlib import Path
# from imagededup.methods import PHash

# def dedup_images(temp_dir):
#     if not os.path.exists(temp_dir):
#         return {'duplicates': {}, 'unique_files': []}
    
#     encoder = PHash()
#     encodings = encoder.encode_images(image_dir=temp_dir)
#     duplicates = encoder.find_duplicates(encoding_map=encodings, max_distance_threshold=10)
    
#     unique_files = []
#     seen = set()
#     for filename in os.listdir(temp_dir):
#         if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
#             unique_files.append(filename)
#             seen.add(filename)
    
#     for dup_group, matches in duplicates.items():
#         if dup_group in seen: continue
#         # Keep first occurrence as unique
#         first = list(matches.keys())[0]
#         unique_files.append(first)
#         seen.add(first)
    
#     return {'duplicates': duplicates, 'unique_files': unique_files}

# if __name__ == "__main__":
#     temp_dir = sys.argv[1]
#     result = dedup_images(temp_dir)
#     print(json.dumps(result))
