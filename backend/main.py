import os
from typing import Literal

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from google.genai import types
from pydantic import BaseModel, Field

load_dotenv()
app = FastAPI(title="Zaman Makinesi API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(","),
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


class Message(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=4000)


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    mode: Literal[1990, 2030]
    history: list[Message] = Field(default_factory=list, max_length=30)


class ChatResponse(BaseModel):
    reply: str
    mode: int


SYSTEM_PROMPTS = {
    1990: """Sen Zaman Makinesi sohbet hattının 1990 yılındaki operatörüsün. Kullanıcıyla Türkçe ve doğal konuş. 1990'da yaşıyormuşsun gibi davran: internet henüz gündelik hayatın parçası değil; modemler, kasetler, radyolar ve dönemin kültürü doğal referansların. 1990'dan sonraki gelişmeleri biliyormuş gibi konuşma; kullanıcı gelecek hakkında sorarsa meraklı ve temkinli tahminler yap, bunların tahmin olduğunu sezdir. Günümüz kavramlarını anahronik biçimde kullanma. Sohbeti sıcak, kısa ve karakterli tut; rolü bozma ama dönem gerçekleri sorulursa dürüst ol.""",
    2030: """Sen Zaman Makinesi'nin 2030 yılındaki sohbet operatörüsün. Kullanıcıyla Türkçe, akıcı, meraklı ve sıcak konuş. 2030'daymış gibi davran; teknoloji ve kültüre dair geleceğe dönük, yaratıcı bir atmosfer kur. Bilmediğin gerçek dünya gelişmelerini olmuş gibi kesin biçimde iddia etme; spekülatif fikirleri açıkça olasılık olarak sun. Gereksiz bilim kurgu jargonu kullanma. Kısa ve karakterli cevaplar ver, kullanıcının sorusuna doğrudan yanıt ver.""",
}


@app.get("/api/health")
async def health():
    return {"status": "ok", "gemini_configured": bool(os.getenv("GEMINI_API_KEY"))}


@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=503,
            detail="Gemini anahtarı bulunamadı. Proje kökündeki .env dosyasına GEMINI_API_KEY değerini ekle ve API sunucusunu yeniden başlat.",
        )
    contents = [
        types.Content(
            role="model" if item.role == "assistant" else "user",
            parts=[types.Part(text=item.content)],
        )
        for item in request.history[-20:]
    ]
    contents.append(types.Content(role="user", parts=[types.Part(text=request.message)]))
    try:
        client = genai.Client(api_key=api_key)
        response = await client.aio.models.generate_content(
            model=os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPTS[request.mode],
                temperature=0.85 if request.mode == 2030 else 0.72,
                max_output_tokens=700,
            ),
        )
        if not response.text:
            raise ValueError("Gemini boş bir yanıt döndürdü.")
        return ChatResponse(reply=response.text.strip(), mode=request.mode)
    except Exception as exc:
        print(f"Gemini isteği başarısız: {type(exc).__name__}: {exc}")
        raise HTTPException(
            status_code=502,
            detail="Gemini’ye şu anda ulaşılamıyor. API anahtarını ve bağlantını kontrol edip tekrar dene.",
        ) from exc
