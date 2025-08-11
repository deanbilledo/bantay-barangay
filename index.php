<?php
require_once 'includes/functions.php';

// Redirect logged-in users to dashboard
if (isLoggedIn()) {
    header('Location: pages/dashboard.php');
    exit;
}

include 'includes/header.php';
?>

<main class="container-fluid p-0">
    <!-- Hero Section -->
    <section class="bg-danger text-white py-5">
        <div class="container">
            <div class="row align-items-center">
                <div class="col-lg-6">
                    <h1 class="display-4 fw-bold mb-4">
                        <i class="bi bi-shield-exclamation"></i>
                        BantayBarangay Malagutay
                    </h1>
                    <p class="lead mb-4">
                        Your emergency response and disaster management system. 
                        Stay connected, stay safe, stay informed.
                    </p>
                    <div class="d-grid gap-2 d-md-flex">
                        <a href="pages/rescue-form.php" class="btn btn-warning btn-lg">
                            <i class="bi bi-plus-circle"></i> Request Emergency Help
                        </a>
                        <a href="login.php" class="btn btn-outline-light btn-lg">
                            <i class="bi bi-box-arrow-in-right"></i> Login
                        </a>
                    </div>
                </div>
                <div class="col-lg-6 text-center">
                    <i class="bi bi-geo-alt-fill" style="font-size: 8rem; opacity: 0.7;"></i>
                </div>
            </div>
        </div>
    </section>

    <!-- Quick Actions -->
    <section class="py-5">
        <div class="container">
            <h2 class="text-center mb-5">Emergency Services</h2>
            <div class="row g-4">
                <div class="col-md-4">
                    <div class="card h-100 text-center emergency-card">
                        <div class="card-body">
                            <i class="bi bi-telephone-fill text-danger" style="font-size: 3rem;"></i>
                            <h5 class="card-title mt-3">Emergency Hotline</h5>
                            <p class="card-text">Call for immediate emergency assistance</p>
                            <a href="tel:<?php echo EMERGENCY_HOTLINE; ?>" class="btn btn-danger btn-lg">
                                Call <?php echo EMERGENCY_HOTLINE; ?>
                            </a>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card h-100 text-center emergency-card">
                        <div class="card-body">
                            <i class="bi bi-plus-circle-fill text-warning" style="font-size: 3rem;"></i>
                            <h5 class="card-title mt-3">Request Rescue</h5>
                            <p class="card-text">Submit rescue request with location</p>
                            <a href="pages/rescue-form.php" class="btn btn-warning btn-lg">
                                Request Help
                            </a>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card h-100 text-center emergency-card">
                        <div class="card-body">
                            <i class="bi bi-megaphone-fill text-info" style="font-size: 3rem;"></i>
                            <h5 class="card-title mt-3">View Alerts</h5>
                            <p class="card-text">Check latest emergency alerts</p>
                            <a href="pages/alerts.php" class="btn btn-info btn-lg">
                                View Alerts
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Recent Alerts -->
    <section class="py-5 bg-light">
        <div class="container">
            <h2 class="text-center mb-4">Latest Emergency Alerts</h2>
            <div id="recentAlerts">
                <div class="text-center">
                    <div class="loading"></div>
                    <p>Loading alerts...</p>
                </div>
            </div>
        </div>
    </section>

    <!-- About Barangay Malagutay -->
    <section class="py-5">
        <div class="container">
            <div class="row">
                <div class="col-lg-8 mx-auto text-center">
                    <h2 class="mb-4">About Barangay Malagutay</h2>
                    <p class="lead">
                        Barangay Malagutay is committed to ensuring the safety and well-being of all residents. 
                        This disaster response system helps coordinate emergency services, rescue operations, 
                        and community alerts during natural disasters and emergencies.
                    </p>
                    <div class="row mt-5">
                        <div class="col-md-4">
                            <i class="bi bi-people-fill text-primary" style="font-size: 2rem;"></i>
                            <h5 class="mt-2">Community Focused</h5>
                            <p>Designed specifically for Malagutay residents</p>
                        </div>
                        <div class="col-md-4">
                            <i class="bi bi-phone-fill text-success" style="font-size: 2rem;"></i>
                            <h5 class="mt-2">Mobile Ready</h5>
                            <p>Works on any device, online or offline</p>
                        </div>
                        <div class="col-md-4">
                            <i class="bi bi-clock-fill text-warning" style="font-size: 2rem;"></i>
                            <h5 class="mt-2">24/7 Available</h5>
                            <p>Always ready for emergency situations</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</main>

<script>
// Load recent alerts
document.addEventListener('DOMContentLoaded', function() {
    fetch('api/get-alerts.php?limit=3')
        .then(response => response.json())
        .then(data => {
            const alertsContainer = document.getElementById('recentAlerts');
            if (data.success && data.alerts.length > 0) {
                alertsContainer.innerHTML = '';
                data.alerts.forEach(alert => {
                    const alertDiv = document.createElement('div');
                    alertDiv.className = `alert alert-${getSeverityClass(alert.severity)} mb-3`;
                    alertDiv.innerHTML = `
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="mb-1">${alert.title}</h6>
                                <p class="mb-1">${alert.message}</p>
                                <small>Type: ${alert.alert_type} | ${formatDate(alert.created_at)}</small>
                            </div>
                            <span class="badge bg-${getSeverityClass(alert.severity)}">${alert.severity}</span>
                        </div>
                    `;
                    alertsContainer.appendChild(alertDiv);
                });
            } else {
                alertsContainer.innerHTML = '<p class="text-center text-muted">No recent alerts</p>';
            }
        })
        .catch(error => {
            document.getElementById('recentAlerts').innerHTML = '<p class="text-center text-muted">Unable to load alerts</p>';
        });
});

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
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    });
}
</script>

<?php include 'includes/footer.php'; ?>
