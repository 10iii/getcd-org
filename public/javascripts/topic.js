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
