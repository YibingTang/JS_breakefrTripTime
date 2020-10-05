// @flow

const U1=   [0.0104,0.02256,1.08,0.02];
const U2=	[5.95,	0.18,	5.95,	2];
const U3=	[3.88,	0.0963,	3.88,	2];
const U4=	[5.67,	0.0352,	5.67,	2];
const U5=	[0.00342,	0.00262,	0.323,	0.02];
const C1=	[0.14,	0,	13.5,	0.02];
const C2=	[13.5,	0,	47.3,	1];
const C3=	[80,	0,	80,	2];
const C4=	[120,	0,	120,	1];
const C5=	[0.05,	0,	4.85,	0.04];

let tccType={
	"U1":U1,
	"U2":U2,
	"U3":U3,
	"U4":U4,
	"U5":U5,
	"C1":C1,
	"C2":C2,
	"C3":C3,
	"C4":C4,
	"C5":C5
}

// expand the pattern to longer time period
function repeatArr(arr,ntimes){
	let x=arr
	let arr2=[]
	for (i=0;i<ntimes;i++){
		for (j=0;j<x.length;j++){
			arr2.push(x[j])
		}
	}
	return arr2
}

/**
//open or reset time calculation, 
A,B,C,p: paramters for the spefici curve type
TDS: time dial setting
M: load ratio
*/
function triptime_cw_ABCp(A,B,C,p,TDS,M){
  if (M == 1) {
    	return 1e12
	} else if (M>1) { //
    	return TDS*(B+A/(M**p-1))
	} else {
    	return TDS*(C/(M**2-1))
  }
}

/**
//open or reset time calculation, 
tcc: curve type 
TDS: time dial setting
M: load ratio
*/
function triptime_cw_tcc(tcc,TDS,M){
	// let tcc="U3"
	let A,B,C,p;
	[A,B,C,p]=tccType[tcc];

	return triptime_cw_ABCp(A,B,C,p,TDS,M);	
}


/*
create short time pattern and return two arrays
ts: array of time
trip: array of trip time at different time
*/
function GetTimeTriptimePairsShort(tcc,TDS,rmax,rmin){
	let ts=[]
	let trip
	let H=rmax
	let L=rmin

	// time and load
	let td0=[2,3,2,3,2,3,2,3,100,50]//duration
	let Mp0=[H,L,H,L,H,L,H,L,L,L]//array of ratio of load to rating


	// let td=repeatArr(td0, 60)
	let td=td0;

	// time and trip time array
	x=0
	for (i=0;i<td.length;i++){
		ts.push(x)
		x+=td[i]
	}

	let trip0=[]//array of trip time
	for (i=0;i<Mp0.length;i++){
		trip0.push(triptime_cw_tcc(tcc,TDS,Mp0[i]))
	}

	// trip=repeatArr(Trip0, 60)//trip time array of particular amplitude
	trip=trip0//trip time array of particular amplitude

	return [ts,trip]
}

/*
create long time pattern and return two arrays
ts: array of time
trip: array of trip time at different time
*/
function GetTimeTriptimePairsLong(tcc,TDS,rmax,rmin){
	let ts=[]
	let trip

	let H=rmax
	let L=rmin

	// time 
	let td0=[2,3,2,3,50]//duration
	let Mp0=[H,L,L,L,L]//array of ratio of load to rating

	let td=repeatArr(td0, 60)
	// time and trip time array
	x=0
	for (i=0;i<td.length;i++){
		ts.push(x)
		x+=td[i]
	}

	let Trip0=[]//array of trip time
	for (i=0;i<Mp0.length;i++){
		Trip0.push(triptime_cw_tcc(tcc,TDS,Mp0[i]))
	}

	//

	trip=repeatArr(Trip0, 60)//trip time array of particular amplitude

	return [ts,trip]
}


/*
Calcualte travel and trip time based on the time, triptime pair
*/
function CalculateTripTime(ts,trip){
	let	time=0;
	let travel=0;

	let sum=0
	let dt=0.005
	let sumMax=0

	for (i=0;i<ts.length;i++){
		let tt0=trip[i]
		let ts1=ts[i+1]
		while (time<ts1 && sum<=1){
			time+=dt
			sum+=1/tt0*dt
			if (sum<0){
				sum=0;
			}
			if (sumMax<sum){
				sumMax=sum;
			}
		}
		if (sum>1){
			break;
		}
	}
	travel=sumMax;
	return [travel,time]
}

function CheckBreakerShortTime(tcc,TDS,rmax,rmin){
	let ts,trip;
	[ts,trip]=GetTimeTriptimePairsShort(tcc,TDS,rmax,rmin);

	let	time, travel;
	[travel,time]=CalculateTripTime(ts,trip);

	return [travel,time]
}


function CheckBreakerLongTime(tcc,TDS,rmax,rmin){
	let ts,trip;
	[ts,trip]=GetTimeTriptimePairsLong(tcc,TDS,rmax,rmin);

	let	time, travel;
	[travel,time]=CalculateTripTime(ts,trip);

	return [travel,time]
}

function CheckBreakerLongTime_travel(tcc,TDS,rmax,rmin){
	let	time, travel;
    [travel,time]=CheckBreakerLongTime(tcc,parseFloat(TDS),parseFloat(rmax),parseFloat(rmin))
    return travel
}

function CheckBreakerLongTime_triptime(tcc,TDS,rmax,rmin){
	let	time, travel;
    [travel,time]=CheckBreakerLongTime(tcc,parseFloat(TDS),parseFloat(rmax),parseFloat(rmin))
    return time
}

function CheckBreakerShortTime_travel(tcc,TDS,rmax,rmin){
	let	time, travel;
    [travel,time]=CheckBreakerShortTime(tcc,parseFloat(TDS),parseFloat(rmax),parseFloat(rmin))
    return travel
}

function CheckBreakerShortTime_triptime(tcc,TDS,rmax,rmin){
	let	time, travel;
    [travel,time]=CheckBreakerShortTime(tcc,parseFloat(TDS),parseFloat(rmax),parseFloat(rmin))
    return time
}


/** 
Test the code, constant load
*/

{
// Define the curve type
let tcc="U3"
let TDS=1.4

// Define the load for const load trip time
let r=1.05;
console.log("\nCW load, load = ",r);
t=triptime_cw_tcc(tcc,TDS,r)
console.log("load ratio=",r,"triptime=",t,"\n")
}


/** 
Test the code, load of two different level
*/

{
// Define the curve type
let tcc="U3"
let TDS=1.4

// Define the load for load with load of different waveform
let rmax=1.13;
let rmin=0.985;
let travel,time;

console.log("\n4 spikes with 3s interval in between, pattern not repeat, calcualte over limited time since this is for short period high density of spike");
[travel,time]=CheckBreakerShortTime(tcc,TDS,rmax,rmin)
console.log("travel=",travel,"time=",time,"\n");

console.log("\n1 spikes within 60s, repeat for 1 hours");
[travel,time]=CheckBreakerLongTime(tcc,TDS,rmax,rmin)
console.log("travel=",travel,"time=",time,"\n");
}
