# SuperChat - מנהל תיקי השקעות

## מה האפליקציה עושה

SuperChat הוא מנהל תיקי השקעות המנהל 3 תיקים עיקריים:
- **Extrade** - תיק ישראלי
- **IBKR** (Interactive Brokers) - תיק בינלאומי
- **Kraken** - תיק קריפטו

האפליקציה מספקת מעקב מרוכז אחר כל התיקים עם חישובי ביצועים מתקדמים.

## Tech Stack

- **Frontend**: Next.js 15 + TypeScript + App Router
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: Prisma ORM + SQLite
- **Testing**: Vitest + Testing Library
- **Live Data**: Alpha Vantage (stocks) + CoinGecko (crypto) + ExchangeRate-API (FX)
- **Deployment**: Ready for Vercel/Netlify

## כללי חישוב מרכזיים

### עמלות לפעולה
- כל פעולת קנייה/מכירה כוללת עמלה שמשפיעה על החישוב
- העמלות נלקחות בחשבון בחישוב הרווח/הפסד הנקי

### מכירה חלקית
- תמיכה במכירות חלקיות של עמדות
- חישוב ממוצע משוקלל לעמלות וריווחים

### מטבע ראשי לתצוגה
- כל הנתונים מוצגים במטבע הראשי (שקל/דולר) לצורך השוואה
- המרות מטבע מתבצעות לפי שער יומי

### השפעת דולר/שקל
- שער הדולר משפיע רק על המרות בין מטבעות
- לא משפיע על ביצועי נכסים במטבע המקורי

### "ביצועים" מול "שווי"
- **ביצועים**: רווח/הפסד יחסי באחוזים
- **שווי**: ערך כספי מוחלט של התיק

### תקופות
- תמיכה בתקופות זמן שונות: יומי, שבועי, חודשי, שנתי
- חישוב ביצועים מצטברים לכל תקופה

## Live Prices

האפליקציה משתמשת בשלושה מקורות מידע לקבלת מחירים עדכניים:

### מקורות נתונים
- **מניות**: [Alpha Vantage API](https://www.alphavantage.co/) - מחירים בזמן אמת למניות אמריקאיות
- **קריפטו**: [CoinGecko API](https://www.coingecko.com/api) - מחירי מטבעות דיגיטליים
- **מטבעות**: [ExchangeRate-API](https://exchangerate.host/) - שערי חליפין USD/ILS

### דרישות סביבה
```bash
ALPHA_VANTAGE_KEY=your_api_key_here  # נדרש למחירי מניות
```

### התנהגות
- בלי מפתח API: האפליקציה תשתמש במחירים דמו עם סימון "(מחיר זמני)"
- עם מפתח API: מחירים חיים מהמקורות החיצוניים
- כפתור "עדכן נתונים" טוען מחירים חדשים ומרענן את הדף

### בדיקת מחירים
```bash
# בדיקת מחיר מניה
curl "http://localhost:3000/api/price?symbol=MSFT"

# בדיקת מחיר קריפטו  
curl "http://localhost:3000/api/price?coin=bitcoin"

# בדיקת שער חליפין
curl "http://localhost:3000/api/price?fx=USDILS"
```

## מבנה תיקיות

```
superchat/
├── src/
│   ├── app/                 # Next.js App Router
│   ├── components/          # React components
│   ├── lib/                 # Utilities (shadcn)
│   ├── domain/              # Business logic & entities
│   ├── data/                # Data access & repositories
│   └── services/            # External integrations
├── prisma/                  # Database schema
├── tests/                   # Test files
└── public/                  # Static assets
```

## Milestones

### M1: API בסיסי + עמודים
- [ ] `/api/accounts` - API לניהול חשבונות
- [ ] `/accounts` - עמוד תצוגת חשבונות
- [ ] מודל נתונים בסיסי ב-Prisma

### M2: לוגיקות חישוב + טסטים
- [ ] חישוב ביצועים לכל תיק
- [ ] חישוב עמלות ומכירות חלקיות
- [ ] המרות מטבע
- [ ] כיסוי טסטים מלא

### M3: עדכון נתונים
- [ ] אינטגרציה עם APIs של הברוקרים
- [ ] עדכון אוטומטי של מחירים
- [ ] דאשבורד זמן אמת

## איך להריץ

### התקנה
```bash
npm install
```

### פיתוח
```bash
npm run dev
```
האפליקציה תהיה זמינה ב-http://localhost:3000

### טסטים
```bash
npm run test
```

### בנייה לפרודקשן
```bash
npm run build
npm run start
```

## סביבת פיתוח

יש לוודא שקיים קובץ `.env` עם:
```
DATABASE_URL="file:./dev.db"
```
A