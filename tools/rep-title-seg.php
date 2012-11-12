<?php
echo "\n";
require_once("./config.php");

try {
 
	$conn = new PDO("mysql:host=$db_host;dbname=$db_dbname", $db_username, $db_password , array(PDO::ATTR_PERSISTENT => true));
	$conn->query("SET NAMES utf8");
	$sth = $conn -> prepare("REPLACE `gcd_search` (topic_id, title) VALUES (?, ?) ");

	$stdin = fopen('php://stdin', 'r');

	while (!feof($stdin)) {
		$buffer = fgets($stdin, 10240);
		$topic_id = trim(substr($buffer, 0, 30));
		$seg_title = trim(substr($buffer, 30));
		if (strlen($seg_title) > 0) {
			$sth->execute(array($topic_id, $seg_title));
		}
	}
	fclose($stdin);
    $conn = null;
} catch (PDOException $e) {
   print "Error!: " . $e->getMessage() . "<br/>";
   die();
}
echo "DONE.\n";
?>
