    <!-- Footer -->
    <footer class="bg-dark text-light mt-5 py-4">
        <div class="container">
            <div class="row">
                <div class="col-md-6">
                    <h5><?php echo APP_NAME; ?></h5>
                    <p class="mb-0">Disaster Response & Emergency Management System</p>
                    <p><small>Serving Barangay Malagutay</small></p>
                </div>
                <div class="col-md-6 text-md-end">
                    <h6>Emergency Contacts</h6>
                    <p class="mb-1">Emergency Hotline: <?php echo EMERGENCY_HOTLINE; ?></p>
                    <p class="mb-1">Barangay Office: <?php echo BARANGAY_HOTLINE; ?></p>
                    <p class="mb-0"><small>Version <?php echo APP_VERSION; ?></small></p>
                </div>
            </div>
        </div>
    </footer>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    
    <!-- Service Worker Registration -->
    <script>
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
                navigator.serviceWorker.register('<?php echo BASE_URL; ?>sw.js')
                .then(function(registration) {
                    console.log('SW registered: ', registration);
                })
                .catch(function(registrationError) {
                    console.log('SW registration failed: ', registrationError);
                });
            });
        }
    </script>
</body>
</html>
