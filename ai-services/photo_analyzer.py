"""
ИИ-анализатор фото для сайта знакомств
Оценивает качество, привлекательность и даёт советы
"""
import os, base64, json, hashlib
from io import BytesIO
from PIL import Image
import requests

class PhotoAnalyzer:
    def __init__(self):
        self.ai_url = "http://localhost:8000"
        
    def analyze_photo(self, image_path=None, image_url=None, image_bytes=None):
        """
        Комплексный анализ фото
        Возвращает: качество, советы, обнаруженные объекты
        """
        result = {
            "quality_score": 0,
            "technical": {},
            "composition": {},
            "recommendations": [],
            "detected_content": [],
            "attractiveness_score": 0,
        }
        
        try:
            # Загружаем изображение
            if image_path:
                img = Image.open(image_path)
            elif image_url:
                import requests as r
                resp = r.get(image_url, timeout=10)
                img = Image.open(BytesIO(resp.content))
            elif image_bytes:
                img = Image.open(BytesIO(image_bytes))
            else:
                return {"error": "Нет изображения"}
            
            # === Технический анализ ===
            width, height = img.size
            result["technical"]["resolution"] = f"{width}x{height}"
            
            # Проверка разрешения
            if width < 400 or height < 400:
                result["quality_score"] -= 30
                result["recommendations"].append("📸 Слишком низкое разрешение. Используйте фото минимум 800x800 пикселей")
            elif width >= 1920:
                result["quality_score"] += 15
            
            # Проверка соотношения сторон
            ratio = width / height
            if ratio < 0.5 or ratio > 2.0:
                result["recommendations"].append("📐 Неудачное соотношение сторон. Рекомендуем квадратное или вертикальное фото")
            elif 0.7 <= ratio <= 1.4:
                result["quality_score"] += 10
            
            # Анализ яркости и контраста
            grayscale = img.convert('L')
            pixels = list(grayscale.getdata())
            avg_brightness = sum(pixels) / len(pixels)
            result["technical"]["brightness"] = round(avg_brightness, 1)
            
            if avg_brightness < 40:
                result["quality_score"] -= 20
                result["recommendations"].append("🌑 Слишком тёмное фото. Добавьте освещение")
            elif avg_brightness > 240:
                result["quality_score"] -= 15
                result["recommendations"].append("🌕 Фото пересвечено. Уменьшите яркость")
            elif 80 <= avg_brightness <= 200:
                result["quality_score"] += 15
            
            # Анализ контраста
            contrast = max(pixels) - min(pixels)
            result["technical"]["contrast"] = contrast
            
            if contrast < 30:
                result["recommendations"].append("🫥 Низкий контраст. Фото выглядит плоским")
            elif contrast > 150:
                result["quality_score"] += 10
            
            # === Анализ композиции ===
            # Проверка на селфи (верхняя часть обычно светлее)
            top_half = sum(list(grayscale.crop((0, 0, width, height//2)).getdata())) / (width * height//2)
            bottom_half = sum(list(grayscale.crop((0, height//2, width, height)).getdata())) / (width * height//2)
            
            if abs(top_half - bottom_half) > 50:
                result["recommendations"].append("🤳 Похоже на селфи с неравномерным освещением")
            
            # Проверка на размытость (упрощённая)
            if contrast < 20:
                result["quality_score"] -= 25
                result["recommendations"].append("🔍 Фото выглядит размытым. Сделайте более чёткий снимок")
            
            # === Контент-анализ через ИИ ===
            try:
                # Отправляем фото в AI сервис для описания
                img_base64 = base64.b64encode(self._img_to_bytes(img)).decode()
                
                analysis_prompt = f"""Проанализируй это фото для сайта знакомств. Ответь JSON:
{{
  "main_subject": "что изображено",
  "is_selfie": true/false,
  "is_group": true/false,
  "is_outdoor": true/false,
  "mood": "настроение фото",
  "appropriateness": 0-100,
  "problems": ["проблемы"],
  "suggestions": ["советы"]
}}
Только JSON, без markdown."""
                
                # Здесь можно отправить в GigaChat/DeepSeek
                # ai_response = requests.post(f"{self.ai_url}/analyze-image", json={...})
                
                # Пока базовый анализ
                result["detected_content"] = [
                    "Портретное фото" if not result["technical"]["resolution"] else "Фото профиля",
                    "Хорошее освещение" if avg_brightness > 100 else "Требуется лучшее освещение"
                ]
                
            except Exception as e:
                print(f"AI content analysis error: {e}")
            
            # === Итоговая оценка ===
            result["quality_score"] = max(0, min(100, result["quality_score"] + 50))
            
            # Оценка привлекательности
            if result["quality_score"] >= 80:
                result["attractiveness_score"] = min(100, result["quality_score"] + 10)
            else:
                result["attractiveness_score"] = result["quality_score"]
            
            # Финальные рекомендации
            if not result["recommendations"]:
                result["recommendations"].append("✅ Отличное фото для профиля!")
            
            # Топ-3 совета
            result["top_tips"] = [
                "Используйте естественное освещение",
                "Покажите искреннюю улыбку",
                "Фон должен быть не отвлекающим"
            ]
            
            return result
            
        except Exception as e:
            return {"error": str(e)}
    
    def _img_to_bytes(self, img):
        """Конвертация PIL Image в bytes"""
        buf = BytesIO()
        img.save(buf, format='JPEG', quality=85)
        return buf.getvalue()
    
    def compare_photos(self, photo1, photo2):
        """Сравнение двух фото (для выбора лучшего)"""
        analysis1 = self.analyze_photo(image_url=photo1)
        analysis2 = self.analyze_photo(image_url=photo2)
        
        better = 1 if analysis1.get("quality_score", 0) >= analysis2.get("quality_score", 0) else 2
        
        return {
            "photo1_score": analysis1.get("quality_score", 0),
            "photo2_score": analysis2.get("quality_score", 0),
            "better_photo": f"photo{better}",
            "difference": abs(analysis1.get("quality_score", 0) - analysis2.get("quality_score", 0)),
            "verdict": f"Рекомендуем использовать фото {better} для профиля"
        }

# Тест
if __name__ == "__main__":
    analyzer = PhotoAnalyzer()
    # result = analyzer.analyze_photo(image_url="https://example.com/photo.jpg")
    print("✅ PhotoAnalyzer готов")
