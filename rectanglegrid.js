class RectGrid{
	constructor(width,height,SW,SH){
		this._width = width;
		this._height = height;
		this.resolution = 0;
		this.type = 0;
		this.parity = 0;
		this.screenWidth = SW;
		this.screenHeight = SH;
		this.updateResolution();
	}
	updateResolution(){
		this.resolution = Math.min(1/this.width*this.screenWidth,1/this.height*this.screenHeight);
	}
	get width(){return this._width;}
	get height(){return this._height;}
	set width(x){this._width = x; this.updateResolution();}
	set height(x){this._height = x; this.updateResolution();}

	get DrawOffsetTop(){
		let offsetTop = this.rectangle_to_pixel(0,0);
		let offsetBottom = this.rectangle_to_pixel(0,this.height);
		let total = offsetBottom[1] - offsetTop[1];
		return Math.floor(0.5 * (this.screenHeight - total));
	}
	get DrawOffsetLeft(){
		let offsetLeft = this.rectangle_to_pixel(0,0);
		let offsetRight = this.rectangle_to_pixel(this.width,0);
		let total = offsetRight[0] - offsetLeft[0];
		return Math.floor(0.5 * (this.screenWidth - total));
	}
	textResolution(){
		return this.resolution;
	}
	mouseAt(x,y){
		return this.pixel_to_rectangle(x,y);
	}
	neighbor(x,y){
		const nei1 = [[-1,1],[-1,-1],[1,1],[1,-1],[0,1],[0,-1],[-1,0],[1,0]];
		let arr = [];
		for(let i=0;i<8;i++){
			arr[i] = [
				x + nei1[i][0],
				y + nei1[i][1]
			];
		}
		return [8,arr];
	}
	get_pixel(x,y){
		return this.rectangle_to_pixel(x,y);
	}
	get_grid(cx,cy,size=1){
		let tempCoord = this.rectangle_to_pixel(cx,cy);
		tempCoord[0] += this.DrawOffsetLeft;
		tempCoord[1] += this.DrawOffsetTop;
		let arr = [];
		arr[0] = [tempCoord[0]-this.resolution*0.5*size,tempCoord[1]-this.resolution*0.5*size];
		arr[1] = [tempCoord[0]+this.resolution*0.5*size,tempCoord[1]-this.resolution*0.5*size];
		arr[2] = [tempCoord[0]+this.resolution*0.5*size,tempCoord[1]+this.resolution*0.5*size];
		arr[3] = [tempCoord[0]-this.resolution*0.5*size,tempCoord[1]+this.resolution*0.5*size];
		
		return [4,tempCoord,arr];
	}

	rectangle_to_pixel(q,r){
		return [(q+0.5) * this.resolution,(r+0.5) * this.resolution];
	}
	pixel_to_rectangle(x,y){
		return [Math.floor(x / this.resolution),Math.floor(y / this.resolution)];
	}
}