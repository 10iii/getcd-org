(function () {
	var formattime = function (dtstr) {
		var dt = new Date(dtstr);
		var res = '' + dt.getFullYear()+'-'+
				((dt.getMonth()+1)>9?'':'0')+(dt.getMonth()+1)+'-'+
				(dt.getDate()>9?'':'0')+dt.getDate()+' '+
				dt.getHours()+':'+dt.getMinutes()+':'+dt.getSeconds();
		return res;
	};
	var div = function (item) {
		var restr = '';
		restr += '<div class="undefined"> <div class="postbox">' +
			'<div class="gcdthumbdiv"> <div class="thumb">' +
			'<a title="' + item.title + '" href="/topic/' + item.topic_id + 
			'" rel="bookmark"> <img src="http://img.getcd.org/t/' + 
			item.topic_id + 
			'.jpg" alt="' + item.topic_id + '"> </a>' +
			'</div><!--end: thumb-->' +
			'</div><!--end: class="gcdthumbdiv"-->' +
			'<div class="boxmeta left">' +
			'<h2> <a href="/topic/' + item.topic_id + '" rel="bookmark">' +
			'' + item.title + '</a></h2>' +
			'<!--' +
			'<span class="by">Posted by' +
			'<a href="http://www.bestwp.net/demo/freshblog/author/admin/" title="Posts by admin">admin</a>      on' +
			'July 28, 2010      </span> -->' +
			'</div>' +
			'<!--end: boxmeta-->' +
			'<div class="post-content">' +
			'<span>' + item.brief + '</span>' +
			'<br />' +
			'更新时间: ' + item.updtime + '' +
			'<br />' +
			'<div class="readmore">分类: ' +
			'<a href="/category/' + encodeURI(item.main_category) + 
			'" title="View all topics in ' + item.main_category + 
			'" rel="category tag">' + item.main_category + '</a>, ' +
			'<a href="/category/' + encodeURI(item.main_category + 
			'/' + item.sub_category) + 
			'" title="View all topics in ' + item.main_category+ 
			'/' + item.sub_category + 
			'" rel="category tag">' + item.sub_category + '</a> ' +
			'</div>' +
			'</div> <!--end: post-content-->' +
			'</div><!--end: postbox-->' +
			'</div><!--end: undefined-->';
		return restr;

	};
	module.exports = div;
}());
