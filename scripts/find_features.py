from PIL import Image
import os

images = {
    '201-bed': 'public/panoramas/room-201/bedroom.jpg',
    '201-kitch': 'public/panoramas/room-201/kitchen.jpg',
    '201-wash': 'public/panoramas/room-201/washroom.jpg',
    '202-bed': 'public/panoramas/room-202/bedroom.jpg',
    '202-kitch': 'public/panoramas/room-202/kitchen.jpg',
    '202-wash': 'public/panoramas/room-202/washroom.jpg',
    '203-bed': 'public/panoramas/room-203/bedroom.jpg',
    '203-kitch': 'public/panoramas/room-203/kitchen.jpg',
    '203-wash': 'public/panoramas/room-203/washroom.jpg',
}

os.makedirs('tests/feature_crops', exist_ok=True)

# Let's crop candidate regions in 202-kitch:
im_202k = Image.open(images['202-kitch'])
W, H = im_202k.size
print(f"202-kitch size: {W}x{H}")

# Crop four quarters of 202-kitch to see exactly what is in each quarter:
for i in range(4):
    box = (int(i * W / 4), 0, int((i + 1) * W / 4), H)
    crop = im_202k.crop(box)
    crop.save(f'tests/feature_crops/202-kitch-q{i}.jpg')
    print(f"Saved quarter {i}: x in [{box[0]}, {box[2]}]")
