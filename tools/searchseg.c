#include <scws.h>
#include <stdlib.h>
#include <stdio.h>
int getsline(char* line,int maxline) {
	int c,i;
	for(i=0;i<maxline-1 && (c=getchar())!=EOF && c !='\n';i++)
		line[i] = c;
	if(c == '\n')
		line[i++]=c;
	line[i] = '\0';

	return i;

}
int scat (char* des, char* src, int count) {
	char* dp;
	char* sp;
	int c = 0;
	dp = des + strlen(des);
	sp = src;
	*dp = ' ';
	dp++;
	for(c = 0; c < count; c++){
		*(dp++) = *(sp++);
	}
	*dp='\0';
	return c;
}
int main() {
	scws_t s;
	scws_res_t res, cur;
	char *text = "123456789012345678901234567890Hello, 我名字叫李那曲是一个中国人, 我有时买Q币来玩, 我还听说过C#语言";
	char instr[16000];
	char outstr[15000];
	int wordlen;
	outstr[0] = '\0';
	instr[0] = '\0';
	if (!(s = scws_new())) {
		printf("error, can't init the scws_t!\n");
		exit(-1);
	}
	scws_set_charset(s, "utf8");
	scws_set_dict(s, "/usr/local/scws/etc/dict.utf8.xdb", SCWS_XDICT_XDB);
	scws_set_rule(s, "/usr/local/scws/etc/rules.utf8.ini");
	
	while (getsline(instr,5000) > 1) {
			scws_send_text(s, instr, strlen(instr));
			while (res = cur = scws_get_result(s))
			{
				while (cur != NULL)
				{
					if (cur->len + strlen(outstr) < 14000) {
						scat(outstr,instr+cur->off,cur->len); 
					}
					cur = cur->next;
				}
				scws_free_result(res);
			}
			printf("%s",outstr);
			fflush(stdout);
			sync();
			instr[0] = '\0';
			outstr[0] = '\0';
	}
	scws_free(s);
}
