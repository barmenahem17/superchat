# superchat – Personal Portfolio Manager (v1)

מנהל השקעות אישי ל-3 תיקים (Extrade, IBKR, Kraken) עם פירוק ביצועים:
- רווח/הפסד שוק
- רווח/הפסד מהמרות דולר/שקל
- הפרדה ברורה בין "ביצועים" לבין "שווי"

## Stack (Phase A)
- Next.js (App Router, TypeScript)
- Tailwind CSS + shadcn/ui
- Prisma + SQLite (שלב ראשון, מעבר בהמשך ל-Supabase/Neon)
- Vitest (בדיקות לחישוב)

## Core rules
- עמלות: קבועות לפעולה; נגרעות רק כשהפעולה בוצעה.
- מכירה חלקית: ממומש לחלק שנמכר + פוטנציאלי ליתרה.
- מטבע ראשי (ILS/USD): משפיע על תצוגה בלבד; מזומן מוצג גם מקורי וגם כהמרה.
- השפעת דולר/שקל: רק מהמרות שבוצעו (FxConversion).
- "ביצועים" = שוק + המרות (ללא הפקדות/משיכות); "שווי" = הכל כולל הפקדות.
- "מתחילת שנה" = 1 בינואר; "מהעסקה הראשונה" = מהתאריך הראשון בתיק.

## Project layout
- `src/app/` – עמודים ו-API
- `src/domain/` – פונקציות חישוב טהורות (עם טסטים)
- `src/data/` – Prisma client ושכבת נתונים
- `src/services/` – שירותי מחירים ושערים (בהמשך)
- `prisma/` – schema + seed
- `tests/` – Vitest

## Milestones
- M1: שלד עובד – `/api/accounts` + `/accounts`
- M2: לוגיקת חישוב + Vitest
- M3: "עדכן נתונים" – משיכת מחירים/שערים בלחיצה
- Phase B: מעבר ל-Supabase/Neon
