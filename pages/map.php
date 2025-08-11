<?php
require_once '../includes/functions.php';

include '../includes/header.php';

// Get recent rescue requests with locations
$stmt = $conn->prepare("
    SELECT id, name, address, emergency_type, status, location_lat, location_lng, created_at
    FROM rescue_requests 
    WHERE location_lat IS NOT NULL AND location_lng IS NOT NULL
    ORDER BY created_at DESC 
    LIMIT 50
");
$stmt->execute();
$rescue_locations = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
?>

<main class="container-fluid py-4">
    <div class="row">
        <div class="col-12">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2><i class="bi bi-geo-alt"></i> Emergency Response Map</h2>
                <div class="btn-group" role="group">
                    <button type="button" class="btn btn-outline-primary" onclick="centerMap()">
                        <i class="bi bi-crosshair"></i> Center Map
                    </button>
                    <button type="button" class="btn btn-outline-success" onclick="toggleSafeZones()">
                        <i class="bi bi-shield-check"></i> Safe Zones
                    </button>
                </div>
            </div>
            
            <!-- Map Legend -->
            <div class="card mb-3">
                <div class="card-body">
                    <h6 class="card-title">Map Legend</h6>
                    <div class="row">
                        <div class="col-md-3 col-6">
                            <span class="badge bg-danger me-2">●</span> Pending Rescue
                        </div>
                        <div class="col-md-3 col-6">
                            <span class="badge bg-warning me-2">●</span> In Progress
                        </div>
                        <div class="col-md-3 col-6">
                            <span class="badge bg-success me-2">●</span> Completed
                        </div>
                        <div class="col-md-3 col-6">
                            <span class="badge bg-info me-2">●</span> Safe Zones
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Map Container -->
            <div class="card">
                <div class="card-body p-0">
                    <div id="map" style="height: 500px; width: 100%;"></div>
                </div>
            </div>
            
            <!-- Map Controls -->
            <div class="card mt-3">
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-4">
                            <h6>Filter by Status</h6>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="showPending" checked>
                                <label class="form-check-label" for="showPending">Pending</label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="showInProgress" checked>
                                <label class="form-check-label" for="showInProgress">In Progress</label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="showCompleted">
                                <label class="form-check-label" for="showCompleted">Completed</label>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <h6>Emergency Type</h6>
                            <select class="form-select form-select-sm" id="emergencyTypeFilter">
                                <option value="">All Types</option>
                                <option value="trapped">Trapped</option>
                                <option value="medical">Medical</option>
                                <option value="evacuation">Evacuation</option>
                                <option value="missing">Missing Person</option>
                                <option value="fire">Fire</option>
                            </select>
                        </div>
                        <div class="col-md-4">
                            <h6>Quick Actions</h6>
                            <button class="btn btn-warning btn-sm me-2" onclick="window.location.href='rescue-form.php'">
                                <i class="bi bi-plus"></i> Request Help
                            </button>
                            <button class="btn btn-info btn-sm" onclick="refreshMap()">
                                <i class="bi bi-arrow-clockwise"></i> Refresh
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Recent Incidents -->
            <div class="card mt-3">
                <div class="card-header">
                    <h6 class="mb-0">Recent Incidents</h6>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Type</th>
                                    <th>Location</th>
                                    <th>Status</th>
                                    <th>Time</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach (array_slice($rescue_locations, 0, 10) as $incident): ?>
                                <tr>
                                    <td><?php echo sanitizeInput($incident['name']); ?></td>
                                    <td><span class="badge bg-secondary"><?php echo ucfirst($incident['emergency_type']); ?></span></td>
                                    <td class="small"><?php echo sanitizeInput($incident['address']); ?></td>
                                    <td><span class="badge bg-<?php echo getStatusColor($incident['status']); ?>"><?php echo ucfirst($incident['status']); ?></span></td>
                                    <td class="small"><?php echo formatDate($incident['created_at']); ?></td>
                                    <td>
                                        <button class="btn btn-outline-primary btn-sm" onclick="focusIncident(<?php echo $incident['location_lat']; ?>, <?php echo $incident['location_lng']; ?>)">
                                            <i class="bi bi-geo-alt"></i>
                                        </button>
                                    </td>
                                </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</main>

<!-- Offline Map Notice -->
<div class="alert alert-warning d-none" id="offlineMapNotice">
    <i class="bi bi-wifi-off"></i>
    <strong>Offline Mode:</strong> Some map features may be limited. Location data from cache.
</div>

<script>
// Barangay Malagutay approximate center coordinates
const MALAGUTAY_CENTER = { lat: 14.5995, lng: 121.0537 }; // Adjust these coordinates
let map;
let markers = [];
let safeZoneMarkers = [];

// Rescue request data
const rescueData = <?php echo json_encode($rescue_locations); ?>;

// Safe zones in Barangay Malagutay (example coordinates)
const safeZones = [
    { lat: 14.6000, lng: 121.0540, name: "Barangay Hall Evacuation Center", capacity: "200 families" },
    { lat: 14.5990, lng: 121.0530, name: "Malagutay Elementary School", capacity: "150 families" },
    { lat: 14.6010, lng: 121.0550, name: "Community Center", capacity: "100 families" }
];

function initMap() {
    // Initialize map centered on Barangay Malagutay
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        center: MALAGUTAY_CENTER,
        mapTypeId: 'hybrid'
    });
    
    // Add rescue request markers
    addRescueMarkers();
    
    // Add event listeners for filters
    document.getElementById('showPending').addEventListener('change', filterMarkers);
    document.getElementById('showInProgress').addEventListener('change', filterMarkers);
    document.getElementById('showCompleted').addEventListener('change', filterMarkers);
    document.getElementById('emergencyTypeFilter').addEventListener('change', filterMarkers);
}

function addRescueMarkers() {
    rescueData.forEach(incident => {
        if (incident.location_lat && incident.location_lng) {
            const marker = new google.maps.Marker({
                position: { lat: parseFloat(incident.location_lat), lng: parseFloat(incident.location_lng) },
                map: map,
                title: incident.name,
                icon: getMarkerIcon(incident.status),
                incidentData: incident
            });
            
            const infoWindow = new google.maps.InfoWindow({
                content: createInfoWindowContent(incident)
            });
            
            marker.addListener('click', () => {
                infoWindow.open(map, marker);
            });
            
            markers.push(marker);
        }
    });
}

function addSafeZoneMarkers() {
    safeZones.forEach(zone => {
        const marker = new google.maps.Marker({
            position: { lat: zone.lat, lng: zone.lng },
            map: map,
            title: zone.name,
            icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="10" cy="10" r="8" fill="#17a2b8" stroke="white" stroke-width="2"/>
                        <text x="10" y="14" text-anchor="middle" fill="white" font-size="12">S</text>
                    </svg>
                `),
                scaledSize: new google.maps.Size(20, 20)
            }
        });
        
        const infoWindow = new google.maps.InfoWindow({
            content: `
                <div class="p-2">
                    <h6 class="mb-1">${zone.name}</h6>
                    <p class="mb-0 small">Capacity: ${zone.capacity}</p>
                    <span class="badge bg-info">Safe Zone</span>
                </div>
            `
        });
        
        marker.addListener('click', () => {
            infoWindow.open(map, marker);
        });
        
        safeZoneMarkers.push(marker);
    });
}

function getMarkerIcon(status) {
    const colors = {
        'pending': '#dc3545',
        'acknowledged': '#ffc107',
        'in_progress': '#fd7e14',
        'completed': '#198754'
    };
    
    const color = colors[status] || '#6c757d';
    
    return {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <circle cx="10" cy="10" r="8" fill="${color}" stroke="white" stroke-width="2"/>
                <text x="10" y="14" text-anchor="middle" fill="white" font-size="10">!</text>
            </svg>
        `),
        scaledSize: new google.maps.Size(20, 20)
    };
}

function createInfoWindowContent(incident) {
    const statusColors = {
        'pending': 'danger',
        'acknowledged': 'warning',
        'in_progress': 'primary',
        'completed': 'success'
    };
    
    return `
        <div class="p-2" style="min-width: 200px;">
            <h6 class="mb-1">${incident.name}</h6>
            <p class="mb-1 small"><strong>Type:</strong> ${incident.emergency_type}</p>
            <p class="mb-1 small"><strong>Location:</strong> ${incident.address}</p>
            <p class="mb-1 small"><strong>Time:</strong> ${formatDate(incident.created_at)}</p>
            <span class="badge bg-${statusColors[incident.status] || 'secondary'}">${incident.status}</span>
        </div>
    `;
}

function filterMarkers() {
    const showPending = document.getElementById('showPending').checked;
    const showInProgress = document.getElementById('showInProgress').checked;
    const showCompleted = document.getElementById('showCompleted').checked;
    const typeFilter = document.getElementById('emergencyTypeFilter').value;
    
    markers.forEach(marker => {
        const incident = marker.incidentData;
        let show = true;
        
        // Status filter
        if (incident.status === 'pending' && !showPending) show = false;
        if (incident.status === 'in_progress' && !showInProgress) show = false;
        if (incident.status === 'completed' && !showCompleted) show = false;
        
        // Type filter
        if (typeFilter && incident.emergency_type !== typeFilter) show = false;
        
        marker.setVisible(show);
    });
}

function centerMap() {
    map.setCenter(MALAGUTAY_CENTER);
    map.setZoom(15);
}

function toggleSafeZones() {
    const isVisible = safeZoneMarkers.length > 0 && safeZoneMarkers[0].getVisible();
    
    if (safeZoneMarkers.length === 0) {
        addSafeZoneMarkers();
    } else {
        safeZoneMarkers.forEach(marker => {
            marker.setVisible(!isVisible);
        });
    }
}

function focusIncident(lat, lng) {
    map.setCenter({ lat: parseFloat(lat), lng: parseFloat(lng) });
    map.setZoom(18);
}

function refreshMap() {
    window.location.reload();
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    });
}

// Check online status
function checkOnlineStatus() {
    const offlineNotice = document.getElementById('offlineMapNotice');
    if (!navigator.onLine) {
        offlineNotice.classList.remove('d-none');
    } else {
        offlineNotice.classList.add('d-none');
    }
}

window.addEventListener('online', checkOnlineStatus);
window.addEventListener('offline', checkOnlineStatus);
document.addEventListener('DOMContentLoaded', checkOnlineStatus);

<?php
function getStatusColor($status) {
    switch($status) {
        case 'pending': return 'warning';
        case 'acknowledged': return 'info';
        case 'in_progress': return 'primary';
        case 'completed': return 'success';
        default: return 'secondary';
    }
}
?>
</script>

<!-- Google Maps API -->
<script async defer src="https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&callback=initMap"></script>

<noscript>
    <div class="alert alert-warning">
        <h6>JavaScript Required</h6>
        <p>The emergency map requires JavaScript to function. Please enable JavaScript or use the list view below.</p>
    </div>
</noscript>

<?php include '../includes/footer.php'; ?>
