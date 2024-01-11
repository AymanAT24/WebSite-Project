

// Infinit Scrool //
// ToDo
let currentPage = 1;
let lastPage = 1;

window.addEventListener("scroll", function() {
let endOfPage = window.innerHeight + window.pageYOffset >= document.body.offsetHeight - 5;
console.log(endOfPage)

  if(endOfPage && currentPage < lastPage){
    // currentPage = currentPage ++;
    getPosts(false, currentPage++);
    console.log(currentPage,lastPage)
  }
})
// Infinit Scrool //

setupUi();
getPosts();
function getPosts(reload = true, page) {
  showLoader(true);
  axios
    .get(`https://tarmeezacademy.com/api/v1/posts?limit=4&page=${page}`)
    .then(function (response) {
      const posts = response.data.data;
      showLoader(false);
      // currentPage = response.data.meta.current_page;
      // console.log(currentPage)
      lastPage = response.data.meta.last_page;
      // console.log(lastPage)
      if (reload) {
        document.getElementById("posts").innerHTML = "";
      }
      for (post of posts) {
        let postTitle = "";
        if (post.title != null) {
          postTitle = post.title;
        }
        let user = getUser();
        let isMyPost = user != null && post.author.id == user.id;
        let editBtnContent = ``;
        let deleteBtnContent = ``;
        if (isMyPost) {
          deleteBtnContent = `<button  class="btn bg-danger text-white ms-1" data-bs-toggle="modal" data-bs-target="#delete-modal" onclick="deleteBtnClicked('${encodeURIComponent(
            JSON.stringify(post)
          )}')" style="float:right">Delete</button>`;
          editBtnContent = `<button class="btn bg-secondary text-white" data-bs-toggle="modal" data-bs-target="#edit-post" onclick="editBtnClicked('${encodeURIComponent(
            JSON.stringify(post)
          )}')" style="float:right">Edit</button>`;
        }
        let content = `
        <div id="posts">
          <div class="card shadow mb-5">
            <div class="card-header">
            <span style="cursor:pointer;" onclick="userClicked(${post.author.id})">
              <img src="${post.author.profile_image}" class="rounded-circle border border-3 profile" alt="">
              <b class="text-success">@${post.author.username}</b>
            </span>
              ${deleteBtnContent}
              ${editBtnContent}
            </div>
            <div class="card-body" style="cursor: pointer;" onclick="postClicked(${post.id})">
              <img class="w-100" src="${post.image}" alt="">
              <h6 class="card-title text-black-50 mt-1">${post.created_at}</h6>
              <h4>${postTitle}</h4>
              <p class="card-text">
                ${post.body}
              </p>
              <hr>
              <div>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pen" viewBox="0 0 16 16">
                  <path d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001m-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708l-1.585-1.585z"/>
                </svg>
                <span>(${post.comments_count})Comments <span id="post-tags-${post.id}"></span></span>
              </div>
            </div>
          </div>
        </div>
      `;
        document.getElementById("posts").innerHTML += content;
        const currentPostTag = `post-tags-${post.id}`;
        document.getElementById(currentPostTag).innerHTML = "";
        // console.log(currentPostTag);
        for (tag of post.tags) {
          // console.log(tag.name);
          let tagsContent = `<button id="post-tags" class="btn btn-sm rounded-5 tags"> ${tag.name} </button>`;
          document.getElementById(currentPostTag).innerHTML += tagsContent;
        }
      }
    });
    getUser();
}

function loginBtnClicked() {
  const username = document.getElementById("username-input").value;
  const password = document.getElementById("password-input").value;
  showLoader(true);
  axios
    .post("https://tarmeezacademy.com/api/v1/login", {
      username: username,
      password: password,
    })
    .then(function (response) {
      showLoader(false);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      showAlert("Logged In Successfully", "success");
      setTimeout(() => {
        window.location.reload();
      }, 900);
    })
    .catch(function (error) {
      const message = error.response.data.message;
      showAlert(message, "danger");
    });
  getUser();
}

function registerClicked() {
  const name = document.getElementById("register-name-input").value;
  const username = document.getElementById("register-username-input").value;
  const password = document.getElementById("register-password-input").value;
  const image = document.getElementById("register-image-input").files[0];
  let bodyFormData = new FormData();
  bodyFormData.append("name", name);
  bodyFormData.append("username", username);
  bodyFormData.append("password", password);
  bodyFormData.append("image", image);
  showLoader(true);
  axios({
    method: "post",
    url: "https://tarmeezacademy.com/api/v1/register",
    data: bodyFormData,
  })
    .then(function (response) {
      showLoader(false);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      showAlert("A New User Registered Succssfully", "success");
      setTimeout(() => {
        window.location.reload();
      }, 900);
    })
    .catch(function (error) {
      const message = error.response.data.message;
      showAlert(message, "danger");
    });

  getUser();
}

function logoutClicked() {
  localStorage.clear();
  showAlert("Logged Out Successfully", "success");
  setTimeout(() => {
    window.location.reload();
  }, 900);
}

function createAnewPost() {
  let title = document.getElementById("title-body-input").value;
  let body = document.getElementById("post-body-input").value;
  let image = document.getElementById("image-body-input").files[0];
  const token = localStorage.getItem("token");

  const formData = new FormData();

  formData.append("title", title);
  formData.append("body", body);
  formData.append("image", image);
  showLoader(true);
  axios({
    method: "post",
    url: "https://tarmeezacademy.com/api/v1/posts",
    data: formData,
    headers: { Authorization: `Bearer ${token}` },
  })
    .then(function (response) {
      //handle success
      // console.log(response);
      showLoader(false);
      showAlert("New Post Has Been Created Successfully", "success");
      getPosts();
        userPosts();
        showUser();
    })
    .catch(function (error) {
      //handle error
      showAlert(error.response.data.message, "danger");
    });
  // window.location.reload()
  getUser();

}

function setupUi() {
  const token = localStorage.getItem("token");

  const login = document.getElementById("login-btn");
  const register = document.getElementById("register-btn");
  const logout = document.getElementById("logout-btn");
  const addBtn = document.getElementById("add-btn");

  if (token != null) {
    login.style.visibility = "hidden";
    register.style.visibility = "hidden";
    logout.style.display = "block";
    addBtn.style.display = "fixed";
  } else {
    login.style.visibility = "visible";
    register.style.visibility = "visible";
    logout.style.display = "none";
    addBtn.style.display = "none";
  }
}

function showAlert(customMessage, type) {
  const alertPlaceholder = document.getElementById("success-alert");
  const appendAlert = (message, type) => {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = [
      `<div class="alert alert-${type} alert-dismissible" role="alert">`,
      `   <div>${message}</div>`,
      '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
      "</div>",
    ].join("");

    alertPlaceholder.append(wrapper);
  };
  appendAlert(customMessage, type);

}

function getUser() {
  let user = null 
  let userLocal = localStorage.getItem("user");
  if(userLocal != null){

    let navUser = document.getElementById("nav-username");
    user = JSON.parse(userLocal);
    navUser.innerHTML = user.name;
  
    let profileImage = document.getElementById("profile-img");
    profileImage.src = user.profile_image;
  }
  return user
}

function postClicked(postId) {

  window.location = `postDetailes.html?id=${postId}`
}



function editBtnClicked(postObj){
  let post = JSON.parse(decodeURIComponent(postObj)); 
  document.getElementById("title-edit-input").value = post.title;
  document.getElementById("body-edit-input").value = post.body;
  document.getElementById("post-id-input").value = post.id 
  // console.log(post.title)
}


function updateBtnClicked() {
  let postId = document.getElementById("post-id-input").value;
  let bodyEdit = document.getElementById("body-edit-input").value;
  let titleEdit = document.getElementById("title-edit-input").value;
  let imageEdit = document.getElementById("image-edit-input").files[0];
  const token = localStorage.getItem("token");
  let formData = new FormData();
  formData.append("body", bodyEdit);
  formData.append("title", titleEdit);
  formData.append("image", imageEdit);
  formData.append("_method", "put");
  showLoader(true);
  axios({
    method: "post",
    url: `https://tarmeezacademy.com/api/v1/posts/${postId}`,
    data: formData,
    headers: { Authorization: `Bearer ${token}` },
  })
    .then(function (response) {
      showLoader(false);
      //handle success
      // console.log(response);
      showAlert("The Post Has Been Updated Successfully", "success");
      getPosts();
    })
    .catch(function (error) {
      //handle error
      showAlert(error.response.data.message, "danger");
    });
  // window.location.reload()
  getUser();
  userPosts();
  showUser();
}

function deleteBtnClicked(postObj){
  let post = JSON.parse(decodeURIComponent(postObj)); 
  document.getElementById("delete-btn-input").value = post.id; 
}

function confirmBtnClicked() {
  let token = localStorage.getItem("token");
  let postId = document.getElementById("delete-btn-input").value;
  // console.log(postId);
  showLoader(true);
  axios({
    method: "delete",
    url: `https://tarmeezacademy.com/api/v1/posts/${postId}`,
    headers: { Authorization: `Bearer ${token}` },
  })
    .then(function (response) {
      //handle success
      // console.log(response);
      showLoader(false);
      showAlert("Post Has Been Deleted Successfully", "success");
    userPosts();
    showUser();
      getPosts()
    })
    .catch(function (error) {
      showAlert(error.response.data.message, "danger");
    });
};

function userClicked(userId){
  window.location = `profile.html?userid=${userId}`
}

function profileClicked(){
  let user = getUser()
  userId = user.id
  window.location = `profile.html?userid=${userId}`;
}

function showLoader(show=true){
  if(show){
    document.getElementById("loader").style.visibility = "visible"
  }else{
    document.getElementById("loader").style.visibility = "hidden";
  }
}