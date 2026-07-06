from io import BytesIO
import json
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest

from PIL import Image


class FileValidationTests(unittest.TestCase):
    def test_validates_image_and_music_extensions_and_sizes(self) -> None:
        from app.services.image_processor import validate_upload

        validate_upload("photo.JPG", 10 * 1024 * 1024, "image")
        validate_upload("song.m4a", 20 * 1024 * 1024, "music")

        with self.assertRaises(ValueError):
            validate_upload("photo.gif", 100, "image")
        with self.assertRaises(ValueError):
            validate_upload("photo.jpg", 10 * 1024 * 1024 + 1, "image")
        with self.assertRaises(ValueError):
            validate_upload("song.ogg", 100, "music")
        with self.assertRaises(ValueError):
            validate_upload("song.mp3", 20 * 1024 * 1024 + 1, "music")


class ImageProcessingTests(unittest.TestCase):
    def test_remove_exif_returns_image_without_metadata(self) -> None:
        from app.services.image_processor import remove_exif

        source = Image.new("RGB", (8, 8), "red")
        exif = Image.Exif()
        exif[0x010E] = "private metadata"
        buffer = BytesIO()
        source.save(buffer, format="JPEG", exif=exif)

        cleaned = remove_exif(buffer.getvalue())

        self.assertEqual(0, len(cleaned.getexif()))

    def test_convert_to_webp_writes_webp_image(self) -> None:
        from app.services.image_processor import convert_to_webp

        with TemporaryDirectory() as temporary_directory:
            output = Path(temporary_directory) / "photo.webp"
            convert_to_webp(Image.new("RGB", (20, 10), "blue"), output)

            with Image.open(output) as converted:
                self.assertEqual("WEBP", converted.format)
                self.assertEqual((20, 10), converted.size)

    def test_create_thumbnail_has_300px_height_and_proportional_width(self) -> None:
        from app.services.image_processor import create_thumbnail

        with TemporaryDirectory() as temporary_directory:
            output = Path(temporary_directory) / "thumb.webp"
            create_thumbnail(Image.new("RGB", (800, 600), "green"), output)

            with Image.open(output) as thumbnail:
                self.assertEqual((400, 300), thumbnail.size)

    def test_generate_particle_map_writes_xyz_color_records(self) -> None:
        from app.services.particle_map import generate_particle_map

        with TemporaryDirectory() as temporary_directory:
            output = Path(temporary_directory) / "particles.json"
            records = generate_particle_map(
                Image.new("RGB", (4, 2), (10, 20, 30)), output, max_particles=8
            )

            self.assertEqual(8, len(records))
            self.assertEqual({"x", "y", "color"}, set(records[0]))
            self.assertEqual("#0a141e", records[0]["color"])
            self.assertEqual(records, json.loads(output.read_text(encoding="utf-8")))

    def test_process_photo_generates_all_sanitized_outputs(self) -> None:
        from app.services.image_processor import process_photo

        source = Image.new("RGB", (16, 8), "purple")
        exif = Image.Exif()
        exif[0x010E] = "private"
        buffer = BytesIO()
        source.save(buffer, format="JPEG", exif=exif)

        with TemporaryDirectory() as temporary_directory:
            outputs = process_photo(
                buffer.getvalue(), "photo.jpg", Path(temporary_directory)
            )

            self.assertEqual(
                {"original", "webp", "thumbnail", "particle_map"}, set(outputs)
            )
            self.assertTrue(all(path.is_file() for path in outputs.values()))
            with Image.open(outputs["original"]) as cleaned:
                self.assertEqual(0, len(cleaned.getexif()))


if __name__ == "__main__":
    unittest.main()
