<?php
require_once '../includes/functions.php';
requireLogin();

$currentUser = getCurrentUser();
$isAdmin = hasRole('admin');
$isOfficial = hasRole('official') || $isAdmin;

// Get dashboard statistics
$stats = [];

// Total rescue requests
$result = $conn->query("SELECT COUNT(*) as total FROM rescue_requests");
$stats['total_requests'] = $result->fetch_assoc()['total'];

// Pending requests
$result = $conn->query("SELECT COUNT(*) as pending FROM rescue_requests WHERE status = 'pending'");
$stats['pending_requests'] = $result->fetch_assoc()['pending'];

// Active alerts
$result = $conn->query("SELECT COUNT(*) as active FROM alerts WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)");
$stats['active_alerts'] = $result->fetch_assoc()['active'];

// Completed requests today
$result = $conn->query("SELECT COUNT(*) as completed FROM rescue_requests WHERE status = 'completed' AND DATE(created_at) = CURDATE()");
$stats['completed_today'] = $result->fetch_assoc()['completed'];

include '../includes/header.php';
?>

<main class="container py-4">
    <!-- Welcome Section -->
    <div class="row mb-4">
        <div class="col-12">
            <div class="card bg-primary text-white">
                <div class="card-body">
                    <h4 class="card-title">
                        <i class="bi bi-speedometer2"></i>
                        Welcome, <?php echo sanitizeInput($currentUser['username']); ?>!
                    </h4>
                    <p class="card-text mb-0">
                        Role: <?php echo ucfirst($currentUser['role']); ?> | 
                        Last login: <?php echo formatDate($currentUser['last_login'] ?? date('Y-m-d H:i:s')); ?>
                    </p>
                </div>
            </div>
        </div>
    </div>

    <!-- Statistics Cards -->
    <div class="row mb-4">
        <div class="col-md-3 col-sm-6 mb-3">
            <div class="stat-card danger">
                <div class="d-flex justify-content-between">
                    <div>
                        <h3 class="mb-0"><?php echo $stats['pending_requests']; ?></h3>
                        <p class="mb-0">Pending Requests</p>
                    </div>
                    <i class="bi bi-exclamation-triangle" style="font-size: 2rem;"></i>
                </div>
            </div>
        </div>
        <div class="col-md-3 col-sm-6 mb-3">
            <div class="stat-card warning">
                <div class="d-flex justify-content-between">
                    <div>
                        <h3 class="mb-0"><?php echo $stats['active_alerts']; ?></h3>
                        <p class="mb-0">Active Alerts</p>
                    </div>
                    <i class="bi bi-megaphone" style="font-size: 2rem;"></i>
                </div>
            </div>
        </div>
        <div class="col-md-3 col-sm-6 mb-3">
            <div class="stat-card success">
                <div class="d-flex justify-content-between">
                    <div>
                        <h3 class="mb-0"><?php echo $stats['completed_today']; ?></h3>
                        <p class="mb-0">Completed Today</p>
                    </div>
                    <i class="bi bi-check-circle" style="font-size: 2rem;"></i>
                </div>
            </div>
        </div>
        <div class="col-md-3 col-sm-6 mb-3">
            <div class="stat-card">
                <div class="d-flex justify-content-between">
                    <div>
                        <h3 class="mb-0"><?php echo $stats['total_requests']; ?></h3>
                        <p class="mb-0">Total Requests</p>
                    </div>
                    <i class="bi bi-bar-chart" style="font-size: 2rem;"></i>
                </div>
            </div>
        </div>
    </div>

    <!-- Quick Actions -->
    <div class="row mb-4">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h5 class="mb-0"><i class="bi bi-lightning-charge"></i> Quick Actions</h5>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-3 col-sm-6 mb-2">
                            <a href="rescue-form.php" class="btn btn-warning w-100">
                                <i class="bi bi-plus-circle"></i><br>
                                Request Help
                            </a>
                        </div>
                        <div class="col-md-3 col-sm-6 mb-2">
                            <a href="alerts.php" class="btn btn-info w-100">
                                <i class="bi bi-megaphone"></i><br>
                                View Alerts
                            </a>
                        </div>
                        <div class="col-md-3 col-sm-6 mb-2">
                            <a href="map.php" class="btn btn-success w-100">
                                <i class="bi bi-geo-alt"></i><br>
                                Emergency Map
                            </a>
                        </div>
                        <?php if ($isOfficial): ?>
                        <div class="col-md-3 col-sm-6 mb-2">
                            <a href="reports.php" class="btn btn-primary w-100">
                                <i class="bi bi-bar-chart"></i><br>
                                Reports
                            </a>
                        </div>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="row">
        <!-- Recent Rescue Requests -->
        <div class="col-lg-8 mb-4">
            <div class="card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="mb-0"><i class="bi bi-list-task"></i> Recent Rescue Requests</h5>
                    <?php if ($isOfficial): ?>
                    <a href="#" class="btn btn-sm btn-primary" data-bs-toggle="modal" data-bs-target="#createAlertModal">
                        <i class="bi bi-plus"></i> Create Alert
                    </a>
                    <?php endif; ?>
                </div>
                <div class="card-body">
                    <div id="recentRequests">
                        <div class="text-center">
                            <div class="loading"></div>
                            <p>Loading rescue requests...</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Recent Alerts -->
        <div class="col-lg-4 mb-4">
            <div class="card">
                <div class="card-header">
                    <h5 class="mb-0"><i class="bi bi-megaphone"></i> Latest Alerts</h5>
                </div>
                <div class="card-body">
                    <div id="recentAlerts">
                        <div class="text-center">
                            <div class="loading"></div>
                            <p>Loading alerts...</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</main>

<!-- Create Alert Modal (for officials) -->
<?php if ($isOfficial): ?>
<div class="modal fade" id="createAlertModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Create Emergency Alert</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form id="createAlertForm">
                <div class="modal-body">
                    <div class="mb-3">
                        <label for="alertTitle" class="form-label">Alert Title *</label>
                        <input type="text" class="form-control" id="alertTitle" name="title" required>
                    </div>
                    <div class="mb-3">
                        <label for="alertMessage" class="form-label">Message *</label>
                        <textarea class="form-control" id="alertMessage" name="message" rows="3" required></textarea>
                    </div>
                    <div class="row">
                        <div class="col-6">
                            <label for="alertType" class="form-label">Type</label>
                            <select class="form-select" id="alertType" name="alert_type" required>
                                <option value="flood">Flood</option>
                                <option value="landslide">Landslide</option>
                                <option value="storm">Storm</option>
                                <option value="general">General</option>
                            </select>
                        </div>
                        <div class="col-6">
                            <label for="alertSeverity" class="form-label">Severity</label>
                            <select class="form-select" id="alertSeverity" name="severity" required>
                                <option value="watch">Watch</option>
                                <option value="warning">Warning</option>
                                <option value="critical">Critical</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-danger">Create Alert</button>
                </div>
            </form>
        </div>
    </div>
</div>
<?php endif; ?>

<script src="../assets/js/dashboard.js"></script>

<?php include '../includes/footer.php'; ?>
