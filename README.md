# Запуск:
- yarn<br>
- yarn dev<br>
- localhost:3000<br><br>

# Задача:<br>
- Создать REST API сервер;<br>
- Создать таблицу со сценариями "создать/изменить/удалить";<br>
- Создать возможность передавать линк с текущим состоянием и историей;<br>

# Реализация:<br>
В рамках данной задачи было создано 3 модуля, каждый из которых отвечает за свою часть приложения.<br><br>

listController.js - данный модуль отвечает за работу со списком. При инициализации модуля из базы достается список и отрисовывается в DOM. Каждый элемент списка, при создании хранит в себе конфигурацию и свою копию DOM. При нажатии на элемент списка, в переменную active передаются конфигурация и копия DOM для того, чтобы при дальнейших манипуляциях с элементом мы избежали лишних действий с поиском недостающей информации, которая в любом из случаев будет нам необходима.<br>
Методы:<br>
- get: Достать список из базы и отрисовать его;<br>
- create: Создать элемент. По умолчанию занимает последнюю позицию в списке: но так же ее можно явно указать (данный параметр требуется для работы с историей браузера);<br>
- update: Обновить элемент. Принимает новую конфигурацию и применяет ее для элемента: который находится в active;<br>
- delete: Удалить элемент. Удаляет элемент: который находится в active;<br>
- setActive: Сделать элемент активным. Принимает конфигурацию, dom и флаг force, говорящий о том, что даже если элемент уже является активным, оставить его состояние неизменным (требуется на работы с историй браузера). Параметр dom не является обязательным. В случае если он не указан, мы берем из конфигурации элемента его ID и по атрибуту data-id ищем в DOM нужный нам элемент списка и записываем его в active;<br>
- _setCount: Отвечает за отображение актуального количества элементов списка в DOM;<br>
- _appendFields: Создание и добавление списка в DOM;<br>
- _createItem: Создание DOM структуры элемента списка;<br>
- _createField: Создание DOM поля в элементе списка;<br><br>

popupController.js - данный модуль отвечает за работу со всплывающими оконами. При инициализации добавляет структуру всплывающего окна в DOM.<br>
Методы:<br>
- show: Показать окно. На вход принимает объект с конфигурацией. При передачи ключа data (конфигурация элемента списка), означает что нужно показать форму. В случае отсутствия данного ключа, всплывающее окно будет содержать текстовую информацию из ключа text. При его отсутсвии будет выводить текст по умолчанию. Так же можно передать ключь events, в котором можно указать 3 сценария onShow, onConfirm, onCancel<br>
- hide: Спрятать всплывающее окно. При закрытии обнуляет все данные модуля;<br>
- _confirm: Подтвердить действие. Выполняет логику из ключа events.onConfirm и скрывает окно;<br>
- _cancel: Отменить действие. Выполняет логику из ключа events.onCancel и скрывает окно;<br>
- _createDOM: Создание структуры всплывающего окна и ее добавление в DOM;<br>
- _createField: Создание DOM поля;<br><br>

popupController.js - данный модуль отвечает за работу с иcторией браузера. Работает следующим образом: При какой либо манипуляции с DOM, данное действие добавляет сохраняется в базе, со своим уникальным id, а так же добавляет его в GET parameter. Если в GET paremeter уже есть данный параметр, он сохраняет внутри текущего его номер, под ключем prevID. Так создается цепочка действий. Пример: Нажатие кнопки добавить -> {action: 'create', id: 1}; Нажатие кнопки подтвердить -> {action: 'created', id: 2, data, prevId: 1}<br>
При инициализации мы смотрим есть ли параметр. Если есть, достаем всю цепочку по id/prevId, сохраняем в history и пушаем в историю браузера, инициализируем текущее действие по параметру и включаем waсher который будет следить за переходами по истории. При переходе, достаем из history данное состояние по параметру и делаем изменения.
<br>
Методы:<br>
- initialize: Инициализация модуля;<br>
- setHistory: Создание и вставка истории;<br>
- setEvent: Выполнить действие со списком. Если action = 'created/updated/deleted', данный метод обрабатывает изменения и работает с listController;<br>
- setState: Выполнить действие с окном. Если action = 'create/update/delete/cancel', данный метод обрабатывает изменения и работает с popupController;<br>
- downgradeHistory: Понизить историю. Данный метод используется когда мы передвигаемя по истории назад и совершаем новое действие. Нам нужно убрать из истории то, что является после;<br>
- getButtonEvent: Информация какая кнопка была нажата 'previous/next'. Еще есть состояние start, которое говорит о том, что мы вернулись на первоначальную страницу в истории. Так как браузеры используют защиту, мы не можем удалить шаг истории, когда мы только зашли, поэтому первый и последний шаг истории браузера, в нашем случае являются дубликатами, Состояние  start говорит нам о том, что мы вернулись в начало;<br>
- getParameter: Достать GET paremeter из строки браузера;<br>
- push: Добавить шаг истории в базу;<br>
