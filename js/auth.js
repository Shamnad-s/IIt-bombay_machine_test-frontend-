const server_url = "https://bookmanagement-npfr8kno.b4a.run/api/auth";

document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById("signupForm");
  if (signupForm) {
    try {
      signupForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();
        const role = document.getElementById("role").value.trim();
        const response = await fetch(`${server_url}/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password, role }),
        });

        const data = await response.json();
        const signupMessage = document.getElementById("signupMessage");

        if (response && response.ok) {
          localStorage.setItem("token", data.token);
          const decodedToken = parseJwt(data.token);

          localStorage.setItem("user_id", decodedToken._id);
          localStorage.setItem("username", decodedToken.username);
          if (decodedToken.role == "Librarian") {
            window.location.href = "librarian_dashboard.html";
          } else if (decodedToken.role == "Member") {
            window.location.href = "member_dashboard.html";
          } else {
            signupMessage.innerHTML = `<div class="alert-danger">${data.message}</div>`;
          }
        } else {
          signupMessage.innerHTML = `<div class="alert-danger">${data.message}</div>`;
        }
      });
    } catch (error) {
      console.log(error);
    }
  }

  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    try {
      loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const username = document.getElementById("loginUsername").value.trim();
        const password = document.getElementById("loginPassword").value.trim();

        const response = await fetch(`${server_url}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });

        const data = await response.json();
        const loginMessage = document.getElementById("loginMessage");

        if (response && response.ok) {
          localStorage.setItem("token", data.token);
          const decodedToken = parseJwt(data.token);

          localStorage.setItem("user_id", decodedToken._id);
          localStorage.setItem("username", decodedToken.username);
          if (decodedToken.role == "Librarian") {
            window.location.href = "librarian_dashboard.html";
          } else {
            window.location.href = "member_dashboard.html";
          }
        } else {
          loginMessage.innerHTML = `<div class="alert-danger">${data.message}</div>`;
        }
      });
    } catch (error) {
      console.log(error);
      return;
    }
  }
});

function parseJwt(token) {
  try {
    const baseurl = token.split(".")[1];
    const base64 = baseurl.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return error;
  }
}
