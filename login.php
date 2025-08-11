<?php
require_once 'includes/functions.php';

$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = sanitizeInput($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';
    
    if (!empty($username) && !empty($password)) {
        $stmt = $conn->prepare("SELECT id, username, password, role FROM users WHERE username = ? AND active = 1");
        $stmt->bind_param("s", $username);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($user = $result->fetch_assoc()) {
            if (password_verify($password, $user['password'])) {
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['username'] = $user['username'];
                $_SESSION['role'] = $user['role'];
                
                header('Location: pages/dashboard.php');
                exit;
            } else {
                $error = 'Invalid username or password';
            }
        } else {
            $error = 'Invalid username or password';
        }
    } else {
        $error = 'Please fill in all fields';
    }
}

include 'includes/header.php';
?>

<main class="container py-5">
    <div class="row justify-content-center">
        <div class="col-md-6 col-lg-4">
            <div class="card shadow">
                <div class="card-header bg-danger text-white text-center">
                    <h4 class="mb-0">
                        <i class="bi bi-shield-exclamation"></i>
                        Login
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
                        <div class="mb-3">
                            <label for="username" class="form-label">Username</label>
                            <input type="text" class="form-control" id="username" name="username" 
                                   value="<?php echo htmlspecialchars($username ?? ''); ?>" required>
                        </div>
                        
                        <div class="mb-3">
                            <label for="password" class="form-label">Password</label>
                            <input type="password" class="form-control" id="password" name="password" required>
                        </div>
                        
                        <div class="d-grid">
                            <button type="submit" class="btn btn-danger btn-lg">
                                <i class="bi bi-box-arrow-in-right"></i>
                                Login
                            </button>
                        </div>
                    </form>
                    
                    <hr>
                    
                    <div class="text-center">
                        <p class="mb-2">Don't have an account?</p>
                        <a href="register.php" class="btn btn-outline-danger">
                            <i class="bi bi-person-plus"></i>
                            Register
                        </a>
                    </div>
                    
                    <div class="text-center mt-3">
                        <small class="text-muted">
                            <i class="bi bi-info-circle"></i>
                            Emergency? Call <?php echo EMERGENCY_HOTLINE; ?>
                        </small>
                    </div>
                </div>
            </div>
            
            <!-- Quick Access for Emergencies -->
            <div class="card mt-3">
                <div class="card-body text-center">
                    <h6 class="card-title text-danger">Need Help Now?</h6>
                    <p class="card-text small">You can request emergency help without logging in</p>
                    <a href="pages/rescue-form.php" class="btn btn-warning btn-sm">
                        <i class="bi bi-plus-circle"></i>
                        Emergency Request
                    </a>
                </div>
            </div>
        </div>
    </div>
</main>

<?php include 'includes/footer.php'; ?>
