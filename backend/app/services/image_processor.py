from io import BytesIO
from pathlib import Path
from typing import Literal
from uuid import uuid4

from PIL import Image, ImageOps

from app.services.particle_map import generate_particle_map


IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MUSIC_EXTENSIONS = {".mp3", ".m4a", ".wav"}
MAX_IMAGE_SIZE = 10 * 1024 * 1024
MAX_MUSIC_SIZE = 20 * 1024 * 1024


def validate_upload(
    filename: str, size: int, media_type: Literal["image", "music"]
) -> None:
    extension = Path(filename).suffix.lower()
    if media_type == "image":
        allowed_extensions = IMAGE_EXTENSIONS
        maximum_size = MAX_IMAGE_SIZE
    else:
        allowed_extensions = MUSIC_EXTENSIONS
        maximum_size = MAX_MUSIC_SIZE

    if extension not in allowed_extensions:
        raise ValueError(f"Unsupported {media_type} file extension")
    if size > maximum_size:
        raise ValueError(f"{media_type.capitalize()} file is too large")


def remove_exif(image_data: bytes) -> Image.Image:
    with Image.open(BytesIO(image_data)) as source:
        cleaned = ImageOps.exif_transpose(source).copy()
    cleaned.info.clear()
    cleaned.getexif().clear()
    return cleaned


def convert_to_webp(image: Image.Image, output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    image.save(output_path, format="WEBP", quality=85)


def create_thumbnail(image: Image.Image, output_path: Path) -> None:
    target_height = 300
    target_width = max(1, round(image.width * target_height / image.height))
    thumbnail = image.resize((target_width, target_height), Image.Resampling.LANCZOS)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    thumbnail.save(output_path, format="WEBP", quality=85)


def process_photo(
    image_data: bytes, original_filename: str, uploads_root: Path
) -> dict[str, Path]:
    validate_upload(original_filename, len(image_data), "image")
    image = remove_exif(image_data)
    identifier = uuid4().hex
    suffix = Path(original_filename).suffix.lower()

    outputs = {
        "original": uploads_root / "original" / f"{identifier}{suffix}",
        "webp": uploads_root / "webp" / f"{identifier}.webp",
        "thumbnail": uploads_root / "thumb" / f"{identifier}.webp",
        "particle_map": uploads_root / "particle_map" / f"{identifier}.json",
    }

    outputs["original"].parent.mkdir(parents=True, exist_ok=True)
    original_format = {
        ".jpg": "JPEG",
        ".jpeg": "JPEG",
        ".png": "PNG",
        ".webp": "WEBP",
    }[suffix]
    original_image = image
    if original_format == "JPEG" and image.mode not in {"RGB", "L"}:
        original_image = image.convert("RGB")
    original_image.save(outputs["original"], format=original_format)

    convert_to_webp(image, outputs["webp"])
    create_thumbnail(image, outputs["thumbnail"])
    generate_particle_map(image, outputs["particle_map"])
    return outputs
