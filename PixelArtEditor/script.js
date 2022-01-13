//const pako = require('pako');

document.body.onload = function(e){initialization()};

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

// png data 
function valueToMultiByte(val, byteNum = 4){

	var byteArr = [];
	var byte4Str = ((val >>> 0).toString(2)).padStart(8 * byteNum, "0");
	var bStr = "";
	for(var i = 0; i < byte4Str.length; ++i){

		bStr += byte4Str[i];
		if( i % 8 === 7){
			byteArr.push(parseInt(bStr, 2));
			bStr = "";
		}
	}
	return byteArr;
}

function stringToByte(str = "0"){
	var binaryStr = [];
	for (var i = 0; i < str.length; ++i){

		binaryStr.push(str[i].charCodeAt(0));
	}
	return binaryStr;
}

function paletteEncoding(p = colorNum){

	var paletteStr = new String("");
	var paletteArr = [];
	for (var i = 0; i < 12; ++i){
		paletteArr = paletteArr.concat(p[i]);
	}
	return paletteArr;
}

function pixelEncoding(dimension = dimensionVal){

	const pixels = document.querySelectorAll(".pixel");
	var pixelArr = [];
	var j = 0;
	pixels.forEach(p => { 
		var empty = true;
		if((j % dimension) == 0)
			pixelArr.push(0);
		for(var i = 0; i < 12; ++i){

			if(p.style.background === colorList[i]){
				pixelArr.push(i);
				empty = false;
				break;
			}		
		}
		if (empty){
				pixelArr.push(11);
		}
		j++;
	}); 
	return pixelArr;
}

function crcTable(){

	var crcT = new Uint32Array(256);
	for(var n = 0; n < 256; ++n){
		var c = (n >>> 0);
		for(var k = 0; k < 8 ; ++k){
			if((c & 1) === 1)
				c = (0xedb88320 ^ (c >>> 1)) >>> 0;
			else
				c = (c >>> 1);
		}
		crcT[n] = c;
	}
	return crcT;
}

const crcTableCalc = crcTable();

function crcEncoding(bStr){

	const crc32 = 0xedb88320 >>> 0;
	var c = 0xffffffff >>> 0;
	
	for (n = 0; n < bStr.length; ++n)
	{
		c = (crcTableCalc[(c ^ (bStr[n] >>> 0)) & 0xff] ^ (c >>> 8) ) >>> 0;
	}
	return valueToMultiByte((c ^ 0xffffffff) >>> 0, 4);
}
// IEND: [174 66 96 130]

// compression
function zlibLength (length){

	var compLength = (~length + 0x10000) & 0xffff;
	var lengthArr = [...valueToMultiByte(length, 2), ...valueToMultiByte(compLength, 2)];
	return lengthArr;
}

function zlibHeader(){

	const ZLIB_WINDOW_SIZE = 1024 * 32;
	let cinfo = 7;// Math.LOG2E * Math.log(ZLIB_WINDOW_SIZE) - 8;
	let compressionMethod = 8; 
	
	let cmf = (cinfo << 4) | compressionMethod;

	let fdict = 0; 
	let flevel = 0; 

	let flg = (flevel << 6) | (fdict << 5);
	let fcheck = 31 - (cmf * 256 + flg) % 31;
	flg |= fcheck;

	let zHeader = [cmf, flg];
	return zHeader;
}

function adler32_buf(buf) {

    var a = 1, b = 0, L = buf.length;
    for (var i = 0; i < L; ++i) {
            a += (buf[i] >>> 0);
			a %= 65521;
            b += a;
			b %= 65521;
        }
//        a = (15 * (a >>> 16) + (a & 65535));
//       b = (15 * (b >>> 16) + (b & 65535));
    return valueToMultiByte((((b % 65521) << 16) | (a % 65521)) >>> 0);
}

function createPNG(){

	var fileString ="";
	const magicNumSequence = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
	var pngMagicNumber = new Uint8Array(magicNumSequence);

	var chunkInfo1 = [...stringToByte("IHDR"), ...valueToMultiByte(dimensionVal * resize, 4),
					...valueToMultiByte(dimensionVal * resize, 4), ...[8, 3, 0, 0, 0]];	//[8 3 0 0 0]
	const infoCRC = crcEncoding(chunkInfo1);
	chunkInfo1 = [...valueToMultiByte(13, 4), ...chunkInfo1, ...infoCRC];

	var paletteChunk = [...stringToByte("PLTE"), ...(paletteEncoding())];
	const paletteCRC = crcEncoding(paletteChunk);
	paletteChunk = [...valueToMultiByte(12 * 3, 4), ...paletteChunk, ...paletteCRC];

	var contentChunk = [ ...stringToByte("IDAT"), ...zlibHeader(), 128]; // compress header is 3 BITS so 100 and 0s => 128
	var unSupContent = pixelEncoding(dimensionVal * resize);
	var lData = unSupContent.length;
	contentChunk = [...contentChunk, ...zlibLength(lData), ...unSupContent, ...adler32_buf(unSupContent)];

	const contentCRC = crcEncoding(contentChunk);
	contentChunk = [...valueToMultiByte(contentChunk.length - 4, 4), ...contentChunk, ...contentCRC];

	const endChunk =  [...valueToMultiByte(0, 4), ...stringToByte("IEND"), ...crcEncoding(stringToByte("IEND"))];

	fileString = [...magicNumSequence, ...chunkInfo1, ...paletteChunk, ...contentChunk, ... endChunk]; 
	const byteArr = new Uint8Array(fileString);

	//ed pixel test
	var testContent = [...zlibHeader(), 128, ...zlibLength (4),
	...[0x00, 0xFF, 0x00, 0x00], 
	...adler32_buf([0x00, 0xFF, 0x00, 0x00])];
	var lengthSig = valueToMultiByte(testContent.length, 4);
	testContent = [...stringToByte("IDAT"), ...testContent];
	var crcCon =  crcEncoding(testContent);
	const testStr = [...magicNumSequence, ...chunkInfo1, ...lengthSig, 
		...testContent, ...crcCon, ...endChunk];
	const testByte = new Uint8Array(testStr);
//	const output = pako.deflate(byteArr);
/*
[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 
		0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 
		0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0xCF, 0xC0, 0x00, 
		0x00, 0x03, 0x01, 0x01, 0x00, 0x18, 0xDD, 0x8D, 0xB0, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 
		0x44, 0xAE, 0x42, 0x60, 0x82];
*/

	return byteArr;
}

function download(text, name, format){

	var a = document.getElementById("dl");
	var file = new Blob([text], {type: format});
	a.href = URL.createObjectURL(file);
	a.download = name;
}

const dlButton = document.getElementById("dlButton");
dlButton.onclick = function(e){

//	download(createPNG(), "test.txt", "text/txt");
	download(createPNG(), "test.png", "image/png");
};