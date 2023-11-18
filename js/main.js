const books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOKSHELF_APPS';

document.addEventListener('DOMContentLoaded', function () {
  const submitForm = document.getElementById('inputBook');
  submitForm.addEventListener('submit', function (event) {
    event.preventDefault();
    addBook();
  });
});

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

document.addEventListener(RENDER_EVENT, function () {
  const uncompletedBookshelfList = document.getElementById('uncompleteBookshelfList');
  uncompletedBookshelfList.innerHTML = '';

  const completedBookshelfList = document.getElementById('completeBookshelfList');
  completedBookshelfList.innerHTML = '';

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);
    if (!bookItem.isCompleted) {
      uncompletedBookshelfList.append(bookElement);
    } else {
      completedBookshelfList.append(bookElement);
    }
  }
});

function addBook() {
  const title = document.getElementById('inputBookTitle').value;
  const author = document.getElementById('inputBookAuthor').value;
  const year = document.getElementById('inputBookYear').value;
  const isCompleted = document.getElementById('inputBookIsComplete').checked;

  const generatedID = generateId();
  const bookObject = generateBookObject(generatedID, title, author, year, isCompleted);
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isCompleted) {
  return {
    id,
    title,
    author,
    year,
    isCompleted
  }
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function isStorageExist() {
  if (typeof (Storage) === undefined) {
    alert('Your browser does not support local storage');
    return false;
  }
  return true;
}

function makeBook(bookObject) {
  const textTitle = document.createElement('h3');
  textTitle.innerText = bookObject.title;

  const textAuthor = document.createElement('h4');
  textAuthor.innerText = bookObject.author;

  const textYear = document.createElement('p');
  textYear.innerText = bookObject.year;

  const textWrapper = document.createElement('div');
  textWrapper.classList.add('book_info');
  textWrapper.append(textTitle, textAuthor, textYear);

  wrapper = document.createElement('article');
  wrapper.classList.add('book_item');
  wrapper.append(textWrapper);
  wrapper.setAttribute('id', `book_${bookObject.id}`);

  if (bookObject.isCompleted) {
    const undoButton = document.createElement('button');
    const wrapperUndoButton = document.createElement('div');
    wrapperUndoButton.classList.add('undo_button');
    wrapperUndoButton.append(undoButton);

    undoButton.addEventListener('click', function () {
      undoBookFromCompleted(bookObject.id);
    });

    const trashButton = document.createElement('button');
    const wrapperTrashButton = document.createElement('div');
    wrapperTrashButton.classList.add('trash_button');
    wrapperTrashButton.append(trashButton);

    trashButton.addEventListener('click', function () {
      removeBookFromCompleted(bookObject.id);
    });

    wrapper.append(wrapperUndoButton, wrapperTrashButton);
  } else {
    const checkButton = document.createElement('button');
    const wrapperCheckButton = document.createElement('div');
    wrapperCheckButton.classList.add('check_button');
    wrapperCheckButton.append(checkButton);

    checkButton.addEventListener('click', function () {
      addBookToCompleted(bookObject.id);
    });

    wrapper.append(wrapperCheckButton)
  }

  return wrapper;
}

function addBookToCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}


function removeBookFromCompleted(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function undoBookFromCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }

  return null;
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }

  return -1;
}