document.addEventListener('DOMContentLoaded', function() {
    loadRecentRequests();
    loadRecentAlerts();
    
    // Create Alert Form
    const createAlertForm = document.getElementById('createAlertForm');
    if (createAlertForm) {
        createAlertForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(createAlertForm);
            
            fetch('../api/create-alert.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Alert created successfully!');
                    createAlertForm.reset();
                    const modal = bootstrap.Modal.getInstance(document.getElementById('createAlertModal'));
                    modal.hide();
                    loadRecentAlerts();
                } else {
                    alert('Failed to create alert: ' + (data.error || 'Unknown error'));
                }
            })
            .catch(error => {
                alert('Network error. Please try again.');
            });
        });
    }
    
    // Auto-refresh data every 30 seconds
    setInterval(() => {
        loadRecentRequests();
        loadRecentAlerts();
    }, 30000);
});

function loadRecentRequests() {
    fetch('../api/get-rescue-requests.php?limit=5')
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('recentRequests');
            
            if (data.success && data.requests.length > 0) {
                container.innerHTML = '';
                data.requests.forEach(request => {
                    const requestDiv = document.createElement('div');
                    requestDiv.className = 'emergency-card p-3 mb-2';
                    requestDiv.innerHTML = `
                        <div class="d-flex justify-content-between align-items-start">
                            <div class="flex-grow-1">
                                <h6 class="mb-1">${request.name}</h6>
                                <p class="mb-1 text-muted small">${request.emergency_type} - ${request.address}</p>
                                <small class="text-muted">${formatDate(request.created_at)}</small>
                            </div>
                            <div class="text-end">
                                <span class="badge bg-${getStatusColor(request.status)}">${request.status}</span>
                                ${request.contact ? `<br><small><a href="tel:${request.contact}" class="text-decoration-none">${request.contact}</a></small>` : ''}
                            </div>
                        </div>
                        ${request.description ? `<p class="mb-0 mt-2 small text-muted">${request.description}</p>` : ''}
                    `;
                    container.appendChild(requestDiv);
                });
                
                // Add view all link
                const viewAllDiv = document.createElement('div');
                viewAllDiv.className = 'text-center mt-3';
                viewAllDiv.innerHTML = '<a href="reports.php" class="btn btn-outline-primary btn-sm">View All Requests</a>';
                container.appendChild(viewAllDiv);
            } else {
                container.innerHTML = '<p class="text-center text-muted">No recent rescue requests</p>';
            }
        })
        .catch(error => {
            document.getElementById('recentRequests').innerHTML = '<p class="text-center text-muted">Unable to load requests</p>';
        });
}

function loadRecentAlerts() {
    fetch('../api/get-alerts.php?limit=5')
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('recentAlerts');
            
            if (data.success && data.alerts.length > 0) {
                container.innerHTML = '';
                data.alerts.forEach(alert => {
                    const alertDiv = document.createElement('div');
                    alertDiv.className = `alert alert-${getSeverityClass(alert.severity)} p-2 mb-2`;
                    alertDiv.innerHTML = `
                        <h6 class="mb-1">${alert.title}</h6>
                        <p class="mb-1 small">${alert.message}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <small>${alert.alert_type}</small>
                            <small>${formatDate(alert.created_at)}</small>
                        </div>
                    `;
                    container.appendChild(alertDiv);
                });
                
                // Add view all link
                const viewAllDiv = document.createElement('div');
                viewAllDiv.className = 'text-center mt-3';
                viewAllDiv.innerHTML = '<a href="alerts.php" class="btn btn-outline-info btn-sm">View All Alerts</a>';
                container.appendChild(viewAllDiv);
            } else {
                container.innerHTML = '<p class="text-center text-muted">No recent alerts</p>';
            }
        })
        .catch(error => {
            document.getElementById('recentAlerts').innerHTML = '<p class="text-center text-muted">Unable to load alerts</p>';
        });
}

function getStatusColor(status) {
    switch(status) {
        case 'pending': return 'warning';
        case 'acknowledged': return 'info';
        case 'in_progress': return 'primary';
        case 'completed': return 'success';
        default: return 'secondary';
    }
}

function getSeverityClass(severity) {
    switch(severity) {
        case 'watch': return 'warning';
        case 'warning': return 'danger';
        case 'critical': return 'dark';
        default: return 'info';
    }
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    });
}
