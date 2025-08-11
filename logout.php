<?php
require_once 'includes/functions.php';

// Logout user
session_destroy();
header('Location: index.php');
exit;
?>
