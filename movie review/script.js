// ===== Global Variables =====
let currentRating = 0;
let reviews = [];
let activeFilter = 'all';
let activeSearch = '';
let sortBy = 'newest';
let currentImageData = '';

// ===== DOM Elements =====
const reviewForm = document.getElementById('reviewForm');
const starRating = document.getElementById('starRating');
const ratingText = document.getElementById('ratingText');
const reviewsContainer = document.getElementById('reviewsContainer');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const noReviews = document.getElementById('noReviews');
const noResults = document.getElementById('noResults');
const filterInfo = document.getElementById('filterInfo');
const filterText = document.getElementById('filterText');
const clearFilter = document.getElementById('clearFilter');
const sortBySelect = document.getElementById('sortBy');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
const fileUploadArea = document.getElementById('fileUploadArea');
const imageFileInput = document.getElementById('imageFile');
const imagePreview = document.getElementById('imagePreview');
const previewImg = document.getElementById('previewImg');
const removeImageBtn = document.getElementById('removeImage');

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    loadReviews();
    displayReviews();
    setupEventListeners();
    loadSampleReviews();
});

// ===== Event Listeners =====
function setupEventListeners() {
    // Star rating
    const stars = starRating.querySelectorAll('i');
    stars.forEach(star => {
        star.addEventListener('click', () => {
            currentRating = parseInt(star.dataset.rating);
            updateStars(currentRating);
        });

        star.addEventListener('mouseenter', () => {
            highlightStars(parseInt(star.dataset.rating));
        });
    });

    starRating.addEventListener('mouseleave', () => {
        highlightStars(currentRating);
    });

    // Form submission
    reviewForm.addEventListener('submit', handleFormSubmit);

    // Search
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });

    // Trending tags
    const tagBtns = document.querySelectorAll('.tag-btn');
    tagBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const searchTerm = btn.dataset.search;
            searchInput.value = searchTerm;
            performSearch();
            scrollToReviews();
        });
    });

    // Category filters
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            categoryCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            activeFilter = card.dataset.category;
            updateFilterInfo();
            displayReviews();
        });
    });

    // Footer category links
    const footerLinks = document.querySelectorAll('.footer-section a[data-category]');
    footerLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const category = link.dataset.category;
            activeFilter = category;
            const categoryCard = document.querySelector(`.category-card[data-category="${category}"]`);
            if (categoryCard) {
                categoryCards.forEach(c => c.classList.remove('active'));
                categoryCard.classList.add('active');
            }
            updateFilterInfo();
            displayReviews();
            scrollToReviews();
        });
    });

    // Sort
    sortBySelect.addEventListener('change', () => {
        sortBy = sortBySelect.value;
        displayReviews();
    });

    // Clear filter
    clearFilter.addEventListener('click', () => {
        activeFilter = 'all';
        activeSearch = '';
        searchInput.value = '';
        filterInfo.style.display = 'none';
        document.querySelectorAll('.category-card').forEach(c => c.classList.remove('active'));
        document.querySelector('.category-card[data-category="all"]').classList.add('active');
        displayReviews();
    });

    // Mobile nav toggle
    navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    // Close mobile nav when clicking a link
    const navLinksItems = navLinks.querySelectorAll('a');
    navLinksItems.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });

    // Clear search on input
    searchInput.addEventListener('input', () => {
        if (searchInput.value === '') {
            activeSearch = '';
            displayReviews();
        }
    });

    // Image upload tabs
    const uploadTabs = document.querySelectorAll('.upload-tab');
    const urlTab = document.getElementById('urlTab');
    const fileTab = document.getElementById('fileTab');

    uploadTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            uploadTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            if (tab.getAttribute('for') === 'urlTab') {
                urlTab.style.display = 'block';
                fileTab.style.display = 'none';
            } else {
                urlTab.style.display = 'none';
                fileTab.style.display = 'block';
            }
        });
    });

    // File upload area click
    fileUploadArea.addEventListener('click', () => {
        imageFileInput.click();
    });

    // File input change
    imageFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleImageFile(file);
        }
    });

    // Drag and drop
    fileUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileUploadArea.classList.add('dragover');
    });

    fileUploadArea.addEventListener('dragleave', () => {
        fileUploadArea.classList.remove('dragover');
    });

    fileUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        fileUploadArea.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleImageFile(file);
        }
    });

    // URL input change - show preview
    document.getElementById('imageUrl').addEventListener('input', (e) => {
        const url = e.target.value.trim();
        if (url) {
            currentImageData = url;
            showImagePreview(url);
        } else {
            currentImageData = '';
            hideImagePreview();
        }
    });

    // Remove image button
    removeImageBtn.addEventListener('click', () => {
        currentImageData = '';
        document.getElementById('imageUrl').value = '';
        imageFileInput.value = '';
        hideImagePreview();
    });
}

// ===== Image Handling Functions =====
function handleImageFile(file) {
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
        showToast('Image size must be less than 5MB!', 'error');
        return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
        showToast('Please select a valid image file!', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        currentImageData = e.target.result;
        showImagePreview(currentImageData);
    };
    reader.readAsDataURL(file);
}

function showImagePreview(imageSrc) {
    previewImg.src = imageSrc;
    imagePreview.style.display = 'block';
}

function hideImagePreview() {
    previewImg.src = '';
    imagePreview.style.display = 'none';
}

// ===== Star Rating Functions =====
function updateStars(rating) {
    const stars = starRating.querySelectorAll('i');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
    ratingText.textContent = `${rating} / 10`;
}

function highlightStars(rating) {
    const stars = starRating.querySelectorAll('i');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.style.color = 'var(--warning)';
        } else {
            star.style.color = '#444';
        }
    });
}

// ===== Form Submission =====
function handleFormSubmit(e) {
    e.preventDefault();

    if (currentRating === 0) {
        showToast('Please select a rating!', 'error');
        return;
    }

    const title = document.getElementById('title').value.trim();
    const category = document.getElementById('category').value;
    const genre = document.getElementById('genre').value.trim();
    const reviewerName = document.getElementById('reviewerName').value.trim();
    const reviewText = document.getElementById('reviewText').value.trim();

    if (!title || !category || !reviewerName || !reviewText) {
        showToast('Please fill in all required fields!', 'error');
        return;
    }

    const newReview = {
        id: Date.now(),
        title,
        category,
        genre,
        imageUrl: currentImageData,
        rating: currentRating,
        reviewerName,
        reviewText,
        date: new Date().toISOString(),
        likes: 0,
        comments: []
    };

    reviews.unshift(newReview);
    saveReviews();
    displayReviews();
    reviewForm.reset();
    currentRating = 0;
    currentImageData = '';
    updateStars(0);
    hideImagePreview();
    
    showToast('Review submitted successfully!');
    scrollToReviews();
}

// ===== Review Display =====
function displayReviews() {
    let filteredReviews = [...reviews];

    // Apply category filter
    if (activeFilter !== 'all') {
        filteredReviews = filteredReviews.filter(review => review.category === activeFilter);
    }

    // Apply search
    if (activeSearch) {
        const searchLower = activeSearch.toLowerCase();
        filteredReviews = filteredReviews.filter(review => 
            review.title.toLowerCase().includes(searchLower) ||
            review.reviewText.toLowerCase().includes(searchLower) ||
            review.reviewerName.toLowerCase().includes(searchLower) ||
            (review.genre && review.genre.toLowerCase().includes(searchLower)) ||
            review.category.toLowerCase().includes(searchLower)
        );
    }

    // Apply sorting
    switch (sortBy) {
        case 'newest':
            filteredReviews.sort((a, b) => new Date(b.date) - new Date(a.date));
            break;
        case 'oldest':
            filteredReviews.sort((a, b) => new Date(a.date) - new Date(b.date));
            break;
        case 'highest':
            filteredReviews.sort((a, b) => b.rating - a.rating);
            break;
        case 'lowest':
            filteredReviews.sort((a, b) => a.rating - b.rating);
            break;
    }

    // Show/hide no results message
    if (filteredReviews.length === 0 && reviews.length > 0) {
        noReviews.style.display = 'none';
        noResults.style.display = 'block';
        reviewsContainer.innerHTML = '';
        return;
    } else if (reviews.length === 0) {
        noReviews.style.display = 'block';
        noResults.style.display = 'none';
        reviewsContainer.innerHTML = '';
        return;
    } else {
        noReviews.style.display = 'none';
        noResults.style.display = 'none';
    }

    // Render reviews
    reviewsContainer.innerHTML = filteredReviews.map(review => createReviewCard(review)).join('');

    // Add event listeners to review cards
    setupReviewEventListeners();
}

function createReviewCard(review) {
    const date = new Date(review.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    const initials = review.reviewerName.split(' ').map(n => n[0]).join('').toUpperCase();
    const stars = generateStars(review.rating);
    const categoryClass = review.category;
    const categoryLabel = review.category.charAt(0).toUpperCase() + review.category.slice(1);

    const imageHTML = review.imageUrl 
        ? `<div class="review-image"><img src="${escapeHtml(review.imageUrl)}" alt="${escapeHtml(review.title)}" onerror="this.style.display='none'; this.parentElement.innerHTML='<i class=\\'fas fa-film placeholder-icon\\'></i>'"></div>`
        : `<div class="review-image"><i class="fas fa-film placeholder-icon"></i></div>`;

    const commentsHTML = review.comments && review.comments.length > 0 
        ? review.comments.map(comment => `
            <div class="comment">
                <div class="comment-header">
                    <span class="comment-author">${escapeHtml(comment.author)}</span>
                    <span class="comment-date">${new Date(comment.date).toLocaleDateString()}</span>
                </div>
                <p class="comment-text">${escapeHtml(comment.text)}</p>
            </div>
        `).join('')
        : '<p style="color: var(--text-muted); font-size: 0.85rem; text-align: center; padding: 0.5rem;">No comments yet</p>';

    return `
        <div class="review-card" data-id="${review.id}">
            ${imageHTML}
            <div class="review-header">
                <div class="review-title-section">
                    <h3 class="review-title">${escapeHtml(review.title)}</h3>
                    <span class="review-category ${categoryClass}">${categoryLabel}</span>
                </div>
                <div class="review-rating">
                    <span class="rating-badge">${review.rating}/10</span>
                </div>
            </div>
            
            ${review.genre ? `<p class="review-genre"><i class="fas fa-tag"></i> ${escapeHtml(review.genre)}</p>` : ''}
            
            <p class="review-text" id="review-text-${review.id}">${escapeHtml(review.reviewText)}</p>
            <button class="read-more" id="read-more-${review.id}" onclick="toggleReviewText(${review.id})">Read More</button>
            
            <div class="review-footer">
                <div class="reviewer-info">
                    <div class="reviewer-avatar">${initials}</div>
                    <div>
                        <div class="reviewer-name">${escapeHtml(review.reviewerName)}</div>
                        <div class="review-date">${date}</div>
                    </div>
                </div>
                
                <div class="review-actions">
                    <button class="action-btn like-btn" data-id="${review.id}" title="Like">
                        <i class="fas fa-heart"></i> ${review.likes || 0}
                    </button>
                    <button class="action-btn comment-toggle-btn" data-id="${review.id}" title="Comments">
                        <i class="fas fa-comment"></i>
                    </button>
                    <button class="action-btn delete-btn" data-id="${review.id}" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            
            <div class="comments-section" id="comments-section-${review.id}">
                <div class="comments-list" id="comments-list-${review.id}">
                    ${commentsHTML}
                </div>
                <form class="comment-form" data-id="${review.id}">
                    <input type="text" placeholder="Add a comment..." class="comment-input" required>
                    <button type="submit"><i class="fas fa-paper-plane"></i></button>
                </form>
            </div>
        </div>
    `;
}

function generateStars(rating) {
    let starsHTML = '';
    for (let i = 1; i <= 10; i++) {
        if (i <= rating) {
            starsHTML += '<i class="fas fa-star"></i>';
        } else {
            starsHTML += '<i class="fas fa-star empty"></i>';
        }
    }
    return starsHTML;
}

function setupReviewEventListeners() {
    // Like buttons
    const likeBtns = document.querySelectorAll('.like-btn');
    likeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const reviewId = parseInt(btn.dataset.id);
            const review = reviews.find(r => r.id === reviewId);
            if (review) {
                review.likes = (review.likes || 0) + 1;
                saveReviews();
                displayReviews();
            }
        });
    });

    // Delete buttons
    const deleteBtns = document.querySelectorAll('.delete-btn');
    deleteBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this review?')) {
                const reviewId = parseInt(btn.dataset.id);
                reviews = reviews.filter(r => r.id !== reviewId);
                saveReviews();
                displayReviews();
                showToast('Review deleted!');
            }
        });
    });

    // Comment toggle buttons
    const commentToggleBtns = document.querySelectorAll('.comment-toggle-btn');
    commentToggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const reviewId = parseInt(btn.dataset.id);
            const commentsSection = document.getElementById(`comments-section-${reviewId}`);
            commentsSection.classList.toggle('visible');
        });
    });

    // Comment forms
    const commentForms = document.querySelectorAll('.comment-form');
    commentForms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const reviewId = parseInt(form.dataset.id);
            const input = form.querySelector('.comment-input');
            const commentText = input.value.trim();

            if (commentText) {
                const review = reviews.find(r => r.id === reviewId);
                if (review) {
                    if (!review.comments) review.comments = [];
                    review.comments.push({
                        author: 'Anonymous',
                        text: commentText,
                        date: new Date().toISOString()
                    });
                    saveReviews();
                    displayReviews();
                    
                    // Keep comments section open
                    setTimeout(() => {
                        const commentsSection = document.getElementById(`comments-section-${reviewId}`);
                        if (commentsSection) {
                            commentsSection.classList.add('visible');
                        }
                    }, 100);
                    
                    showToast('Comment added!');
                }
            }
        });
    });
}

// ===== Toggle Review Text =====
function toggleReviewText(reviewId) {
    const reviewText = document.getElementById(`review-text-${reviewId}`);
    const readMoreBtn = document.getElementById(`read-more-${reviewId}`);
    
    reviewText.classList.toggle('expanded');
    
    if (reviewText.classList.contains('expanded')) {
        readMoreBtn.textContent = 'Show Less';
    } else {
        readMoreBtn.textContent = 'Read More';
    }
}

// ===== Search Function =====
function performSearch() {
    activeSearch = searchInput.value.trim();
    
    if (activeSearch) {
        filterText.innerHTML = `Showing results for "<strong>${escapeHtml(activeSearch)}</strong>"`;
        filterInfo.style.display = 'flex';
    } else {
        filterInfo.style.display = 'none';
    }
    
    displayReviews();
    scrollToReviews();
}

// ===== Filter Info =====
function updateFilterInfo() {
    if (activeFilter !== 'all') {
        const categoryLabel = activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1);
        filterText.innerHTML = `Filtering by: <strong>${categoryLabel}</strong>`;
        filterInfo.style.display = 'flex';
    } else {
        filterInfo.style.display = 'none';
    }
}

// ===== Scroll to Reviews =====
function scrollToReviews() {
    setTimeout(() => {
        document.getElementById('reviews').scrollIntoView({ behavior: 'smooth' });
    }, 100);
}

// ===== LocalStorage Functions =====
function saveReviews() {
    localStorage.setItem('cinereview_reviews', JSON.stringify(reviews));
}

function loadReviews() {
    const stored = localStorage.getItem('cinereview_reviews');
    if (stored) {
        reviews = JSON.parse(stored);
    }
}

function loadSampleReviews() {
    if (reviews.length === 0) {
        reviews = [
            {
                id: 1,
                title: 'Attack on Titan',
                category: 'anime',
                genre: 'Action, Drama, Fantasy',
                imageUrl: 'https://image.tmdb.org/t/p/w500/9Vr4VrbGTl3SM2j3dLm9XQsL5Vh.jpg',
                rating: 10,
                reviewerName: 'Anime Fan',
                reviewText: 'Absolutely masterpiece! The storytelling, character development, and plot twists are phenomenal. Every episode keeps you on the edge of your seat. The animation quality is top-notch and the soundtrack perfectly complements every scene.',
                date: new Date(Date.now() - 86400000 * 2).toISOString(),
                likes: 15,
                comments: [
                    { author: 'John', text: 'Totally agree! Best anime ever!', date: new Date(Date.now() - 3600000).toISOString() }
                ]
            },
            {
                id: 2,
                title: 'The Shawshank Redemption',
                category: 'movie',
                genre: 'Drama',
                imageUrl: 'https://image.tmdb.org/t/p/w500/9cjIGRQL5jLOTYZxJWsTq9IkVnv.jpg',
                rating: 10,
                reviewerName: 'Movie Buff',
                reviewText: 'A timeless classic that never gets old. The performances by Tim Robbins and Morgan Freeman are exceptional. This movie teaches us about hope, friendship, and perseverance. A must-watch for everyone!',
                date: new Date(Date.now() - 86400000 * 5).toISOString(),
                likes: 23,
                comments: []
            },
            {
                id: 3,
                title: 'One Piece',
                category: 'manga',
                genre: 'Adventure, Comedy, Action',
                imageUrl: 'https://image.tmdb.org/t/p/w500/e3NBGiAifW9Xt8xD5tpARskjccO.jpg',
                rating: 9,
                reviewerName: 'Manga Reader',
                reviewText: 'Eiichiro Oda has created an incredible world with amazing world-building. The character arcs are deep and meaningful. While the pacing can be slow at times, the payoff is always worth it. Highly recommended!',
                date: new Date(Date.now() - 86400000 * 7).toISOString(),
                likes: 18,
                comments: []
            },
            {
                id: 4,
                title: 'Spider-Man: Into the Spider-Verse',
                category: 'cartoon',
                genre: 'Animation, Action, Adventure',
                imageUrl: 'https://image.tmdb.org/t/p/w500/xnopI5Xtkysf0PhZ3Yn69hhOrAf.jpg',
                rating: 9,
                reviewerName: 'Cartoon Lover',
                reviewText: 'Revolutionary animation style that brings comic books to life. The story is engaging, the humor is on point, and the message about anyone being able to wear the mask is powerful. A new classic in animation!',
                date: new Date(Date.now() - 86400000 * 10).toISOString(),
                likes: 12,
                comments: []
            },
            {
                id: 5,
                title: 'Breaking Bad',
                category: 'series',
                genre: 'Crime, Drama, Thriller',
                imageUrl: 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjotRGRE.jpg',
                rating: 10,
                reviewerName: 'Series Addict',
                reviewText: 'One of the greatest TV series ever made. Walter White\'s transformation from a mild-mannered teacher to a ruthless drug lord is captivating. Every season is better than the last. Bryan Cranston deserves all the awards!',
                date: new Date(Date.now() - 86400000 * 14).toISOString(),
                likes: 27,
                comments: []
            },
            {
                id: 6,
                title: 'Our Planet',
                category: 'documentary',
                genre: 'Nature, Documentary',
                imageUrl: 'https://image.tmdb.org/t/p/w500/lH%20x2eJHLOl4o6UCYJoSKGEgXQ.jpg',
                rating: 8,
                reviewerName: 'Nature Enthusiast',
                reviewText: 'Breathtaking cinematography showcasing the beauty of our natural world. David Attenborough\'s narration is soothing and informative. Makes you appreciate nature and want to protect our environment.',
                date: new Date(Date.now() - 86400000 * 20).toISOString(),
                likes: 9,
                comments: []
            }
        ];
        saveReviews();
    }
}

// ===== Utility Functions =====
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i> ${message}`;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
