<?php
require_once '../includes/functions.php';

$success = '';
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = sanitizeInput($_POST['name'] ?? '');
    $contact = sanitizeInput($_POST['contact'] ?? '');
    $address = sanitizeInput($_POST['address'] ?? '');
    $emergency_type = sanitizeInput($_POST['emergency_type'] ?? '');
    $description = sanitizeInput($_POST['description'] ?? '');
    $location = sanitizeInput($_POST['location'] ?? '');
    $family_members = (int)($_POST['family_members'] ?? 1);
    
    // Validation
    if (empty($name) || empty($contact) || empty($address) || empty($emergency_type)) {
        $error = 'Please fill in all required fields';
    } elseif (!preg_match('/^[0-9]{10,15}$/', $contact)) {
        $error = 'Please enter a valid contact number';
    } else {
        // Parse location
        $lat = $lng = null;
        if ($location && strpos($location, ',') !== false) {
            list($lat, $lng) = explode(',', $location);
            $lat = floatval($lat);
            $lng = floatval($lng);
        }
        
        // Handle photo upload
        $photo_path = null;
        if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
            $uploadDir = '../assets/images/rescue/';
            $photo_path = uploadFile($_FILES['photo'], $uploadDir);
        }
        
        // Insert rescue request
        $stmt = $conn->prepare("
            INSERT INTO rescue_requests 
            (name, contact, location_lat, location_lng, address, emergency_type, description, family_members, photo_path, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
        ");
        $stmt->bind_param("ssddsssss", $name, $contact, $lat, $lng, $address, $emergency_type, $description, $family_members, $photo_path);
        
        if ($stmt->execute()) {
            $request_id = $conn->insert_id;
            $success = "Rescue request submitted successfully! Reference ID: #$request_id";
            
            // Send SMS notification to emergency responders
            $message = "Emergency Request #$request_id\nName: $name\nType: $emergency_type\nLocation: $address\nContact: $contact";
            sendSMS(BARANGAY_HOTLINE, $message);
            
            // Clear form
            $name = $contact = $address = $description = $location = '';
            $emergency_type = '';
            $family_members = 1;
        } else {
            $error = 'Failed to submit request. Please try again.';
        }
    }
}

include '../includes/header.php';
?>

<main class="container py-4">
    <div class="row justify-content-center">
        <div class="col-lg-8">
            <div class="card shadow">
                <div class="card-header bg-warning text-dark">
                    <h4 class="mb-0">
                        <i class="bi bi-plus-circle"></i>
                        Emergency Rescue Request
                    </h4>
                    <small>Fill out this form if you need immediate rescue assistance</small>
                </div>
                
                <div class="card-body">
                    <?php if ($error): ?>
                        <div class="alert alert-danger">
                            <i class="bi bi-exclamation-triangle"></i>
                            <?php echo $error; ?>
                        </div>
                    <?php endif; ?>
                    
                    <?php if ($success): ?>
                        <div class="alert alert-success">
                            <i class="bi bi-check-circle"></i>
                            <?php echo $success; ?>
                        </div>
                    <?php endif; ?>
                    
                    <form id="rescueForm" method="POST" enctype="multipart/form-data" class="needs-validation" novalidate>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="name" class="form-label">Full Name *</label>
                                    <input type="text" class="form-control" id="name" name="name" 
                                           value="<?php echo htmlspecialchars($name ?? ''); ?>" required>
                                    <div class="invalid-feedback">Please provide your full name</div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="contact" class="form-label">Contact Number *</label>
                                    <input type="tel" class="form-control" id="contact" name="contact" 
                                           value="<?php echo htmlspecialchars($contact ?? ''); ?>" 
                                           pattern="^[0-9]{10,15}$" placeholder="09123456789" required>
                                    <div class="invalid-feedback">Please provide a valid contact number</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <label for="address" class="form-label">Address in Barangay Malagutay *</label>
                            <textarea class="form-control" id="address" name="address" rows="2" 
                                      placeholder="Sitio, Street, Barangay Malagutay" required><?php echo htmlspecialchars($address ?? ''); ?></textarea>
                            <div class="invalid-feedback">Please provide your complete address</div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-8">
                                <div class="mb-3">
                                    <label for="emergency_type" class="form-label">Emergency Type *</label>
                                    <select class="form-select" id="emergency_type" name="emergency_type" required>
                                        <option value="">Select emergency type</option>
                                        <option value="trapped" <?php echo ($emergency_type ?? '') === 'trapped' ? 'selected' : ''; ?>>Trapped (flood, landslide, debris)</option>
                                        <option value="medical" <?php echo ($emergency_type ?? '') === 'medical' ? 'selected' : ''; ?>>Medical Emergency</option>
                                        <option value="evacuation" <?php echo ($emergency_type ?? '') === 'evacuation' ? 'selected' : ''; ?>>Evacuation Needed</option>
                                        <option value="missing" <?php echo ($emergency_type ?? '') === 'missing' ? 'selected' : ''; ?>>Missing Person</option>
                                        <option value="fire" <?php echo ($emergency_type ?? '') === 'fire' ? 'selected' : ''; ?>>Fire Emergency</option>
                                        <option value="other" <?php echo ($emergency_type ?? '') === 'other' ? 'selected' : ''; ?>>Other Emergency</option>
                                    </select>
                                    <div class="invalid-feedback">Please select emergency type</div>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="mb-3">
                                    <label for="family_members" class="form-label">Family Members</label>
                                    <input type="number" class="form-control" id="family_members" name="family_members" 
                                           value="<?php echo htmlspecialchars($family_members ?? 1); ?>" min="1" max="50">
                                    <div class="form-text">Including yourself</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <label for="description" class="form-label">Description</label>
                            <textarea class="form-control" id="description" name="description" rows="3" 
                                      placeholder="Describe your situation in detail..."><?php echo htmlspecialchars($description ?? ''); ?></textarea>
                            <div class="form-text">Provide any additional details that can help responders</div>
                        </div>
                        
                        <div class="mb-3">
                            <label class="form-label">GPS Location</label>
                            <div class="input-group">
                                <input type="text" class="form-control" id="location" name="location" 
                                       value="<?php echo htmlspecialchars($location ?? ''); ?>" readonly 
                                       placeholder="Location will appear here">
                                <button type="button" class="btn btn-outline-primary" id="getLocation">
                                    <i class="bi bi-geo-alt"></i> Get Location
                                </button>
                            </div>
                            <div class="form-text">GPS coordinates help responders find you quickly</div>
                        </div>
                        
                        <div class="mb-3">
                            <label for="photo" class="form-label">Photo (Optional)</label>
                            <input type="file" class="form-control" id="photo" name="photo" accept="image/*">
                            <div class="form-text">Upload a photo of your situation if possible</div>
                        </div>
                        
                        <div class="alert alert-warning">
                            <h6><i class="bi bi-exclamation-triangle"></i> Important:</h6>
                            <ul class="mb-0 small">
                                <li>This is for REAL emergencies only</li>
                                <li>False reports are subject to legal action</li>
                                <li>For immediate life-threatening situations, call <?php echo EMERGENCY_HOTLINE; ?> first</li>
                                <li>Keep your phone charged and accessible</li>
                            </ul>
                        </div>
                        
                        <div class="d-grid">
                            <button type="submit" class="btn btn-danger btn-lg">
                                <i class="bi bi-send"></i>
                                Submit Emergency Request
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            
            <!-- Emergency Contacts Card -->
            <div class="card mt-3">
                <div class="card-body">
                    <h6 class="card-title text-danger">Emergency Contacts</h6>
                    <div class="row text-center">
                        <div class="col-6">
                            <a href="tel:<?php echo EMERGENCY_HOTLINE; ?>" class="btn btn-outline-danger btn-sm w-100">
                                <i class="bi bi-telephone"></i><br>
                                Emergency<br>
                                <?php echo EMERGENCY_HOTLINE; ?>
                            </a>
                        </div>
                        <div class="col-6">
                            <a href="tel:<?php echo BARANGAY_HOTLINE; ?>" class="btn btn-outline-primary btn-sm w-100">
                                <i class="bi bi-telephone"></i><br>
                                Barangay<br>
                                <?php echo BARANGAY_HOTLINE; ?>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</main>

<script src="../assets/js/rescue-form.js"></script>

<?php include '../includes/footer.php'; ?>
