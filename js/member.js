const server_url = "https://bookmanagement-npfr8kno.b4a.run/api/books";
const server_url_two = "https://bookmanagement-npfr8kno.b4a.run/api/members";
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "login.html";
    return;
  }
  const logoutBtn = document.getElementById("logoutBtn");

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "login.html";
  });
  const username = localStorage.getItem("username");
  if (username) {
    document.getElementById("username").textContent = username;
  }

  initializeBooks();
  initializeHistory();
  const deleteMember = document.getElementById("deleteMyaccount");
  deleteMember.addEventListener("click", async (e) => {
    const obj = {
      user_id: localStorage.getItem("user_id"),
    };
    e.preventDefault();
    if (
      confirm(
        "Are you sure you want to delete this account? this action will be redirected to sign up page."
      )
    ) {
      const response = await fetch(`${server_url_two}/delete/account`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(obj),
      });
      const data = await response.json();
      const librarianMessage = document.getElementById("librarienMessage");
      if (response && response.ok) {
        localStorage.removeItem("token");
        window.location.href = "signup.html";
      } else {
        librarianMessage.innerHTML = `<div class="alert alert-successs">Failed</div>`;
      }
    }
  });
});
async function initializeBooks() {
  const token = localStorage.getItem("token");
  const booksTableBody = document.querySelector("#available-booksTable tbody");
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
         <button class="btn btn-sm btn-warning me-2" onclick = "borrowOrReturnBook('${
           book._id
         }','${book.title}','Borrowed')" ${
        book.status === "Borrowed" ? "disabled" : ""
      }>Borrow</button>
          <button class="btn btn-sm btn-danger" onclick ="borrowOrReturnBook('${
            book._id
          }','${book.title}','Available')" ${
        book.status === "Available" ? "disabled" : ""
      }>Return</button>
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
function borrowOrReturnBook(id, title, status) {
  let user_id = localStorage.getItem("user_id");
  let username = localStorage.getItem("username");
  let obj = {
    status: status,
    user_id: user_id,
    title: title,
    username: username,
  };
  if (confirm(`Are you sure you want to change status of this book`)) {
    fetch(`${server_url}/borrow-or-return/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(obj),
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        const librarianMessage = document.getElementById("Membermessage");

        if (data.meassage) {
          librarianMessage.innerHTML = `<div classs="alert alert-success">Status updated successfully</div>`;
          initializeBooks();
          initializeHistory();
        } else {
          librarianMessage.innerHTML = `<div classs="alert alert-danger">This book is already borrowed by someone</div>`;
        }
      })
      .catch((err) => {
        console.log(err);

        const librarianMessage = document.getElementById("Membermessage");
        librarianMessage.innerHTML = `<div classs="alert alert-danger">An error occured</div>`;
      });
  }
}
async function initializeHistory() {
  const token = localStorage.getItem("token");
  const user_id = localStorage.getItem("user_id");
  let obj = { user_id: user_id };
  const booksTableBody = document.querySelector(
    "#borrowing-history-Table tbody"
  );
  booksTableBody.innerHTML = " ";
  const response = await fetch(`${server_url_two}/history`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(obj),
  });
  const books = await response.json();

  if (response && response.ok) {
    if (books.user.borrowedbooks && books.user.borrowedbooks.length) {
      books.user.borrowedbooks.forEach((book) => {
        const returnDate = book.returnedAt ? formateDate(book.returnedAt) : "";
        const borrowedDate = book.boorowedAt
          ? formateDate(book.boorowedAt)
          : "";
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${book.title}</td>
          <td>${borrowedDate}</td>
          <td>${returnDate}</td>
          `;
        booksTableBody.append(tr);
      });
    }
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
