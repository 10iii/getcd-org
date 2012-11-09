CREATE TABLE `gcd_entry_test` (
	  `entry_id` int(11) unsigned zerofill NOT NULL AUTO_INCREMENT,
	  `topic_id` varchar(30) NOT NULL,
	  `res_site` varchar(10) DEFAULT NULL,
	  `res_id` varchar(30) DEFAULT NULL,
	  `title` varchar(1000) DEFAULT NULL,
	  `author` varchar(200) DEFAULT NULL,
	  `brief` varchar(2000) DEFAULT NULL,
	  `abstract` varchar(2000) DEFAULT NULL,
	  `pubtime` datetime NOT NULL,
	  `updtime` datetime DEFAULT NULL,
	  `res_link` varchar(200) DEFAULT NULL,
	  `thumb_link` varchar(200) DEFAULT NULL,
	  `image_link` varchar(200) DEFAULT NULL,
	  `post_flag` tinyint(4) unsigned zerofill DEFAULT '0000',
	  `posttime` datetime DEFAULT NULL,
	  `thumb_flag` tinyint(4) unsigned zerofill DEFAULT '0000',
	  `image_flag` tinyint(4) unsigned zerofill DEFAULT '0000',
	  `fetch_flag` tinyint(4) unsigned zerofill DEFAULT '0000',
	  `res_html` text,
	  `entrytime` datetime DEFAULT NULL,
	  PRIMARY KEY (`entry_id`),
	  UNIQUE KEY `entry_id` (`entry_id`),
	  KEY `site_id` (`res_id`),
	  KEY `updtime` (`updtime`),
	  KEY `res_site` (`res_site`),
	  KEY `post_flag` (`post_flag`),
	  KEY `thumb_flag` (`thumb_flag`),
	  KEY `image_flag` (`image_flag`),
	  KEY `fetch_flag` (`fetch_flag`),
	  KEY `entrytime` (`entrytime`),
	  KEY `topic_id` (`topic_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
