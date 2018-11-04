document.addEventListener("DOMContentLoaded", function(event) {
    let urlInput = document.getElementById('urlInput');
    urlInput.value = location.origin + '/';

    let fileInput = document.getElementById('fileInput');

    const SLICE_SIZE = 100000;

    fileInput.addEventListener("change", function (evt) {
        output('---');

        let selectedFile = fileInput.files[0];

        console.log("selectedFile:", selectedFile.name, selectedFile.size);

        let md5whole = new SparkMD5.ArrayBuffer();
        let position = 0;
        let slice = selectedFile.slice(position, position + SLICE_SIZE);
        let fileReader = new FileReader();
        fileReader.onload = function (evt) {
            let arrayBuffer = evt.target.result;

            if (slice.size > 0) {
                console.log("position:", position);
                md5whole.append(arrayBuffer);

                position += slice.size;
                slice = selectedFile.slice(position, position + SLICE_SIZE);
                fileReader.readAsArrayBuffer(slice);
            } else {
                let hash = md5whole.end();
                output("MD5: " + hash);
                postRemaining(selectedFile, hash);
            }
        };
        fileReader.onerror = function (err) {
            output(err);
        };
        fileReader.readAsArrayBuffer(slice);
    });

    function postRemaining(file, hash) {
        let url = urlInput.value;
        let mode = url.startsWith(location.origin) ? 'same-origin' : 'cors';
        let startPos = parseInt(document.getElementById('startPosInput').value, 10);
        let continuedFile = file.slice(startPos, undefined, file.type);
        console.log("url:", url, "   startPos:", startPos, "   mode:", mode);
        if (continuedFile.size === 0) {
            output("no more to send");
            return;
        }
        output("remaining size: " + continuedFile.size);

        fetch(url, {
            method: 'POST',
            body: continuedFile,
            headers: {
                'Access-Control-Request-Headers': 'X-Content-Range',
                'X-Content-Range': 'bytes ' + startPos + '-' + file.size + '/' + file.size,
                'X-MD5': hash
            },
            mode: mode,
        }).then(response => {
            output(response);
        }).catch(err => {
            output(err);
        })

    }

    function output(msg) {
        console.log(msg);

        let div = document.createElement('div');
        div.innerText = msg;
        document.body.appendChild(div);
    }
});
