<?php
//echo "\n";
require_once("./config.php");
$conn = new PDO("mysql:host=$db_host;dbname=$db_dbname", $db_username, $db_password , array(PDO::ATTR_PERSISTENT => true));
$conn->query("SET NAMES utf8");
$sqlstr = "SELECT topic_id, title FROM gcd_topic LIMIT 1000";
//echo $sqlstr."\n";
$rows = $conn->query($sqlstr);
echo $rows->rowCount()."\n";
foreach ($rows as $row) {
	echo str_pad($row["topic_id"], 30).preg_replace("/\s/", " ", $row["title"])."\n";
}
?>
