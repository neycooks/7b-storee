import { reset } from "./applyClothing.js";
import { sendError } from "./index.js";

export function drawTorso(pants, shirt, defaultShirt, callback) {
  const skinImage = new Image();
  skinImage.src = "../models/textures/skin.webp";
  skinImage.addEventListener("load", () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = skinImage.width;
      canvas.height = skinImage.height;

      ctx.drawImage(skinImage, 0, 0);
      if (pants.src !== '../models/textures/basePants.png'){ctx.drawImage(pants, 0, 0);}
      if (defaultShirt == false) {ctx.drawImage(shirt, 0, 0);}

      const overlaidImage = new Image();
      overlaidImage.src = canvas.toDataURL();

      callback(overlaidImage);
  });
}



function draw(
  img,
  skin,
  startX,
  startY,
  endX,
  endY,
  offsetX,
  offsetY,
  callback
) {
  const overlayCanvas = document.createElement("canvas");
  const overlayCtx = overlayCanvas.getContext("2d");
  const pixelRangeX = endX - startX;
  const pixelRangeY = endY - startY;
  // console.log(pixelRangeX + " " + pixelRangeY);

  overlayCanvas.width = skin.width;
  overlayCanvas.height = skin.height;
  // console.log(overlayCanvas.width + ' ' + overlayCanvas.height)
  overlayCtx.drawImage(skin, 0, 0, skin.width, skin.height);
  overlayCtx.drawImage(
    img,
    startX,
    startY,
    pixelRangeX,
    pixelRangeY,
    offsetX,
    offsetY,
    pixelRangeX,
    pixelRangeY
  );
  const newImage = new Image();
  newImage.src = overlayCanvas.toDataURL();
  newImage.onload = function () {
    callback(newImage);
  };
}
export function draw2D(type, image, drawShirt, currentHands) {
  if (reset !== true){
    let skin = new Image();
    skin.src = document.getElementById("image2D").src;
    skin.addEventListener("load", () => {
      let img = new Image();
      img.src = image.src;
      img.addEventListener("load", () => {
        if (type == "shirt") {
          draw(img,skin,231,74,231+128,74+128,168,69,(skin)=>{draw(img,skin,217,355,217+64,355+128,104,69,(skin)=>{draw(img,skin,308,355,308+64,355+128,296,69,(skin)=>{draw(img,skin,427,74,427+128,74+128,453,69,(skin)=>{draw(img,skin,85,355,85+64,355+128,581,69,(skin)=>{draw(img,skin,440,355,440+64,355+128,389,69,(skin)=>{draw(img,skin,151,355,151+64,355+128,25,69,(skin)=>{draw(img,skin,374,355,374+64,355+128,660,69,(skin)=>{document.getElementById("image2D").src = skin.src;})})})})})})})});
        } else if (type == "pants") {
          draw(img,skin,231,74,231+128,74+128,168,69,(skin)=>{draw(img,skin,217,355,217+64,355+128,104+64,197,(skin)=>{draw(img,skin,308,355,308+64,355+128,296-64,197,(skin)=>{draw(img,skin,427,74,427+128,74+128,453,69,(skin)=>{draw(img,skin,85,355,85+64,355+128,581-64,197,(skin)=>{draw(img,skin,440,355,440+64,355+128,389+64,197,(skin)=>{draw(img,skin,151,355,151+64,355+128,25,197,(skin)=>{draw(img,skin,374,355,374+64,355+128,660,197,(skin)=>{document.getElementById("image2D").src = skin.src;})})})})})})})});
        }
      });
    });
  }
}




export async function addPaddingToImg(clothingImg, callback) {

  async function addPadding(img, startX, startY, endX, endY) {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Operation timed out'));
      }, 2000);

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img, 0, 0);

      for (let i = 0; i <= endX - startX; i++) {
        ctx.putImageData(ctx.getImageData(startX + i, startY, 1, 1), startX + i, startY - 1);
        ctx.putImageData(ctx.getImageData(startX + i, endY, 1, 1), startX + i, endY + 1);
      }
      for (let i = 0; i <= endY - startY; i++) {
        ctx.putImageData(ctx.getImageData(endX, startY + i, 1, 1), endX + 1, startY + i);
        ctx.putImageData(ctx.getImageData(startX, startY + i, 1, 1), startX - 1, startY + i);
      }

      const newImg = new Image();
      newImg.onload = () => {
        clearTimeout(timeoutId); // Clear the timeout if the operation completes within the timeout period
        resolve(newImg);
      };
      newImg.onerror = reject;
      newImg.src = canvas.toDataURL("image/png");
    });
  }

  async function addSkin(img) {
    return new Promise((resolve, reject) => {
      const skinImage = new Image();
      const skinImage2 = new Image();
      skinImage.src = "../models/textures/skin.webp";
      skinImage2.src = "../models/textures/skin2.webp";

      skinImage.onload = () => {
        skinImage2.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          canvas.width = skinImage.width;
          canvas.height = skinImage.height;

          ctx.drawImage(skinImage, 0, 0);
          ctx.drawImage(img, 0, 0);
          ctx.drawImage(skinImage2, 0, 0);

          const overlaidImage = new Image();
          overlaidImage.onload = () => {
            resolve(overlaidImage);
          };
          overlaidImage.onerror = reject;
          overlaidImage.src = canvas.toDataURL();
        };
        skinImage2.onerror = reject;
      };
      skinImage.onerror = reject;
    });
  }

  try {
    clothingImg = await addSkin(clothingImg);

    // clothingImg = await addPadding(clothingImg, 231, 8, 358, 71);

    // clothingImg = await addPadding(clothingImg, 165, 74, 228, 201);
    // clothingImg = await addPadding(clothingImg, 231, 74, 358, 201);
    // clothingImg = await addPadding(clothingImg, 361, 74, 424, 201);
    // clothingImg = await addPadding(clothingImg, 427, 74, 554, 201);

    // clothingImg = await addPadding(clothingImg, 231, 204, 358, 267);
    
    // clothingImg = await addPadding(clothingImg, 217, 289, 280, 352);
    // clothingImg = await addPadding(clothingImg, 308, 289, 371, 352);

    // clothingImg = await addPadding(clothingImg, 217,355, 280, 482);
    // clothingImg = await addPadding(clothingImg, 151,355, 214, 482);
    // clothingImg = await addPadding(clothingImg, 85,355, 148, 482);
    // clothingImg = await addPadding(clothingImg, 19,355, 82, 482);
    // clothingImg = await addPadding(clothingImg, 308,355, 371, 482);
    // clothingImg = await addPadding(clothingImg, 374,355, 437, 482);
    // clothingImg = await addPadding(clothingImg, 440,355, 503, 482);
    // clothingImg = await addPadding(clothingImg, 506,355, 569, 482);
    
    // clothingImg = await addPadding(clothingImg, 217,485, 280, 548);
    clothingImg = await addPadding(clothingImg, 308,485, 371, 548, (finalImg) => {callback(finalImg)});
    callback(clothingImg);
  } catch (error) {
    console.error(`Error while processing image. While adding padding. ${error}`);
  }
}