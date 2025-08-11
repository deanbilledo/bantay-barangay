<?php
require_once '../includes/functions.php';

include '../includes/header.php';

// Get alerts with filtering
$alert_type = $_GET['type'] ?? '';
$severity = $_GET['severity'] ?? '';

$where_conditions = [];
$params = [];
$types = '';

if (!empty($alert_type)) {
    $where_conditions[] = "alert_type = ?";
    $params[] = $alert_type;
    $types .= 's';
}

if (!empty($severity)) {
    $where_conditions[] = "severity = ?";
    $params[] = $severity;
    $types .= 's';
}

$where_clause = '';
if (!empty($where_conditions)) {
    $where_clause = 'WHERE ' . implode(' AND ', $where_conditions);
}

$sql = "SELECT * FROM alerts $where_clause ORDER BY created_at DESC LIMIT 50";
$stmt = $conn->prepare($sql);

if (!empty($params)) {
    $stmt->bind_param($types, ...$params);
}

$stmt->execute();
$alerts = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
?>

<main class="container py-4">
    <div class="row">
        <div class="col-12">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2><i class="bi bi-megaphone"></i> Emergency Alerts</h2>
                <?php if (hasRole('admin') || hasRole('official')): ?>
                <button class="btn btn-danger" data-bs-toggle="modal" data-bs-target="#createAlertModal">
                    <i class="bi bi-plus"></i> Create Alert
                </button>
                <?php endif; ?>
            </div>
            
            <!-- Filter Options -->
            <div class="card mb-4">
                <div class="card-body">
                    <form method="GET" class="row g-3">
                        <div class="col-md-4">
                            <label for="type" class="form-label">Alert Type</label>
                            <select class="form-select" id="type" name="type">
                                <option value="">All Types</option>
                                <option value="flood" <?php echo $alert_type === 'flood' ? 'selected' : ''; ?>>Flood</option>
                                <option value="landslide" <?php echo $alert_type === 'landslide' ? 'selected' : ''; ?>>Landslide</option>
                                <option value="storm" <?php echo $alert_type === 'storm' ? 'selected' : ''; ?>>Storm</option>
                                <option value="general" <?php echo $alert_type === 'general' ? 'selected' : ''; ?>>General</option>
                            </select>
                        </div>
                        <div class="col-md-4">
                            <label for="severity" class="form-label">Severity</label>
                            <select class="form-select" id="severity" name="severity">
                                <option value="">All Severities</option>
                                <option value="watch" <?php echo $severity === 'watch' ? 'selected' : ''; ?>>Watch</option>
                                <option value="warning" <?php echo $severity === 'warning' ? 'selected' : ''; ?>>Warning</option>
                                <option value="critical" <?php echo $severity === 'critical' ? 'selected' : ''; ?>>Critical</option>
                            </select>
                        </div>
                        <div class="col-md-4 d-flex align-items-end">
                            <button type="submit" class="btn btn-primary me-2">Filter</button>
                            <a href="alerts.php" class="btn btn-outline-secondary">Clear</a>
                        </div>
                    </form>
                </div>
            </div>
            
            <!-- Alerts List -->
            <div class="row">
                <?php if (empty($alerts)): ?>
                <div class="col-12">
                    <div class="alert alert-info text-center">
                        <i class="bi bi-info-circle"></i>
                        No alerts found matching your criteria.
                    </div>
                </div>
                <?php else: ?>
                <?php foreach ($alerts as $alert): ?>
                <div class="col-lg-6 mb-3">
                    <div class="card severity-<?php echo $alert['severity']; ?>">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h6 class="mb-0"><?php echo sanitizeInput($alert['title']); ?></h6>
                            <span class="badge bg-<?php echo getAlertSeverityColor($alert['severity']); ?>">
                                <?php echo ucfirst($alert['severity']); ?>
                            </span>
                        </div>
                        <div class="card-body">
                            <p class="card-text"><?php echo nl2br(sanitizeInput($alert['message'])); ?></p>
                            <div class="d-flex justify-content-between align-items-center">
                                <small class="text-muted">
                                    <i class="bi bi-tag"></i>
                                    <?php echo ucfirst($alert['alert_type']); ?>
                                </small>
                                <small class="text-muted">
                                    <i class="bi bi-clock"></i>
                                    <?php echo formatDate($alert['created_at']); ?>
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
                <?php endforeach; ?>
                <?php endif; ?>
            </div>
        </div>
    </div>
</main>

<!-- Create Alert Modal (for officials) -->
<?php if (hasRole('admin') || hasRole('official')): ?>
<div class="modal fade" id="createAlertModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Create Emergency Alert</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form id="createAlertForm">
                <div class="modal-body">
                    <div class="mb-3">
                        <label for="alertTitle" class="form-label">Alert Title *</label>
                        <input type="text" class="form-control" id="alertTitle" name="title" 
                               placeholder="Brief, descriptive title" required>
                    </div>
                    <div class="mb-3">
                        <label for="alertMessage" class="form-label">Detailed Message *</label>
                        <textarea class="form-control" id="alertMessage" name="message" rows="4" 
                                  placeholder="Detailed information about the emergency situation..." required></textarea>
                    </div>
                    <div class="row">
                        <div class="col-6">
                            <label for="alertType" class="form-label">Alert Type *</label>
                            <select class="form-select" id="alertType" name="alert_type" required>
                                <option value="">Select type...</option>
                                <option value="flood">Flood Warning</option>
                                <option value="landslide">Landslide Alert</option>
                                <option value="storm">Storm/Typhoon</option>
                                <option value="general">General Emergency</option>
                            </select>
                        </div>
                        <div class="col-6">
                            <label for="alertSeverity" class="form-label">Severity Level *</label>
                            <select class="form-select" id="alertSeverity" name="severity" required>
                                <option value="">Select severity...</option>
                                <option value="watch">Watch (Be Prepared)</option>
                                <option value="warning">Warning (Take Action)</option>
                                <option value="critical">Critical (Immediate Danger)</option>
                            </select>
                        </div>
                    </div>
                    <div class="alert alert-warning mt-3">
                        <h6><i class="bi bi-exclamation-triangle"></i> Notice:</h6>
                        <p class="mb-0 small">
                            This alert will be sent to all registered residents via SMS and displayed on the website. 
                            Ensure the information is accurate and necessary.
                        </p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-danger">
                        <i class="bi bi-send"></i> Send Alert
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>
<?php endif; ?>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const createAlertForm = document.getElementById('createAlertForm');
    if (createAlertForm) {
        createAlertForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const submitBtn = createAlertForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span class="loading"></span> Sending...';
            submitBtn.disabled = true;
            
            const formData = new FormData(createAlertForm);
            
            fetch('../api/create-alert.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Alert created and sent successfully!');
                    createAlertForm.reset();
                    const modal = bootstrap.Modal.getInstance(document.getElementById('createAlertModal'));
                    modal.hide();
                    window.location.reload();
                } else {
                    alert('Failed to create alert: ' + (data.error || 'Unknown error'));
                }
            })
            .catch(error => {
                alert('Network error. Please try again.');
            })
            .finally(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            });
        });
    }
    
    // Auto-refresh every 60 seconds
    setInterval(() => {
        window.location.reload();
    }, 60000);
});
</script>

<?php include '../includes/footer.php'; ?>
