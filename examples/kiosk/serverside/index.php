<?php
// kiosk.php
$file = 'kiosk.json'; // Path to JSON file

//ini_set('display_errors', 1);
//ini_set('display_startup_errors', 1);
//error_reporting(E_ALL);

header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

define('HTTP_OK', 200);
define('HTTP_NOT_MODIFIED', 304);
function sendResponse(string $url = '', string $error = ''): void {
    http_response_code(HTTP_OK);
    if ($error !== '') {
        $response["error"] = $error;
    }
    if ($url !== '') {
        $response["url"] = $url;
    }
    echo json_encode($response);
    exit;
}

function getJsonData($file) {
    $data = json_decode(file_get_contents($file), true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        sendResponse(error: "Invalid JSON in $file");
    }
    return $data;
}

if (!file_exists($file) || !is_readable($file)) {
    sendResponse(error: "kiosk json file not found or not readable");
}

$lastModifiedTime = filemtime($file);

// Always send headers
header("Last-Modified: ".gmdate("D, d M Y H:i:s", $lastModifiedTime)." GMT");

// Exit if not modified
if (@strtotime($_SERVER['HTTP_IF_MODIFIED_SINCE']) == $lastModifiedTime) {
    http_response_code(HTTP_NOT_MODIFIED);
    exit;
}

// Handle POST request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = getJsonData('php://input');
    $id = $data['id'] ?? null;
    if ($id === null) {
        sendResponse(error: "No ID provided");
    }

    $kioskData = getJsonData($file);
    $url = $kioskData[$id] ?? null;

    if ($url === null) {
        sendResponse(error: "No URL found for the provided ID");
    }

    // Check if the URL is reachable
    $headers = @get_headers($url);
    if (!$headers || strpos($headers[0], '200') === false) {
        sendResponse(error: "URL is not reachable");
    }

    sendResponse(url: $url);
}
