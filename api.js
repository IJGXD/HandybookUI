//----------------IMPORTS----------------
var mongojs = require('mongojs');
var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');
//----------------SETUP----------------

var app = express();

app.use(bodyParser());
app.listen(process.env.PORT || 80);
app.use(express.static(__dirname + '/clientFiles', {maxAge : 86400000}));

if(process.env.MONGOLAB_URI || process.env.MONGOHQ_URL)
	var db = mongojs(process.env.MONGOLAB_URI || process.env.MONGOHQ_URL, ["bookings", "counters"]);
else
	var db = mongojs("test", ["bookings", "counters"]);

var handyAPI = {
	user: '033f18c3c80ba2affaeb761b368e8d13',
	password: '66f4c547d6bb04c647432a1505b8b480',
	url : 'https://033f18c3c80ba2affaeb761b368e8d13:66f4c547d6bb04c647432a1505b8b480@clothestwin.com/api/v2/partners/bookings'
};

//----------------RESPONDERS----------------

app.post('/getPrice', function(req,res) {
	var address = handyAPI.url + '/quote?quote[zipcode]='+req.body.zip+'&quote[bedrooms]='+req.body.beds+'&quote[bathrooms]='+req.body.baths;
	console.log(address);
	request.get(address, function(err, response, body) {
		if (!err && response.statusCode == 200) {
			var responseDoc = JSON.parse(body);
    		res.send(JSON.stringify({
    			responseCode : 1,
    			price : responseDoc.price + " " + responseDoc.currency
    		}));
  		} else {
  			res.send(JSON.stringify({
    			responseCode : 2
    		}));
  		}
	});
});

app.post('/book', function(req,res) {
	getNextSequence("bookings", function(newID) {
		var booking = {
			id : newID,
			user_id: 123,
			listing_id:123,
			first_name:req.body.first_name,
			last_name:req.body.last_name,
			email:req.body.email,
			phone:req.body.phone,
			zipcode:req.body.zipcode,
			address_line_one:req.body.address_line_one,
			address_line_two:req.body.address_line_two,
			address_city:req.body.address_city,
			address_state:req.body.address_state,
			beds: parseInt(req.body.beds),
			baths: req.body.baths,
			time: req.body.time,
			status : "",
			comments: ""
		};

		db.bookings.save(booking, function(err) {
			if(!err)
				res.send(JSON.stringify({
					responseCode:1,
					id:newID
				}));
			else 
				res.send(JSON.stringify({
					responseCode:2
				}));
		});
	});
});

app.post('/getBookings', function(req, res) {
	db.bookings.find().sort({id:1},function(err, docs) {
		if(!err)
			res.send(JSON.stringify({
				responseCode : 1,
				bookings : docs
			}));
		else
			res.send(JSON.stringify({
				responseCode : 2
			})); 	
	});
});

app.post('/addComment', function(req,res) {
	db.bookings.update({id:req.body.id}, {$set:{comments : req.body.comment}}, {multi:false}, function() {
		res.send(JSON.stringify({
			responseCode:1
		}));
	});
});

app.post('/cancelBooking', function(req,res) {
	db.bookings.remove({id:req.body.id}, function(){
		res.send(JSON.stringify({
			responseCode:1
		}));
	});
});

//----------------HELLPERS----------------


function getNextSequence(name, callback) {
   db.counters.findAndModify(
          {
            query: { _id: name },
            update: { $inc: { seq: 1 } },
            new: true
          }
   );

   db.counters.findOne({_id: name}, function(err, doc) {
		callback(doc.seq);

   });
   
}