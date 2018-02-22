
function generateHTML(){
	for (var i=0; i<tableData.length; i++) {
		var photoObj = tableData[i];
		var labelString = photoObj.labels;
		var labelList = labelString.split(",");
		idNameMap[i] = photoObj.fileName;
		createDiv(photoObj, i);
		var deleteDiv = document.getElementById("deleteDiv"+i);
		deleteDiv.innerHTML="";
		if(labelString != ""){
			for(var j=0; j<labelList.length; j++){
			createDeleDiv(labelList,j,i);
			}

		}

    }
}

function createDeleDiv(labelList,j,i){

	//child of deleteDive
	deleteDiv = document.getElementById("deleteDiv"+i);
	deleImg = document.createElement("img");
	deleteDiv.appendChild(deleImg);
	deleImg.className = "deleImg";
	deleImg.id = "deleImg_"+i+j;
	deleImg.src = "images/removeTagButton.png";
	para = document.createElement("p");
	deleteDiv.appendChild(para);
	para.id = "para_"+i+j;
	para.className = "para";
	para.textContent = labelList[j];



	deleImg.style.display = "block";
	deleImg.onclick = (function(){
		var currentJ = j;
		var currentI = i;
		return function(){
			deleteLabel(labelList[j],currentJ +'',currentI +'');
		}
	})();
}
function createDiv(photoObj, i){
	console.log(photoObj.fileName);
	var mLeft = document.getElementById("m_left");

	//child of m_left
	photoDiv = document.createElement("div");
	mLeft.appendChild(photoDiv);
	photoDiv.id = "photoDiv"+i;
	photoDiv.className = "flexy"+" "+photoObj.fileName;           /////////////////////////////////////////changed part


	//child of flexy=photoDive
	pictureBox = document.createElement("div");
	photoDiv.appendChild(pictureBox);
	pictureBox.className = "picturebox";

	tagS = document.createElement("div");
	photoDiv.appendChild(tagS);
	tagS.id = "l_"+i;
	tagS.className = "tags";

	/***************** Create Progress Bar *******************/
	var progressBar = document.createElement('div');
	var myBar = document.createElement('div');
	// give id
	progressBar.id='myProgress' + i;
	myBar.id='myBar' + i;
	// give className
	myBar.className='Bar';
	progressBar.className='Progress';

	progressBar.appendChild(myBar);
	photoDiv.appendChild(progressBar);
	/***************** END Progress Bar *******************/


	addSection = document.createElement("div");
	photoDiv.appendChild(addSection);
	addSection.id = "addSection_"+i;
	addSection.className = "addsection";


	//child of picturebox
	photoImg = document.createElement("img");
	pictureBox.appendChild(photoImg);
	photoImg.id = "p_"+i;
	photoImg.className = "photo";
	photoImg.src = "photo/"+ photoObj.fileName;

	triAngle = document.createElement("div");
	pictureBox.appendChild(triAngle);
	triAngle.className = "triangle";

	navig = document.createElement("nav");
	pictureBox.appendChild(navig);
	navig.id = "f_"+i;


	//child of tags
	deleteDiv = document.createElement("div");
	tagS.appendChild(deleteDiv);
	deleteDiv.id = "deleteDiv" + i;
	deleteDiv.className = "deleteDiv";

/*
	var labelString = photoObj.labels;
	var labelList = labelString.split(",");

	if(labelString != "")
	{
		for(var j=0; j<labelList.length; j++)
		{
			createDeleDiv(labelList,j,i);
		}
	}
*/
















	//child of addSection
	addTextBox = document.createElement("input");
	addSection.appendChild(addTextBox);
	addTextBox.type = "text";
	addTextBox.id = "addTextBox_" +i;

	addButton = document.createElement("button");
	addSection.appendChild(addButton);
	addButton.id = "a_"+i;
	addButton.className = "add";
	addButton.innerHTML = "Add";


	//child of triangle
	trangleImg = document.createElement("img");
	triAngle.appendChild(trangleImg);
	trangleImg.id = "t_"+i;
	trangleImg.src="images/optionsTriangle.png";


	//child of navig
	list1 = document.createElement("li");
	navig.appendChild(list1);
	list1.innerHTML = "change tags";
	list1.id = "li1_0";

	list2 = document.createElement("li");
	navig.appendChild(list2);
	list2.innerHTML = "add to favorites";

	/***************************************************** onclick function for add to favorite ***************************************/
	list2.onclick = (function (){
		var filename = photoObj.fileName;
		return function(){
			addFavorite(filename);
		}

	})();
/***************************************************** onclick function for add to favorite ***************************************/

	navImg = document.createElement("img");
	navig.appendChild(navImg);
	navImg.id = "ti_"+i;
	navImg.src="images/optionsTriangle.png";



	// trangleImg.addEventListener("onclick",);
	navig.style.display = "none";
	addSection.style.display = "none";
	tagS.style.display = "block";
	trangleImg.onclick = (function() {
	    var currentI = i;
	    return function() {
	        show_flag(currentI + '');
	    }
	})();
	navImg.onclick = (function(){
		var currentI = i;
		return function(){
		show_flag(currentI + '');
		}
	})();
	addButton.onclick=(function(){
		var currentI = i;
		var currentPhotoObj = photoObj;
		return function(){
			createNewOnclick(currentI,currentPhotoObj.labels);
		}
	})();
	list1.onclick = (function(){
		var currentI =i;
		return function(){
			show_tag(currentI +'');
		}
	})();
}




function show_firstbox(){
	var firstbox = document.getElementById("firstbox");
	if(firstbox.style.display == 'none'){
		firstbox.style.display = 'block';
	}
	else{
		firstbox.style.display = 'none';
	}
}
function show_secondbox(){
	var secondbox = document.getElementById("secondbox");
	if(secondbox.style.display == 'none'){
		secondbox.style.display = 'block';
	}
	else{
		secondbox.style.display = 'none';
	}
}
function show_flag(index){
	var showId = "f_"+index;
	var flag = document.getElementById(showId);
	if(flag.style.display == "none"){
		flag.style.display = "block";
	}
	else{
		flag.style.display = "none";
	}
	var addSection = document.getElementById("addSection_"+index);
	if(addSection.style.display == "block"){
		addSection.style.display = "none";
	}
}
function createNewOnclick(index,labels){
	var inputId = "addTextBox_" + index;
	var input = document.getElementById(inputId);
	// para.innerHTML = para.innerHTML + labels;
	var value = input.value;
	addLabels(value, index);
}

function show_tag(index){
	var addSection = document.getElementById("addSection_"+index);
	if(addSection.style.display == "none"){
		addSection.style.display = "block";
	}else{
		addSection.style.display = "none";
	}
}
