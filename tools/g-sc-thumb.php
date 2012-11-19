?<?php
echo "\n";
require_once("./config.php");
$conn = new PDO("mysql:host=$db_host;dbname=$db_dbname", $db_username, $db_password , array(PDO::ATTR_PERSISTENT => true));
$ch = curl_init();
$table_name = 'gcd_entry';
$sth = $conn -> prepare("UPDATE `".$table_name."` SET thumb_flag =? WHERE entry_id =? ");
$batch_vol = 500;
$datestr = date("Y-m-d");
$nopic = md5(file_get_contents('nopic.jpg'));
if($argc == 2){
	$workid = $argv[1];
}else{
	$workid = '100';
}
function fetchitem() {
	global $table_name,$workid,$batch_vol,$conn;
	$sqlstr = "UPDATE ".$table_name." SET thumb_flag = '".$workid."' WHERE thumb_flag = 0 AND res_site = 'SC' LIMIT ".$batch_vol ;
	echo $sqlstr."\n";
	$conn->query($sqlstr);
	$sqlstr = "SELECT entry_id, topic_id, thumb_link FROM ".$table_name." WHERE thumb_flag = '".$workid."' and res_site = 'SC' ";
	echo $sqlstr."\n";
	return $conn->query($sqlstr);
}


while($rows = fetchitem()){
	if ($rows->rowCount()==0){
	ECHO "DONE.";
	break;
	}
	foreach($rows as $row){
		// set URL and other appropriate options
		curl_setopt($ch, CURLOPT_URL, $row["thumb_link"]);
		curl_setopt($ch, CURLOPT_HEADER, 0);
		
		//$filename1 = "orithumb\\".$row["id"].".jpg";
		$dirname = "fetched/thumb/".substr($row["topic_id"],0,2)."/".substr($row["topic_id"],2,1);
		if(!is_dir($dirname)) {
			mkdir($dirname,0777,true);
		}
		$filename1 = $dirname."/".$row["topic_id"].".jpg";
		$imgfile = fopen($filename1,"w");
		echo ("fetching ".$filename1." --> ");
		curl_setopt($ch, CURLOPT_FILE, $imgfile);
		
		// grab URL and pass it to the browser
		$trycount = 0;
		do{
			$trycount++;
			curl_exec($ch);
			$urlinfo = curl_getinfo($ch);
			//print_r($urlinfo);
		}while($urlinfo["http_code"] != '200' && $trycount < 5);
		fclose($imgfile);
		if ($urlinfo["http_code"] == '200'){
			echo $filename1." DONE.";
			if(md5(file_get_contents($filename1)) == $nopic ){
				unlink($filename1);
			}
			//echo $conn->exec("UPDATE `lock` SET editor ='1' WHERE id =".$row["id"].";");
			$sth->execute(array(1,$row["entry_id"] ));
		}else{
			if (is_file($filename1)) {
				unlink($filename1);
			}
			echo $filename1." FAILED.";
			//echo $conn->exec("UPDATE `lock` SET editor ='9' WHERE id =".$row["id"].";");
			$sth->execute(array(9,$row["entry_id"] ));		
		}
		echo "\n";
	}
	
}
curl_close($ch);
echo "DONE.\n";

?>
