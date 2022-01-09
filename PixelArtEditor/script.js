document.body.onload = function(e){initialization()};

function random_rgb() {
    var o = Math.round, r = Math.random, s = 255;
    return 'rgb(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) + ')';
}

var color = "gray";

var colorList = ["rgb(0, 0, 0)", "rgb(72,61,139)","rgb(105,105,105)", "rgb(153,50,204)", 
				"rgb(65,105,225)", "rgb(147,112,219)", "rgb(210,105,30)", "rgb(188,143,143)", 
				"rgb(255,192,203)", "rgb(255,228,225)", "rgb(255,255,224)", "rgb(255, 255, 255)"];

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
		pixelSingle.addEventListener("click", (e) => e.target.style.background = color );	
		//colorList[Math.round(Math.random()*4)]
	}	
};

function addPaletteElement(){

	const paletteDiv = document.getElementById("paletteDiv"); 

	for(let i = 0; i < 12; ++i){

		const paletteSingle = document.createElement("palette"); 
		paletteDiv.appendChild(paletteSingle);
		paletteSingle.className = "palette";
		paletteSingle.style.background = colorList[i];
		paletteSingle.addEventListener("click", (e) => {color = e.target.style.background} );	
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
	document.querySelector("input").value = inputVal;
	color = "gray";
	addPixelElement(inputVal);
};