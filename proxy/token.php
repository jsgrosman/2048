<?php
require_once('config.inc');

$code = $_GET['code'];

$url = $NPRONE_HOST . '/authorization/v2/token';
$params = ['client_id' => $CLIENT_ID,
            'client_secret' => $CLIENT_SECRET,
            'grant_type' => 'authorization_code',
            'code' => $code,
            'redirect_uri' => 'http://dev-jgrosman.npr.org/NPR2048/'
        ];

//open connection
$ch = curl_init();
curl_setopt($ch,CURLOPT_URL, $url);
curl_setopt($ch,CURLOPT_POST, TRUE);
curl_setopt($ch,CURLOPT_POSTFIELDS, $params);
curl_setopt($ch,CURLOPT_TIMEOUT,10);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

//execute post
$result = curl_exec($ch);

//close connection
curl_close($ch);

print $result;

