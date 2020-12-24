class OctalGrid{
	constructor(width,height,SW,SH)
	{
		
		this._width = width;
		this._height = height;
		this.resolution =0;
		this._type = 0;//Octal First or Square First
		this._parity = 0;//Not Used
		

		this.screenWidth = SW;
		this.screenHeight = SH;
		this.DrawOffsetLeft = 0;
		this.DrawOffsetTop = 0;
		this.updateResolution();
		
	}
	updateResolution(){
		this.resolution = 
		Math.min(1/(this._width * 3 + 1)*this.screenWidth , 1/(this._height * 3 + 1)*this.screenHeight);
		{
			let btLeft = this.octal_to_pixel(0,0);
			btLeft[0]-=this.resolution*2;
			let btRight = this.octal_to_pixel(this._width-1,0);
			btRight[0]+=this.resolution*2;
			let totalGridWidth = btRight[0] - btLeft[0];
			this.DrawOffsetLeft = 0.5 * (this.screenWidth - totalGridWidth);
		}
		{
			let btTop = this.octal_to_pixel(0,0);
			btTop[1]-=this.resolution*2;
			let btBottom = this.octal_to_pixel(0,this._height-1);
			btBottom[1]+=this.resolution*2;
			let totalGridWidth = btBottom[1] - btTop[1];
			this.DrawOffsetTop = 0.5 * (this.screenHeight - totalGridWidth);
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
		return this.resolution*2.5;
	}
	mouseAt(x,y){
		return this.pixel_to_octal(x,y);
	}
	neighbor(x,y){
		let parity = (x&1)^(y&1)^this.type;
		if(parity){//Rectangle Have 4 of them
			return [4,[
				[x+1,y],
				[x,y+1],
				[x-1,y],
				[x,y-1]
			]];
		}else{//Octagonal Have 8 of them
			return [8,[
				[x+1,y],
				[x,y+1],
				[x-1,y],
				[x,y-1],
				[x+1,y+1],
				[x-1,y+1],
				[x+1,y-1],
				[x-1,y-1]
			]];
		}
	}
	get_grid(cx,cy,size=1){
		let tmpCoord = this.octal_to_pixel(cx,cy);
		tmpCoord[0] += this.DrawOffsetLeft;
		tmpCoord[1] += this.DrawOffsetTop;
		let parity = (cx & 1) ^ (cy & 1);
		let len = 8-((parity^this.type) * 4);
		let arr= new Array(len);
		for(let i=0;i<len;i++){
			arr[i] = [...this.octal_corner(...tmpCoord,parity,size,i)];
		}
		return [len,tmpCoord,arr];

	}
	get_pixel(x,y){
		return this.octal_to_pixel(x,y);
	}

	octal_corner(x,y,parity,size,i){
		let offX = 0;
		let offY = 0;
		if(this.type == 1){
			parity ^=1;
		}
		if(parity == 0){//Octagonal
			switch(i){
				case 0 : offX = 1;offY = -2;break;
				case 1 : offX = 2;offY = -1;break;
				case 2 : offX = 2;offY =  1;break;
				case 3 : offX = 1;offY =  2;break;
				case 4 : offX =-1;offY =  2;break;
				case 5 : offX =-2;offY =  1;break;
				case 6 : offX =-2;offY = -1;break;
				case 7 : offX =-1;offY = -2;break;
			}
		}else{
			switch(i){
				case 0 : offX = 1;offY =-1;break;
				case 1 : offX = 1;offY = 1;break;
				case 2 : offX =-1;offY = 1;break;
				case 3 : offX =-1;offY =-1;break;
			}
		}
		return [
			x + offX * this.resolution * size,
			y + offY * this.resolution * size
		];
	}

	pixel_to_octal(x,y){
		let resultX = 0;
		let resultY = 0;
		let bigX = x / this.resolution;
		let bigY = y / this.resolution;
		if(this.type == 1){
			bigX += 2;
		}
		let ix = Math.floor(bigX);
		let iy = Math.floor(bigY);
			
		// Determine Regions of interest
		// By dividings them into subsections
		// Of 2x2 that contains 2x2
		let regionX = bigX / 3;
		let regionY = bigY / 3;
		let rix = Math.floor(regionX);
		let rfx = (bigX - rix*3);
		let riy = Math.floor(regionY);
		let rfy = (bigY - riy*3);
		
		let precondition = (ix & 1) | ((iy & 1) << 1);
		let regParity = (rix & 1)^(riy & 1);
		resultX = rix;
		resultY = riy;
		if(regParity == 0){
			let sum = (rfx + rfy < 1);
			if(sum ){
				resultX -= 1;
				resultY -= 1;
			}
		}else{
			if((ix % 3+3)%3 == 0 || (iy % 3+3)%3 == 0){
				let sum = ((3-rfx) + rfy < 3);
				if(sum ){
					resultY -=1;
				}else{
					resultX -=1;
				}
			}
		}
		if(this.type == 1){
			resultX -= 1;
		}
		return [resultX,resultY];

	}
	octal_to_pixel(cx,cy){
		return [(cx*3+2)*this.resolution,(cy*3+2)*this.resolution];
	}
}