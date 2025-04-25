// Filter functionality
document.addEventListener('DOMContentLoaded', function() {
    // Get all filter checkboxes and price range inputs
    const filterCheckboxes = document.querySelectorAll('.filter-list input[type="checkbox"]');
    const priceMin = document.querySelector('#price-min');
    const priceMax = document.querySelector('#price-max');
    const priceRange = document.querySelector('#price-range');

    // Get all product/sensor items
    const items = document.querySelectorAll('.product-card, .sensor-item');

    // Function to update filters
    function updateFilters() {
        // Get selected categories
        const selectedCategories = Array.from(document.querySelectorAll('.filter-list input[name="category"]:checked'))
            .map(checkbox => checkbox.value);

        // Get selected brands
        const selectedBrands = Array.from(document.querySelectorAll('.filter-list input[name="brand"]:checked'))
            .map(checkbox => checkbox.value);

        // Get price range
        const minPrice = parseFloat(priceMin.value) || 0;
        const maxPrice = parseFloat(priceMax.value) || Infinity;

        // Filter items
        items.forEach(item => {
            const category = item.dataset.category;
            const brand = item.dataset.brand;
            const price = parseFloat(item.dataset.price.replace('₹', '').replace(',', ''));

            const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(category);
            const brandMatch = selectedBrands.length === 0 || selectedBrands.includes(brand);
            const priceMatch = price >= minPrice && price <= maxPrice;

            if (categoryMatch && brandMatch && priceMatch) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        });
    }

    // Add event listeners
    filterCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateFilters);
    });

    if (priceRange) {
        priceRange.addEventListener('input', function() {
            priceMin.value = this.value;
            updateFilters();
        });
    }

    if (priceMin) {
        priceMin.addEventListener('change', updateFilters);
    }

    if (priceMax) {
        priceMax.addEventListener('change', updateFilters);
    }

    // Initialize sorting functionality
    const sortSelect = document.querySelector('#sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            const sortBy = this.value;
            const itemsArray = Array.from(items);
            
            itemsArray.sort((a, b) => {
                const priceA = parseFloat(a.dataset.price.replace('₹', '').replace(',', ''));
                const priceB = parseFloat(b.dataset.price.replace('₹', '').replace(',', ''));
                
                if (sortBy === 'price-low-high') {
                    return priceA - priceB;
                } else if (sortBy === 'price-high-low') {
                    return priceB - priceA;
                }
            });

            const container = document.querySelector('.products-grid, .sensor-items');
            itemsArray.forEach(item => container.appendChild(item));
        });
    }
}); 