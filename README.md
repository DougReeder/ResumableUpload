FileStreamer - sends remainder of file, with MD-5 of whole file
---
Use the network tab of the debugger to see that the request only contain the last part of the file.

Use the same host (default URL) to see the `X-Content-Range` and `X-MD5` headers.

Request will fail unless server accepts cross-origin posts to the URL.
