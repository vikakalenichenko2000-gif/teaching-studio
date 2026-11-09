---
name: readyto-import
description: Підготувати готовий текст для «Імпорт зі списку (кілька вправ)» у ReadyTo з наданого матеріалу
---
Аргументи: $ARGUMENTS
Прочитай `ReadyTo/platform-guide/mass-import.md` і `shared/readyto-formats.md`.
1. Перетвори матеріал на блоки лише з 16 документованих маркерів (Text, Vocabulary, GapFill, DropDown, DragWords, MultipleChoice, TrueFalse, Table, Matching, Unscramble, SortSentences, ColumnSort, FlipCards, Writing, HiddenText, TeacherNote).
2. Між блоками порожній рядок; заголовки й описи англійською (мова матеріалу), без пояснень формату.
3. Збережи `.txt` у `ReadyTo/lessons/` або `ReadyTo/exercises/`, запусти `python3 ReadyTo/tools/check_import.py <файл>` до 0 помилок.
4. Видай текст одним блоком коду + коротку інструкцію: Урок → «Імпорт зі списку (кілька вправ)» → вставити → «Перевірити» → «Створити вправи».
5. Окремо перелічи, що треба додати вручну (медіа, інтеграції). Commit + push.
