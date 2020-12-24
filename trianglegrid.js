class TriGrid{
	constructor(width,height,SW,SH){
		this._width = width;
		this._height = height;
		this.resolution = 0;
		this._type = 0;
		this.parity = 0;
		this.screenWidth = SW;
		this.screenHeight = SH;
		this.updateResolution();
	}
	get type(){return this._type;}
	set type(x){this._type = x; this.updateResolution();}
	get width(){return this._width;}
	get height(){return this._height;}
	set width(x){this._width = x; this.updateResolution();}
	set height(x){this._height = x; this.updateResolution();}
	get DrawOffsetLeft(){
		let GridOffsetLeft = this.triangle_to_pixel(0,0);
		let GridOffsetRight = this.triangle_to_pixel(this.width-1,0);
		let GridTotalWidth = GridOffsetRight[0] - GridOffsetLeft[0];
		return Math.floor(0.5 *(this.screenWidth - GridTotalWidth));
	}
	get DrawOffsetTop(){
		let GridOffsetTop = this.triangle_to_pixel(0,0);
		let GridOffsetBottom = this.triangle_to_pixel(0,this.height-1);
		let GridTotalHeight = GridOffsetBottom[1] - GridOffsetTop[1];
		return Math.floor(0.5 *(this.screenHeight - GridTotalHeight));
	}
	updateResolution(){
		this.resolution =[
		Math.min((1/this.height)*this.screenHeight,(1/(this.width+2))*this.screenWidth),
		Math.min(1/(this.height+2)*this.screenHeight,1/this.width*this.screenWidth)
		][this.type];
	}
	textResolution(){
		return this.resolution;
	}
	mouseAt(x,y){
		let ppos = this.pixel_to_triangle(x,y);
		return ppos;
	}
	neighbor(x,y){
		return [
		TriGrid.neighbor_top_flat_point_triangle,
		TriGrid.neighbor_top_slope_triangle][this.type](x,y);
	}
	get_pixel(x,y){
		return this.triangle_to_pixel(x,y);
	}
	static neighbor_top_flat_point_triangle(x,y){
		const nei1 = [[0,-1],[0,1],[1,-1],[-1,-1],[-1,1],[1,1],[1,0],[-1,0],[2,0],[-2,0]];
		let arr = [];
		let inv = (x + y )&1;
		for(let i=0;i<10;i++){
			arr[i] = [x + nei1[i][0],y + nei1[i][1]];
		}
		for(let i=0;i<2;i++){
			arr[i+10] = [x + nei1[8+i][0], y + (inv ? -1 : 1)];
		}
		return [12,arr];
	}
	static neighbor_top_slope_triangle(x,y){
		const nei1 = [[0,-1],[0,1],[1,-1],[-1,-1],[-1,1],[1,1],[1,0],[-1,0],[2,0],[-2,0]];
		let arr = [];
		let inv = (x + y )&1;
		for(let i=0;i<10;i++){
			arr[i] = [x + nei1[i][1],y + nei1[i][0]];
		}
		for(let i=0;i<2;i++){
			arr[i+10] = [ x + (inv ? -1 : 1),y + nei1[8+i][0]];
		}
		return [12,arr];
	}
	get_grid(cx,cy,size=1){
		let tempCoord = this.triangle_to_pixel(cx,cy);
		tempCoord[0] += this.DrawOffsetLeft;
		tempCoord[1] += this.DrawOffsetTop;
		let arrOfVert = new Array(3);
		for(let i=0;i<3;i++){
			arrOfVert[i] = [...this.triangle_corner(...tempCoord,(cx+cy)&1,size,i)];
		}
		return [3,tempCoord,arrOfVert];
	}
	

	pixel_to_triangle(x,y){
		return [
		this.triangle_pixel_to_point_flat_top,
		this.triangle_pixel_to_slope_top
		][this.type](this,x,y);
	}
	triangle_to_pixel(q,r){
		return [
		this.triangle_point_flat_top_to_pixel,
		this.triangle_slope_top_to_pixel][this.type](this,q,r);
	}

	triangle_corner(cx,cy,inv,size,i){
		return [
		this.triangle_point_flat_top_corner,
		this.triangle_slope_top_corner][this.type](this,cx,cy,inv,size,i);
	}

	triangle_point_flat_top_corner(_this,cx,cy,inv,size,i){
		let arr = new Array(3);
		switch(i % 3){
			case 0 : arr = [cx,cy - _this.resolution * (inv ? -1 : 1)*0.5*size];break;
			case 1 : arr = [cx -_this.resolution*0.75*size,cy + _this.resolution * (inv ? -1 : 1)*0.5*size];break;
			case 2 : arr = [cx +_this.resolution*0.75*size,cy + _this.resolution * (inv ? -1 : 1)*0.5*size];break;
		}
		return arr;
	}
	triangle_slope_top_corner(_this,cx,cy,inv,size,i){
		let arr = [];
		switch(i % 3){
			case 0 : arr = [cx - _this.resolution * (inv ? -1 : 1)*0.5*size,cy];break;
			case 1 : arr = [cx + _this.resolution * (inv ? -1 : 1)*0.5*size,cy -_this.resolution*0.75*size];break;
			case 2 : arr = [cx + _this.resolution * (inv ? -1 : 1)*0.5*size,cy +_this.resolution*0.75*size];break;
		}
		return arr;
	}
	triangle_point_flat_top_to_pixel(_this,q,r){
		return [
			_this.resolution * (q*0.75),
			_this.resolution * (r)
		];
	}
	triangle_slope_top_to_pixel(_this,q,r){
		return [_this.resolution * (q),_this.resolution * (0.75*r)];
	}
	triangle_pixel_to_point_flat_top(_this,x,y){
		let fx = x/0.75/_this.resolution;
		let fy = y/_this.resolution+0.5;
		let ix = Math.floor(fx);
		let iy = Math.floor(fy);
		fx -= ix;
		fy -= iy;
		let side = 0;
		if((iy & 1) == 0)
			if(ix & 1){side = fx + fy > 1;}
			else{side = fx > fy;}
		else
			if(ix & 1){side = fx > fy;}
			else{side = fx + fy > 1;}
		return [(ix + side),iy];
	}
	triangle_pixel_to_slope_top(_this,x,y){
		let fx = x/_this.resolution+0.5;
		let fy = y/0.75/_this.resolution;
		let ix = Math.floor(fx);
		let iy = Math.floor(fy);
		fx -= ix;
		fy -= iy;
		let side = 0;
		if((ix & 1 )== 0)
			if(iy & 1){side = fx + fy > 1;}
			else{side = fy > fx;}
		else
			if(iy & 1){side = fy > fx;}
			else{side = fx+fy > 1;}
		return [ix , iy + side];
	}
}