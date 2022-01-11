document.body.onload = function(e){initialization()};

function random_rgb() {
    var o = Math.round, r = Math.random, s = 255;
    return 'rgb(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) + ')';
}

var color = "rgb(0, 0, 0)";
var dimensionVal = 16;
var resize = 1;
var colorNum = [[0, 0, 0], [72, 61, 139], [105, 105, 105], [153, 50, 204],
				[65, 105, 225], [147, 112, 219], [210, 105, 30], [188, 143, 143],
				[255, 192, 203], [255, 228, 225], [255, 255, 224], [255, 255, 255]];
// the list below could put up from numbers
var colorList = ["rgb(0, 0, 0)", "rgb(72, 61, 139)","rgb(105, 105, 105)", "rgb(153, 50, 204)", 
				"rgb(65, 105, 225)", "rgb(147, 112, 219)", "rgb(210, 105, 30)", "rgb(188, 143, 143)", 
				"rgb(255, 192, 203)", "rgb(255, 228, 225)", "rgb(255, 255, 224)", "rgb(255, 255, 255)"];

function addPixelElement(dimension = 16){

    const pixelDiv = document.getElementById("pixelDiv"); 
	while (pixelDiv.firstChild) {

		pixelDiv.removeChild(pixelDiv.lastChild);
	};
	pixelDiv.style.gridTemplateColumns = "repeat( " + dimension + ", 1fr)";

	for(let i = 1; i <= (dimension*dimension); ++i){

		const pixelSingle = document.createElement("div"); 
		pixelDiv.appendChild(pixelSingle);
		pixelSingle.className = "pixel"; 
		pixelSingle.addEventListener("mousedown", (e) => e.target.style.background = color );	
		pixelSingle.addEventListener("mouseenter", (e) => {if(e.buttons>0){e.target.style.background = color} });	
	}	
};

function addPaletteElement(){

	const paletteDiv = document.getElementById("paletteDiv"); 
	const colorIndicator = document.getElementById("currentColor");

	for(let i = 0; i < 12; ++i){

		const paletteSingle = document.createElement("palette"); 
		paletteDiv.appendChild(paletteSingle);
		paletteSingle.className = "palette";
		paletteSingle.style.background = colorList[i];
		paletteSingle.addEventListener("click", (e) => {color = e.target.style.background; 
			colorIndicator.style.background = color} );	
	}	
};

function initialization(){

	addPixelElement();
	addPaletteElement();
};

const resetButton = document.getElementById("button");
resetButton.onclick = function(e){

	let inputVal = document.querySelector("input").value;
	if(inputVal < 8) {inputVal = 8};
	if(inputVal > 48) {inputVal = 48};
	dimensionVal = inputVal;
	document.querySelector("input").value = inputVal;
	color = "rgb(0, 0, 0)";
	const paletteSingle = document.getElementById("currentColor"); 
	paletteSingle.style.background = color;
	addPixelElement(inputVal);
};


function valueToByte(val, byteNum = 1){

	return (val.toString(2)).padStart(8 * byteNum, "0");
}

function hexToByte(val, byteNum = 1){

	return (parseInt(val, 16).toString(2)).padStart(8 * byteNum, "0");
}

function stringToByte(str = "0"){
	var binaryStr = new String("");
	for (var i = 0; i < str.length; ++i){

		binaryStr += (str[i].charCodeAt(0).toString(2)).padStart(8, "0");
	}
	return binaryStr;
}

function paletteEncoding(p = colorNum){

	var paletteStr = new String("");
	for (var i = 0; i < 12; ++i){
		var str = [p[i][0], p[i][1], p[i][2]];
		for (var j = 0; j < 3; ++j)
			paletteStr += (str[j].toString(2)).padStart(8, "0");
	}
	return paletteStr;
}

function pixelEncoding(){

	const pixels = document.querySelectorAll(".pixel");
	var pixelStr = new String("");
	
	pixels.forEach(p => { 
		var empty = true;
		for(var i = 0; i < 12; ++i){

			if(p.style.background === colorList[i]){
				pixelStr += valueToByte(i);
				empty = false;
				break;
			}		
		}
		if (empty)
				pixelStr +=  valueToByte(11);	
	}); 
	return pixelStr;
}

function crcTable(){

	var crcT = new Uint8Array(256);
	for(var n = 0; n <256; ++n){
		var c = n;
		for(var k = 0; k <8 ; ++k){
			if(c & 1)
				c = 0xedb8320 ^ (c >>> 1);
			else
				c = c >>> 1;
		}
		crcT[n] = c;
	}
	return crcT;
}

var crcTableCalc = crcTable();

function crcEncoding(bStr = ""){

	const crc32 = 0xedb88320;
	var c = 0xffffffff;
	for (n = 0; n < bStr.length; ++n)
	{
		c = crcTableCalc[(c ^ bStr[n]) & 0xff] ^ (c >>> 8);
	}
	return c ^ 0xffffffff;
}

function createPNG(){

	var fileString ="";
	const magicNumSequence = ["89", "50", "4e", "47", "0d", "0a", "1a", "0a"];
	var pngMagicNumber = "";
	magicNumSequence.forEach(val => {pngMagicNumber += hexToByte(val, 1)});
	const chunkInfo1 = valueToByte(13, 4) + stringToByte("IHDR") +valueToByte(dimensionVal * resize, 4) 
					+ valueToByte(dimensionVal * resize, 4) 
					+ valueToByte(8) + valueToByte(3)
					+ valueToByte(0) + valueToByte(0) + valueToByte(0);	
	const paletteChunk = valueToByte(12 * 3, 4) + stringToByte("PLTE") + paletteEncoding();
	const contentChunk = valueToByte((dimensionVal * resize)**2, 4) + stringToByte("IDAT") + pixelEncoding();
	const endChunk =  valueToByte(0, 4) + stringToByte("IEND");
	fileString = contentChunk; 
	//pngMagicNumber + chunkInfo1 + paletteChunk + contentChunk + 
	var byteArr = new Uint8Array();
	return fileString;
}

function download(text, name, format){

	var a = document.getElementById("dl");
	var file = new Blob([text], {type: format});
	a.href = URL.createObjectURL(file);
	a.download = name;
}

const dlButton = document.getElementById("dlButton");
dlButton.onclick = function(e){

	download(createPNG(), "test.txt", "text/txt");
};