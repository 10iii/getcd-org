<?php
//echo "\n";
require_once("./config.php");
$conn = new PDO("mysql:host=$db_host;dbname=$db_dbname", $db_username, $db_password , array(PDO::ATTR_PERSISTENT => true));
$conn->query("SET NAMES utf8");
$tailarr = str_split("0987654321abcdefghijklmnopqrstuvwxyz");
foreach ($tailarr as $tail) {
	$sqlstr = "SELECT topic_id, updtime FROM gcd_topic WHERE topic_id like '%".$tail."' ";
	$outfile = fopen("../public/docs/sitemaps/".$tail.".xml","w");
	fwrite($outfile, '<?xml version="1.0" encoding="utf-8"?>'."\n<urlset>\n");
	echo $sqlstr."\n";
	$rows = $conn->query($sqlstr);
	echo $rows->rowCount()."\n";
	foreach ($rows as $row) {
		fwrite($outfile, "<url>\n");
		fwrite($outfile, "<loc>http://getcd.org/topic/".$row["topic_id"]."</loc>\n");
		fwrite($outfile, "<lastmod>".substr($row["updtime"], 0, 10)."</lastmod>\n");
		fwrite($outfile, "<changefreq>daily</changefreq>\n");
		fwrite($outfile, "</url>\n");
	}
	fwrite($outfile, "</urlset>\n");
	fclose($outfile);
}
?>
