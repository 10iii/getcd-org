<?php
echo "\n";
function logout ($logstr) {
	echo date("c")." = ".$logstr."\n";
	return;
}
chdir("/www/getcd-org/tools");
logout("main job start.");
echo shell_exec("cd /www/getcd-org/tools");

logout("start to fetch SC index.");
$today = getdate();
if ($today['wday'] == 1) {
	$date = new DateTime();
	$date->sub(new DateInterval('P10D'));
	echo shell_exec("node g-sc-index.js ".$date->format('Y-m-d')." > sc-ind-log~ 2>&1");
} else {
	echo shell_exec("node g-sc-index.js > sc-ind-log~ 2>&1");
}
logout("finished fetch SC index.");

logout("start to fetch SC detail.");
echo shell_exec("node g-sc-detail.js > sc-det-log~ 2>&1");
logout("finished fetch SC detail.");

logout("start to fetch SC thumb.");
echo shell_exec("php g-sc-thumb.php > sc-thb-log~ 2>&1");
logout("finished fetch SC thumb.");

logout("start to execute sql daily job.");
echo shell_exec("/opt/lampp/bin/mysql -ugetcddb -pgetat0408 -e'source dailysql.sql' getcd");
logout("finished execute sql daily job.");

logout("start to copy thumb to img server.");
echo shell_exec("cp -u -R fetched/thumb /www/img-getcd-org/ ");
logout("finished copy thumb");


logout("start to seg title for search.");
echo shell_exec("php exp-title.php |./wordseg |php rep-title-seg.php");
logout("finished seg title");

logout("start to generate sitemap.");
echo shell_exec("php gen-sitemap-num.php");
echo shell_exec("php gen-sitemap-ind.php > ../public/docs/sitemap-index.xml");
logout("finished generate sitemap.");

?>
