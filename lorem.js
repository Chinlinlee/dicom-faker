const { request } = require("undici");


(async () => {
    let url = "https://picsum.photos/512/512.jpg";
    const { body, statusCode } = await request(url, {
        headers: {
            accept: 'image/jpeg',
        },
        maxRedirections: 10
    });
    let buffer = await body.arrayBuffer();
    console.log(buffer);
})();