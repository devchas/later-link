'use strict';

const Path = require('path');
const Hapi = require('hapi');
const Hoek = require('hoek');

// Create a server with host and port
const server = new Hapi.Server();

server.connection({
	port: '3000',
	host: 'localhost'
});

server.register(require('vision'), (err) => {

	Hoek.assert(!err, err);

	server.views({
		engines: {
			html: require('handlebars')
		},
		relativeTo: __dirname,
		path: 'templates',
		layout: true,
		layoutPath: ('templates/layout') 
	});
});

// Add the route
server.route({
	method: 'GET',
	path: '/',
	handler: function (request, reply) {
		return reply.view('index');
	}
});

// Add the route
server.route({
	method: 'POST',
	path: '/send',
	handler: function (request, reply) {
		var data = request.payload;
		sendEmail(data);
		return reply.view('success');
	}
});

function sendEmail(data) {
	var sendgrid = require('sendgrid')('__APIKEY__');
	var body = 'Here is the link to that article you\'ve been meaning to read.  Enjoy! ' + data.link; 
	var email = new sendgrid.Email({
	  to:       data.email,
	  from:     data.email,
	  subject:  'Check out this article!',
	  text:     body
	});
	var sendDate = new Date();
	email.setSendAt(randomDate());
	sendgrid.send(email, function(err, json) {
	  if (err) { return console.error(err); }
	  console.log(json);
	 });
}

// Returns a random date within the next few days
function randomDate() {
	var d = new Date();
	var incr = Math.floor((Math.random()) + 1);
	d.setDate(d.getDate() + incr);
	console.log('New article send time: ' + d);
	return d.getTime()/1000;
}

// Start the server
server.start((err) => {

	if (err) {
		throw err;
	}
	console.log('Server running at:', server.info.uri)
});