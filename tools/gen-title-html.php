<?php
//echo "\n";
require_once("./config.php");
$conn = new PDO("mysql:host=$db_host;dbname=$db_dbname", $db_username, $db_password , array(PDO::ATTR_PERSISTENT => true));
$conn->query("SET NAMES utf8");
	$sqlstr = "SELECT topic_id, title FROM gcd_topic ";
	$outfile = fopen("../public/docs/sitemaps/title.html","w");
	echo $sqlstr."\n";
	$rows = $conn->query($sqlstr);
	echo $rows->rowCount()."\n";
	foreach ($rows as $row) {
		fwrite($outfile, str_replace(">", " ", str_replace("<", " ", $row["title"]))."<br />\n");
		fwrite($outfile, '<a href="http://getcd.org/topic/'.$row["topic_id"].'">http://getcd.org/topic/'.$row["topic_id"]."</a><br />\n");
	}
	fclose($outfile);
?>
