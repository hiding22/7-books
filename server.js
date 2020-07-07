// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const shortid = require('shortid')
 
const adapter = new FileSync('db.json');
const db = low(adapter);

// Set some defaults
db.defaults({ books: [] }).write()

app.set('view engine', 'pug')
app.set('views', './views')
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.get("/books", (request, response) => {
	response.render('index', {
		books: db.get('books').value()
	});
});	

app.get("/books/search", (request, response)=> {
	var q = request.query.q;
	var matched = db.get('books').value().filter(function (book) {
    	return book.title.toLowerCase().indexOf(q.toLowerCase()) !== -1; 
	});

	response.render('index', {
    books: matched
  });
});

app.get("/books/create", (req, res) => {
	res.render('create');
});

app.get('/books/:id/delete', (req, res) => {
	var id = req.params.id;

	var book = db.get('books').find({ id: id }).value();

	db.get('books')
	.remove({ id: book.id })
	.write();
	res.redirect('/books');
});

app.get('/books/:id/view', (req, res) => {
	var id = req.params.id;

	var book = db.get('books').find({ id: id }).value();
	res.render('view', {
		book: book
	})
});

app.get('/books/update/:id', (req, res) => { 
	res.render('update', {
		id: req.params.id
	});
});

app.post('/books/update/:id', (req, res) => {
	db.get('books')
	.find({ id: req.params.id })
	.assign({ title: req.body.title })
	.write();
	res.redirect("/books")
});

app.post("/books/create", (req, res) => {
	req.body.id = shortid.generate();
	db.get('books').push(req.body).write();
	res.redirect('/books');
});

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
