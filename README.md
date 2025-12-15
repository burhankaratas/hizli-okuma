# Hızlı Okuma Uygulaması (Flask + Electron)

Bu proje, **Flask (Python)** tabanlı bir web uygulamasını **Electron (JavaScript)** ile masaüstü uygulaması olarak çalıştıran, modüler yapıda bir **hızlı okuma uygulamasıdır**.

Flask tarafı arka planda lokal bir web sunucusu olarak çalışır, Electron ise bu sunucuyu masaüstü uygulaması şeklinde kullanıcıya gösterir. Uygulama, `templates/modules` klasörü altındaki HTML dosyalarını otomatik olarak algılar ve modül olarak listeler.

---

## Mimari Genel Bakış

* **Python / Flask**: Uygulama mantığı ve sayfa render işlemleri
* **Electron**: Masaüstü uygulama kabuğu (UI görüntüleme)
* **start.py**: Tüm sistemi yöneten başlatıcı (orchestrator)

  * Python sanal ortamını oluşturur
  * Python bağımlılıklarını kurar
  * Flask uygulamasını başlatır
  * Electron uygulamasını çalıştırır

---

## Gereksinimler

Sisteminizde aşağıdaki yazılımların kurulu olması gerekir:

### Zorunlu

* **Python 3.12+**
* **Node.js (LTS önerilir)**
* **npm** (Node.js ile birlikte gelir)
* Git (projeyi klonlamak için)

---

## Kurulum

### 1. Projeyi Klonlayın

```bash
git clone <repo-url>
cd proje-klasoru
```

---

### 2. Ortam Değişkenleri (.env)

Proje kök dizininde bir `.env` dosyası oluşturun:

```env
SECRET_KEY=guclu_bir_gizli_anahtar
```

> `SECRET_KEY`, Flask session ve güvenlik mekanizmaları için gereklidir.

---

### 3. Uygulamayı Başlatın

Tüm kurulum ve çalıştırma işlemleri **tek bir dosya** üzerinden yapılır:

```bash
python3 start.py
```

Bu komut şunları otomatik olarak yapar:

* Python sanal ortamını (`venv`) oluşturur
* `requirements.txt` içindeki Python bağımlılıklarını kurar
* Node.js ve npm kontrolü yapar
* `npm install` çalıştırır
* Flask sunucusunu başlatır
* Electron masaüstü uygulamasını açar

İlk çalıştırma biraz zaman alabilir.

---

## Proje Yapısı

```text
.
├── app.py                # Flask uygulaması
├── start.py              # Başlatıcı (orchestrator)
├── main.js               # Electron ana dosyası
├── package.json          # Electron / JS bağımlılıkları
├── package-lock.json     # Kilitlenmiş npm bağımlılıkları
├── requirements.txt      # Python bağımlılıkları
├── templates/
│   ├── index.html
│   └── modules/
│       ├── modul1.html
│       ├── modul2.html
│       └── ...
├── static/               # CSS / JS / görseller
├── .env                  # Ortam değişkenleri (Git'e dahil edilmez)
└── README.md
```

---

## Modül Sistemi

* `templates/modules` klasörüne eklenen her `.html` dosyası **otomatik olarak bir modül** olarak algılanır
* Ana sayfada bu modüller dinamik olarak listelenir
* Yeni modül eklemek için backend koduna dokunmaya gerek yoktur

Örnek:

```text
templates/modules/hizli_okuma_1.html
```

Bu dosya otomatik olarak arayüzde görünür.

---

## Geliştirme Notları

* Flask yalnızca **local** olarak çalışır (`127.0.0.1`)
* Uygulama internet bağlantısı gerektirmez
* Electron sadece görüntüleme amaçlıdır, iş mantığı Python tarafındadır

---

## Git Ignore

Aşağıdaki dosya ve klasörler Git'e dahil edilmez:

* `venv/`
* `.venv/`
* `node_modules/`
* `__pycache__/`
* `.env`
* `dist/`
* `build/`

---

## Lisans

Bu proje kişisel / eğitim amaçlı geliştirilmiştir. Lisanslama ihtiyacına göre düzenlenebilir.

---

## Not

Bu proje, basit bir MVP olarak tasarlanmıştır. Mimari; ileride otomatik güncelleme, modül bazlı ayarlar veya kullanıcı profilleri gibi özellikler eklemeye uygundur.
