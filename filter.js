document.addEventListener('DOMContentLoaded', function () {
    const filterButtons = document.querySelectorAll('.filter-options');
    const activeFilters = new Set();
    const searchInput = document.getElementById('search');
    const locationSelect = document.getElementById('location');
    const hostelItems = document.querySelectorAll('.residency-info');
    const hostelContainer = document.querySelector('.hostel-info');

    let selectedFiltersDiv = document.querySelector('.selected-filters');
    if (!selectedFiltersDiv) {
        selectedFiltersDiv = document.createElement('div');
        selectedFiltersDiv.className = 'selected-filters';
        document.querySelector('.dropdown-content').appendChild(selectedFiltersDiv);
    }

    let applyButton = document.getElementById('apply-filters');
    if (!applyButton) {
        applyButton = document.createElement('button');
        applyButton.id = 'apply-filters';
        applyButton.textContent = 'Apply Filters';
        document.querySelector('.dropdown-content').appendChild(applyButton);
    }

    function removeExtraBrTags(container) {
        container.querySelectorAll('br').forEach(br => br.remove());
    }

    filterButtons.forEach(button => {
        button.addEventListener('click', function () {
            const filterValue = this.value;
            this.classList.toggle('active');

            if (this.classList.contains('active')) {
                activeFilters.add(filterValue);
                const chip = document.createElement('div');
                chip.className = 'filter-chip';
                chip.dataset.filter = filterValue;
                chip.innerHTML = this.textContent + ' <span>&times;</span>';

                chip.querySelector('span').addEventListener('click', function () {
                    const filterToRemove = this.parentElement.dataset.filter;
                    document.querySelector(`.filter-options[value="${filterToRemove}"]`).classList.remove('active');
                    activeFilters.delete(filterToRemove);
                    this.parentElement.remove();
                    applyFilters();
                });

                selectedFiltersDiv.appendChild(chip);
            } else {
                activeFilters.delete(filterValue);
                const chipToRemove = document.querySelector(`.filter-chip[data-filter="${filterValue}"]`);
                if (chipToRemove) {
                    chipToRemove.remove();
                }
            }
        });
    });

    applyButton.addEventListener('click', function () {
        applyFilters();
        document.querySelector('.dropdown-content').style.display = 'none';
        setTimeout(() => {
            document.querySelector('.dropdown-content').style.removeProperty('display');
        }, 10);
    });

    searchInput.addEventListener('input', applyFilters);
    locationSelect.addEventListener('change', applyFilters);

    function applyFilters() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedLocation = locationSelect.value;
        removeExtraBrTags(hostelContainer);

        hostelItems.forEach(hostel => {
            const description = hostel.querySelector('.description').textContent.toLowerCase();
            let shouldShow = true;

            if (searchTerm && !description.includes(searchTerm)) {
                shouldShow = false;
            }

            if (selectedLocation !== 'all' && !description.includes(getFullLocationName(selectedLocation).toLowerCase())) {
                shouldShow = false;
            }

            if (activeFilters.size > 0) {
                if (activeFilters.has('men') && !description.includes('boys')) {
                    shouldShow = false;
                }

                if (activeFilters.has('women') && !description.includes('girls') && !description.includes('women')) {
                    shouldShow = false;
                }

                if (activeFilters.has('coliving') && !description.includes('co-living')) {
                    shouldShow = false;
                }
            }

            hostel.style.display = shouldShow ? 'grid' : 'none';
        });

        const visibleHostels = Array.from(hostelItems).filter(item => item.style.display !== 'none');

        if (activeFilters.has('price')) {
            sortHostelsByPrice(visibleHostels, true);
        }

        if (activeFilters.has('sharing')) {
            sortHostelsBySharing(visibleHostels, true);
        }

        if (activeFilters.has('rating')) {
            sortHostelsByRating(visibleHostels, false);
        }
    }

    function getFullLocationName(code) {
        const locations = {
            'hyd': 'Hyderabad',
            'bng': 'Bangalore',
            'che': 'Chennai',
            'mumbai': 'Mumbai',
            'del': 'Delhi'
        };
        return locations[code] || code;
    }

    function sortHostelsByPrice(hostels, ascending = true) {
        removeExtraBrTags(hostelContainer);
        hostels.sort((a, b) => (extractPrice(a) - extractPrice(b)) * (ascending ? 1 : -1));
        hostels.forEach(hostel => hostelContainer.appendChild(hostel));
    }

    function sortHostelsBySharing(hostels, ascending = true) {
        removeExtraBrTags(hostelContainer);
        hostels.sort((a, b) => (extractSharing(a) - extractSharing(b)) * (ascending ? 1 : -1));
        hostels.forEach(hostel => hostelContainer.appendChild(hostel));
    }

    function sortHostelsByRating(hostels, ascending = true) {
        removeExtraBrTags(hostelContainer);
        hostels.sort((a, b) => (extractRating(a) - extractRating(b)) * (ascending ? 1 : -1));
        hostels.forEach(hostel => hostelContainer.appendChild(hostel));
    }

    function extractPrice(hostel) {
        const description = hostel.querySelector('.description').textContent;
        const priceMatch = description.match(/Price\s*:\s*₹\s*([\d,]+)/i);
        return priceMatch ? parseInt(priceMatch[1].replace(/,/g, '')) : 0;
    }

    function extractSharing(hostel) {
        const description = hostel.querySelector('.description').textContent;
        const sharingMatch = description.match(/Sharing\s*:\s*(\d+)-(\d+)/i);
        return sharingMatch ? parseInt(sharingMatch[1]) : 0;
    }

    function extractRating(hostel) {
        const description = hostel.querySelector('.description').textContent;
        const ratingMatch = description.match(/Rating\s*:\s*(\d+(\.\d+)?)/i);
        return ratingMatch ? parseFloat(ratingMatch[1]) : 0;
    }

    if (!Array.from(locationSelect.options).some(option => option.value === 'all')) {
        const allOption = document.createElement('option');
        allOption.value = 'all';
        allOption.textContent = 'All Locations';
        locationSelect.insertBefore(allOption, locationSelect.firstChild);
        locationSelect.value = 'all';
    }
});
