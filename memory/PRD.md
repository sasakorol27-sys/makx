# Hamburg Apartment Scanner — PRD

## Original Problem Statement
Создать сайт мониторинга квартир с tenant.immomio.com для Гамбурга с автоматическим сканированием каждые 3 минуты и email уведомлениями.

## User Choices
- Частота сканирования: **3 минуты**
- Email-сервис: **Resend**
- Фильтры: **Цена, количество комнат**
- Email уведомлений: **maximnikityk@ukr.net**
- Дополнительные функции: **История найденных + админ-страница с управлением пользователями**
- Источники данных: **SAGA Hamburg + Google Search + ручное добавление URLs**

## Architecture
- **Frontend**: React (CRA), Tailwind CSS, Shadcn UI, Phosphor Icons, Swiss Brutalism design
- **Backend**: FastAPI, Motor (async MongoDB), APScheduler, Playwright (для парсинга SPA), Resend
- **Auth**: JWT in httpOnly cookies (samesite=none, secure=true), bcrypt
- **DB**: MongoDB (collections: users, apartments, scan_logs, manual_urls, settings)

## Core Features (Implemented)
- ✅ JWT-based авторизация с admin role
- ✅ Admin panel: CRUD пользователей + manual URL management
- ✅ Парсинг РЕАЛЬНЫХ страниц tenant.immomio.com/apply/{uuid} через Playwright
- ✅ Извлечение: title, price, rooms, area, district, address, landlord, image
- ✅ Автоматическое сканирование каждые 3 минуты через APScheduler
- ✅ SAGA Hamburg scraper (Playwright обход JS challenge)
- ✅ DuckDuckGo search для immomio URLs
- ✅ Manual URLs - админ может вставлять найденные ссылки
- ✅ Фильтры по цене (min/max) и комнатам (min/max)
- ✅ История всех найденных квартир
- ✅ Email уведомления через Resend (требует API ключ)
- ✅ Countdown таймер до следующего сканирования
- ✅ Manual scan trigger

## Test Credentials
- Admin: `admin@hamburg-scanner.com` / `admin123`

## Currently Mocked / Pending
- ✅ Resend API key настроен — email уведомления работают
- ✅ **SAGA scraper працює** (2026-02): обхід bot-check через PoW + bypass Friendly Captcha
- ⚠️ DuckDuckGo search возвращает 0 результатов (Google не индексирует apply pages) — не критично, основні скрапери покривають усе

## CHANGELOG
- **2026-02-23** SAGA scraper фіксовано:
  - Видалено залежність від Tor/Playwright для SAGA
  - Реалізовано прямий обхід SAGA bot-check через `requests`:
    1. PoW challenge (`?create_challenge` → solve SHA256 → `?verify_challenge`)
    2. Friendly Captcha bypass (POST `/captcha-validate` з порожнім solution → success)
    3. XHR fetch listings (`X-Requested-With: XMLHttpRequest`)
  - Парсить картки `#APARTMENT-card-N` з data-rooms / data-livingSpace / data-fullCosts
  - Результат: 2 SAGA квартири (Moorburg, Bramfeld) тепер в БД та UI

## P0 / P1 / P2 Backlog
- [P1] Refactor `server.py` (~1700 рядків) → routes/models/scrapers/notifications
- [P1] Додати Telegram bot integration для уведомлень
- [P2] Brute-force protection на /api/auth/login
- [P2] Графіки статистики (квартири по днях)
- [P2] Push notifications через Web Push API
- [P2] Filter by district (multi-select)

## CHANGELOG — Design
- **2026-07-09** Повний редизайн UI зі "швейцарського бруталізму" → сучасний мінімалізм:
  - Палітра: нейтральний Slate + акцент Coral (#FF6F61), shadcn CSS-variables
  - Світла + темна тема з перемикачем (ThemeContext + ThemeToggle, localStorage)
  - Шрифти: Manrope (заголовки) + DM Sans (текст)
  - Заокруглені картки (rounded-2xl), м'які тіні, glass-header, мікро-анімації
  - Перероблено: LoginPage, StatusBar, FilterPanel, ApartmentList, AdminPanel, ProfilePage, StatsPage, StatsChart, InstallPrompt, Dashboard, ProtectedRoute
  - Функціонал (WebSocket, скрапери, PWA, auth, фільтри) НЕ змінювався

## CHANGELOG — Доступ/Підписка
- **2026-07-09** Таймер доступу (підписка) для користувачів:
  - Admin: поле "Zugang (Tage)" при створенні + кнопки "Setzen / ∞ / Sperren" на кожному користувачі
  - Backend: user.access_expires_at; helpers is_access_active/access_info; endpoints PUT /admin/users/{id}/access та /access/unlimited
  - Прострочені юзери: 403 на /apartments, НЕ отримують email/push сповіщень
  - Frontend: екран "Zugang geschlossen" (AccessExpired.jsx) з кнопкою продовження → Telegram @albina_pay
  - Admin завжди активний; порожній expiry = необмежено
  - Перевірено curl: create(30д)→active, revoke(0)→403, restore(30)→200

## CHANGELOG — Immowelt + ScraperAPI + Admin Tabs (2026-07-16)
- ScraperAPI інтеграція (ключ у .env + DB app_settings, редагується з адмінки)
- Потік immowelt: профіль → лише Wohnung (skip Gewerbe/Büro/Restaurant) → detail page → extract tenant.immomio.com/apply → parse_immomio_listing → publish. Планувальник кожні 10 хв + ручний тригер.
- db collections: immowelt_profiles, immowelt_seen (кеш expose→immomio щоб не витрачати кредити), app_settings
- Admin endpoints: GET /admin/scraperapi/account, PUT /admin/scraperapi/key, GET/POST/DELETE /admin/immowelt-profiles, POST /admin/immowelt/scan
- notify_new_apartments() винесено як спільну функцію (email+push) для обох сканів
- Адмінка перероблена на 3 вкладки: Benutzer / immomio-URLs / Immowelt & ScraperAPI (лічильник кредитів + прогрес-бар + зміна ключа)
- ⚠️ ВАЖЛИВО: безкоштовний тариф ScraperAPI НЕ включає premium/ultra_premium проксі, потрібні для DataDome immowelt (free tier → 403/500). Потрібен платний тариф.

## CHANGELOG — Switched to Scrapfly (2026-07-16)
- Замінено ScraperAPI → Scrapfly (ключ у .env SCRAPFLY_KEY + DB app_settings 'scrapfly_key', редаг. з адмінки)
- _scrapfly_fetch(asp=true, country=de) обходить DataDome. Endpoints: GET /admin/scrapfly/account, PUT /admin/scrapfly/key
- Адмінка вкладка "Immowelt & Scrapfly": лічильник (used/limit/remaining), прогрес, зміна ключа
- ✅ Перевірено E2E: профіль SAGA → 1 Wohnung (skip Büro/Restaurant) → detail → immomio apply → published (523€, SAGA). Кожен ASP-запит ~25 кредитів.
- Інтервал immowelt = 60 хв (free 1000 кредитів ≈ 40 запитів/міс — тріал лише для тесту, для постійного моніторингу потрібен платний тариф)

## CHANGELOG — Scan interval (2026-07-16)
- Adminka: поле "Scan-Intervall (Minuten)" у вкладці Immowelt & Scrapfly
- Endpoints GET/PUT /admin/immowelt/interval; зберігається в app_settings; APScheduler reschedule на льоту; default 60
- GCV: витягує immomio apply link з IS24-експозе → публікує з immomio URL + адресою (10/11)
