document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('rescueForm');
    const getLocationBtn = document.getElementById('getLocation');
    const locationInput = document.getElementById('location');

    // Get GPS location
    if (getLocationBtn) {
        getLocationBtn.addEventListener('click', function () {
            if ('geolocation' in navigator) {
                getLocationBtn.disabled = true;
                getLocationBtn.innerHTML = '<i class="bi bi-geo-alt"></i> Getting...';
                
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const lat = position.coords.latitude;
                        const lng = position.coords.longitude;
                        locationInput.value = `${lat},${lng}`;
                        
                        getLocationBtn.innerHTML = '<i class="bi bi-check"></i> Location Set';
                        getLocationBtn.className = 'btn btn-success';
                        
                        // Show accuracy info
                        const accuracy = Math.round(position.coords.accuracy);
                        const accuracyInfo = document.createElement('div');
                        accuracyInfo.className = 'form-text text-success';
                        accuracyInfo.innerHTML = `<i class="bi bi-check-circle"></i> Location captured (±${accuracy}m accuracy)`;
                        locationInput.parentNode.appendChild(accuracyInfo);
                        
                        setTimeout(() => {
                            getLocationBtn.disabled = false;
                            getLocationBtn.innerHTML = '<i class="bi bi-geo-alt"></i> Update Location';
                            getLocationBtn.className = 'btn btn-outline-primary';
                        }, 3000);
                    },
                    (error) => {
                        let errorMessage = 'Unable to get location.';
                        
                        switch(error.code) {
                            case error.PERMISSION_DENIED:
                                errorMessage = 'Location access denied. Please allow location access.';
                                break;
                            case error.POSITION_UNAVAILABLE:
                                errorMessage = 'Location information unavailable.';
                                break;
                            case error.TIMEOUT:
                                errorMessage = 'Location request timed out.';
                                break;
                        }
                        
                        alert(errorMessage);
                        getLocationBtn.innerHTML = '<i class="bi bi-geo-alt"></i> Try Again';
                        getLocationBtn.disabled = false;
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 60000
                    }
                );
            } else {
                alert('Geolocation is not supported by this browser.');
            }
        });
    }

    // Form validation and submission
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            
            if (!form.checkValidity()) {
                form.classList.add('was-validated');
                return;
            }
            
            // Show loading state
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span class="loading"></span> Submitting...';
            submitBtn.disabled = true;
            
            // Submit form
            const formData = new FormData(form);
            
            fetch(form.action || window.location.href, {
                method: 'POST',
                body: formData
            })
            .then(response => response.text())
            .then(data => {
                // Reload page to show result
                window.location.reload();
            })
            .catch(error => {
                alert('Network error. Please check your connection and try again.');
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            });
        });
    }

    // Auto-save form data to localStorage (for offline capability)
    const formElements = form ? form.querySelectorAll('input, select, textarea') : [];
    formElements.forEach(element => {
        // Load saved data
        const savedValue = localStorage.getItem(`rescue_form_${element.name}`);
        if (savedValue && !element.value) {
            element.value = savedValue;
        }
        
        // Save data on change
        element.addEventListener('change', function() {
            localStorage.setItem(`rescue_form_${element.name}`, element.value);
        });
    });

    // Clear saved data on successful submission
    if (window.location.search.includes('success=1')) {
        formElements.forEach(element => {
            localStorage.removeItem(`rescue_form_${element.name}`);
        });
    }

    // Photo preview
    const photoInput = document.getElementById('photo');
    if (photoInput) {
        photoInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                // Check file size (5MB limit)
                if (file.size > 5 * 1024 * 1024) {
                    alert('File size must be less than 5MB');
                    e.target.value = '';
                    return;
                }
                
                // Show preview
                const reader = new FileReader();
                reader.onload = function(e) {
                    let preview = document.getElementById('photoPreview');
                    if (!preview) {
                        preview = document.createElement('div');
                        preview.id = 'photoPreview';
                        preview.className = 'mt-2';
                        photoInput.parentNode.appendChild(preview);
                    }
                    preview.innerHTML = `
                        <img src="${e.target.result}" class="img-thumbnail" style="max-height: 200px;">
                        <div class="form-text">Photo ready for upload</div>
                    `;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Network status monitoring
    function updateOnlineStatus() {
        const offlineIndicator = document.querySelector('.offline-indicator');
        if (!offlineIndicator) {
            const indicator = document.createElement('div');
            indicator.className = 'offline-indicator';
            indicator.innerHTML = '<i class="bi bi-wifi-off"></i> You are offline. Your request will be saved and sent when you reconnect.';
            document.body.prepend(indicator);
        }
        
        const indicator = document.querySelector('.offline-indicator');
        if (navigator.onLine) {
            indicator.classList.remove('show');
        } else {
            indicator.classList.add('show');
        }
    }

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();
});
