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

document.addEventListener('DOMContentLoaded', function () {
  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

document.addEventListener('DOMContentLoaded', function () {
  const searchForm = document.getElementById('searchBook');
  searchForm.addEventListener('submit', function (event) {
    event.preventDefault();
    searchBooks();
  });
});

function addBook() {
  const title = document.getElementById('inputBookTitle').value;
  const author = document.getElementById('inputBookAuthor').value;
  const year = parseInt(document.getElementById('inputBookYear').value, 10);
  const isCompleted = document.getElementById('inputBookIsComplete').checked;

  const generatedID = generateId();
  const bookObject = generateBookObject(generatedID, title, author, year, isCompleted);
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
  resetFormData();

  Swal.fire({
    title: 'Berhasil!',
    text: 'Buku berhasil ditambahkan',
    icon: 'success',
    confirmButtonColor: '#0855E7',
  });
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

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
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

    const editButton = document.createElement('button');
    const wrapperEditButton = document.createElement('div');
    wrapperEditButton.classList.add('edit_button');
    wrapperEditButton.append(editButton);

    editButton.addEventListener('click', function () {
      editBook(bookObject.id);
    });

    const trashButton = document.createElement('button');
    const wrapperTrashButton = document.createElement('div');
    wrapperTrashButton.classList.add('trash_button');
    wrapperTrashButton.append(trashButton);

    trashButton.addEventListener('click', function () {
      removeBookFromCompleted(bookObject.id);
    });

    wrapper.append(wrapperUndoButton, wrapperEditButton, wrapperTrashButton);
  } else {
    const editButton = document.createElement('button');
    const wrapperEditButton = document.createElement('div');
    wrapperEditButton.classList.add('edit_button');
    wrapperEditButton.append(editButton);

    editButton.addEventListener('click', function () {
      editBook(bookObject.id);
    });

    const checkButton = document.createElement('button');
    const wrapperCheckButton = document.createElement('div');
    wrapperCheckButton.classList.add('check_button');
    wrapperCheckButton.append(checkButton);

    checkButton.addEventListener('click', function () {
      addBookToCompleted(bookObject.id);
    });

    wrapper.append(wrapperEditButton, wrapperCheckButton)
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
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  Swal.fire({
    title: 'Konfirmasi',
    text: 'Apakah Anda yakin ingin menghapus buku ini?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ya, Hapus!',
    cancelButtonText: 'Batal',
    cancelButtonColor: '#EB5353',
    confirmButtonColor: '#0855E7',
  }).then((result) => {
    if (result.isConfirmed) {
      const bookIndex = findBookIndex(bookId);

      if (bookIndex !== -1) {
        books.splice(bookIndex, 1);

        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
      }
    }
  });
}

function undoBookFromCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function editBook(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  Swal.fire({
    title: 'Edit Book',
    html:
      `<input id="swal-input1" class="swal2-input" value="${bookTarget.title}" placeholder="Title">` +
      `<input id="swal-input2" class="swal2-input" value="${bookTarget.author}" placeholder="Author">` +
      `<input id="swal-input3" class="swal2-input" value="${bookTarget.year}" placeholder="Year">`,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'Simpan',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#0855E7',
    cancelButtonColor: '#EB5353',
    preConfirm: () => {
      const newTitle = Swal.getPopup().querySelector('#swal-input1').value;
      const newAuthor = Swal.getPopup().querySelector('#swal-input2').value;
      const newYear = parseInt(Swal.getPopup().querySelector('#swal-input3').value, 10);

      if (!newTitle || !newAuthor || !newYear) {
        Swal.showValidationMessage('Please fill in all fields');
      }

      return { newTitle, newAuthor, newYear };
    }
  }).then((result) => {
    if (result.isConfirmed) {
      bookTarget.title = result.value.newTitle;
      bookTarget.author = result.value.newAuthor;
      bookTarget.year = result.value.newYear;

      document.dispatchEvent(new Event(RENDER_EVENT));
      saveData();
    }
  });
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

function searchBooks() {
  const searchTitleInput = document.getElementById('searchBookTitle');
  const searchTitle = searchTitleInput.value.toLowerCase();

  const searchResults = books.filter(book => {
    const title = book.title.toLowerCase();
    return title.includes(searchTitle);
  });

  displaySearchResults(searchResults);
}

function displaySearchResults(results) {
  const uncompletedBookshelfList = document.getElementById('uncompleteBookshelfList');
  const completedBookshelfList = document.getElementById('completeBookshelfList');

  uncompletedBookshelfList.innerHTML = '';
  completedBookshelfList.innerHTML = '';

  if (results.length === 0) {
    const noResultsMessage = document.createElement('p');
    noResultsMessage.textContent = 'No results found.';
    uncompletedBookshelfList.append(noResultsMessage);
  } else {
    results.forEach(result => {
      const resultElement = makeBook(result);
      if (result.isCompleted) {
        completedBookshelfList.append(resultElement);
      } else {
        uncompletedBookshelfList.append(resultElement);
      }
    });
  }
}

function resetFormData() {
  document.getElementById('inputBookTitle').value = '';
  document.getElementById('inputBookAuthor').value = '';
  document.getElementById('inputBookYear').value = '';
  document.getElementById('inputBookIsComplete').checked = false;
}