class renderer{
	constructor()
	{
		
		this.textureImage = document.createElement("img");
		this.textureImage.src = "data:image/png;base64,"+imgFile;
		
		this.canvasLayer1 = document.createElement("canvas");
		this.ctxLayer1 = this.canvasLayer1.getContext("2d");

		this.canvasLayer2 = document.createElement("canvas");
		this.ctxLayer2 = this.canvasLayer2.getContext("2d");

	}

}