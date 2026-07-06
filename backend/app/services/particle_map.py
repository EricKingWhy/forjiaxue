import json
import math
from pathlib import Path

import cv2
import numpy as np
from PIL import Image


def generate_particle_map(
    image: Image.Image,
    output_path: Path,
    *,
    max_particles: int = 60_000,
) -> list[dict[str, int | str]]:
    if max_particles < 1:
        raise ValueError("max_particles must be positive")

    rgba = cv2.cvtColor(np.asarray(image.convert("RGB")), cv2.COLOR_RGB2RGBA)
    height, width = rgba.shape[:2]
    sample_step = max(1, math.ceil(math.sqrt(width * height / max_particles)))
    particles: list[dict[str, int | str]] = []

    for y in range(0, height, sample_step):
        for x in range(0, width, sample_step):
            red, green, blue, alpha = (int(channel) for channel in rgba[y, x])
            if alpha == 0:
                continue
            particles.append(
                {"x": x, "y": y, "color": f"#{red:02x}{green:02x}{blue:02x}"}
            )

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(
        json.dumps(particles, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )
    return particles
