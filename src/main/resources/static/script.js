// globals (yay vanilla javascript ftw)
fetchBlogs();
loginCheck();
document.getElementById("login-form").addEventListener("submit", onLoginSubmit);
document.getElementById("logout-form").addEventListener("submit", onLogoutSubmit);
document.getElementById("blog-form").addEventListener("submit", onBlogSubmit);

function withErrorHandler(errorElemId, promise) {
    const errorElem = document.getElementById(errorElemId);
    errorElem.classList.add("hidden");
    promise.catch((error) => {
        errorElem.textContent = error;
        errorElem.classList.remove("hidden");
    });
}

function onLoginSubmit(event) {
    const username = event.target[0].value;
    const password = event.target[1].value;
    event.preventDefault();
    withErrorHandler("login-error",
        fetch("/api/user/login", {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({username, password}),
        }).then(filterOk)
            .then(response => response.json())
            .then(response => {
                window.sessionStorage.setItem("token", response.token)
                window.sessionStorage.setItem("fullname", response.fullname)
            })
            .then(() => loginCheck())
    );
}

function onLogoutSubmit(event) {
    event.preventDefault();
    fetch("/logout")
        .then(() => window.sessionStorage.removeItem("fullname"))
        .then(() => loginCheck());
}

function onBlogSubmit(event) {
    const data = {"title": event.target[0].value, "body": event.target[1].value}
    event.preventDefault();

    withErrorHandler("new-blog-error",
        fetch("/api/blog", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${window.sessionStorage.getItem("token")}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        }).then(filterOk)
            .then(() => fetchBlogs())
            .then(() => event.target.reset())
    );
}

// switch display based on login status
function loginCheck() {
    const fullname = window.sessionStorage.getItem("fullname") || "anonymous";
    let authentic = fullname !== "anonymous"
    document.getElementById("login-form").parentElement.hidden = authentic;
    document.getElementById("logout-form").parentElement.hidden = !authentic;
    document.getElementById("username").innerText = fullname;
}

function fetchBlogs() {
    fetch("/api/blog")
        .then(filterOk)
        .then(response => response.json())
        .then(page => renderBlogs(page.content));
}

function renderBlogs(blogs) {
    // We use DOM operations here to avoid injections like XSS and other fun issues.
    const blogDiv = document.getElementById("blog-container");

    const newBlogChildren = blogs.map((blog) => {
        const blogWrapper = document.createElement("div");
        const title = document.createElement("h2");

        title.textContent = blog.title;
        blogWrapper.appendChild(title);
        const createdAt = document.createElement("p");

        createdAt.textContent = renderUtcTime(blog.createdAt);
        blogWrapper.appendChild(createdAt);
        const body = document.createElement("p");

        body.textContent = blog.body;
        blogWrapper.appendChild(body);
        return blogWrapper;
    });

    blogDiv.replaceChildren(...newBlogChildren);
}

function renderUtcTime(time) {
    const date = new Date(time);
    const pad = (s) => s.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

async function filterOk(response) {
    if (response.ok) {
        return response;
    }
    if (response.status === 400) {
        return Promise.reject("Invalid input")
    }
    if (response.status === 403 || response.status === 401) {
        return Promise.reject("No permissions")
    }
    return Promise.reject(await response.text());
}
