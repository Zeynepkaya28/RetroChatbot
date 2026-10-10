# Zaman Makinesi

1990 ve 2030 arasında geçiş yapabilen, seçilen dönemin diline ve görünümüne uyum sağlayan bir sohbet uygulaması. Ön yüz React ve Vite, API sunucusu Python ve FastAPI ile hazırlanmıştır. Yanıtlar Gemini API üzerinden üretilir.

## Özellikler

- **1990 modu:** CRT terminali, fosfor yeşili yazılar ve döneme uygun sohbet üslubu.
- **2030 modu:** Dinamik, modern arayüz ve geleceğe dönük sohbet üslubu.
- Sohbet geçmişi isteklerle birlikte API'ye aktarılır.
- Gemini API anahtarı yalnızca backend'de kullanılır; tarayıcıya gönderilmez.

## Gereksinimler

- Python 3.10 veya üzeri
- Node.js ve npm
- Gemini API anahtarı

## Kurulum

### 1. Gemini API anahtarını ayarla

Proje kök dizininde (`backend` ve `frontend` klasörlerinin bulunduğu dizin) `.env.example` dosyasını `.env` adıyla kopyala. `.env` içeriğini kendi anahtarınla güncelle:

```dotenv
GEMINI_API_KEY=buraya_gemini_api_anahtarini_yaz
GEMINI_MODEL=gemini-2.5-flash
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

`.env` dosyasını paylaşma veya Git'e ekleme. Bu dosya `.gitignore` tarafından yok sayılır.

### 2. Python paketlerini yükle

Proje kökünde PowerShell aç ve çalıştır:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

Sanal ortamı etkinleştirme komutu PowerShell'in yürütme ilkesi nedeniyle engellenirse, etkinleştirmeden şu komutları kullanabilirsin:

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

## Uygulamayı çalıştırma

Uygulama iki sunucudan oluşur. İki ayrı terminal kullan; terminal pencerelerini açık bırak.

### Terminal 1: FastAPI

Proje kökünde çalıştır:

```powershell
.\.venv\Scripts\python.exe -m uvicorn backend.main:app --reload --port 8000
```

Sağlık kontrolü: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health). `status` alanı `ok`, `gemini_configured` alanı `true` olmalı.

### Terminal 2: React/Vite

```powershell
cd frontend
npm install
npm run dev
```

Vite'ın verdiği adresi aç. Varsayılan adres: [http://127.0.0.1:5173](http://127.0.0.1:5173).

## Kullanımı

Sohbet kutusuna mesaj yazıp Enter'a bas veya gönder düğmesini kullan. Zaman makinesi düğmesiyle 1990 ve 2030 arasında geçiş yapabilirsin. Her mod kendi dönemine uygun bir sohbet başlangıcı ve öneriler sunar.

## Sorun giderme

- **Siteye ulaşılamıyor:** Vite terminalinde `Local` adresinin göründüğünü ve terminalin hâlâ çalıştığını kontrol et. Adres genellikle `http://127.0.0.1:5173/` olur.
- **Sohbet yanıt vermiyor:** FastAPI terminalinin çalıştığını ve `/api/health` yanıtının `ok` olduğunu kontrol et.
- **Gemini anahtarı bulunamadı:** `.env` dosyasının proje kökünde olduğunu ve `GEMINI_API_KEY=` satırında gerçek anahtarın bulunduğunu doğrula. `.env` değişikliğinden sonra FastAPI'yi durdurup yeniden başlat.
- **Gemini bağlantı hatası:** Anahtarın geçerli olduğunu ve internet bağlantısını kontrol et. Backend ayrıntıyı terminale, genel hata mesajını arayüze yazar.

## Proje yapısı

```text
.
├── backend/
│   └── main.py          # FastAPI ve Gemini sohbet uç noktası
├── frontend/
│   ├── src/             # React uygulaması ve stiller
│   ├── index.html
│   └── vite.config.js   # /api isteklerini FastAPI'ye yönlendirir
├── .env.example
├── requirements.txt
└── README.md
```

## API uç noktaları

- `GET /api/health` — Sunucu ve Gemini anahtarı yapılandırma durumu.
- `POST /api/chat` — `message`, `mode` (`1990` veya `2030`) ve isteğe bağlı `history` alır; Gemini yanıtını döndürür.
