//Offset Coordinate Even-r Format

class HexGrid{
	constructor(width,height,SW,SH)
	{
		
		this._width = width;
		this._height = height;
		this.resolution =0;// Math.min(1/(this.height)*10.25/16*SH,1/(this.width)*2.2/4*SW);
		this._type = 0;//Pointy Top Or Flat top
		this._parity = 0;//0 Even 1 Odd
		

		this.screenWidth = SW;
		this.screenHeight = SH;
		this.DrawOffsetLeft = 0;
		this.DrawOffsetTop = 0;
		this.updateResolution();
		
	}
	updateResolution(){
		this.resolution = [
		Math.min(1/(this.height*0.75+0.25)/2*this.screenHeight,1/(this.width+0.5)/Math.sqrt(3)*this.screenWidth),
		Math.min(1/(this.height+0.5)/Math.sqrt(3)*this.screenHeight,1/(this.width*0.75+0.25)/2*this.screenWidth)
		][this.type];
		{
			let GridOffsetLeft = this.axial_to_pixel([-1,0][this.type],[1,0][this.type]);
			let GridOffsetRight = this.axial_to_pixel([this.width-1,this.width-2][(1-this.type)*(1-this.parity)],0);
		
			let GridTotalWidth = GridOffsetRight[0] - GridOffsetLeft[0];
			this.DrawOffsetLeft = Math.floor(0.5*(this.screenWidth - GridTotalWidth));
		}
		{
			let GridOffsetTop = this.axial_to_pixel([0,1][this.type],[0,-1][this.type]);
			let GridOffsetBottom = this.axial_to_pixel([-this.width/2,0][this.type],[this.height-1,this.height-2][this.type *(1-this.parity)]);

			let GridTotalHeight = GridOffsetBottom[1] - GridOffsetTop[1];
			this.DrawOffsetTop =  Math.floor(0.5*(this.screenHeight - GridTotalHeight));
		}
	}
	get parity(){return this._parity;}
	set parity(x){this._parity = x;}
	get type(){return this._type;}
	set type(x){this._type = x; this.updateResolution();}
	get width(){return this._width;}
	get height(){return this._height;}
	set width(x){this._width = x; this.updateResolution();}
	set height(x){this._height = x; this.updateResolution();}
	textResolution(){
		return this.resolution * 2;
	}
	
	
	mouseAt(x,y){
		let ppos = this.cube_to_offset(...HexGrid.axial_to_cube(...this.pixel_to_axial(x,y)));
		return ppos;
	}

	neighbor(x,y){
		const nei = [[-1,0,1],[1,0,-1],[1,-1,0],[-1,1,0],[0,1,-1],[0,-1,1]];
		let CubePos=  this.offset_to_cube(x,y);
		let arr = new Array(6);
		for(let i=0;i<6;i++){
			arr[i] = this.cube_to_offset(
					CubePos[0] + nei[i][0],
					CubePos[1] + nei[i][1],
					CubePos[2] + nei[i][2]
				);
		}
		return [6,arr];
	}
	get_pixel(x,y){
		return this.axial_to_pixel(...HexGrid.cube_to_axial(...this.offset_to_cube(x,y)));
	}
	/**
	*	Next part is generic Coordinate conversion 
	*	best suites for any general purposes
	*/

	axial_to_pixel(q,r){
		return [HexGrid.axial_pointy_to_pixel,HexGrid.axial_flat_to_pixel][this.type](this,q,r);
	}

	pixel_to_axial(x,y){
		return [HexGrid.pixel_to_pointy_axial,HexGrid.pixel_to_flat_axial][this.type](this,x,y);
	}
	cube_to_offset(x,y,z){
		return [
			[HexGrid.cube_to_evenr,HexGrid.cube_to_oddr],
			[HexGrid.cube_to_evenq,HexGrid.cube_to_oddq]
			][this.type][this.parity](x,y,z);
	}
	offset_to_cube(q,r){
		return ([
			[HexGrid.evenr_to_cube,HexGrid.oddr_to_cube],
			[HexGrid.evenq_to_cube,HexGrid.oddq_to_cube]
			])[this.type][this.parity](q,r);
	}
	hex_corner(cx,cy,size,i){
		return [HexGrid.pointy_hex_corner,HexGrid.flat_hex_corner][this.type](this,cx,cy,size,i);
	}
	get_grid(x,y,size=1){
		let tempCoord = this.axial_to_pixel(...HexGrid.cube_to_axial(...this.offset_to_cube(x,y)));
		tempCoord[0] += this.DrawOffsetLeft;
		tempCoord[1] += this.DrawOffsetTop;
		let arrOfVert = new Array(6);
		for(let i=0;i<6;i++){
			arrOfVert[i] = [...this.hex_corner(...tempCoord,size,i)];
		}
		return [6,tempCoord,arrOfVert];

	}
	


	/**
	* Next Part Here i just copy from 
	* https://www.redblobgames.com/grids/hexagons/
	*/
	

	static pointy_hex_corner(_this,cx,cy,size,i){
		let ang_deg = 60 * i - 30;
		let ang_rad = Math.PI / 180 * ang_deg;
		return [cx + _this.resolution*Math.cos(ang_rad)*size,cy + _this.resolution*Math.sin(ang_rad)*size];
	}

	static flat_hex_corner(_this,cx,cy,size,i){
		let ang_deg = 60 * i;
		let ang_rad = Math.PI / 180 * ang_deg;
		return [cx + _this.resolution*Math.cos(ang_rad)*size,cy + _this.resolution*Math.sin(ang_rad)*size];
	}


	static axial_pointy_to_pixel(_this,q,r){//Axial 
		const sqrt3 = Math.sqrt(3);
		let x = _this.resolution * (sqrt3 * q + sqrt3 / 2 * r);
		let y = _this.resolution * (3/2 * r);
		return [x,y];
	}
	static axial_flat_to_pixel(_this,q,r){
		const sqrt3 = Math.sqrt(3);
		let x = _this.resolution * (3/2*q);
		let y = _this.resolution * (sqrt3/2*q+sqrt3*r);
		return [x,y];

	}
	
	static axial_round(x,y){
		return HexGrid.cube_to_axial(...HexGrid.cube_round(...HexGrid.axial_to_cube(x,y)));
	}
	static cube_round(x,y,z){
		let rx = Math.round(x);
		let ry = Math.round(y);
		let rz = Math.round(z);
		let x_diff = Math.abs(rx- x);
		let y_diff = Math.abs(ry- y);
		let z_diff = Math.abs(rz- z);
		if(x_diff > y_diff && x_diff > z_diff)
			rx = -ry - rz;
		else if(y_diff > z_diff)
			ry = -rx - rz;
		else
			rz = -rx - ry;
		return [rx,ry,rz];
	}
	
	static pixel_to_pointy_axial(_this,x,y){
		const sqrt3 = Math.sqrt(3);
		let q = (sqrt3/3 * x - 1/3 * y)/_this.resolution;
		let r = (2/3 * y)/_this.resolution;
		return HexGrid.axial_round(q,r);
	}
	static pixel_to_flat_axial(_this,x,y){
		const sqrt3 = Math.sqrt(3);
		let q = (2/3*x) / _this.resolution;
		let r = (-1/3*x + sqrt3/3 * y) / _this.resolution;
		return HexGrid.axial_round(q,r);
	}
	static cube_to_axial(x,y,z){
		let q = x;
		let r = z;
		return [q,r];
	}
	static axial_to_cube(q,r){
		let x = q;
		let z = r;
		let y = -x-z;
		return [x,y,z];
	}

	static cube_to_oddr(x,y,z){
		let col = x + (z - (z&1)) / 2;
		let row = z;
		return [col,row];
	}
	static oddr_to_cube(col,row){
		let x = col - (row - (row &1))/2;
		let z = row;
		let y = -x-z;
		return [x,y,z];
	}
	static cube_to_evenr(x,y,z){
		let col = x + (z + (z&1)) / 2;
		let row = z;
		return [col,row];
	}
	static evenr_to_cube(col,row){
		let x = col - (row + (row & 1)) / 2;
		let z = row;
		let y = -x-z;
		return [x,y,z];
	}
	static cube_to_oddq(x,y,z){
		let col = x;
		let row = z + (x - (x&1))/2;
		return [col,row];
	}
	static oddq_to_cube(col,row){
		let x = col;
		let z = row - (col - (col&1))/2;
		let y = -x-z;
		return [x,y,z];
	}
	static cube_to_evenq(x,y,z){
		let col = x;
		let row = z + (x + (x&1))/2;
		return [col,row];
	}
	static evenq_to_cube(col,row){
		let x = col;
		let z = row - (col + (col&1))/2;
		let y = -x-z;
		return [x,y,z];
	}
	/**
	End of Copy Fron another Stuff
	*/
}

/*
Grid Size Pseudocode 
*/
/*
	let Grid = new HexGrid(GW,GH,1/(GH)*10.25/16*H);
	let GridOffsetLeft = Grid.axial_pointy_to_pixel(-1,1);
	let GridOffsetRight = Grid.axial_pointy_to_pixel(GW-2,0);
	let GridOffsetTop = Grid.axial_pointy_to_pixel(0,0);
	let GridOffsetBottom = Grid.axial_pointy_to_pixel(-GW/2,GH-1);
	let GridTotalWidth = GridOffsetRight[0] - GridOffsetLeft[0];
	let GridTotalHeight = GridOffsetBottom[1] - GridOffsetTop[1];

	let DrawOffsetLeft = Math.floor(0.5*(W - GridTotalWidth));
	let DrawOffsetTop = Math.floor(0.5*(H - GridTotalHeight));

*/