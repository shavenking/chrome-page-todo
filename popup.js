var currentTabUrl = function (callback) {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        callback(tabs[0].url.split('#', 1))
    })
}

var TodoStorage = {
    nextId: '',
    all: function (callback) {
        chrome.storage.sync.get(function (items) {
            currentTabUrl(function (url) {
                callback(items[url])
            })
        })
    },
    save: function (description, callback) {
        currentTabUrl(function (url) {
            chrome.storage.sync.get(function (items) {
                items[url] = items[url] || []

                items[url].push({
                    id: Math.random(),
                    description: description
                })

                chrome.storage.sync.set(items, callback)
            })
        })
    },
    remove: function (id, callback) {
        currentTabUrl(function (url) {
            chrome.storage.sync.get(function (items) {
                items[url] = items[url] || []

                items[url] = items[url].filter(function (candidate) {
                    return id != candidate.id
                })

                chrome.storage.sync.set(items, callback)
            })
        })
    }
}

var newTaskInput = function () {
    return document.getElementById('new-task-input')
}

var taskList = function () {
    return document.getElementById('task-list')
}

var clearInput = function (input) {
    input.value = ''
}

var renderTasks = function (tasks) {
    if (!Array.isArray(tasks)) {
        return
    }

    taskList().innerHTML = tasks.reverse().map(function (task) {
        return (
            '<li class="list-group-item justify-content-between">'
            + task.description
            + '<button type="button" class="btn btn-link btn-check-task" data-id="' + task.id + '">CHECK</button>'
            + '</li>'
        )
    }).join('')
}

var onNewTaskInputKeypress = function (e) {
    if (e.keyCode != 13 && e.which != 13) {
        return;
    }

    e.preventDefault()

    TodoStorage.save(e.target.value, function () {
        TodoStorage.all(renderTasks)
    })

    clearInput(e.target)
}

var onBtnCheckTaskClick = function (e) {
    e.preventDefault()

    if (e.target.classList.contains('btn-check-task')) {
        TodoStorage.remove(e.target.dataset.id, function () {
            TodoStorage.all(renderTasks)
        })
    }
}

setTimeout(function () {
    taskList().addEventListener('click', onBtnCheckTaskClick)

    newTaskInput().addEventListener('keypress', onNewTaskInputKeypress)

    TodoStorage.all(renderTasks)
}, 200)
