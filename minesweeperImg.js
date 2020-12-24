


const imageTexture = document.createElement("img");
imageTexture.src = "data:image/bmp;base64,"+imgFile;


class TileDrawing{
	static getImageBuffer(img){
		let w = img.width;
		let h = img.height;
		let _cv = document.createElement("canvas");
		_cv.width = w;
		_cv.height = h;
		let _ctx = _cv.getContext("2d");
		_ctx.drawImage(img,0,0);
		let buffer = _ctx.getImageData(0,0,w,h);
		return buffer;
	}
	static drawUV(buffer,x1,y1,x2,y2,x3,y3){
		
		/* Next piece of code is from
		http://www.sunshine2k.de/coding/java/TriangleRasterization/TriangleRasterization.html
		*/
		let bwidth = buffer.width;
		let bheight = buffer.height;
		function crossProduct(a1,b1,a2,b2){
			return (a1 * b2) - (a2 * b1);
		}
		function plotPixel(x,y,u,v){
			buffer.data[(x+y*bwidth) * 4 + 0] = u * 255;
			buffer.data[(x+y*bwidth) * 4 + 1] = v * 255;
			//buffer.data[(x+y*bwidth) * 4 + 2] = isNotEdge*255;
			buffer.data[(x+y*bwidth) * 4 + 3] = 255;
			
			//ctx.fillRect(x,y,1,1);
		}
		let maxX = Math.ceil(Math.max(x1, Math.max(x2, x3)))+1;
		let minX = Math.floor(Math.min(x1, Math.min(x2, x3)));
		let maxY = Math.ceil(Math.max(y1, Math.max(y2, y3)))+1;
		let minY = Math.floor(Math.min(y1, Math.min(y2, y3)));
		let vs1x = x2-x1;
		let vs1y = y2-y1;
		let vs2x = x3-x1;
		let vs2y = y3-y1;
		let maxXsc = Math.min(bwidth-1,maxX);
		let maxYsc = Math.min(bheight-1,maxY);
		
		let area = crossProduct(vs1x,vs1y,vs2x,vs2y);
		for(let y=Math.max(minY,0);y<=maxYsc;y++)
		for(let x=Math.max(minX,0);x<=maxXsc;x++){
			let qx = x - x1;
			let qy = y - y1;
			let nqx = (x+1)-x1;
			let nqy = (y+1)-y1;


			let s = crossProduct(qx,qy,vs2x,vs2y) / area;
			let t = crossProduct(vs1x,vs1y,qx,qy) / area;
			let ns = crossProduct(nqx,nqy,vs2x,vs2y) / area;
			let nt = crossProduct(vs1x,vs1y,nqx,nqy) / area;

		
			if((s >= 0) && (t >= 0) && (s+t<=1)){
				plotPixel(x,y,s,t);
			}


		}
	}

	static mapTextureToPixel(destctx,uvBuffer,textureSampler,indexX,indexY,tileWidth,tileHeight,boundLeft,boundTop,boundWidth,boundHeight){
		function toroidalSpace(x1,y1,x2,y2){
			let dx = Math.abs(x2 - x1);
			let dy = Math.abs(y2 - y1);
			if(dx > 0.5 )dx = 1-dx;
			if(dy > 0.5 )dy = 1-dy;
			return Math.sqrt(dx*dx+dy*dy);
		}
		//let imgData = srcctx.getImageData(boundLeft,boundTop,boundWidth,boundHeight);
		let destData = destctx.createImageData(boundWidth,boundHeight);
		let imgStride = imageTexture.width;
		let offsetX = indexX * tileWidth;
		let offsetY = indexY * tileHeight;
		

		//destctx.clearRect(boundLeft,boundTop,boundWidth,boundHeight);
		for(let y=0;y<boundHeight;++y)
		for(let x=0;x<boundWidth;++x){
			let alpha = uvBuffer.data[(x+y*boundWidth)*4+3]/255; //0-1
			if(alpha < 0.5)continue;
			let isNotEdge = 1;//uvBuffer.data[(x+y*boundWidth)*4+2] / 255;
			let u = uvBuffer.data[(x+y*boundWidth)*4+0]/255; //0-1
			let v = uvBuffer.data[(x+y*boundWidth)*4+1]/255; //0-1
			let nx = Math.min(x+1,boundWidth-1);
			let ny = Math.min(y+1,boundHeight-1);
			
			let tu = uvBuffer.data[(nx+y*boundWidth)*4+0]/255;
			let tv = uvBuffer.data[(nx+y*boundWidth)*4+1]/255;
			let su = uvBuffer.data[(x+ny*boundWidth)*4+0]/255;
			let sv = uvBuffer.data[(x+ny*boundWidth)*4+1]/255;
			let dfx = toroidalSpace(u,v,tu,tv);
			let dfy = toroidalSpace(u,v,su,sv);
			
			u = offsetX + u * (tileWidth-1);
			v = offsetY + v * (tileHeight-1);
			u = Math.min(Math.max(u,offsetX),offsetX+tileWidth-1);
			v = Math.min(Math.max(v,offsetY),offsetY+tileHeight-1);
			dfx = dfx * (tileWidth-1);
			dfy = dfy * (tileHeight-1);
			//dfx = Math.min(Math.max(u,indexX*tileWidth),indexX*tileWidth+tileWidth-1);
			//dfy = Math.min(Math.max(v,indexY*tileHeight),indexY*tileHeight+tileHeight-1);
			/*tu = indexX * tileWidth + tu * (tileWidth-1);
			tv = indexY * tileHeight + tv * (tileHeight-1);
			tu = Math.min(Math.max(tu,indexX*tileWidth),indexX*tileWidth+tileWidth-1);
			tv = Math.min(Math.max(tv,indexY*tileHeight),indexY*tileHeight+tileHeight-1);
			su = indexX * tileWidth + su * (tileWidth-1);
			sv = indexY * tileHeight + sv * (tileHeight-1);
			su = Math.min(Math.max(su,indexX*tileWidth),indexX*tileWidth+tileWidth-1);
			sv = Math.min(Math.max(sv,indexY*tileHeight),indexY*tileHeight+tileHeight-1);
			*/
			let _fu = Math.floor(u);
			let _fv = Math.floor(v);
			let _cu = Math.ceil(u);
			let _cv = Math.ceil(v);
			let _iu = u -_fu;
			let _iv = v -_fv;
			
			
			
			
			//_iu = _iu * _iu * (3-2*_iu);
			//_iv = _iv * _iv * (3-2*_iv);
			
			//if(alpha > 0.5)
			let clampFncX = (x,lvl)=>{return Math.min(Math.max(x,Math.floor(offsetX/(2**lvl))),Math.floor((offsetX+tileWidth-2)/(2**lvl)))};
			let clampFncY = (y,lvl)=>{return Math.min(Math.max(y,Math.floor(offsetY/(2**lvl))),Math.floor((offsetY+tileHeight-2)/(2**lvl)))};
			for(let i=0;i<4;i++){

				destData.data[(x+y*boundWidth)*4+i] = //textureSampler.sample(_fu,_fv,i,dfx,dfy,clampFncX,clampFncY);
				textureSampler.sample(_fu,_fv,i,dfx,dfy,clampFncX,clampFncY)*(1-_iu)*(1-_iv)+
				textureSampler.sample(_cu,_fv,i,dfx,dfy,clampFncX,clampFncY)*(_iu)*(1-_iv)+
				textureSampler.sample(_fu,_cv,i,dfx,dfy,clampFncX,clampFncY)*(1-_iu)*(_iv)+
				textureSampler.sample(_cu,_cv,i,dfx,dfy,clampFncX,clampFncY)*(_iu)*(_iv)
				;
				//imgTexture.data[(_fu+_fv*imgStride)*4+i];
				/*(imgTexture.data[(_fu+_fv*imgStride)*4+i]*(1-_iu)*(1-_iv)+
				imgTexture.data[(_cu+_fv*imgStride)*4+i]*(_iu)*(1-_iv)+
				imgTexture.data[(_fu+_cv*imgStride)*4+i]*(1-_iu)*(_iv)+
				imgTexture.data[(_cu+_cv*imgStride)*4+i]*(_iu)*(_iv));*/

			}
			
			//destctx.drawImage(img,u,v,1,1,boundLeft+x,boundTop+y,1,1);

		}
		destctx.putImageData(destData,boundLeft,boundTop);
	}

}
class MipMapping{
	constructor(buffer,level){
		let tempCanvas = document.createElement("canvas");
		let tempCtx = tempCanvas.getContext("2d");
		this.level = level;
		this.bufferList = new Array(level);
		this.bufferList[0] = buffer;

		this.width = new Array(level);
		this.width[0] = buffer.width;

		this.height = new Array(level);
		this.height[0] = buffer.height;
		for(let i=1;i<level;i++){
			let currWidth = this.width[i-1]/2;
			let currHeight = this.height[i-1]/2;
			let currBuffer = tempCtx.createImageData(currWidth,currHeight);
			let lastBufferData = this.bufferList[i-1].data;
			for(let x=0;x<currWidth;x++)
				for(let y=0;y<currHeight;y++){
					let xsc = x*2;
					let ysc = y*2;
					for(let j=0;j<4;j++)
					currBuffer.data[(x+y*currWidth)*4+j]=
					lastBufferData[((xsc)+(ysc)*(currWidth*2))*4+j]*0.25+
					lastBufferData[((xsc+1)+(ysc)*(currWidth*2))*4+j]*0.25+
					lastBufferData[((xsc)+(ysc+1)*(currWidth*2))*4+j]*0.25+
					lastBufferData[((xsc+1)+(ysc+1)*(currWidth*2))*4+j]*0.25;
				}
			this.bufferList[i] = currBuffer;
			this.width[i] = currWidth;
			this.height[i] = currHeight;
		}
	}
	sample(x,y,i,dfx,dfy,clampFncX,clampFncY){
		let selectLevel = Math.min(this.level-1,Math.log2(Math.max(1,Math.abs(dfx),Math.abs(dfy))));
		
		let selectLevel2 = Math.ceil(selectLevel);
		let tx1 = clampFncX(Math.floor(x / (2**selectLevel2)),selectLevel2);
		let ty1 = clampFncY(Math.floor(y / (2**selectLevel2)),selectLevel2);
		let tx2 = clampFncX(Math.ceil(x / (2**selectLevel2)),selectLevel2);
		let ty2 = clampFncY(Math.ceil(y / (2**selectLevel2)),selectLevel2);
		let fx = clampFncX(x / (2**selectLevel2),selectLevel2) - tx1;
		let fy = clampFncY(y / (2**selectLevel2),selectLevel2) - ty1;
		
		return (
			this.bufferList[selectLevel2].data[(tx1+ty1*this.width[selectLevel2])*4+i]*(1-fx)*(1-fy)+
			this.bufferList[selectLevel2].data[(tx1+ty2*this.width[selectLevel2])*4+i]*(1-fx)*(fy)+
			this.bufferList[selectLevel2].data[(tx2+ty1*this.width[selectLevel2])*4+i]*(fx)*(1-fy)+
			this.bufferList[selectLevel2].data[(tx2+ty2*this.width[selectLevel2])*4+i]*(fx)*(fy)
			
			);
	}
}
class CanvasList{
	constructor(canvasCount,canvasWidth,canvasHeight){
		this.canvasArray = new Array(canvasCount);
		this.contextArray = new Array(canvasCount);
		this.canvasCount = canvasCount;
		for(let i=0;i<canvasCount;i++){
			this.canvasArray[i] = document.createElement("canvas");
			this.canvasArray[i].width = canvasWidth;
			this.canvasArray[i].height = canvasHeight;
			this.contextArray[i] = this.canvasArray[i].getContext("2d");
		}
	}
	masking(baseMaskLayer,srcLayer){
		this.contextArray[baseMaskLayer].globalCompositeOperation = "source-atop";
		this.contextArray[baseMaskLayer].drawImage(this.canvasArray[srcLayer],0,0);
		this.contextArray[baseMaskLayer].globalCompositeOperation = "source-over";
		

	}
}
