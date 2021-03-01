class Timer{
	constructor(){
		this.isTicked = false;
		this.timeStart = 0;
		this.timeEnd = 0;
	}
	start(){
		if(this.isTicked)return;
		this.isTicked = true;
		this.timeStart = Date.now();
	}
	end(){
		this.isTicked = false;
		this.timeEnd = Date.now();
	}
	view(){
		this.timeEnd = Date.now();
	}
	reset(){
		this.isTicked = false;
	}
	result(){
		let delta = this.resultRaw();
		return [Math.floor(delta / 3600000),Math.floor(delta/60000)%60,Math.floor(delta/1000)%60,delta%1000];
	}
	resultRaw(){
		return this.timeEnd - this.timeStart;
	}
}