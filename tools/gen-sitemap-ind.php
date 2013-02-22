<?php
$dir = "../public/docs/sitemaps/";

echo '<?xml version="1.0" encoding="UTF-8"?>';
echo "\n";
echo '<sitemapindex>';
echo "\n";

// Open a known directory, and proceed to read its contents
if (is_dir($dir)) {
    if ($dh = opendir($dir)) {
        while (($file = readdir($dh)) !== false) {
			if (!is_dir($dir . $file)) {
				echo '<sitemap>';
				echo "\n";
				echo '<loc>http://getcd.org/docs/sitemaps/'. $file .'</loc>';
				echo "\n";
				echo '<lastmod>'. date ("Y-m-d", filemtime($dir . $file)) .'</lastmod>';
				echo "\n";
				echo '</sitemap>';
				echo "\n";
			}
        }
        closedir($dh);
    }
}

echo '</sitemapindex>';
echo "\n";
?> 

