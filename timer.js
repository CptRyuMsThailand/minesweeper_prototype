class Timer{
	constructor(){
		this.isTicked = false;
		this.res = 0;
		this.timeStart = 0;
		this.timeEnd = 0;
	}
	start(){
		if(this.isTicked)return;
		this.res = 0;
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
		this.res = 1;
	}
	result(){
		let delta = this.resultRaw();
		return [Math.floor(delta / 3600000),Math.floor(delta/60000)%60,Math.floor(delta/1000)%60,delta%1000];
	}
	resultRaw(){
		if(this.res )return 0;
		return this.timeEnd - this.timeStart;
	}
}