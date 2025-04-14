const registerBtn = document.getElementById('register');
const container = document.getElementById('container');
const loginBtn = document.getElementById('toggleLoginBtn');

registerBtn.addEventListener('click', ()=> {
    container.classList.add("active");
}  
);

toggleLoginBtn.addEventListener('click', ()=> {
    container.classList.remove("active");
}  
);
