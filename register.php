<?php
require_once 'includes/functions.php';

$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = sanitizeInput($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirm_password = $_POST['confirm_password'] ?? '';
    $contact = sanitizeInput($_POST['contact'] ?? '');
    $address = sanitizeInput($_POST['address'] ?? '');
    $role = 'resident'; // Default role
    
    // Validation
    if (empty($username) || empty($password) || empty($contact) || empty($address)) {
        $error = 'Please fill in all required fields';
    } elseif (strlen($password) < 6) {
        $error = 'Password must be at least 6 characters long';
    } elseif ($password !== $confirm_password) {
        $error = 'Passwords do not match';
    } elseif (!preg_match('/^[0-9]{10,15}$/', $contact)) {
        $error = 'Please enter a valid contact number';
    } else {
        // Check if username already exists
        $stmt = $conn->prepare("SELECT id FROM users WHERE username = ?");
        $stmt->bind_param("s", $username);
        $stmt->execute();
        
        if ($stmt->get_result()->num_rows > 0) {
            $error = 'Username already exists';
        } else {
            // Create new user
            $hashed_password = password_hash($password, PASSWORD_DEFAULT);
            
            $stmt = $conn->prepare("INSERT INTO users (username, password, role, contact_number, address, active) VALUES (?, ?, ?, ?, ?, 1)");
            $stmt->bind_param("sssss", $username, $hashed_password, $role, $contact, $address);
            
            if ($stmt->execute()) {
                $success = 'Registration successful! You can now login.';
                // Clear form data
                $username = $contact = $address = '';
            } else {
                $error = 'Registration failed. Please try again.';
            }
        }
    }
}

include 'includes/header.php';
?>

<main class="container py-5">
    <div class="row justify-content-center">
        <div class="col-md-8 col-lg-6">
            <div class="card shadow">
                <div class="card-header bg-danger text-white text-center">
                    <h4 class="mb-0">
                        <i class="bi bi-person-plus"></i>
                        Register for BantayBarangay
                    </h4>
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
                    
                    <form method="POST" action="">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="username" class="form-label">Username *</label>
                                    <input type="text" class="form-control" id="username" name="username" 
                                           value="<?php echo htmlspecialchars($username ?? ''); ?>" required>
                                    <div class="form-text">Choose a unique username</div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="contact" class="form-label">Contact Number *</label>
                                    <input type="tel" class="form-control" id="contact" name="contact" 
                                           value="<?php echo htmlspecialchars($contact ?? ''); ?>" 
                                           placeholder="09123456789" required>
                                    <div class="form-text">For emergency notifications</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <label for="address" class="form-label">Address in Barangay Malagutay *</label>
                            <textarea class="form-control" id="address" name="address" rows="2" 
                                      placeholder="Sitio, Street, Barangay Malagutay" required><?php echo htmlspecialchars($address ?? ''); ?></textarea>
                            <div class="form-text">Your complete address for rescue coordination</div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="password" class="form-label">Password *</label>
                                    <input type="password" class="form-control" id="password" name="password" required>
                                    <div class="form-text">Minimum 6 characters</div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="confirm_password" class="form-label">Confirm Password *</label>
                                    <input type="password" class="form-control" id="confirm_password" name="confirm_password" required>
                                </div>
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="terms" required>
                                <label class="form-check-label" for="terms">
                                    I agree to allow Barangay Malagutay to contact me for emergency notifications and community alerts
                                </label>
                            </div>
                        </div>
                        
                        <div class="d-grid">
                            <button type="submit" class="btn btn-danger btn-lg">
                                <i class="bi bi-person-plus"></i>
                                Register
                            </button>
                        </div>
                    </form>
                    
                    <hr>
                    
                    <div class="text-center">
                        <p class="mb-2">Already have an account?</p>
                        <a href="login.php" class="btn btn-outline-danger">
                            <i class="bi bi-box-arrow-in-right"></i>
                            Login
                        </a>
                    </div>
                </div>
            </div>
            
            <!-- Important Notice -->
            <div class="alert alert-info mt-3">
                <h6><i class="bi bi-info-circle"></i> Important Notice</h6>
                <ul class="mb-0 small">
                    <li>Registration is for Barangay Malagutay residents only</li>
                    <li>Your contact information will be used for emergency notifications</li>
                    <li>All rescue requests are logged and tracked</li>
                    <li>False emergency reports are subject to legal action</li>
                </ul>
            </div>
        </div>
    </div>
</main>

<?php include 'includes/footer.php'; ?>
