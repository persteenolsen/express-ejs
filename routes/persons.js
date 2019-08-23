var express = require('express')
var app = express()

// SHOW LIST OF PERSONS
app.get('/', function(req, res, next) {
	req.getConnection(function(error, conn) {
		conn.query('SELECT * FROM node_express_crud ORDER BY id DESC',function(err, rows, fields) {
			//if(err) throw err
			if (err) {
				req.flash('error', err)
				res.render('person/list', {
					title: 'A list of Persons', 
					data: ''
				})
			} else {
				// render to views/person/list.ejs template file
				res.render('person/list', {
					title: 'A list of Persons', 
					data: rows
				})
			}
		})
	})
})

// SHOW ADD PERSON FORM
app.get('/add', function(req, res, next){	
	// render to views/person/add.ejs
	res.render('person/add', {
		title: 'Add a new Person',
		name: '',
		age: '',
		email: ''		
	})
})

// ADD NEW PERSON POST ACTION
app.post('/add', function(req, res, next){	
	req.assert('name', 'Name is required').notEmpty()           //Validate name
	req.assert('age', 'Age is required').notEmpty()             //Validate age
    req.assert('email', 'A valid email is required').isEmail()  //Validate email

    var errors = req.validationErrors()
    
    if( !errors ) {   //No errors were found.  Passed Validation!
		
		/********************************************
		 * Express-validator module
		 
		req.body.comment = 'a <span>comment</span>';
		req.body.username = '   a user    ';

		req.sanitize('comment').escape(); // returns 'a &lt;span&gt;comment&lt;/span&gt;'
		req.sanitize('username').trim(); // returns 'a user'
		********************************************/
		var person = {
			name: req.sanitize('name').escape().trim(),
			age: req.sanitize('age').escape().trim(),
			email: req.sanitize('email').escape().trim()
		}
		
		req.getConnection(function(error, conn) {
			conn.query('INSERT INTO node_express_crud SET ?', person, function(err, result) {
				//if(err) throw err
				if (err) {
					req.flash('error', err)
					
					// render to views/user/add.ejs
					res.render('person/add', {
						title: 'Add a new Person',
						name: user.name,
						age: user.age,
						email: user.email					
					})
				} else {				
					req.flash('success', 'Data added successfully!')
					
					// render to views/person/add.ejs
					res.render('person/add', {
						title: 'Add a new Person',
						name: '',
						age: '',
						email: ''					
					})
				}
			})
		})
	}
	else {   //Display errors to user
		var error_msg = ''
		errors.forEach(function(error) {
			error_msg += error.msg + '<br>'
		})				
		req.flash('error', error_msg)		
		
		/**
		 * Using req.body.name 
		 * because req.param('name') is deprecated
		 */ 
        res.render('person/add', { 
            title: 'Add a new Person',
            name: req.body.name,
            age: req.body.age,
            email: req.body.email
        })
    }
})

// SHOW EDIT PERSON FORM
app.get('/edit/(:id)', function(req, res, next){
	req.getConnection(function(error, conn) {
		conn.query('SELECT * FROM node_express_crud WHERE id = ?', [req.params.id], function(err, rows, fields) {
			if(err) throw err
			
			// if person not found redirect to list of persons
			if (rows.length <= 0) {
				req.flash('error', 'Person not found with id = ' + req.params.id)
				res.redirect('/persons')
			}
			else { // if person found
				// render to views/person/edit.ejs template file
				res.render('person/edit', {
					title: 'Edit the selected Person', 
					//data: rows[0],
					id: rows[0].id,
					name: rows[0].name,
					age: rows[0].age,
					email: rows[0].email					
				})
			}			
		})
	})
})

// EDIT PERSON POST ACTION
app.put('/edit/(:id)', function(req, res, next) {
	req.assert('name', 'Name is required').notEmpty()           //Validate name
	req.assert('age', 'Age is required').notEmpty()             //Validate age
    req.assert('email', 'A valid email is required').isEmail()  //Validate email

    var errors = req.validationErrors()
    
    if( !errors ) {   //No errors were found.  Passed Validation!
		
		/********************************************
		 * Express-validator module
		 
		req.body.comment = 'a <span>comment</span>';
		req.body.username = '   a user    ';

		req.sanitize('comment').escape(); // returns 'a &lt;span&gt;comment&lt;/span&gt;'
		req.sanitize('username').trim(); // returns 'a user'
		********************************************/
		var person = {
			name: req.sanitize('name').escape().trim(),
			age: req.sanitize('age').escape().trim(),
			email: req.sanitize('email').escape().trim()
		}
		
		req.getConnection(function(error, conn) {
			conn.query('UPDATE node_express_crud SET ? WHERE id = ' + req.params.id, person, function(err, result) {
				//if(err) throw err
				if (err) {
					req.flash('error', err)
					
					// render to views/user/add.ejs
					res.render('person/edit', {
						title: 'Edit the selected Person',
						id: req.params.id,
						name: req.body.name,
						age: req.body.age,
						email: req.body.email
					})
				} else {
					req.flash('success', 'Data updated successfully!')
					
					// render to views/person/add.ejs
					res.render('person/edit', {
						title: 'Edit the selected Person',
						id: req.params.id,
						name: req.body.name,
						age: req.body.age,
						email: req.body.email
					})
				}
			})
		})
	}
	else {   //Display errors to person
		var error_msg = ''
		errors.forEach(function(error) {
			error_msg += error.msg + '<br>'
		})
		req.flash('error', error_msg)
		
		/**
		 * Using req.body.name 
		 * because req.param('name') is deprecated
		 */ 
        res.render('person/edit', { 
            title: 'Edit the selected Person',            
			id: req.params.id, 
			name: req.body.name,
			age: req.body.age,
			email: req.body.email
        })
    }
})

// DELETE PERSON
app.delete('/delete/(:id)', function(req, res, next) {
	var person = { id: req.params.id }
	
	req.getConnection(function(error, conn) {
		conn.query('DELETE FROM node_express_crud WHERE id = ' + req.params.id, person, function(err, result) {
			//if(err) throw err
			if (err) {
				req.flash('error', err)
				// redirect to persons list page
				res.redirect('/persons')
			} else {
				req.flash('success', 'Person deleted successfully! id = ' + req.params.id)
				// redirect to persons list page
				res.redirect('/persons')
			}
		})
	})
})

module.exports = app
