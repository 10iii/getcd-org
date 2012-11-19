<?php
echo "\n";
function logout ($logstr) {
	echo date("c")." = ".$logstr."\n";
	return;
}
chdir("/www/getcd-org/tools");
logout("main job start.");
shell_exec("cd /www/getcd-org/tools");

logout("start to fetch SC index.");
shell_exec("node g-sc-index.js > sc-ind-log~ 2>&1");
logout("finished fetch SC index.");

logout("start to fetch SC detail.");
shell_exec("node g-sc-detail.js > sc-det-log~ 2>&1");
logout("finished fetch SC detail.");

logout("start to fetch SC thumb.");
shell_exec("php g-sc-thumb.php > sc-thb-log~ 2>&1");
logout("finished fetch SC thumb.");

logout("start to execute sql daily job.");
shell_exec("/opt/lampp/bin/mysql -ugetcddb -pgetat0408 -e'source dailysql.sql' getcd");
logout("finished execute sql daily job.");

logout("start to copy thumb to img server.");
shell_exec("cp -u -R fetched/thumb /www/img-getcd-org/ ");
logout("finished copy thumb");


?>
