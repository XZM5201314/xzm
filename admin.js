class AdminPanel {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.checkAdminAccess();
        this.initializeEventListeners();
        this.loadData();
        this.currentEditingId = null;
        this.currentCarouselEditingId = null;
        this.initializeImageUpload();
    }

    checkAdminAccess() {
        if (!this.currentUser || this.currentUser.role !== 'admin') {
            window.location.href = 'login.html';
        }
    }

    initializeEventListeners() {
        document.querySelectorAll('.admin-nav a').forEach(link => {
            link.addEventListener('click', (e) => this.handleNavigation(e));
        });

        document.getElementById('logoutBtn').addEventListener('click', () => this.handleLogout());

        document.getElementById('newArticleBtn').addEventListener('click', () => this.openArticleDialog());
        document.getElementById('articleForm').addEventListener('submit', (e) => this.handleArticleSubmit(e));

        document.getElementById('newCarouselBtn').addEventListener('click', () => this.openCarouselDialog());
        document.getElementById('carouselForm').addEventListener('submit', (e) => this.handleCarouselSubmit(e));
    }

    handleNavigation(e) {
        e.preventDefault();
        const target = e.target.getAttribute('href').substring(1);
        
        document.querySelectorAll('.admin-nav a').forEach(link => {
            link.classList.remove('active');
        });
        e.target.classList.add('active');

        document.getElementById('articles-section').style.display = 
            target === 'articles' ? 'block' : 'none';
        document.getElementById('users-section').style.display = 
            target === 'users' ? 'block' : 'none';
        document.getElementById('comments-section').style.display = 
            target === 'comments' ? 'block' : 'none';
    }

    handleLogout() {
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    }

    loadData() {
        this.loadCarousel();
        this.loadArticles();
        this.loadUsers();
        this.loadComments();
    }

    loadUsers() {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const usersList = document.querySelector('.users-list');
        usersList.innerHTML = '';

        users.forEach(user => {
            if (user.role !== 'admin') {
                const userItem = document.createElement('div');
                userItem.className = 'user-item';
                userItem.innerHTML = `
                    <div>
                        <strong>${user.username}</strong>
                        <span>${user.phone}</span>
                    </div>
                    <button class="delete-btn" data-phone="${user.phone}">删除</button>
                `;
                usersList.appendChild(userItem);
            }
        });

        // 添加删除用户事件监听
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.deleteUser(e.target.dataset.phone));
        });
    }

    loadComments() {
        const comments = JSON.parse(localStorage.getItem('comments')) || [];
        const commentsList = document.querySelector('.comments-list');
        commentsList.innerHTML = '';

        comments.forEach(comment => {
            const commentItem = document.createElement('div');
            commentItem.className = 'comment-item';
            commentItem.innerHTML = `
                <div>
                    <strong>${comment.author}</strong>
                    <p>${comment.content}</p>
                    <small>${comment.date}</small>
                </div>
                <button class="delete-btn" data-id="${comment.id}">删除</button>
            `;
            commentsList.appendChild(commentItem);
        });

        // 添加删除评论事件监听
        document.querySelectorAll('.comments-list .delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.deleteComment(e.target.dataset.id));
        });
    }

    deleteUser(phone) {
        if (confirm('确定要删除该用户吗？')) {
            let users = JSON.parse(localStorage.getItem('users')) || [];
            users = users.filter(user => user.phone !== phone);
            localStorage.setItem('users', JSON.stringify(users));
            this.loadUsers();
        }
    }

    deleteComment(commentId) {
        if (confirm('确定要删除该评论吗？')) {
            let comments = JSON.parse(localStorage.getItem('comments')) || [];
            comments = comments.filter(comment => comment.id !== commentId);
            localStorage.setItem('comments', JSON.stringify(comments));
            this.loadComments();
        }
    }

    loadArticles() {
        const articles = JSON.parse(localStorage.getItem('articles')) || [];
        const articlesList = document.querySelector('.articles-list');
        articlesList.innerHTML = '';

        articles.forEach(article => {
            const articleItem = document.createElement('div');
            articleItem.className = 'article-item';
            articleItem.innerHTML = `
                <div class="article-header">
                    <span class="article-title">${article.title}</span>
                    <div class="article-actions">
                        <button class="edit-btn" data-id="${article.id}">编辑</button>
                        <button class="delete-btn" data-id="${article.id}">删除</button>
                    </div>
                </div>
                <div class="article-meta">
                    <span>分类：${article.category}</span>
                    <span>发布时间：${article.date}</span>
                </div>
                <p class="article-summary">${article.summary}</p>
            `;
            articlesList.appendChild(articleItem);
        });

        // 添加编辑和删除事件监听
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.editArticle(e.target.dataset.id));
        });

        document.querySelectorAll('.articles-list .delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.deleteArticle(e.target.dataset.id));
        });
    }

    openArticleDialog(article = null) {
        const dialog = document.getElementById('articleDialog');
        const form = document.getElementById('articleForm');
        const title = document.getElementById('dialogTitle');

        if (article) {
            title.textContent = '编辑文章';
            this.currentEditingId = article.id;
            // 填充表单
            document.getElementById('articleTitle').value = article.title;
            document.getElementById('articleCategory').value = article.category;
            document.getElementById('articleSummary').value = article.summary;
            document.getElementById('articleContent').value = article.content;
            document.getElementById('articleImage').value = article.image;
        } else {
            title.textContent = '新建文章';
            this.currentEditingId = null;
            form.reset();
        }

        dialog.style.display = 'flex';
    }

    closeArticleDialog() {
        document.getElementById('articleDialog').style.display = 'none';
        this.currentEditingId = null;
    }

    handleArticleSubmit(e) {
        e.preventDefault();
        const formData = {
            title: document.getElementById('articleTitle').value,
            category: document.getElementById('articleCategory').value,
            summary: document.getElementById('articleSummary').value,
            content: document.getElementById('articleContent').value,
            image: document.getElementById('articleImage').value,
            date: new Date().toISOString().split('T')[0],
            id: this.currentEditingId || Date.now().toString()
        };

        let articles = JSON.parse(localStorage.getItem('articles')) || [];

        if (this.currentEditingId) {
            // 编辑现有文章
            articles = articles.map(article => 
                article.id === this.currentEditingId ? {...formData} : article
            );
        } else {
            // 添加新文章
            articles.unshift(formData);
        }

        localStorage.setItem('articles', JSON.stringify(articles));
        this.closeArticleDialog();
        this.loadArticles();
    }

    editArticle(id) {
        const articles = JSON.parse(localStorage.getItem('articles')) || [];
        const article = articles.find(a => a.id === id);
        if (article) {
            this.openArticleDialog(article);
        }
    }

    deleteArticle(id) {
        if (confirm('确定要删除这篇文章吗？')) {
            let articles = JSON.parse(localStorage.getItem('articles')) || [];
            articles = articles.filter(article => article.id !== id);
            localStorage.setItem('articles', JSON.stringify(articles));
            this.loadArticles();
        }
    }

    loadCarousel() {
        const carouselImages = JSON.parse(localStorage.getItem('carouselImages')) || [];
        const carouselList = document.querySelector('.carousel-list');
        carouselList.innerHTML = '';

        carouselImages.sort((a, b) => a.order - b.order).forEach(image => {
            const imageItem = document.createElement('div');
            imageItem.className = 'carousel-item';
            imageItem.innerHTML = `
                <div class="carousel-preview">
                    <img src="${image.url}" alt="${image.caption}">
                </div>
                <div class="carousel-info">
                    <span class="carousel-caption">${image.caption}</span>
                    <span class="carousel-order">顺序: ${image.order}</span>
                    <div class="carousel-actions">
                        <button class="edit-btn" data-id="${image.id}">编辑</button>
                        <button class="delete-btn" data-id="${image.id}">删除</button>
                    </div>
                </div>
            `;
            carouselList.appendChild(imageItem);
        });

        // 添加编辑和删除事件监听
        document.querySelectorAll('.carousel-list .edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.editCarouselImage(e.target.dataset.id));
        });

        document.querySelectorAll('.carousel-list .delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.deleteCarouselImage(e.target.dataset.id));
        });
    }

    openCarouselDialog(image = null) {
        const dialog = document.getElementById('carouselDialog');
        const form = document.getElementById('carouselForm');
        const title = document.getElementById('carouselDialogTitle');
        const preview = document.getElementById('carouselImagePreview');

        if (image) {
            title.textContent = '编辑轮播图';
            this.currentCarouselEditingId = image.id;
            document.getElementById('carouselCaption').value = image.caption;
            document.getElementById('carouselOrder').value = image.order;
            
            // 显示现有图片
            preview.className = 'image-preview';
            preview.innerHTML = `<img src="${image.url}" alt="预览图">`;
            this.currentImageData = image.url;
        } else {
            title.textContent = '添加轮播图';
            this.currentCarouselEditingId = null;
            const images = JSON.parse(localStorage.getItem('carouselImages')) || [];
            const maxOrder = images.reduce((max, img) => Math.max(max, img.order), 0);
            document.getElementById('carouselOrder').value = maxOrder + 1;
            
            // 重置预览
            preview.className = 'image-preview empty';
            preview.textContent = '选择图片后在这里预览';
            this.currentImageData = null;
            form.reset();
        }

        dialog.style.display = 'flex';
    }

    handleCarouselSubmit(e) {
        e.preventDefault();
        
        if (!this.currentImageData) {
            alert('请选择图片');
            return;
        }

        const formData = {
            url: this.currentImageData,
            caption: document.getElementById('carouselCaption').value,
            order: parseInt(document.getElementById('carouselOrder').value),
            id: this.currentCarouselEditingId || Date.now().toString()
        };

        let carouselImages = JSON.parse(localStorage.getItem('carouselImages')) || [];

        if (this.currentCarouselEditingId) {
            carouselImages = carouselImages.map(image => 
                image.id === this.currentCarouselEditingId ? {...formData} : image
            );
        } else {
            carouselImages.push(formData);
        }

        localStorage.setItem('carouselImages', JSON.stringify(carouselImages));
        this.closeCarouselDialog();
        this.loadCarousel();
    }

    editCarouselImage(id) {
        const carouselImages = JSON.parse(localStorage.getItem('carouselImages')) || [];
        const image = carouselImages.find(img => img.id === id);
        if (image) {
            this.openCarouselDialog(image);
        }
    }

    deleteCarouselImage(id) {
        if (confirm('确定要删除这张轮播图吗？')) {
            let carouselImages = JSON.parse(localStorage.getItem('carouselImages')) || [];
            carouselImages = carouselImages.filter(image => image.id !== id);
            localStorage.setItem('carouselImages', JSON.stringify(carouselImages));
            this.loadCarousel();
        }
    }

    closeCarouselDialog() {
        document.getElementById('carouselDialog').style.display = 'none';
        this.currentCarouselEditingId = null;
        this.currentImageData = null;
        const preview = document.getElementById('carouselImagePreview');
        preview.className = 'image-preview empty';
        preview.textContent = '选择图片后在这里预览';
    }

    initializeImageUpload() {
        const imageInput = document.getElementById('carouselImage');
        const preview = document.getElementById('carouselImagePreview');
        preview.className = 'image-preview empty';
        preview.textContent = '选择图片后在这里预览';

        imageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                if (file.size > 5 * 1024 * 1024) { // 5MB 限制
                    alert('图片大小不能超过5MB');
                    imageInput.value = '';
                    preview.className = 'image-preview empty';
                    preview.textContent = '选择图片后在这里预览';
                    return;
                }

                const reader = new FileReader();
                reader.onload = (e) => {
                    preview.className = 'image-preview';
                    preview.innerHTML = `<img src="${e.target.result}" alt="预览图">`;
                    this.currentImageData = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

// 全局函数用于关闭对话框
function closeArticleDialog() {
    document.getElementById('articleDialog').style.display = 'none';
}

function closeCarouselDialog() {
    document.getElementById('carouselDialog').style.display = 'none';
}

// 初始化管理面板
new AdminPanel(); 