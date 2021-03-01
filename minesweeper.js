class Minesweeper{
	constructor(ctx,sw,sh){
		this.gameOver = false;
		this.overType = 0;
		this.gameBoard = [];
		this.screenWidth = sw;
		this.screenHeight = sh;
		this.gameWidth = 9;
		this.gameHeight = 9;
		this.flagAvail = 0;
		this.bombCount = 0;
		this.firstClick = false;
		this.rng ;

		this.flagSprite = new Sprite("flag.png");
		this.bombSprite = new Sprite("bomb.png");
		this.foreground = new Pattern(ctx,"grass_2.jpg");
		this.background = new Pattern(ctx,"dirt_1.jpg");


	}
	allImageLoaded(){
		return this.flagSprite.loaded&&
				this.bombSprite.loaded&&
				this.foreground.loaded&&
				this.background.loaded ;
	}
	init(gridInterface,gameWidth,gameHeight,bombCount,rng){
		gameWidth = Math.max(9,gameWidth);
		gameHeight = Math.max(9,gameHeight);
		this.gameOver = false;
		this.overType = 0;
		this.flagAvail = this.bombCount = Math.min(Math.max(bombCount,10),(gameWidth-1)*(gameHeight-1));
		this.firstClick = true;
		this.gameBoard = new Uint8Array(gameWidth*gameHeight);
		for(let i=0;i<gameWidth*gameHeight;++i){
			this.gameBoard[i] = 0;
		}
		gridInterface.height = this.gameHeight = gameHeight;
		gridInterface.width = this.gameWidth = gameWidth;
		this.rng = rng;
		/*for(let i=0;i<bombCount;++i){
			this.gameBoard[i] = 1;
		}
		RandUtil.shuffle(this.gameBoard,rng);*/
	}

	bombGen(gridInterface,cx,cy){
		let pos = 0;
		let nlist = gridInterface.neighbor(cx,cy);

		for(let i=0;i<this.bombCount;){
			let x = Math.floor(this.rng.rand()*this.gameWidth);
			let y = Math.floor(this.rng.rand()*this.gameHeight);
			pos = x+y*this.gameWidth;
			let isNotQualify = (x == cx) && (y == cy);
			for(let j=0;j<nlist[0];j++){
				isNotQualify |= (x == nlist[1][j][0]) && (y == nlist[1][j][1]);
			}
			if(!isNotQualify && (this.gameBoard[pos] & 1)==0){
				this.gameBoard[pos]|= 1;
				i++;
			}
		}
	}
	victory_procedure(){
		if(this.victory_check()){
			for(let y=0;y<this.gameHeight;y++)
				for(let x=0;x<this.gameWidth;x++){
					let pos = x+y*this.gameWidth;
					if((this.gameBoard[pos] & 1) != 0){
						this.gameBoard[pos] |= 4;
						this.gameBoard[pos] &= ~8;
					}
				}
			
		}
	}
	victory_check(){
		let revealCount = 0;
		for(let y=0;y<this.gameHeight;y++)
		for(let x=0;x<this.gameWidth;x++){
			let pos = x+y*this.gameWidth;
			revealCount+= (this.gameBoard[pos]&2) != 0;
		}
		let boardArea = this.gameWidth * this.gameHeight;
		if((boardArea - revealCount)-this.bombCount == 0){
			this.gameOver = true;
			this.overType = 1;
			return 1;
		}
		return 0;
	}
	refreshFlag(){
		let fAvail = this.bombCount;
		for(let y=0;y<this.gameHeight;++y)
		for(let x=0;x<this.gameWidth;++x){
			fAvail -= (this.gameBoard[y*this.gameWidth+x] & 4)!=0;
		}
		this.flagAvail = fAvail;
	}
	mouse_click(gridInterface,px,py,mode){
		//let M_STACK = [];
		
		if(this.gameOver )return;
		let cenCoord = gridInterface.mouseAt(px-gridInterface.DrawOffsetLeft,py-gridInterface.DrawOffsetTop);
		if(cenCoord[0] < 0 || cenCoord[0] >= this.gameWidth ||
			cenCoord[1] < 0 || cenCoord[1] >= this.gameHeight){
			return;
		}
		if(mode == 0){
			if(this.firstClick){
				this.firstClick = false;
				this.bombGen(gridInterface,cenCoord[0],cenCoord[1]);
			}

			let first = true;
			let stack = [];
			stack.push(cenCoord);
			while(stack[0]){
				let cpp = stack.pop();
				let currValue = this.revealTile(gridInterface,cpp[0],cpp[1],first);
				if(first){
					if(currValue[0] == -1){
						this.gameBoard[cpp[0]+cpp[1]*this.gameWidth] |= 2;
						this.gameOver = true;
						return ;
					}
				}
				if(currValue[0] > 0 && currValue[2] == 0){
					for(let i=0;i<currValue[0];++i)
					stack.push(currValue[1][i]);
				}
				first = false;
			}
			this.refreshFlag();
			this.victory_procedure();
		}else{
			this.flagTile(gridInterface,cenCoord[0],cenCoord[1])&&
			this.questionTile(gridInterface,cenCoord[0],cenCoord[1]);
			
		}
	}
	flagTile(gi,sx,sy){
		if(sx < 0 || sx >= this.gameWidth ||
			sy < 0 || sy >= this.gameHeight){
			return 0;
		}
		let tv = this.gameBoard[sx+sy*this.gameWidth];
		if(tv & 2 ){
			return 0;
		}else{
			if((tv & 4 )||(tv & 8)){
				return 1;
			}else if(this.flagAvail > 0){
				this.flagAvail--;
				this.gameBoard[sx+sy*this.gameWidth]|=4;
				return 0;
			}
		}

	}

	questionTile(gi,sx,sy){
		if(sx < 0 || sx >= this.gameWidth ||
			sy < 0 || sy >= this.gameHeight){
			return 0;
		}
		let tv = this.gameBoard[sx+sy*this.gameWidth];
		if(tv & 2 ){
			return 0;
		}else{
			if(tv & 4){
				this.flagAvail++;
				this.gameBoard[sx+sy*this.gameWidth]|=8;
				this.gameBoard[sx+sy*this.gameWidth]&=~4;
			}else if(tv & 8){
				this.gameBoard[sx+sy*this.gameWidth]&=~8;
				
			}else{
				throw "Error";
			}
		}
	}
	revealTile(gi,sx,sy,first){
		if(sx < 0 || sx >= this.gameWidth ||
			sy < 0 || sy >= this.gameHeight){
			return [0];
		}
		let pos = sx+sy*this.gameWidth;
		let tv = this.gameBoard[pos];
		if(first){
			if(tv & 1){
				return [-1];
			}else if(tv & 2){
				return [0];
			}else if(tv & 4){
				return [0];
			}else if(tv & 8){
				return [0];
			}else{
				this.gameBoard[pos] |= 2;
			}
		}else{
			if(tv & 1){
				return [0];
			}else if(tv & 2){
				return [0];
			}else if(tv & 4){
				this.gameBoard[pos]&=~4;
			}else if(tv & 8){
				this.gameBoard[pos]&=~8;
			}else{
				this.gameBoard[pos]|=2;
			}
		}
		

		let bombCount = 0;
		let nei = gi.neighbor(sx,sy);
		for(let i=nei[0]-1;i>=0;--i){
			let nx = nei[1][i][0];
			let ny = nei[1][i][1];
			
			if(nx < 0 || ny < 0 || nx >= this.gameWidth || ny >= this.gameHeight){
				continue;
			}
			let cg = this.gameBoard[nx+ny*this.gameWidth];
			if(cg & 1){
				bombCount++;
			}			
		}
		this.gameBoard[sx+sy*this.gameWidth] |= bombCount << 4;
		return [nei[0],nei[1],bombCount];
		
	}
	renderRectangle(){

	}
	render(ctx,gridInterface,elemText){

		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.strokeStyle = "rgba(0,0,0,0.5)";
		ctx.font = " "+gridInterface.textResolution()*0.5 + "px arial";
		let sizeOfIcon = gridInterface.textResolution()*0.5;
		ctx.clearRect(0,0,this.screenWidth,this.screenHeight);
		
		let bufferOfSprite = [];

		let x_min = Infinity,y_min = Infinity;
		let x_max = -Infinity,y_max = -Infinity;
		for(let y=this.gameHeight-1;y>=0;y--)
		for(let x=this.gameWidth-1;x>=0;x--){
			let accX = 0;
			let accY = 0;
			let pp = gridInterface.get_pixel(x,y);
			let polygon = gridInterface.get_grid(x,y,0.9);
			let polygon1 = gridInterface.get_grid(x,y,1);
			let basePolygon = new Path2D();

			ctx.beginPath();
			ctx.moveTo(accX = polygon[2][0][0],accY = polygon[2][0][1]);
			basePolygon.moveTo(polygon1[2][0][0],polygon1[2][0][1]);
			x_min = Math.min(x_min,polygon1[2][0][0]);
			y_min = Math.min(y_min,polygon1[2][0][1]);
			x_max = Math.max(x_max,polygon1[2][0][0]);
			y_max = Math.max(y_max,polygon1[2][0][1]);
			
			for(let i=1;i<polygon[0];++i){
				let tx = polygon[2][i][0];
				let ty = polygon[2][i][1];
				accX += tx;
				accY += ty;
				ctx.lineTo(tx,ty);
				basePolygon.lineTo(polygon1[2][i][0],polygon1[2][i][1]);
				x_min = Math.min(x_min,polygon1[2][i][0]);
				y_min = Math.min(y_min,polygon1[2][i][1]);
				x_max = Math.max(x_max,polygon1[2][i][0]);
				y_max = Math.max(y_max,polygon1[2][i][1]);
			}
			accX /= polygon[0];
			accY /= polygon[0];
			
			ctx.closePath();
			basePolygon.closePath();

			let arrIndex = x+y*this.gameWidth;
			let currValue = this.gameBoard[arrIndex];
			let revealValue = (currValue & 2 );
			
			
			if(revealValue ){
				if((currValue & 1) == 0 )
				{
					
					ctx.fillStyle = "rgba(0,0,0,0.75)";
					ctx.fill();
					
					let tileText = (currValue & 0xf0 )>>4;
					if(tileText > 0){
						bufferOfSprite.push({
							type:"drawNumber",
							params:[
							tileText,accX,accY
							]
						});
						//this.drawNumber(ctx,tileText,accX,accY,sizeOfIcon);
						//ctx.fillStyle = numberColor(tileText);
						//ctx.fillText(tileText,accX,accY);
					}
					
					
				}
				
				
			}else{
				ctx.fillStyle = this.background.patt;
				ctx.fill(basePolygon);
				ctx.fillStyle = this.foreground.patt;
				ctx.fill();
				ctx.stroke();
				
				if(currValue & 4){
					bufferOfSprite.push({
							type:"drawFlag",
							params:[
							accX,accY
							]
						});
					//this.drawFlag(ctx,accX,accY,sizeOfIcon);
					//ctx.fillStyle= "#0f0";
					//ctx.fillText("F",accX,accY);
				}else if(currValue & 8){
					bufferOfSprite.push({
						type:"drawQuestion",
						params:[
							accX,accY
							]
					});
					//this.drawQuestion(ctx,accX,accY,sizeOfIcon);
					//ctx.fillStyle = "#ff0";
					//ctx.fillText("?",accX,accY);
				}
				
			}
			if(this.gameOver){
				let condBomb = (currValue & 1) != 0;
				let condReveal = (currValue & 2) != 0;
				let condFlag = (currValue & 4) != 0;
				if(condFlag && !condBomb && !condReveal){
				
					ctx.fillStyle = this.background.patt;
					ctx.fill();
					
					//ctx.fillStyle = "#000";
					//ctx.fill();
					//ctx.stroke();
					
					


					//ctx.fillStyle = "#fff";
					//ctx.fillText("X",accX,accY);
					bufferOfSprite.push({
						type:"drawInvalidFlag",
						params:[
							accX,accY
							]
					});
					//this.drawInvalidFlag(ctx,accX,accY,sizeOfIcon);
				}else if(condBomb && !condFlag){
					if(condReveal){
						ctx.fillStyle = "#f00";
						ctx.fill();
						ctx.stroke();
					}
					bufferOfSprite.push({
						type:"drawBomb",
						params:[
							accX,accY
							]
					});
					//this.drawBomb(ctx,accX,accY,sizeOfIcon);
					//ctx.fillStyle = "#000";
					//ctx.fillText("B",accX,accY);
				}
			}
			

			//ctx.stroke();
			
		}

		
		
		//ctx.drawImage(this.foreground.img,0,0,this.screenWidth,this.screenHeight);

		


		for(let i of bufferOfSprite){
			this[i.type](ctx,...i.params,sizeOfIcon);
		}
		if(this.gameOver){
				ctx.fillStyle = "rgba(128,128,128,0.2)";
				ctx.fillRect(x_min,y_min,x_max-x_min,y_max-y_min);
				
			}
		document.getElementById(elemText).innerText = this.flagAvail;
	}
	drawNumber(ctx,num,cx,cy,size){
		
		ctx.lineWidth = size/5;
		ctx.strokeStyle = this.numberColor(num);
		ctx.strokeText(num,cx,cy);
		ctx.lineWidth = 1;
		ctx.fillStyle = "#fff";
		ctx.fillText(num,cx,cy);

	}
	drawFlag(ctx,cx,cy,size){
		ctx.shadowColor = "#fff";
		ctx.shadowBlur = 2;
		if(this.flagSprite.loaded){
			ctx.drawImage(this.flagSprite.img,cx-size*0.8,cy-size*0.8,size*0.8*2,size*0.8*2);
		}else{
			ctx.fillStyle = "#f00";
			ctx.fillText("F",cx,cy);	
		}
		ctx.shadowBlur = 0;//set to zero when not used shadow map
		
	}
	drawQuestion(ctx,cx,cy,size){
		ctx.fillStyle = "#ff0";
		ctx.fillText("?",cx,cy);
	}
	drawBomb(ctx,cx,cy,size){
		if(this.bombSprite.loaded){
			ctx.drawImage(this.bombSprite.img,cx-size*0.8,cy-size*0.8,size*0.8*2,size*0.8*2);
		}else{
			ctx.fillStyle = "#fff";
			ctx.fillText("B",cx,cy);	
		}
		
	}
	drawInvalidFlag(ctx,cx,cy,size){
		ctx.fillStyle = "#f00";
		ctx.fillText("X",cx,cy);
	}
	numberColor(i){
		switch(i){
			case 1 : return "#0000ff";
			case 2 : return "#008800";
			case 3 : return "#ff0000";
			case 4 : return "#000055";
			case 5 : return "#550000";
			case 6 : return "#007777";
			case 8 : return "#999999";
			default : return "#000000";
		}
	}
}
