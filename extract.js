const fs = require('fs');
const pdf = require('pdf-parse');

let dataBuffer = fs.readFileSync('Quyet_dinh_thanh_lap_LOVE_BANH_MI_Xac_Minh_Gốc.pdf');

pdf(dataBuffer).then(function(data) {
    console.log("PDF TEXT START:");
    console.log(data.text);
    console.log("PDF TEXT END");
}).catch(err => {
    console.error(err);
});
