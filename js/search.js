// Search functionality
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.querySelector('.search-bar input');
    const searchButton = document.querySelector('.search-bar button');
    
    // Get all searchable items from different sections
    const items = [
        ...document.querySelectorAll('.category-card'),
        ...document.querySelectorAll('.icon-item'),
        ...document.querySelectorAll('.category-grid .category-card')
    ];

    function performSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        if (!searchTerm) {
            // If search is empty, show all items
            items.forEach(item => {
                item.style.display = '';
            });
            return;
        }

        items.forEach(item => {
            const title = item.querySelector('h3, span')?.textContent.toLowerCase() || '';
            const description = item.querySelector('p')?.textContent.toLowerCase() || '';
            
            if (title.includes(searchTerm) || description.includes(searchTerm)) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        });
    }

    // Search on button click
    searchButton.addEventListener('click', performSearch);

    // Search on Enter key press
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    // Clear search when input is empty
    searchInput.addEventListener('input', function() {
        if (this.value.trim() === '') {
            items.forEach(item => {
                item.style.display = '';
            });
        }
    });
}); 