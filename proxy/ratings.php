<?php
require_once('config.inc');

$token = $_COOKIE['nprone_token'];
$url = $NPRONE_HOST . '/listening/v2/ratings?' . $_SERVER['QUERY_STRING'];

$postBody = file_get_contents('php://input');

//open connection
$ch = curl_init();
curl_setopt($ch,CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_HTTPHEADER, array(
    'Authorization: Bearer ' . $token
));
curl_setopt($ch,CURLOPT_POST, TRUE);
curl_setopt($ch,CURLOPT_POSTFIELDS, $postBody);
curl_setopt($ch,CURLOPT_TIMEOUT,10);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

//execute post
$result = curl_exec($ch);

//close connection
curl_close($ch);

print $result;


