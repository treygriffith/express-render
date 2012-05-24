express-render
==============
### Stand-alone View Rendering for Express

`express-render` is a tiny library that uses a modified version of the view renderer
 from [Express](http://www.expressjs.com) (`res.render`) to allow rendering of templates,
 complete with local variables, outside of the context of a `res` object.

 It needs to be installed along side a functioning Express server, as it still uses parts
 of Express.

 Its primary purpose is to allow view rendering for emails and the like, which are nice to template, but don't need to be 
 sent back as part of the response.


 Installation
 ------------

Through [NPM](http://www.npmjs.org) - working on adding to the Registry
 ``` bash
 $ npm install https://github.com/treygriffith/express-render.git
 ```

 or using Git
 ``` bash
 $ git clone git://github.com/treygriffith/express-render.git node_modules/express-render/
 ```

 How to Use
 ----------

 Require the module, and initialize it, inputting your initialized Express server.
 When you want to render a view, simply pass it a template name, your local variables,
 and, optionally, a callback function.

 The following example shows the entire process, leaving out steps like setting up a template engine, etc.

## Example:	
 ``` javascript
 // Require modules
 var express = require('express');
 var expressRender = require('express-render');

 // Initalize Express
 var app = express.createServer();

 // Initialize express-render
 expressRender.init(express, app);

 // Set up Templating Engine, View directory, etc
 // ...

 // Set up responder
 app.get("/", function(req, res) {
 	
 	// Asynchronous use of express-render
 	expressRender.render(
 		"mytemplate", 
	 	{
	 		locals: {
	 			this: "is",
	 			a: "local"
	 		}
	 	}, 
	 	function(error, rendered_view) {
 			// Do something with my rendered view
 		}	
 	);

 	// Synchronous use of express-render
 	var rendered_view = expressRender.render(
 		"mytemplate", 
 		{
	 		locals: {
	 			this: "is",
	 			a: "local"
	 		}
 		}
 	);

 	// My previously rendered template is outside the context of this
 	res.render("adifferentemplate");

 });

 app.listen(process.env.PORT || 3000);

 ```

 Notes
 -----
 This is a work in progress. It likely contains far too much of the Express rendering function and can be much improved.
 Based on looking at Express, it looks like stand-alone view rendering will be a feature of Express 3.x via app.render, 
 which will make this lib obsolete.

