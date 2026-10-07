# Hızlı Okuma

> Flask sunucusunu Electron masaüstü kabuğuyla birleştiren, modüler yapıda bir hızlı okuma uygulaması.

![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-3.1-000000?logo=flask&logoColor=white)
![Electron](https://img.shields.io/badge/Electron-26-47848F?logo=electron&logoColor=white)
![Lisans](https://img.shields.io/badge/license-MIT-green)

Okurken göz satır sonuna geldiğinde geri döner ve her dönüşte zaman kaybedilir.
Bu uygulama; göz kaslarını çalıştıran, karar süresini kısaltan ve okuma tekniğini
değiştiren modüllerle bu kaybı azaltmayı hedefler.

Flask arka planda yalnızca yerel (`127.0.0.1`) bir sunucu olarak çalışır; Electron
ise onu masaüstü uygulaması olarak gösterir. **İnternet bağlantısı gerekmez,
veriler cihazdan çıkmaz.**

## Özellikler

- **Modüler sistem** — `templates/modules/` içine eklenen her `.html` dosyası
  otomatik olarak bir modül olarak algılanır; backend'e dokunmak gerekmez.
- **Takistoskop** — kısa süreli hızlı görsel/kelime algısı çalışması.
- **Anlam refleksi** — anlamayı düşürmeden hızı artırmaya yönelik metin çalışması.
- **Dikkat analizi & dikkat refleksi** — odak ve tepki süresi çalışmaları.
- **Matematik refleksi** — zihinsel işlem hızını geliştiren egzersiz.
- **Tek komutla kurulum** — `start.py` tüm süreci yönetir.

## Mimari

| Katman | Teknoloji | Görev |
| --- | --- | --- |
| Backend | Python 3.12, Flask | Sayfa render, modül keşfi, iş mantığı |
| Masaüstü kabuğu | Electron (JavaScript) | Flask sunucusunu masaüstü penceresinde gösterir |
| Başlatıcı | `start.py` | venv oluşturur, bağımlılıkları kurar, sunucuyu ve Electron'u başlatır |

```
.
├── app.py                 # Flask uygulaması
├── start.py               # Başlatıcı (orchestrator)
├── main.js                # Electron giriş noktası
├── package.json           # Electron bağımlılıkları
├── requirements.txt       # Python bağımlılıkları
├── static/
│   ├── data/              # Modül verileri (JSON)
│   └── js/                # Modül mantıkları
└── templates/
    ├── index.html
    ├── layout.html
    └── modules/           # Her .html dosyası bir modül
```

## Kurulum

Gereksinimler: **Python 3.12+**, **Node.js (LTS)** ve **npm**.

```bash
git clone https://github.com/burhankaratas/hizli-okuma.git
cd hizli-okuma
cp .env.example .env      # SECRET_KEY değerini düzenleyin
python3 start.py
```

`start.py` sanal ortamı oluşturur, Python ve Node bağımlılıklarını kurar,
Flask sunucusunu başlatır ve Electron penceresini açar. İlk çalıştırma
biraz uzun sürebilir.

## Yeni modül ekleme

1. `templates/modules/` içine yeni bir `.html` dosyası ekleyin.
2. Gerekirse `static/js/` ve `static/data/` altına mantık ve verisini koyun.

Modül, arayüzde otomatik olarak listelenir.

## Lisans

[MIT](LICENSE) © 2026 Mahmut Burhan Karataş