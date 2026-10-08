from PIL import Image
import os

PANOS = {
    '201-bedroom': 'public/panoramas/room-201/bedroom.jpg',
    '201-kitchen': 'public/panoramas/room-201/kitchen.jpg',
    '201-washroom': 'public/panoramas/room-201/washroom.jpg',
    '202-bedroom': 'public/panoramas/room-202/bedroom.jpg',
    '202-kitchen': 'public/panoramas/room-202/kitchen.jpg',
    '202-washroom': 'public/panoramas/room-202/washroom.jpg',
    '203-bedroom': 'public/panoramas/room-203/bedroom.jpg',
    '203-kitchen': 'public/panoramas/room-203/kitchen.jpg',
    '203-washroom': 'public/panoramas/room-203/washroom.jpg',
}

os.makedirs('tests/feature_crops', exist_ok=True)

def to_yaw_pitch(x, y, w=2912, h=1440):
    yaw = (x / w) * 360.0
    if yaw > 180.0:
        yaw -= 360.0
    pitch = (0.5 - (y / h)) * 180.0
    return round(yaw), round(pitch)

def save_crop(pano_key, name, x_center, y_center, crop_w=400, crop_h=400):
    img = Image.open(PANOS[pano_key])
    w, h = img.size
    x1 = max(0, int(x_center - crop_w / 2))
    x2 = min(w, int(x_center + crop_w / 2))
    y1 = max(0, int(y_center - crop_h / 2))
    y2 = min(h, int(y_center + crop_h / 2))
    crop = img.crop((x1, y1, x2, y2))
    crop_path = f'tests/feature_crops/{pano_key}-{name}.jpg'
    crop.save(crop_path)
    yaw, pitch = to_yaw_pitch(x_center, y_center, w, h)
    print(f"[{pano_key}] {name:25} -> x={x_center:4}, y={y_center:4} | yaw={yaw:4}°, pitch={pitch:3}° -> saved {crop_path}")
    return yaw, pitch

print("=== AUDITING ROOM 201 ===")
save_crop('201-bedroom', 'bed', 1456, 920)
save_crop('201-bedroom', 'balcony-window', 980, 720)
save_crop('201-bedroom', 'washroom-door', 230, 720)
save_crop('201-bedroom', 'kitchen-door', 2780, 720)

save_crop('201-kitchen', 'bedroom-door', 2510, 740)
save_crop('201-kitchen', 'washroom-corridor', 80, 740)
save_crop('201-kitchen', 'breakfast-bar', 2180, 920)
save_crop('201-kitchen', 'water-purifier-sink', 1600, 680)

save_crop('201-washroom', 'bedroom-door', 2880, 740)
save_crop('201-washroom', 'kitchen-corridor', 80, 740)
save_crop('201-washroom', 'rainfall-shower', 1380, 480)
save_crop('201-washroom', 'ceramic-vanity', 500, 750)

print("\n=== AUDITING ROOM 202 ===")
save_crop('202-bedroom', 'bed', 2420, 920)
save_crop('202-bedroom', 'bay-window', 1340, 720)
save_crop('202-bedroom', 'art-gallery', 2320, 620)
save_crop('202-bedroom', 'terrace-door', 490, 720)
save_crop('202-bedroom', 'suite-corridor', 2850, 720)

save_crop('202-kitchen', 'bedroom-hallway', 2440, 720)
save_crop('202-kitchen', 'washroom-exit', 2850, 720)
save_crop('202-kitchen', 'cooktop-breakfast', 1980, 920)
save_crop('202-kitchen', 'undermount-sink', 1240, 920)

save_crop('202-washroom', 'bedroom-door', 1830, 720)
save_crop('202-washroom', 'kitchen-door', 1870, 720)
save_crop('202-washroom', 'deluge-shower', 2480, 520)
save_crop('202-washroom', 'granite-vanity', 1050, 780)

print("\n=== AUDITING ROOM 203 ===")
save_crop('203-bedroom', 'presidential-bed', 1480, 920)
save_crop('203-bedroom', 'washroom-door', 490, 720)
save_crop('203-bedroom', 'patio-kitchen-exit', 2680, 720)
save_crop('203-bedroom', 'rustic-wardrobe', 1920, 750)

save_crop('203-kitchen', 'bedroom-pavilion', 460, 720)
save_crop('203-kitchen', 'washroom-pavilion', 2350, 720)
save_crop('203-kitchen', 'courtyard-pool', 1456, 920)

save_crop('203-washroom', 'bedroom-exit', 60, 720)
save_crop('203-washroom', 'kitchen-pavilion-exit', 2870, 720)
save_crop('203-washroom', 'freestanding-tub', 780, 880)
save_crop('203-washroom', 'rainforest-window', 1420, 680)
save_crop('203-washroom', 'brass-shower', 2080, 620)
