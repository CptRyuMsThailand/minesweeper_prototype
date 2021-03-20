class BV3{
	static calculateScore(gi,minesweeper){
		let gWidth = minesweeper.gameWidth;
		let gHeight = minesweeper.gameHeight;

		let score = 0;

		let gridOfBomb = new Uint8Array(minesweeper.gameWidth *minesweeper.gameHeight);
		// MNB
		for(let i=0;i<gWidth*gHeight;i++){
			gridOfBomb[i] = minesweeper.gameBoard[i] & 1;
		}
		gridOfBomb = BV3.initBoard(gi,gridOfBomb,gWidth,gHeight);
		[score,gridOfBomb] = BV3.markCell(gi,gridOfBomb,gWidth,gHeight);
		return score;
	}
	static initBoard(gi,gridOfBomb,w,h){
		for(let y=0;y<h;y++)
		for(let x=0;x<w;x++){
			if(gridOfBomb[x+y*w] & 1)continue;
			let nei = gi.neighbor(x,y);
			for(let i=nei[0]-1;i>=0;--i){
				let nx = nei[1][i][0];
				let ny = nei[1][i][1];
			
				if(nx < 0 || ny < 0 || nx >= w || ny >= h){
					continue;
				}


				if(gridOfBomb[nx+ny*w] & 1){
					gridOfBomb[x+y*w] |= 2;
					break;
				}
			}
		}
		return gridOfBomb;
	}
	static markCell(gi,gridOfBomb,w,h){
		let score = 0;
		for(let y=0;y<h;y++)
		for(let x=0;x<w;x++){
			if(gridOfBomb[x+y*w] )continue; // Non empty cell, Escape it
			score++;
			gridOfBomb = BV3.floodFillCell(gi,gridOfBomb,w,h,x,y);
		}
		for(let y=0;y<h;y++)
		for(let x=0;x<w;x++){
			if(!(gridOfBomb[x+y*w] & 0b101)){//Non bomb Non Mark
				score++;
			}
		}
		return [score,gridOfBomb];
	}
	static floodFillCell(gi,gridOfBomb,w,h,x,y){
		let stack = [];
		stack.push([x,y]);
		while(stack[0]){
			let cpp = stack.pop();
			let vvv = gridOfBomb[cpp[0]+cpp[1]*w];
			if(!(vvv & 4)){
				gridOfBomb[cpp[0]+cpp[1]*w] |= 4;
				if(!(vvv & 2)){
					let nei = gi.neighbor(...cpp);
					for(let i=nei[0]-1;i>=0;--i){
						let nx = nei[1][i][0];
						let ny = nei[1][i][1];
						if(nx < 0 || ny < 0 || nx >= w || ny >= h)continue;
						if((gridOfBomb[nx + ny * w] & 4 ) == 0){
							stack.push(nei[1][i]);
						}

					}
				}


			}
		}
		return gridOfBomb;
	}
	

}