// function addImageNextToLabel() {
//     const fieldId = '177156';
//     const imageUrl = 'https://picsum.photos/200';

//     const settings = {
//         width: "40px",
//         height: "auto",
//         marginLeft: "8px",
//         borderRadius: "4px"
//     };

//     // Only add if not already present
//     if ($(`label[for='${fieldId}']`).next("img.label-added").length === 0) {
//         const imgHtml = `
//             <img src="${imageUrl}" 
//                  alt="label image"
//                  class="label-added"
//                  style="width:${settings.width}; 
//                         height:${settings.height}; 
//                         margin-left:${settings.marginLeft}; 
//                         border-radius:${settings.borderRadius}; 
//                         vertical-align:middle;">
//         `;
//         $(`label[for='${fieldId}']`).after(imgHtml);
//     }
// }


function addImageNextToLabel() {
    const fieldId = '177156';
    // Tiny red dot PNG (replace with your own Base64)
    const imageUrl = ''

    const imgHtml = `
        <img src="${imageUrl}" 
             alt="label image"
             class="label-added"
             style="width:40px; height:40px; margin-left:8px; border-radius:4px; vertical-align:middle; border:1px solid red;">
    `;

    if ($(`label[for='${fieldId}']`).next("img.label-added").length === 0) {
        $(`label[for='${fieldId}']`).after(imgHtml);
    }
}

$(document).ready(function () {
    addImageNextToLabel();
});
