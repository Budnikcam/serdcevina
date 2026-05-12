"""
Сердцевина AI Service - GigaChat + DeepSeek
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os, uuid, time, json
import requests
from typing import Optional
from enum import Enum
from dotenv import load_dotenv
import warnings
warnings.filterwarnings('ignore')

load_dotenv()

app = FastAPI(title="Сердцевина AI")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

class AIModel(str, Enum):
    gigachat = "gigachat"
    deepseek = "deepseek"
    auto = "auto"

class ProfileData(BaseModel):
    name: str
    age: int
    bio: str
    interests: list = []
    looking_for: str = ""

class TestRequest(BaseModel):
    model: AIModel = AIModel.auto

class AnalysisRequest(BaseModel):
    profile: ProfileData
    model: AIModel = AIModel.auto

class CompatibilityRequest(BaseModel):
    user1: ProfileData
    user2: ProfileData
    model: AIModel = AIModel.auto

class MessageRequest(BaseModel):
    my_profile: ProfileData
    their_profile: ProfileData
    context: Optional[str] = ""
    model: AIModel = AIModel.auto

# ===== GigaChat =====
class GigaChatService:
    def __init__(self):
        self.key = os.getenv('GIGACHAT_AUTH_KEY')
        self.token = None
        self.expires = 0
        self.ok = bool(self.key)
        
    def auth(self):
        if self.token and time.time() < self.expires:
            return self.token
        try:
            r = requests.post(
                "https://ngw.devices.sberbank.ru:9443/api/v2/oauth",
                headers={
                    "Authorization": f"Basic {self.key}",
                    "RqUID": str(uuid.uuid4()),
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                data={"scope": "GIGACHAT_API_PERS"},
                verify=False, timeout=10
            )
            if r.status_code == 200:
                self.token = r.json()["access_token"]
                self.expires = time.time() + 1500
                return self.token
        except:
            pass
        return None

    def ask(self, prompt, sys=""):
        t = self.auth()
        if not t: return None
        try:
            msgs = []
            if sys: msgs.append({"role": "system", "content": sys})
            msgs.append({"role": "user", "content": prompt})
            r = requests.post(
                "https://gigachat.devices.sberbank.ru/api/v1/chat/completions",
                headers={"Authorization": f"Bearer {t}", "Content-Type": "application/json"},
                json={"model": "GigaChat", "messages": msgs, "temperature": 0.7, "max_tokens": 1500},
                verify=False, timeout=30
            )
            if r.status_code == 200:
                return r.json()["choices"][0]["message"]["content"]
        except:
            pass
        return None

# ===== DeepSeek через Yandex Studio =====
class DeepSeekService:
    def __init__(self):
        self.api_key = os.getenv('DEEPSEEK_API_KEY')
        self.agent_id = os.getenv('DEEPSEEK_AGENT_ID')
        self.project_id = os.getenv('DEEPSEEK_PROJECT_ID')
        self.ok = bool(self.api_key and self.agent_id and self.project_id)
        
    def ask(self, prompt, sys=""):
        if not self.ok: 
            return None
        
        # Формируем полный промпт с системным сообщением
        full_prompt = f"{sys}\n\n{prompt}" if sys else prompt
        
        try:
            # Правильные заголовки как в рабочем curl
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Api-Key {self.api_key}",
                "OpenAI-Project": self.project_id  # Важный заголовок!
            }
            
            data = {
                "prompt": {
                    "id": self.agent_id
                },
                "input": full_prompt
            }
            
            print(f"📤 DeepSeek -> {self.agent_id}")
            r = requests.post(
                "https://ai.api.cloud.yandex.net/v1/responses",
                headers=headers,
                json=data,
                timeout=60
            )
            
            print(f"📥 Status: {r.status_code}")
            
            if r.status_code == 200:
                result = r.json()
                
                # Ищем текст в ответе
                output = result.get("output", [])
                for item in output:
                    if item.get("type") == "message":
                        content = item.get("content", [])
                        for c in content:
                            if c.get("type") == "output_text":
                                text = c.get("text", "")
                                print(f"✅ DeepSeek: {len(text)} chars")
                                return text
                
                print(f"⚠️ Output format unknown, keys: {list(result.keys())}")
                # Пробуем альтернативные поля
                if "text" in result:
                    return result["text"]
                    
            else:
                print(f"❌ DeepSeek error: {r.text[:200]}")
                
        except Exception as e:
            print(f"❌ DeepSeek: {e}")
        
        return None

# ===== Manager =====
class AIManager:
    def __init__(self):
        self.gc = GigaChatService()
        self.ds = DeepSeekService()
        self.gc_ok = self.gc.ok
        self.ds_ok = self.ds.ok
        print(f"GigaChat: {'✅' if self.gc_ok else '❌'}")
        print(f"DeepSeek: {'✅' if self.ds_ok else '❌'}")
        
    def gen(self, prompt, sys="", model=AIModel.auto):
        svc, name = None, "mock"
        
        if model == AIModel.gigachat and self.gc_ok:
            svc, name = self.gc, "gigachat"
        elif model == AIModel.deepseek and self.ds_ok:
            svc, name = self.ds, "deepseek"
        elif model == AIModel.auto:
            # Пробуем сначала DeepSeek (качественнее), потом GigaChat
            if self.ds_ok:
                svc, name = self.ds, "deepseek"
            elif self.gc_ok:
                svc, name = self.gc, "gigachat"
        
        if svc:
            print(f"🎯 {name}...")
            res = svc.ask(prompt, sys)
            if res:
                return {"text": res, "model": name, "status": "success"}
        
        print("⚠️ Fallback to mock")
        return {"text": mock(prompt), "model": "mock", "status": "fallback"}

ai = AIManager()

# ===== Prompts =====
PERS = """Ты — профессиональный психолог. Проанализируй анкету пользователя сайта знакомств.

Формат ответа:
🎯 ТИП ЛИЧНОСТИ: [MBTI]
💪 КЛЮЧЕВЫЕ ЧЕРТЫ:
• черта
• черта
• черта
• черта
• черта
💎 ЦЕННОСТИ:
• ценность
• ценность
• ценность
🗣 СТИЛЬ ОБЩЕНИЯ: описание
💑 ИДЕАЛЬНЫЙ ПАРТНЁР: описание
✨ РЕКОМЕНДАЦИИ:
1. совет
2. совет
3. совет

Пиши на русском, с эмодзи, живо и интересно."""

COMP = """Ты — эксперт по отношениям. Оцени совместимость двух людей.

Формат ответа:
❤️ СОВМЕСТИМОСТЬ: X%
✅ СИЛЬНЫЕ СТОРОНЫ:
• сторона
• сторона
• сторона
⚠️ ВОЗМОЖНЫЕ СЛОЖНОСТИ:
• сложность
• сложность
• сложность
💡 СОВЕТЫ:
1. совет
2. совет
3. совет
🎯 ТЕМЫ ДЛЯ РАЗГОВОРА:
1. тема
2. тема
3. тема

Пиши на русском, с эмодзи."""

SYS_MSG = """Ты — профессиональный дейтинг-коуч. Придумай ОДНО лучшее первое сообщение.

Правила:
• Без банальностей ("привет, как дела?")
• Опирайся на интересы из профиля
• С лёгким юмором, но не пошло
• 2-4 предложения
• Заканчивай вопросом чтобы продолжить диалог
• Покажи что прочитал профиль

Формат ответа: Только текст сообщения, без заголовков, без "Вариант 1:", без Markdown.
Начни сразу с сообщения. Не добавляй пояснений почему."""

def mock(prompt):
    if "совместим" in prompt:
        return """❤️ СОВМЕСТИМОСТЬ: 78%
✅ СИЛЬНЫЕ СТОРОНЫ:
• Общие интересы и ценности
• Схожий взгляд на отношения
• Взаимное притяжение
⚠️ ВОЗМОЖНЫЕ СЛОЖНОСТИ:
• Разный ритм жизни
• Ожидания от отношений
• Коммуникация в сложных ситуациях
💡 СОВЕТЫ:
1. Больше общайтесь лично, а не в переписке
2. Будьте искренни с первых дней
3. Обсуждайте важные темы открыто
🎯 ТЕМЫ ДЛЯ РАЗГОВОРА:
1. Путешествия и приключения
2. Хобби и увлечения
3. Мечты и планы на будущее
⚠️ ИИ временно недоступен, показан базовый анализ"""
    
    return """🎯 ТИП ЛИЧНОСТИ: INFJ (Активист)
💪 КЛЮЧЕВЫЕ ЧЕРТЫ:
• Эмпатичность и чуткость
• Креативное мышление
• Целеустремленность
• Развитая интуиция
• Глубина мышления
💎 ЦЕННОСТИ:
• Саморазвитие и рост
• Гармония в отношениях
• Искренность
🗣 СТИЛЬ ОБЩЕНИЯ: Вдумчивый, тёплый, предпочитает глубокие разговоры
💑 ИДЕАЛЬНЫЙ ПАРТНЁР: Человек с похожими ценностями, который ценит искренность
✨ РЕКОМЕНДАЦИИ:
1. Добавьте больше конкретных деталей о хобби
2. Используйте живые, естественные фотографии
3. Опишите конкретные цели в отношениях
⚠️ ИИ временно недоступен, показан базовый анализ"""

# ===== API =====
@app.get("/health")
async def health():
    return {
        "status": "ok",
        "gigachat": ai.gc_ok,
        "deepseek": ai.ds_ok,
        "primary": "deepseek" if ai.ds_ok else "gigachat" if ai.gc_ok else "mock"
    }

@app.post("/test")
async def test(req: TestRequest):
    r = ai.gen(
        "Скажи 'Привет! Я работаю!' с эмодзи, одним предложением",
        "Ответь коротко, на русском",
        req.model
    )
    return r

@app.post("/analyze-personality")
async def analyze(req: AnalysisRequest):
    p = req.profile
    prompt = f"""АНКЕТА:
Имя: {p.name}
Возраст: {p.age}
О себе: {p.bio}
Интересы: {', '.join(p.interests)}
Ищет: {p.looking_for}"""
    
    r = ai.gen(prompt, PERS, req.model)
    return {"analysis": r["text"], "model": r["model"], "status": r["status"]}

@app.post("/calculate-compatibility")
async def compatibility(req: CompatibilityRequest):
    u1, u2 = req.user1, req.user2
    prompt = f"""Пара для анализа:

Человек 1: {u1.name}, {u1.age} лет
О себе: {u1.bio}
Интересы: {', '.join(u1.interests)}
Ищет: {u1.looking_for}

Человек 2: {u2.name}, {u2.age} лет
О себе: {u2.bio}
Интересы: {', '.join(u2.interests)}
Ищет: {u2.looking_for}"""
    
    r = ai.gen(prompt, COMP, req.model)
    return {"compatibility": r["text"], "model": r["model"], "status": r["status"]}

@app.post("/generate-message")
async def message(req: MessageRequest):
    mp, tp = req.my_profile, req.their_profile
    prompt = f"""Мой профиль:
Имя: {mp.name}, {mp.age} лет
О себе: {mp.bio}
Интересы: {', '.join(mp.interests)}

Профиль собеседника:
Имя: {tp.name}, {tp.age} лет
О себе: {tp.bio}
Интересы: {', '.join(tp.interests)}
{f'Контекст: {req.context}' if req.context else ''}"""
    
    r = ai.gen(prompt, SYS_MSG, req.model)
    return {"messages": r["text"], "model": r["model"], "status": r["status"]}



if __name__ == "__main__":
    import uvicorn
    print("\n" + "="*50)
    print("  🚀 Сердцевина AI Service")
    print("="*50)
    print(f"  GigaChat: {'✅' if ai.gc_ok else '❌'}")
    print(f"  DeepSeek: {'✅' if ai.ds_ok else '❌'}")
    print(f"  📡 http://localhost:8000")
    print(f"  📚 http://localhost:8000/docs")
    print("="*50 + "\n")
    uvicorn.run(app, host="0.0.0.0", port=8000)

# ===== Photo Analysis Endpoint =====
class PhotoAnalysisRequest(BaseModel):
    photo_url: Optional[str] = ""
    photo_base64: Optional[str] = ""

@app.post("/analyze-photo")
async def analyze_photo(req: PhotoAnalysisRequest):
    """AI анализ фото профиля"""
    from photo_analyzer import PhotoAnalyzer
    analyzer = PhotoAnalyzer()
    
    try:
        if req.photo_url:
            result = analyzer.analyze_photo(image_url=req.photo_url)
        elif req.photo_base64:
            import base64
            image_bytes = base64.b64decode(req.photo_base64)
            result = analyzer.analyze_photo(image_bytes=image_bytes)
        else:
            return {"error": "Нужен photo_url или photo_base64"}
        
        # Добавляем AI-generated советы через GigaChat/DeepSeek
        if result.get("quality_score", 0) < 60:
            improvement_prompt = f"Дай 3 конкретных совета как улучшить фото для сайта знакомств. Проблемы: {result.get('recommendations', [])}"
            ai_advice = ai.gen(improvement_prompt, "Ты эксперт по фото для сайтов знакомств")
            result["ai_advice"] = ai_advice["text"]
        
        return result
        
    except Exception as e:
        return {"error": str(e)}
