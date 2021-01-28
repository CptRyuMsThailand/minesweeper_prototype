class Sprite{
	constructor(url){
		this.img = document.createElement("img");
		this.loaded = false;
		this.img.src = url;
		let _this = this;
		this.img.onload = function(){
			_this.loaded = true;
		}
	}
	

}
class Pattern{
	constructor(ctx,url){
		this.img = document.createElement("img");
		this.loaded = false;
		this.img.src = url;
		this.patt;
		let _this = this;
		this.img.onload = function(){
			_this.loaded = true;
			_this.patt = ctx.createPattern(_this.img,"repeat");
		}
	}
}