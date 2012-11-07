var request = require('request');
var b = require('buffer');
var fs = require('fs');


request('http://i.simplecd.me/Yso1e5wH.jpg').pipe(fs.createWriteStream('test3.jpg'));
request('http://i.simplecd.me/Yso1e5wH.jpg', function (error, response, body) {
		if (!error && response.statusCode == 200) {
			//console.log(Buffer.isBuffer(response.body));
			console.log(body.length,response.body.length,body.toString() === response.body.toString());
			var buf = new Buffer(response.body,'binary');
			console.log(buf.length);
fs.createWriteStream('test4.jpg').write(buf);
			fs.writeFile('test2.jpg', response.body, null, function (err) {
				if (err) throw err;
				console.log('file saved');
			});
			//console.log(body) // Print the google web page.
		}
		});
