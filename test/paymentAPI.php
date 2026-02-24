<?php
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    http_response_code(200);
    exit;
}
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$input = json_decode(file_get_contents("php://input"), true);
$amt = $input['amount'];
$number = $input['number'];

$curl = curl_init();

            curl_setopt_array($curl, array(
                CURLOPT_URL => 'https://payments.paypack.rw/api/auth/agents/authorize',
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_ENCODING => '',
                CURLOPT_MAXREDIRS => 10,
                CURLOPT_TIMEOUT => 0,
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                CURLOPT_CUSTOMREQUEST => 'POST',
                CURLOPT_POSTFIELDS => '{
  "client_id": "2dadbf28-0c25-11f1-b785-deadd43720af", 
  "client_secret": "d7ecf425151af123c70aafa9fbe052ccda39a3ee5e6b4b0d3255bfef95601890afd80709"
}',
                CURLOPT_HTTPHEADER => array(
                    'Content-Type: application/json',
                ),
            ));

            $response = curl_exec($curl);

            $data = json_decode($response);

           // $amt = 100;
           // $date = date('Y-m-d');


$curl = curl_init();

curl_setopt_array($curl, array(
  CURLOPT_URL => 'https://payments.paypack.rw/api/transactions/cashin',
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_ENCODING => '',
  CURLOPT_MAXREDIRS => 10,
  CURLOPT_TIMEOUT => 0,
  CURLOPT_FOLLOWLOCATION => true,
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
  CURLOPT_CUSTOMREQUEST => 'POST',

  CURLOPT_POSTFIELDS => json_encode([
    "amount" => $amt,
    "number" => $number
]),

  CURLOPT_HTTPHEADER => array(
    'Authorization: Bearer ' . $data->access,
    'Content-Type: application/json'
  ),
));

$response = curl_exec($curl);

curl_close($curl);
echo $response;