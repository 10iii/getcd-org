#include <node.h>
#include <v8.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <scws.h>
using namespace v8;
using namespace node;
scws_t scws;
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

Handle<Value> initScws(const Arguments& args){
    HandleScope scope;
		scws = scws_new();
    if (!scws) {
        ThrowException(Exception::TypeError(String::New("initial failure")));
        return scope.Close(Undefined());
    }
    Handle<Value> arg0 = args[0];
    String::Utf8Value dict(arg0);
		scws_set_charset(scws, "utf8");
		//scws_set_dict(scws, *dict, SCWS_XDICT_XDB);
		scws_set_dict(scws, "/usr/local/scws/etc/dict.utf8.xdb", SCWS_XDICT_XDB);
		scws_set_rule(scws, "/usr/local/scws/etc/rules.utf8.ini");
    return scope.Close(Undefined());
}
Handle<Value> segment(const Arguments& args) {
    HandleScope scope;
    scws_res_t res, cur;
    Handle<Value> arg0 = args[0];
    String::Utf8Value txt(arg0);
	Local<Function> cb = Local<Function>::Cast(args[1]);
	char* inbuff = *txt;
    int txtLen = strlen(inbuff);
	int maxlen = txtLen * 10;
	char* outbuff = (char *)malloc(maxlen);
	outbuff[0] = '\0';
	scws_send_text(scws, inbuff, txtLen);
	while (res = cur = scws_get_result(scws))
	{
		while (cur != NULL)
		{
				if (cur->len + strlen(outbuff) < maxlen) {
					scat(outbuff, inbuff + cur->off, cur->len);
				}
			cur = cur->next;
		}
		scws_free_result(res);
	}
	const unsigned argc = 1;
	Local<Value> argv[argc] = { Local<Value>::New(String::New(outbuff)) };
	cb->Call(Context::GetCurrent()->Global(), argc, argv);
	free(outbuff);
	return scope.Close(Undefined());
}

void Init(Handle<Object> target) {
  target->Set(String::NewSymbol("init"),
		  FunctionTemplate::New(initScws)->GetFunction());
  target->Set(String::NewSymbol("segment"),
		  FunctionTemplate::New(segment)->GetFunction());
}

NODE_MODULE(searchseg,Init);
 

