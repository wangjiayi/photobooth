var count = 0;
var idNameMap = {};
var tableData;

var favoriteToggle = false; ////////////////////////////////////////////////////added

function getPhotos(){
    var f_url = "http://138.68.25.50:12501/photos";
    var oReq = new XMLHttpRequest();
    //oReq is response result
    oReq.open("GET", f_url, true);
    oReq.onload = function() {
        console.log(oReq.responseText);
        tableData = JSON.parse(oReq.responseText);
        generateHTML();
        count = tableData.length;
    }
    oReq.send();
}



function uploadPhoto(){
	var url = "http://138.68.25.50:12501";
    var selectedFile = document.getElementById('choose').files[0];
    var formData = new FormData();
    formData.append("userfile", selectedFile);

    var photoObj = {};
    photoObj.fileName = selectedFile.name;
    photoObj.labels = "";
    photoObj.favorite = 0;
    idNameMap[count] = selectedFile.name;

    createDiv(photoObj , count);


    var image = document.getElementById('p_' + count);
    idNameMap[count] = selectedFile.name;
    var fr = new FileReader();

    var progressBar = document.getElementById("myProgress" + count);  /////////////progress Bar
    var myBar = document.getElementById("myBar" + count);            /////////////progress Bar

    fr.onload = function () {
        image.src = fr.result;
        image.style.opacity = 0.5;
        progressBar.style.display = "block";                     /////////////progress Bar

    };
    fr.readAsDataURL(selectedFile);


    var oReq = new XMLHttpRequest();
    oReq.open("POST", url, true);
    oReq.onload = function() {
        console.log(oReq.responseText);
    }
    oReq.upload.addEventListener("progress", function(e) {
            var completed = parseInt(e.loaded / e.total * 100);
            myBar.style.width = completed + "%";                /////////////progress Bar
            if (completed == 100) {
                progressBar.style.display = "none";               /////////////progress Bar
                image.style.opacity = 1.0;
            }
        }, false);

    function reqFinishedListener (){
        var response = this.responseText;
        var labelList = response.split(',');
        for(var j=0; j<labelList.length; j++){
            createDeleDiv(labelList,j,count);
        }
        count++;
    }
    oReq.addEventListener("load",reqFinishedListener);
    oReq.send(formData);

}

function deleteLabel(value,indexj,indexi){
    var imgName = idNameMap[indexi];
    var url = "http://138.68.25.50:12501/query?op=delete&img="+imgName+"&label="+value;
    function reqListener(){
       var labelDiv = document.getElementById("para_"+indexi+indexj);
       var deleteSign = document.getElementById("deleImg_"+indexi+indexj);
       labelDiv.parentNode.removeChild(labelDiv);
       deleteSign.parentNode.removeChild(deleteSign);
    }
    var oReq = new XMLHttpRequest();
    oReq.addEventListener("load",reqListener);
    oReq.open("GET",url);
    oReq.send();
}


function addLabels(value, index){
    var imgName = idNameMap[index];
    var url = "http://138.68.25.50:12501/query?op=add&img="+imgName+"&label="+value;
    function reqListener (){
        var pgh = document.getElementById("deleteDiv"+index);
        pgh.innerHTML = '';
        var response = this.responseText;
        var labelList = response.split(',');
        for(var j=1; j<labelList.length; j++){
            createDeleDiv(labelList,j,index);
        }
    }
    var oReq = new XMLHttpRequest();
    oReq.addEventListener("load", reqListener);
    oReq.open("GET", url);
    oReq.send();
}

/*********************************************************************************************** Filter by label ***************************************/
function filter(){
    var targetLabel = document.getElementById("filter").value;
    var photoDivs = document.getElementsByClassName("flexy");
    if(targetLabel !==""){
      var url = "http://138.68.25.50:12501/query?op=filter&img=empty&label="+targetLabel;
      function reqListener (){

          var response = this.responseText;
          var imgObj=JSON.parse(response);
          console.log(imgObj);
          if(imgObj.length>0){
            for(var i=0;i<photoDivs.length;i++){
                photoDivs[i].style.display="none";
            }

            for(var i=0;i<imgObj.length;i++){
              console.log(imgObj[i].fileName);
              var photoToshow = document.getElementsByClassName(imgObj[i].fileName)[0];
              photoToshow.style.display="block";
            }
          }
          else{
            for(var i=0;i<photoDivs.length;i++){
                photoDivs[i].style.display="none";
            }
          }

      }
      var oReq = new XMLHttpRequest();
      oReq.addEventListener("load", reqListener);
      oReq.open("GET", url);
      oReq.send();

    }

}

function clearFilter(){
    document.getElementById("filter").value="";
    var photoDivs = document.getElementsByClassName("flexy");
    for(var i=0;i<photoDivs.length;i++){
        photoDivs[i].style.display="block";
    }


}

function filterFavorite(){
  var photoDivs = document.getElementsByClassName("flexy");
  var url = "http://138.68.25.50:12501/query?op=getFavorite&img=empty&label=empty";
  if(!favoriteToggle){

    function reqListener (){
        var response = this.responseText;
        var imgObj=JSON.parse(response);
        if(imgObj.length>0){
          for(var i=0;i<photoDivs.length;i++){
              photoDivs[i].style.display="none";
          }

          for(var i=0;i<imgObj.length;i++){
            console.log(imgObj[i].fileName);
            var photoToshow = document.getElementsByClassName(imgObj[i].fileName)[0];
            photoToshow.style.display="block";
          }
        }
        else{
          for(var i=0;i<photoDivs.length;i++){
              photoDivs[i].style.display="none";
          }
        }

    }
    var oReq = new XMLHttpRequest();
    oReq.addEventListener("load", reqListener);
    oReq.open("GET", url);
    oReq.send();
    favoriteToggle = true;

  }
  else{

    for(var i=0;i<photoDivs.length;i++){
        photoDivs[i].style.display="block";
    }
    favoriteToggle = false;
  }

}
/*********************************************************************************************** End of Filter by label ***************************************/

/*********************************************************************************************** add to favorite ***************************************/
function addFavorite(filename){
  var url = "http://138.68.25.50:12501/query?op=favorite&img="+filename+"&label=empty";
  function reqListener (){

      var response = this.responseText;
      console.log(response);

  }
  var oReq = new XMLHttpRequest();
  oReq.addEventListener("load", reqListener);
  oReq.open("GET", url);
  oReq.send();

}
/*********************************************************************************************** End of add to favorite ***************************************/
