var checkAll = function (str,checked) {
	var ed2ktable = $('table.ed2kzone>tbody');
	ed2ktable.find('input[name='+str+']').each(function(idx, el){
		var theone = $(el);
		if (checked) {
			theone.attr('checked','true');
		} else {
			theone.removeAttr('checked');
		}
	});
	em_size(str);
};
var em_size =  function (str) {
	var ed2ktable = $('table.ed2kzone>tbody');
	var size = 0;
	var allchecked = true;
	ed2ktable.find('input[name='+str+']').each(function(idx, el){
		var theone = $(el);
		if (theone.attr('checked')) {
			var m = theone.val().split('|');
			size += m[3]*1;
		} else {
			allchecked = false;
		}
	});
	if (allchecked) {
		ed2ktable.find('#checkall_' + str).attr('checked', 'true');
	} else {
		ed2ktable.find('#checkall_' + str).removeAttr('checked');
	}
	ed2ktable.find('#size_' + str).html(gen_size(size, 3, 1));
};
function gen_size(val, li, sepa ) {
	if (parseInt(val)<1) return 0;
	sep = Math.pow(10, sepa); //小数点后的位数
	li = Math.pow(10, li); //开始截断的长度
	retval = val;
	unit = 'Bytes';
	if (val >= li*1000000000) {
		val = Math.round( val / (1099511627776/sep) ) / sep;
		unit = 'TB';
	} else if (val >= li*1000000) {
		val = Math.round( val / (1073741824/sep) ) / sep;
		unit = 'GB';
	} else if (val >= li*1000) {
		val = Math.round( val / (1048576/sep) ) / sep;
		unit = 'MB';
	} else if (val >= li) {
		val = Math.round( val / (1024/sep) ) / sep;
		unit = 'KB';
	}
	return val + unit;
}
function copy(str) {
	var a = document.getElementsByName(str);
	var n = a.length;
	var ed2kcopy = "";
	for (var i = 0; i < n; i++) {
		if(a[i].checked) {
			ed2kcopy += a[i].value;
			ed2kcopy += "\n";
		}
	}
	copyToClipboard(ed2kcopy);
}
function countlink(str){
	var r = 0;
	a = document.getElementsByName(str);
	n = a.length;
	for ( var i = 0; i < n; i++ ){
		if ( a[i].checked) {
			r += 1;
		}
	}
	return r;
}
function copy2popup(str){
	var a = document.getElementsByName(str);
	var n = a.length;
	var ed2kcopy = "";
	for (var i = 0;i < n; i++) {
		if (a[i].checked) {
			ed2kcopy += a[i].value;
			ed2kcopy += "<br>\n";
		}
	}
	return ed2kcopy;
}
function copyToClipboard(txt) {
	if(window.clipboardData) {
		window.clipboardData.clearData();
		window.clipboardData.setData("Text", txt);
	} else if(navigator.userAgent.indexOf("Opera") != -1) {
		window.location = txt;
	} else if (window.netscape) {
		try {
			netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
		} catch (e) {
			alert("被浏览器拒绝！\n请在浏览器地址栏输入'about:config'并回车\n然后将'signed.applets.codebase_principal_support'设置为'true'");
		}
		var clip = Components.classes['@mozilla.org/widget/clipboard;1'].createInstance(Components.interfaces.nsIClipboard);
		if (!clip)
			return;
		var trans = Components.classes['@mozilla.org/widget/transferable;1'].createInstance(Components.interfaces.nsITransferable);
		if (!trans)
			return;
		trans.addDataFlavor('text/unicode');
		var str = new Object();
		var len = new Object();
		var str = Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);
		var copytext = txt;
		str.data = copytext;
		trans.setTransferData("text/unicode",str,copytext.length*2);
		var clipid = Components.interfaces.nsIClipboard;
		if (!clip)
			return false;
		clip.setData(trans,null,clipid.kGlobalClipboard);
	}
}
function download(str, i, first) {
	var a = document.getElementsByName(str);
	var n = a.length;

	//尝试使用activex方式批量新增下载
	try {
		var ed2k_links = '';
		var ax = new ActiveXObject("IE2EM.IE2EMUrlTaker");
		var emule_version = ax.GetEmuleVersion();
		if ('e' != emule_version.substr(0,1)) {
			throw {errorCode:'eMule not Installed.'};
		}
		for (var i = i; i < n; i++) {
			if(a[i].checked) {
				if (ed2k_links=='') {
					ed2k_links = a[i].value;
				} else {
					ed2k_links += "\n"+a[i].value;
				}
			}
		}
		ax.SendUrl(ed2k_links, 'dd', document.location);
		delete ax;
		return;
	} catch (e) {}

	if (!window.continueDown) {
		//使用最旧的方法来批量新增下载
		for (var i = i; i < n; i++) {
			if(a[i].checked) {
				window.location=a[i].value;
				if (first)
					timeout = 6000;
				else
					timeout = 500;
				i++;
				window.setTimeout("download('"+str+"', "+i+", 0)", timeout);
				break;
			}
		}
	} else {
		//使用稍微新一点的方法来批量新增下载
		for (var i = i; i < n; i++) {
			if(a[i].checked) {
				if(first){
					var k = i;
					var current_link = a[k].nextSibling;
					var multi_text = '';
					var tmp_counter = 0;
					var comma = '';
					while(true){
						if(a[k].checked && current_link){//如果是有效节点并且被选中
							if(current_link.href){
								if(current_link.href.indexOf('ed2k') !== 0){
									current_link = current_link.nextSibling;
									continue;
								}
								if(tmp_counter > 7){//收集超过若干个有效链接后，退出
									multi_text += '<br />…………';
									break;
								}
								var right_link = current_link;
								tmp_counter++;
								if (navigator.userAgent.toLowerCase().indexOf("msie")==-1) {
									multi_text += comma+current_link.text;
								}else{
									multi_text += comma+current_link.innerText;
								}
								comma = '<br />';
							}

							current_link = current_link.nextSibling;
						}else{//未被选中，或往下没有相邻节点了，那么切换到下个父节点
							if(++k >= n){//如果父节点也到底了，那么退出
								break;
							}
							current_link = a[k].nextSibling;
						}
					}
					downPopup(right_link,multi_text);
				}

				continueDown(a[i].value);
				//window.location=a[i].value;
				if (first)
					timeout = 6000;
				else
					timeout = 500;
				i++;
				window.setTimeout("download('"+str+"', "+i+", 0)", timeout);
				break;
			}
		}
	}
}
var topicinit = function()
{	
	var sizesum = 0;
	var ed2ktable = $('table.ed2kzone>tbody');
	ed2ktable.find('tr[name=itemline]').each(function(idx, el){
		var theone = $(el);
		var itemsize = (theone.find('td>input').val().split("|")[3])*1
		sizesum += itemsize;
		theone.find('td.itemsize').html(gen_size(itemsize,3,1));
	});
	ed2ktable.find('tr>td.sizesum').html(gen_size(sizesum,3,1));
	
	ed2ktable.find('tr:odd>td').addClass('post2');
	
	
}
$(document).ready(function() 
{
	topicinit();
	
	$('input#copyselect').mouseenter(function(){
		var tempstr = '';
		$('table.ed2kzone>tbody>tr[name="itemline"]>td>:checked').each(function(ind,el){
			tempstr += $(el).val()+'\n';
		});
		$('div#popupcontent>textarea').html(tempstr);
		
	});
	
	
});
