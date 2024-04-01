/*!
 * view360 1.0.0
 * 
 * Copyright 2023-, view360. All rights reserved.
 * @author: Angela Liao, someonemimo@gmail.com
*/

function View360(el, params) {
    // 公用參數
    const { img, imgHeight, imgWidth, scrub = 10, dir = -1, isSprite = false, sprite = isSprite ? { row: 6, col: 6 } : null } = params;

    let imageSourceReload = false;

    // 私有參數
    // 取得Canvas元素
    let canvas, ctx;

    let imgUrl = img;
    // 圖片總量
    // ===== 多張單圖
    const sourceCount = Object.keys(img).length || null;
    // ===== 雪碧圖
    const spritesCount = isSprite ? sprite.row * sprite.col : null;
    // 靈敏度範圍定義
    const scrubMax = 30, scrubMin = 1;
    // 靈敏度限制
    let scrubDrag = Math.min(Math.max(scrub, scrubMin), scrubMax);
    // 靈敏度提示
    scrub >= scrubMax ? console.log(`靈敏度最大${scrubMax}`) : null && scrub <= scrubMin ? console.log(`靈敏度最小${scrubMin}`) : null;


    // 存放圖片的陣列
    let images = [];

    // 目前顯示的圖片索引
    let currentIndex = 0;
    // 拖曳開始的X座標
    let dragStartX = 0;
    // 是否正在拖曳中的標誌
    let isDragging = false;


    // 取得元素
    function selectElements() {
        // 只在 setInit 中调用
        canvas = document.querySelector(el);
        ctx = canvas.getContext('2d')
    }
    // 調整Canvas大小的函數
    function resizeCanvas() {
        // 設定Canvas的寬度為視窗寬度
        canvas.width = imgHeight;//window.innerWidth;
        // 設定Canvas的高度為寬度的16:9比例
        canvas.height = imgWidth;//window.innerWidth * 0.5625;
        // 繪製目前圖片
        drawCurrentImage();
    }

    // 繪製目前圖片的函數
    function drawCurrentImage() {
        // 清空Canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // 繪製目前索引的圖片
        ctx.drawImage(images[currentIndex], 0, 0, canvas.width, canvas.height);
    }

    // 處理滑鼠按下事件的函數
    function handleMouseDown(e) {
        // 設定拖曳標誌為true
        isDragging = true;
        // 記錄拖曳開始的X座標
        dragStartX = e.clientX || e.touches[0].clientX;
    }

    // 處理滑鼠移動事件的函數
    function handleMouseMove(e) {
        if (isDragging) {
            // 計算拖曳距離
            const dragDistance = (e.clientX || e.touches[0].clientX) - dragStartX;
            const floor = Math.sign(dragDistance);
            // 設定拖曳的靈敏度
            const sensitivity = scrubDrag;
            // 計算圖片索引的偏移量
            const imageIndexOffset = Math.floor(Math.abs(dragDistance) / sensitivity) * floor;

            // 更新目前圖片索引
            if (isSprite) {
                currentIndex = Math.abs((currentIndex + (dir * imageIndexOffset) + spritesCount) % spritesCount);
                drawCanvas(currentIndex);
            } else {
                currentIndex = Math.abs((currentIndex + (dir * imageIndexOffset) + images.length) % images.length);
                preloadImages();
                // 繪製目前圖片
                drawCurrentImage();
            }

            // 更新拖曳開始的X座標
            dragStartX = e.clientX || e.touches[0].clientX;
        }
    }

    // 處理滑鼠釋放事件的函數
    function handleMouseUp() {
        // 設定拖曳標誌為false
        isDragging = false;
    }

    // 處理滑鼠離開Canvas區域的函數
    function handleMouseLeave() {
        // 設定拖曳標誌為false
        isDragging = false;
    }

    selectElements()
    // 監聽滑鼠事件
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    // 監聽觸控事件
    canvas.addEventListener('touchstart', handleMouseDown);
    canvas.addEventListener('touchmove', handleMouseMove);
    canvas.addEventListener('touchend', handleMouseUp);

    // 監聽視窗大小變化事件
    // window.addEventListener('resize', resizeCanvas);

    // 預加載圖片的函數
    function preloadImages(startIndex, count) {
        for (let i = 1; i < sourceCount; i++) {
            imgOnload(i)
                .catch((error) => {
                    console.error("圖片加載失敗:", error, i);
                    return
                });
        }
    }

    function imgOnload(num, callback) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.src = imgUrl[num];

            image.onload = () => {
                images[num] = image;
                resolve();
            };
            image.onerror = (error) => {
                reject(error);
            };
        })
    }

    if (isSprite) {
        drawCanvas(0);
    } else {
        imgOnload(0)
            .then(() => {
                resizeCanvas();
                drawCurrentImage();
            })
            .catch((error) => {
                console.error("圖片加載失敗:", error);
                return
            });

    }

    function drawCanvas(currentIndex) {

        if(imageSourceReload) {
            setCanvasPara(images[0],currentIndex);
        } else {

            imgOnload(0)
            .then(() => {
                imageSourceReload = true;
                setCanvasPara(images[0],currentIndex);
            })
            .catch((error) => {
                console.error("圖片加載失敗:", error);
                return
            });
        }

    }
    function setCanvasPara(IMAGE,CURRINDEX){
        const patternWidth = IMAGE.width / sprite.row;
        const patternHeight = IMAGE.height / sprite.col;

        // 設定Canvas的寬度為視窗寬度
        canvas.width = imgHeight;
        // 設定Canvas的高度為寬度的16:9比例
        canvas.height = imgWidth * (patternHeight / patternWidth);

        const col = CURRINDEX % sprite.row;
        const row = Math.floor(CURRINDEX / sprite.col);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.drawImage(IMAGE, col * patternWidth, row * patternHeight, patternWidth, patternHeight, 0, 0, canvas.width, canvas.height);
    }
    View360.prototype.onChangeSoure = function (url) {
        imgUrl = url;
        imageSourceReload = false;
        drawCanvas(0)
    }
}