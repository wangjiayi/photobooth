var express = require('express');
var formidable = require('formidable');
var app = express();


app.use(express.static('./public/photobooth')); // serve static files from public
var querystring = require('querystring'); // handy for parsing query strings
var sqlite3 = require("sqlite3").verbose();  // use sqlite

var dbFile = "photos.db"
var db = new sqlite3.Database(dbFile);  // new object, old DB
var cmdStr = "CREATE TABLE IF NOT EXISTS photoLabels (fileName TEXT UNIQUE NOT NULL PRIMARY KEY, labels TEXT, favorite INTEGER)"
db.run(cmdStr);

var LIVE = true;
var APIrequest = require('request');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
APIurl = 'https://vision.googleapis.com/v1/images:annotate?key=AIzaSyBEcrGFtsdXlhSa9Omip9YIPYVQ2Hf1bbo';

function errorCallback(err) {
    if (err) {
    console.log("error: ",err,"\n");
    }
}

//upload photos
app.post('/', function (request, response){
    var form = new formidable.IncomingForm();
    var fileName="";
    form.parse(request);
    form.on('fileBegin', function (name, file){
        file.path = __dirname + '/public/photobooth/photo/' + file.name;
        fileName = file.name;
        console.log("uploading ",file.name,name);
        console.log("starting DB operations");
        console.log(fileName);
        db.run(
            "INSERT OR REPLACE INTO photoLabels VALUES ('"+fileName +"','',0)",
            errorCallback);
    });
    form.on('end', function (){
        requestObject = {
          "requests": [
            {
              "image":{
                    "source": {"imageUri": "http://138.68.25.50:12501/photo/"+fileName}
                },
              "features": [{ "type": "LABEL_DETECTION" }]
            }
          ]
        }
        if (LIVE) {
            // The code that makes a request to the API
            // Uses the Node request module, which packs up and sends off
            // an XMLHttpRequest.
            APIrequest(
            { // HTTP header stuff
                url: APIurl,
                method: "POST",
                headers: {"content-type": "application/json"},
                // stringifies object and puts into HTTP request body as JSON
                json: requestObject,
            },APIcallback);
            console.log(requestObject.requests[0].image.source.imageUri);
        } else {// not live! return fake response
                    // call fake callback in 2 seconds
            console.log("not live");
            setTimeout(fakeAPIcallback, 2000);
        }

        // live callback function
        function APIcallback(err, APIresponse, body) {
            if ((err) || (APIresponse.statusCode != 200)) {
        	   console.log("Got API error");
            } else {
        	   APIresponseJSON = body.responses[0];
        	   console.log(APIresponseJSON);
               console.log(APIresponseJSON.labelAnnotations.length);
               var newLabel = "";
                for(var i = 0; i< APIresponseJSON.labelAnnotations.length; i++){
                    newLabel += APIresponseJSON.labelAnnotations[i].description;
                    if(i != APIresponseJSON.labelAnnotations.length - 1){
                        newLabel += ",";
                    }
                    console.log(newLabel);
                    console.log("tryend")
                }
                db.run(
                    "UPDATE photoLabels SET labels = '"+newLabel+"' WHERE fileName = '"+fileName+"'", updateCallbackAPI);
                        // function getCallbackAPI(err,data) {
                        //     console.log("INSERT photoLabels SET labels = '"+newLabel+"' WHERE fileName = '"+fileName+"'");
                        //     console.log("getting labels from "+fileName);
                        //     if (err) {
                        //         console.log("error: ",err,"\n");
                        //     } else {
                        //         fakeAPIcallback();
                        //     }
                        // }
                function updateCallbackAPI(err) {
                    console.log("updating labels for "+fileName+"\n");
                    if (err) {
                        console.log(err+"\n");
                        sendCode(400,response,"requested photo not found");
                    } else {
                        // send a nice response back to browser
                        sendCode(200,response,newLabel);
                    }
                }
            }
        }
        // // fake callback function
        // function fakeAPIcallback() {
        //     console.log("fake");
        // 	console.log( ` { labelAnnotations:
        //     [ { mid: '/m/026bk', description: 'fakeLabel1', score: 0.89219457 },
        //      { mid: '/m/05qjc',
        //        description: 'fakeLabel2',
        //        score: 0.87477195 },
        //      { mid: '/m/06ntj', description: 'fakeLabel3', score: 0.7928342 },
        //      { mid: '/m/02jjt',
        //        description: 'fakeLabel4',
        //        score: 0.7739482 },
        //      { mid: '/m/02_5v2',
        //        description: 'fakeLabel5',
        //        score: 0.70231736 } ] }` );
        // }
        // console.log('success');
        // sendCode(201,response,'recieved file');  // respond to browser
    });
});

//get photos
app.get('/photos', function (request, response){
    db.all('SELECT * FROM photoLabels',dataCallback);
    function dataCallback(err, tableData) {
        console.log("getAllData");
        if (err) {
            console.log("error: ",err,"\n");
            sendCode(400,response,err);

        } else {
            console.log("got: ",tableData,"\n");
            console.log("getAllData" + tableData);
            sendCode(200,response,tableData);
        }
    }
});






function sendCode(code,response,message) {
    response.status(code);
    response.send(message);
}

//check if query exist and then answer to add or delete
app.get('/query', function (request, response){
    console.log("query");
    query = request.url.split("?")[1]; // get query string
    if (query) {
       answer(query, response);
    } else {
       sendCode(400,response,'query not recognized');
    }
});

app.listen(12501);

//add and delete labels
function answer(query, response) {
    // query looks like: op=add&img=[image filename]&label=[label to add]
    queryObj = querystring.parse(query);
    newLabel = queryObj.label;
    imageFile = queryObj.img;
    if (queryObj.op == "add") {
        if (newLabel && imageFile) {
            db.get(
                 'SELECT labels FROM photoLabels WHERE fileName = ?', [imageFile], getCallback);
            function getCallback(err,data) {
                console.log("getting labels from "+imageFile);
                if (err) {
                    console.log("error: ",err,"\n");
                } else {
                    if(data.labels.length != 0){
                        newLabel = data.labels + "," + newLabel;
                    }
                    else{
                        newLabel = data.labels + newLabel;
                    }
                    
                    db.run(
                        'UPDATE photoLabels SET labels = ? WHERE fileName = ?', [newLabel, imageFile],
                        updateCallback);
                }
            }
            // Also define this inside queries so it knows about
            // response object
            function updateCallback(err) {
                console.log("updating labels for "+imageFile+"\n");
                if (err) {
                    console.log(err+"\n");
                    sendCode(400,response,"requested photo not found");
                } else {
                    // send a nice response back to browser
                    response.status(200);
                    response.type("text/plain");
                    response.send(newLabel);
                }
            }
        }
    }else if(queryObj.op == "delete"){
        if (newLabel && imageFile) {
            db.get(
                 'SELECT labels FROM photoLabels WHERE fileName = ?', [imageFile], getCallback2);
            function getCallback2(err,data) {
                console.log("getting labels from "+imageFile);
                if (err) {
                    console.log("error: ",err,"\n");
                } else {
                    // good response...so let's update labels
                    console.log("delete: ",data.labels,"\n");
                    var dataList = data.labels.split(',');
                    var finalData = '';
                    for(var i = 0;  i < dataList.length; i++){
                        if(dataList[i] != newLabel){
                            finalData += (dataList[i] + ',');
                            
                        }

                        
                    }
                    if(finalData.charAt(finalData.length-1)=="," || finalData.charAt(finalData.length-1)==" "){
                            finalData=finalData.substring(0,finalData.length-1);
                        }
                    console.log("finalData: ",finalData,"\n");
                    db.run(
                        'UPDATE photoLabels SET labels = ? WHERE fileName = ?',[finalData, imageFile],
                        updateCallback2);
                }
            }
            function updateCallback2(err) {
                console.log("updating labels for "+imageFile+"\n");
                if (err) {
                    console.log(err+"\n");
                    sendCode(400,response,"requested photo not found");
                } else {
                    // send a nice response back to browser
                    response.status(200);
                    response.type("text/plain");
                    response.send("remaining labels are "+newLabel+" for "+imageFile);
                }
            }
        }
    }
    /************************************************************************************************************************************* added ******************************************/
        else if (queryObj.op == "filter") {
            if (newLabel) {
                console.log(newLabel);
                db.all(
                    'SELECT fileName FROM photoLabels WHERE labels LIKE ?', ["%" + newLabel + "%"], dataCallback);

                function dataCallback(err, tableData) {
                    if (err) {
                        console.log("error: ", err, "\n");
                    } else {
                        console.log("got: ", tableData, "\n");
                        response.status(200);
                        response.type("text/plain");
                        response.send(tableData);

                    }
                }


            }

        } else if (queryObj.op == "favorite") {

            if (imageFile) {
                console.log(imageFile);
                db.get(
                    'SELECT favorite FROM photoLabels WHERE fileName = ?', [imageFile], getCallback3);

                function getCallback3(err, data) {
                    if (err) {
                        console.log("error: ", err, "\n");
                    } else {
                        if (data.favorite != 1) {
                            db.run(
                                'UPDATE photoLabels SET favorite = ? WHERE fileName = ?', [1, imageFile],
                                updateCallback3);

                            function updateCallback3(err) {
                                if (err) {
                                    console.log("error: ", err, "\n");
                                } else {
                                    response.status(200);
                                    response.type("text/plain");
                                    response.send(imageFile + " is marked as favorite");

                                }
                            }

                        } else {
                            db.run(
                                'UPDATE photoLabels SET favorite = ? WHERE fileName = ?', [0, imageFile],
                                updateCallback4);

                            function updateCallback4(err) {
                                if (err) {
                                    console.log("error: ", err, "\n");
                                } else {
                                    response.status(200);
                                    response.type("text/plain");
                                    response.send(imageFile + " is marked as unfavorite");

                                }
                            }

                        }

                    }

                }




            }

        } else if (queryObj.op == "getFavorite") {
            db.all(
                'SELECT fileName FROM photoLabels WHERE favorite = ?', [1], dataCallback2);

            function dataCallback2(err, tableData) {
                if (err) {
                    console.log("error: ", err, "\n");
                } else {
                    console.log("got: ", tableData, "\n");
                    response.status(200);
                    response.type("text/plain");
                    response.send(tableData);

                }
            }
        }
    /************************************************************************************************************************************* End of added ******************************************/
}
