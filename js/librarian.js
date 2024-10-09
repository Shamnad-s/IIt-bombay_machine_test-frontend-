// import bootstrap = require("bootstrap");

const server_url = "http://localhost:3000/api/books";
const server_url_two = "http://localhost:3000/api/members";
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "login.html";
    return;
  }
  const username = localStorage.getItem("username");
  if (username) {
    document.getElementById("username").textContent = username;
  }
  initializeBooks();
  getMembers();
  initializeHistory();

  const logoutBtn = document.getElementById("logoutBtn");

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "login.html";
  });
  const addBookForm = document.getElementById("addBookForm");
  addBookForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("bookTitle").value.trim();
    const author = document.getElementById("bookAuthor").value.trim();
    const response = await fetch(`${server_url}/generatebooks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, author }),
    });
    const data = await response.json();
    const librarianMessage = document.getElementById("librarienMessage");

    if (response && response.ok) {
      librarianMessage.innerHTML = `<div class="alert alert-successs">Book added successfully</div>`;
      addBookForm.reset();
      initializeBooks();
    } else {
      librarianMessage.innerHTML = `<div class="alert alert-successs">Failed</div>`;
    }
  });

  const addMemberForm = document.getElementById("addMemberForm");
  addMemberForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("memeberUsername").value.trim();
    const password = document.getElementById("memberPassword").value.trim();
    const response = await fetch(`${server_url_two}/add-new-mebers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    const librarianMessage = document.getElementById("librarienMessagesecond");

    if (response && response.ok) {
      librarianMessage.innerHTML = `<div class="alert alert-successs">${data.message}</div>`;
      addMemberForm.reset();
      getMembers();
    } else {
      librarianMessage.innerHTML = `<div class="alert alert-successs">${data.message}</div>`;
    }
  });
});
async function initializeBooks() {
  const token = localStorage.getItem("token");
  const booksTableBody = document.querySelector("#booksTable tbody");
  booksTableBody.innerHTML = " ";
  const response = await fetch(`${server_url}/getbooks`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  const books = await response.json();

  if (response && response.ok) {
    books.forEach((book) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
      <td>${book.title}</td>
      <td>${book.author}</td>
      <td>${book.status}</td>
      <td> 
       <button class="btn btn-sm btn-warning me-2" onclick = "editBook('${book._id}','${book.title}','${book.author}','${book.status}')">Edit</button>
        <button class="btn btn-sm btn-danger" onclick ="deleteBook('${book._id}')">Delete</button>
        </td>
      `;
      booksTableBody.append(tr);
    });
  } else {
    booksTableBody.innerHTML = ` <tr>
          <td colspan="4" class="text-danger">
            "Failed to load books"
          </td>
        </tr>`;
  }
}
function deleteBook(id) {
  if (confirm("Are you sure you want to delete this book?")) {
    fetch(`${server_url}/deletebook/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        const librarianMessage = document.getElementById("librarienMessage");

        if (data.meassage) {
          librarianMessage.innerHTML = `<div classs="alert alert-success">${data.meassage}</div>`;
          initializeBooks();
        } else {
          librarianMessage.innerHTML = `<div classs="alert alert-danger">Failed to delete</div>`;
        }
      })
      .catch((err) => {
        console.log(err);

        const librarianMessage = document.getElementById("librarienMessage");
        librarianMessage.innerHTML = `<div classs="alert alert-danger">An error occured</div>`;
      });
  }
}
function editBook(id, title, author, status) {
  document.getElementById("editTitle").value = title;
  document.getElementById("editAuthor").value = author;
  document.getElementById("editStatus").value = status;
  editUserForm.onsubmit = function (event) {
    event.preventDefault();
    const title = document.getElementById("editTitle").value;
    const author = document.getElementById("editAuthor").value;
    const status = document.getElementById("editStatus").value;

    const updateData = { title: title, author: author, status: status };

    fetch(`${server_url}/updatebook/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        const librarianMessage = document.getElementById("librarienMessage");

        if (data.meassage) {
          librarianMessage.innerHTML = `<div classs="alert alert-success">${data.meassage}</div>`;
          editBookModal.hide();
          initializeBooks();
        } else {
          librarianMessage.innerHTML = `<div classs="alert alert-danger">Failed to update</div>`;
          editBookModal.hide();
        }
      })
      .catch((err) => {
        console.log(err);

        const librarianMessage = document.getElementById("librarienMessage");
        librarianMessage.innerHTML = `<div classs="alert alert-danger">An error occured</div>`;
      });
  };
  const editBookModal = new bootstrap.Modal(
    document.getElementById("editBookModal")
  );
  editBookModal.show();
}
async function getMembers() {
  const token = localStorage.getItem("token");
  const memebersTablebody = document.querySelector("#membersTable tbody");
  memebersTablebody.innerHTML = " ";
  const response = await fetch(`${server_url_two}/get-all-mebers`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer${token}`,
    },
  });
  const members = await response.json();

  if (response && response.ok) {
    members.forEach((member) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${member.username}</td>
        <td>${member.isactive ? "Active" : "Deleted"}</td>
       
        <td> 
         <button class="btn btn-sm btn-warning me-2" onclick = "editUser('${
           member._id
         }','${member.username}','${member.isactive}')"  ${
        !member.isactive ? "disabled" : ""
      }>Edit</button>
          <button class="btn btn-sm btn-danger" onclick ="deleteUsers('${
            member._id
          }')" ${!member.isactive ? "disabled" : ""}>Delete</button>
          </td>
        `;
      memebersTablebody.append(tr);
    });
  }
}
function deleteUsers(id, username, isAactive) {
  if (confirm("Are you sure you want to delete this user?")) {
    fetch(`${server_url_two}/delete/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        const librarianMessage = document.getElementById("librarienMessage");

        if (data.message) {
          librarianMessage.innerHTML = `<div classs="alert alert-success">${data.message}</div>`;
          getMembers();
        } else {
          librarianMessage.innerHTML = `<div classs="alert alert-danger">Failed to delete</div>`;
        }
      })
      .catch((err) => {
        console.log(err);

        const librarianMessage = document.getElementById("librarienMessage");
        librarianMessage.innerHTML = `<div classs="alert alert-danger">An error occured</div>`;
      });
  }
}
function editUser(id, username, isActive) {
  document.getElementById("editUsername").value = username;
  document.getElementById("editIsActive").value = isActive ? "true" : "false";

  const editMemberForm = document.getElementById("editMemberForm");

  editMemberForm.onsubmit = function (event) {
    event.preventDefault();
    const username = document.getElementById("editUsername").value;
    const newPassword = document.getElementById("editPassword").value || null;
    const newIsactive =
      document.getElementById("editIsActive").value === "true";

    const updateData = { username: username, isactive: newIsactive };
    const editedModal = new bootstrap.Modal(
      document.getElementById("editMemberModal")
    );
    if (newPassword) {
      updateData.password = newPassword;
    }
    fetch(`${server_url_two}/update/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        const librarianMessage = document.getElementById("librarienMessage");
        if (data.meassage) {
          librarianMessage.innerHTML = `<div classs="alert alert-success">${data.meassage}</div>`;
          editMemberModal.hide();
          getMembers();
        } else {
          librarianMessage.innerHTML = `<div classs="alert alert-danger">Failed to update</div>`;
          editMemberModal.hide();
        }
      })
      .catch((err) => {
        console.log(err);

        const librarianMessage = document.getElementById("librarienMessage");
        librarianMessage.innerHTML = `<div classs="alert alert-danger">An error occured</div>`;
      });
  };
  const editMemberModal = new bootstrap.Modal(
    document.getElementById("editMemberModal")
  );
  editMemberModal.show();
}
async function initializeHistory() {
  const token = localStorage.getItem("token");
  const booksTableBody = document.querySelector("#hsitoryTable tbody");
  booksTableBody.innerHTML = " ";
  const response = await fetch(`${server_url_two}/hsitory`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  const books = await response.json();

  if (response && response.ok) {
    books.forEach((book) => {
      const returnDate = book.returnedAt ? formateDate(book.returnedAt) : "";
      const borrowedDate = book.boorowedAt ? formateDate(book.boorowedAt) : "";
      const tr = document.createElement("tr");
      tr.innerHTML = `
      <td>${book.username}</td>
      <td>${book.title}</td>
      <td>${borrowedDate}</td>
      <td>${returnDate}</td>
  
      `;
      booksTableBody.append(tr);
    });
  } else {
    booksTableBody.innerHTML = ` <tr>
          <td colspan="4" class="text-danger">
            "Failed to load books"
          </td>
        </tr>`;
  }
}
function formateDate(data) {
  const date = new Date(data);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}
