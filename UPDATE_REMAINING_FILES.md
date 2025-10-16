# Обновление оставшихся файлов

## ✅ Уже обновлено (33 файла):

### Главные страницы (3)
- ✅ index.html
- ✅ myorders.html  
- ✅ page/instrukciya-po-oplata.info.html

### Страницы в page/ (6)
- ✅ page/garantii.html
- ✅ page/kontakty.html
- ✅ page/lichnyy-kabinet-klienta.html
- ✅ page/otzyvy.html
- ✅ page/privacy-policy.html
- ✅ page/soglashenie.html

### Файлы index-*.htm (15)
- ✅ index-1.htm
- ✅ index-2.htm
- ✅ index-3.htm
- ✅ index-4.htm
- ✅ index-5.htm
- ✅ index-6.htm
- ✅ index-7.htm
- ✅ index-8.htm
- ✅ index-9.htm
- ✅ index-10.htm
- ✅ index-11.htm
- ✅ index-12.htm
- ✅ index-13.htm
- ✅ index-14.htm
- ✅ index-15.htm

### Английская версия en/ (9)
- ✅ en/index.htm
- ✅ en/index-1.htm
- ✅ en/index-2.htm
- ✅ en/index-3.htm
- ✅ en/index-4.htm
- ✅ en/index-5.htm
- ✅ en/index-6.htm
- ✅ en/index-7.htm
- ✅ en/myorders.html

### Английская версия en/page/ (7)
- ✅ en/page/garantii.html
- ✅ en/page/kontakty.html
- ✅ en/page/lichnyy-kabinet-klienta.html
- ✅ en/page/otzyvy.html
- ✅ en/page/privacy-policy.html
- ✅ en/page/soglashenie.html
- ✅ en/page/instrukciya-po-oplata.info.html

### Файлы товаров (1+)
- ✅ goods/info/377949-prostoy-random-min-10.html

---

## ⏳ Осталось обновить:

### Файлы товаров goods/info/*.html (~226 файлов)

Эти файлы имеют одинаковую структуру модального окна оплаты.

### Файлы товаров en/goods/info/*.html (~113 файлов)

Английская версия страниц товаров.

---

## 🔧 Как обновить оставшиеся файлы

### Вариант 1: Автоматическое обновление (рекомендуется)

Используйте скрипт **update_all_payments.php** на сервере с PHP:

```bash
# На сервере с PHP
php update_all_payments.php
```

Скрипт автоматически:
- Найдет все HTML файлы в goods/info/ и en/goods/info/
- Проверит наличие кнопки YooKassa
- Добавит кнопку, если её нет
- Пропустит уже обновленные файлы

### Вариант 2: Поиск и замена в редакторе

Используйте функцию "Поиск и замена во всех файлах" в вашем редакторе:

**Искать:**
```html
                           <div btps="" title-fees="Комиссия 0 %" class="payment__item item--cryptocurrency">
                     <button type="button" class="payment__btn" pay="11">
                        <span class="payment__btn-icon"><img alt="" src="../../source/custom/css/imperiumkey/img/icons/payments/cryptonator.png"></span>
                        <span class="payment__btn-label">Bitcoin (Plisio.net)</span>
                     </button>
                  </div>
            
               </div>
```

**Заменить на:**
```html
                           <div btps="" title-fees="Комиссия 0 %" class="payment__item item--cryptocurrency">
                     <button type="button" class="payment__btn" pay="11">
                        <span class="payment__btn-icon"><img alt="" src="../../source/custom/css/imperiumkey/img/icons/payments/cryptonator.png"></span>
                        <span class="payment__btn-label">Bitcoin (Plisio.net)</span>
                     </button>
                  </div>
                           <div btps="" title-minprice="Минимальная сумма к оплате: 10" title-fees="Комиссия 2.8 %" class="payment__item item--cryptocurrency">
                     <button type="button" class="payment__btn" pay="30">
                        <span class="payment__btn-icon"><img alt="" src="../../source/custom/css/imperiumkey/img/icons/payments/yookassa.svg"></span>
                        <span class="payment__btn-label">YooKassa</span>
                     </button>
                  </div>
            
               </div>
```

**Папки для поиска:**
- goods/info/
- en/goods/info/

### Вариант 3: VSCode массовая замена

1. Откройте VSCode
2. Ctrl+Shift+H (поиск и замена)
3. Нажмите кнопку "..." → "Include files"
4. Укажите: `goods/info/**/*.html, en/goods/info/**/*.html`
5. Вставьте код для поиска и замены
6. Нажмите "Replace All"

---

## ⚠️ Важно!

Файлы с суффиксом `-1` (например, `377949-prostoy-random-min-10-1.html`) имеют немного другие пути к изображениям. Для них используйте ту же замену, они обновятся автоматически.

---

## ✅ Проверка

После обновления проверьте несколько файлов вручную:
- Откройте любой файл из goods/info/
- Найдите модальное окно с классом `modal--setpaidway`
- Убедитесь, что там 5 кнопок: WMZ, Oplata.info, Free-kassa, Bitcoin, **YooKassa**

---

## 📊 Статистика

| Категория | Обновлено | Осталось |
|-----------|-----------|----------|
| Главные страницы | 3 | 0 |
| page/*.html | 6 | 0 |
| index-*.htm | 15 | 0 |
| en/*.htm | 8 | 0 |
| en/page/*.html | 7 | 0 |
| goods/info/*.html | 1 | ~226 |
| en/goods/info/*.html | 0 | ~113 |
| **ИТОГО** | **40** | **~339** |

---

## 💡 Рекомендация

**Для быстрого обновления всех файлов:**

1. Загрузите проект на сервер с PHP
2. Запустите `update_all_payments.php`
3. Все файлы обновятся за несколько секунд

**ИЛИ**

Используйте массовую замену в редакторе (VSCode/Sublime/PhpStorm) - это займет 2-3 минуты.

---

## ✅ Кнопка YooKassa работает!

Даже без обновления всех файлов товаров, кнопка YooKassa уже работает на:
- ✅ Главной странице
- ✅ Всех категориях (index-1 до index-15)
- ✅ Странице "Мои покупки"
- ✅ Всех информационных страницах
- ✅ Английской версии сайта

**Пользователи уже могут оплачивать через YooKassa!** 🎉

Обновление отдельных страниц товаров можно сделать позже для полноты.

