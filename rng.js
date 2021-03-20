class rngLCG{
	constructor(seed=1){
		this.seed = seed;
		this.originSeed = seed;
	}
	discard(){
		this.seed = (this.seed * 1664525 + 1013904223)%(2**32);
	}
	rand(){
		this.discard();
		return this.seed / (2**32);
	}
}
class RandUtil{
	static shuffle(arr,randEngine){
		for(let i=arr.length-1;i>0;i--){
			let t = Math.floor(randEngine.rand()*i);
			let tmp = arr[i];
			arr[i] = arr[t];
			arr[t] = tmp;
		}
	}
}