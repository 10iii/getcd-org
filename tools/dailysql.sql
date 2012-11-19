DELETE FROM t USING gcd_topic_imp_sc AS t,gcd_entry AS e WHERE t.topic_id = e.topic_id AND e.fetch_flag > 1;


DELETE FROM t USING gcd_topic_imp_sc AS t,gcd_entry AS e WHERE t.topic_id = e.topic_id AND e.fetch_flag = 1 AND e.ext_flag_1 = 0;

REPLACE gcd_topic SELECT * FROM gcd_topic_imp_sc;
TRUNCATE TABLE gcd_topic_imp_sc;

UPDATE gcd_entry SET fetch_flag = 3 WHERE fetch_flag > 3;

UPDATE gcd_entry SET fetch_flag = 0 WHERE fetch_flag = 1 AND ext_flag_1 = 0;
