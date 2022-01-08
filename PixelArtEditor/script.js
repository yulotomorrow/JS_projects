document.body.onload = addElement;

function addElement(){

    const pixelDiv = document.createElement("div"); 	
    const canvasDiv = document.getElementById("canvas");
	canvasDiv.appendChild(pixelDiv);

	for(let i = 1; i <= (16*16); ++i){
		let pixelSingle = document.createElement("div"); 
		pixelDiv.appendChild(pixelSingle);
		pixelSingle.className = "pixel";		
	};	
	
    pixelDiv.style.display = "grid";
	pixelDiv.style.gridTemplateColumns = "repeat(16, 1fr)"
	pixelDiv.style.height = "500px";
	pixelDiv.style.width = "500px";   
    pixelDiv.style.background = "white";
	
};
