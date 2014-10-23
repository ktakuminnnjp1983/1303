
function download(name, url){
    var link = document.getElementById("dummyDownload");
    link.download = name;
    link.href = url;
    link.click();
}

function testBlobDownload(content, type){
    var blob = new Blob([content], {"type": type});
    var url = URL.createObjectURL(blob);
    download("blob.txt", url);
}
