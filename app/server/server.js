const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const csvToJson = require('convert-csv-to-json');
const port = process.env.PORT || 5000;
var pdf = require('html-pdf');
const path = require('path');

const app = express();
app.use(express.static(__dirname + "/../build"));
app.use(bodyParser.urlencoded({extended:true}));  // parse nested obj
app.use(bodyParser.json());

var filePath = __dirname + '/file.json';
// filePath = '~/Library/Application\ Support/label-printer' + '/file.json';
var fileInputName = __dirname + '/daydots.csv';
////////////////////////////////////////////////////////////

// prepare data
var breakfastItems = [];
var lunchItems = [];
var breakfast = [];
var lunch = [];
var itemToDaydot = {};
var daydotToAruco = {};
var dropDownOptions = [];
var selectedImages = [];
// selected itemnames-->find daydots-->find aruco nums-->choose label pictures
function prepareData(filePath,fileInputName){
	breakfastItems = [];
	lunchItems = [];
	breakfast = [];
	lunch = [];
	itemToDaydot = {};
	daydotToAruco = {};
	dropDownOptions = [];
	selectedImages = [];


	data = fs.readFileSync(filePath).toString();
	obj = JSON.parse(data);

	// 1. create dictionary, {itemname: daydot}
	breakfast = obj.breakfast; //[{'name':    'daydot':   }]
	lunch = obj.lunch;
	for (var i = 0; i < breakfast.length; i++){
		var row = breakfast[i];
		itemToDaydot[row.name] = row.daydot;
	  breakfastItems.push(row.name);
	}
	for (var i = 0; i < lunch.length; i++){
		var row = lunch[i];
		itemToDaydot[row.name] = row.daydot;
	  lunchItems.push(row.name);
	}


	// 2. create dictionary, {daydot: aruco num}
	const json = csvToJson.fieldDelimiter(',') .getJsonFromCsv(fileInputName);
	// a list, [{ aruco: '0', daydots: '1A\r' }, {.....}]
	for(var i = 0; i < json.length; i++){
	    var row = json[i];
	    var daydot = row.daydots.slice(0,-1);
			daydotToAruco[daydot] = row.aruco;
	    dropDownOptions.push({'value':daydot, 'label':daydot});
	}

}


// end points

app.get('/', function(req, res){
	res.sendFile(path.join(__dirname, '/../build/index.html'));
})

app.get('/menu', function(req, res) {
	prepareData(filePath,fileInputName);
  res.send({
            items:breakfastItems,
            breakfastItems:breakfastItems,
            lunchItems:lunchItems,
            breakfast:breakfast,
            lunch:lunch,
            itemToDaydot:itemToDaydot,
            daydotToAruco:daydotToAruco,
            dropDownOptions:dropDownOptions,
            selectedImages:selectedImages
          });
}
)


app.post('/save', function(req, res){
  var data = req.body;
	itemToDaydot[data.name] = data.daydot;
	for (i = 0; i < breakfast.length; i++){
		if (breakfast[i].name === data.name){
	    breakfast[i].daydot = data.daydot;
    }
  }

	for (i = 0; i < lunch.length; i++){
		if (lunch[i].name === data.name){
	    lunch[i].daydot = data.daydot;
    }
  }

  newData = {'breakfast':breakfast,'lunch':lunch};

  fs.writeFile(filePath, JSON.stringify(newData), function(err){
		if (err){
			return console.error(err);
		}
	});

	res.send({
						itemToDaydot:itemToDaydot
					});

})

app.post('/print', function(req, res){
  selectedImages = []; // initial
  selectedItems = req.body.selected;
  // selectedDaydots = [];
	for (var i = 0; i < selectedItems.length; i++){
		item = selectedItems[i].trim();
		daydot = itemToDaydot[item].trim();
		imgNo = daydotToAruco[daydot];
		selectedImages.push({
       'img' : "http://localhost:5000/img/"+ imgNo +"_4x4_markers.jpg",
			 'item' : item,
			 'daydot' : daydot
	  });
	}
  res.send(selectedImages);
})


app.post('/pdf', function(req, res){
	var output = req.body.html
	// console.log(__dirname);  //     /Users/keyimashgin/Desktop/label-printer-v5-pdf/app/server
	// console.log('~~~~~~~',output)   //correct
	var options = { format: 'Letter' };
	pdf.create(output, options).toFile(path.join(__dirname, '../build/print.pdf'), function(err, response){
		if (err) return console.log(err)
	})

	res.send('finished');

  // res.sendFile(path.join(__dirname, '../build/print.pdf'))
})



app.listen(port, () => console.log(`Listening on port 5000`));
