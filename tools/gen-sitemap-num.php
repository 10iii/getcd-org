<?php
//echo "\n";
$RANGE = 10000;
require_once("./config.php");
$conn = new PDO("mysql:host=$db_host;dbname=$db_dbname", $db_username, $db_password , array(PDO::ATTR_PERSISTENT => true));
$conn->query("SET NAMES utf8");
$sqlstr = "SELECT MAX(entry_id) as max_id FROM gcd_entry ";
$rows = $conn->query($sqlstr);
$row = $rows->fetch();
$max_id = $row["max_id"];
$mark = $max_id - ($max_id % $RANGE);
$mark1 = $mark - $RANGE;
$mark2 = $mark + $RANGE;

$sqlstr = "SELECT topic_id, updtime FROM gcd_entry WHERE entry_id > ".$mark1." AND entry_id <= ".$mark." ";
$outfile = fopen("../public/docs/sitemaps/num_".$mark.".xml","w");
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


$sqlstr = "SELECT topic_id, updtime FROM gcd_entry WHERE entry_id > ".$mark." AND entry_id <= ".$mark2." ";
$outfile = fopen("../public/docs/sitemaps/num_".$mark2.".xml","w");
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
?>
