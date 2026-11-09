---
name: readyto-lesson
description: Повноцінний інтерактивний урок ReadyTo (60 хв, 5 етапів школи) з матеріалу чи теми — «Зроби урок ReadyTo»
---
Аргументи: $ARGUMENTS
Прочитай `ReadyTo/CLAUDE.md` (розділ «Урок ReadyTo»), `shared/preferences.md`, `shared/students.md`, `shared/brand-guide.md`, `ReadyTo/platform-guide/mass-import.md`.
Якщо в `teaching/` є урок/презентація на цю тему — використай їхню лексику й граматику.

Алгоритм:
1. Прочитай матеріал (фото, PDF, текст). 2. Визнач мову, тему, рівень, лексику, граматику; чи читають учні. 3. Can-do цілі.
4. Секції = етапи школи: Warming up → Vocabulary (2–3 різні типи блоків-ігор) → Grammar → Reading (для тих, хто читає; інакше аудіо/картинки) → Mini-test 5–7 хв (MultipleChoice/TrueFalse/DropDown, змішано по всьому уроку).
5. Підбери блоки за метою (таблиця в `ReadyTo/CLAUDE.md`), не повторюй один тип скрізь.
6. Напиши Варіант A (масовий імпорт) — `ReadyTo/lessons/YYYY-MM-DD_тема_рівень.txt`; першим блоком `#TeacherNote` з таймінгом, Lingo Coins і ключовими відповідями.
7. Варіант B — `…​.md`: ручні блоки (картинки, аудіо-скрипти, YouTube лише з реальним посиланням, Wordwall/Quizlet лише з реальними публічними посиланнями) + куди їх вставити, ключ відповідей, статуси.
8. `python3 ReadyTo/tools/check_import.py` → 0 помилок; перевір англійську.
9. Запропонуй офлайн-гру з `shared/games-library.md` і, за потреби, Wordwall/Quizlet-набори (skills `wordwall`, `quizlet`).
10. Commit + push. У чаті: блок коду для імпорту, список ручних кроків, що перевірити.
