import os
from PIL import Image, ImageDraw

def create_icon_folder(folder_path):
    os.makedirs(folder_path, exist_ok=True)

def generate_x_icon(size):
    # X Theme: Modern deep black/charcoal with bright white logo
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Charcoal rounded container
    margin = max(1, size // 16)
    draw.rounded_rectangle(
        [margin, margin, size - margin, size - margin],
        radius=size // 4,
        fill='#0f1419'
    )
    
    # Sleek Accessibility eye symbol + 'A'
    # We will draw a stylized 'A' with a clean dot or bar
    font_size = size // 2
    # Draw horizontal wave or eye contour
    center = size // 2
    height_offset = size // 16
    
    # Outer ring (eye contour)
    draw.arc(
        [size // 4, size // 3, 3 * size // 4, 2 * size // 3],
        start=0, end=360,
        fill='#1d9bf0',
        width=max(1, size // 20)
    )
    
    # Sharp clean white 'A' in the center
    # Left leg, right leg, bridge
    w = max(1, size // 12)
    left_leg = [(size // 2 - size // 6, 2 * size // 3), (size // 2, size // 3)]
    right_leg = [(size // 2, size // 3), (size // 2 + size // 6, 2 * size // 3)]
    bridge = [(size // 2 - size // 10, size // 2 + height_offset), (size // 2 + size // 10, size // 2 + height_offset)]
    
    draw.line(left_leg, fill='white', width=w, joint='round')
    draw.line(right_leg, fill='white', width=w, joint='round')
    draw.line(bridge, fill='white', width=w, joint='round')
    
    return img

def generate_squarespace_icon(size):
    # Squarespace Theme: Minimalist pure black background, elegant white geometric logo
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Pure black sharp container
    margin = max(1, size // 16)
    draw.rounded_rectangle(
        [margin, margin, size - margin, size - margin],
        radius=size // 4,
        fill='#111111'
    )
    
    # Double slashes and a premium white geometric 'A'
    w = max(1, size // 14)
    # Draw 'A'
    left_leg = [(size // 2 - size // 5, 2 * size // 3), (size // 2, size // 4 + size // 12)]
    right_leg = [(size // 2, size // 4 + size // 12), (size // 2 + size // 5, 2 * size // 3)]
    bridge = [(size // 2 - size // 8, size // 2 + size // 16), (size // 2 + size // 8, size // 2 + size // 16)]
    
    draw.line(left_leg, fill='white', width=w, joint='round')
    draw.line(right_leg, fill='white', width=w, joint='round')
    draw.line(bridge, fill='white', width=w, joint='round')
    
    # Add minimalist elegant dot on top right
    dot_radius = max(1, size // 20)
    draw.ellipse(
        [size // 2 + size // 6 - dot_radius, size // 4 - dot_radius, size // 2 + size // 6 + dot_radius, size // 4 + dot_radius],
        fill='#7f7f7f'
    )
    
    return img

def generate_webflow_icon(size):
    # Webflow Theme: Tech designer slate background, vibrant neon electric-blue/purple details
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Premium deep blue slate container
    margin = max(1, size // 16)
    draw.rounded_rectangle(
        [margin, margin, size - margin, size - margin],
        radius=size // 4,
        fill='#191a1f'
    )
    
    # Elegant glow gradient (simulated with a larger subtle circle behind)
    glow_radius = size // 3
    draw.ellipse(
        [size // 2 - glow_radius, size // 2 - glow_radius, size // 2 + glow_radius, size // 2 + glow_radius],
        outline='#4353ff',
        width=max(1, size // 24)
    )
    
    # In center: neon blue bold 'A'
    w = max(2, size // 10)
    left_leg = [(size // 2 - size // 6, 2 * size // 3), (size // 2, size // 3)]
    right_leg = [(size // 2, size // 3), (size // 2 + size // 6, 2 * size // 3)]
    bridge = [(size // 2 - size // 8, size // 2 + size // 12), (size // 2 + size // 8, size // 2 + size // 12)]
    
    draw.line(left_leg, fill='#2b6cb0', width=w, joint='round')
    draw.line(right_leg, fill='#4299e1', width=w, joint='round')
    draw.line(bridge, fill='#63b3ed', width=w, joint='round')
    
    # Accessibility tick or star on top
    star_radius = max(1, size // 16)
    draw.ellipse(
        [size // 2 - star_radius, size // 3 - star_radius - size // 12, size // 2 + star_radius, size // 3 + star_radius - size // 12],
        fill='#3182ce'
    )
    
    return img

def main():
    paths = {
        'x-autoalt': generate_x_icon,
        'squarespace-autoalt': generate_squarespace_icon,
        'webflow-autoalt': generate_webflow_icon
    }
    
    base_dir = "/Users/jethrojones/jethro/autoalt/extensions"
    
    for folder_name, generator in paths.items():
        folder_path = os.path.join(base_dir, folder_name, "icons")
        create_icon_folder(folder_path)
        
        for size in [16, 48, 128]:
            img = generator(size)
            output_file = os.path.join(folder_path, f"icon-{size}.png")
            img.save(output_file, 'PNG')
            print(f"Generated {folder_name} icon: {output_file}")

if __name__ == '__main__':
    main()
