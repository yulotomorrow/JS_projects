document.body.onload = addElement();

function addElement(){

    const pixelDiv = document.createElement("div"); 	
    const canvasDiv = document.getElementById("canvas");
	canvasDiv.appendChild(pixelDiv);

	for(let i = 1; i <= (16*16); ++i){
		const pixelSingle = document.createElement("div"); 
		pixelDiv.appendChild(pixelSingle);
		pixelSingle.className = "pixel";
		pixelSingle.addEventListener("click", (e) => e.target.style.background = "rgb(214, 175, 0)" );		
	};	

    pixelDiv.style.display = "grid";
	pixelDiv.style.gridTemplateColumns = "repeat(16, 1fr)"
	pixelDiv.style.height = "500px";
	pixelDiv.style.width = "500px";   
    pixelDiv.style.background = "rgb(25, 27, 31)";	
	pixelDiv.style.border = "5px solid rgb(25, 27, 31)";

	const resetButton = document.querySelector("button");
	const pixel = document.querySelectorAll("div.pixel");
	resetButton.addEventListener("click",function () {pixel.forEach((p) => {p.style.background = "white"})});
};

