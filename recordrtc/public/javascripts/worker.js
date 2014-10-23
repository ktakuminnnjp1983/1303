onmessage = function(event){
    console.log(event.data);
    postMessage("worker end");
}
