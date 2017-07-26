(function(window, document) {
    const canvas = document.getElementById('canvas'),
        success = document.getElementById('success'),
        fail = document.getElementById('fail'),
        ctx = canvas.getContext('2d'),
        winWidth = document.body.clientWidth,
        winHeight = document.body.clientHeight,
        y1 = winHeight / 2 - 68, //68=图片高(48)+线位置(20)
        y2 = winHeight - 68,
        line1 = winHeight / 2 - 18,
        line2 = winHeight - 18;
    canvas.width = winWidth;
    canvas.height = winHeight;
    let p = new Promise((resolve, reject) => {
            let img = new Image();
            img.src = 'images/run.gif';
            img.onload = () => resolve(img);
            img.onerror = () => reject('img load error');
        }),
        dist = 20,
        jumping1 = false,
        jumping2 = false, //防止在跳跃过程中用户多次点击
        cancelMove,
        die = false,
        imgY = y1 + 48 - line1,
        time = 0.00,
        timer;
    p.then((img) => {
        ctx.save();
        ctx.font = '30px bold';
        ctx.fillText(time, 0, 30);
        ctx.restore();
        ctx.fillText('你渴望力量吗？那就狂点我！', 100, 450);
        ctx.font = '30px bold';
        layout(img, line1, y1);
        layout(img, line2, y2);
        setInterval(() => !die && setTimeout(moveWall, Math.round(Math.random() * 3) * 1000, winWidth, line1 - 31), 1000);
        timer = setInterval(timing, 10);
        canvas.addEventListener('click', (e) => {
            e.clientY < line1 && !jumping1 && requestAnimationFrame(() => jump(y1, y1, img, 1));
            e.clientY < line2 && e.clientY > line1 + 10 && !jumping2 && requestAnimationFrame(() => jump(y2, y2, img, 2));
        })
    }).catch((e) => {
        throw new new Error(e);
    });

    function layout(img, line, y) {
        ctx.fillRect(0, line, winWidth, 10);
        ctx.fillRect(winWidth, line1 - 30, 10, 30);
        ctx.drawImage(img, 50, y);
    }

    function moveWall(x, y) {
        x <= 0 && ctx.clearRect(x, y, 10, 30);
        if (die) {
            return;
        }
        ctx.clearRect(x, y, 10, 30);
        if (x > 50 && x <= 99 && imgY <= 30) {
            cancelAnimationFrame(cancelMove);
            ctx.fillRect(x, y + 1, 10, 30);
            clearInterval(timer);
            die = true;
            if (!sessionStorage.getItem('achievements') || sessionStorage.getItem('achievements') < time) {
                sessionStorage.setItem('achievements', time.toFixed(2));
                success.querySelector('p').innerHTML = `${time.toFixed(2)}s`;
                success.style.display = "block";
            } else {
                fail.querySelector('h3').innerHTML = `${time.toFixed(2)}s`;
                fail.querySelector('p').innerHTML = `最好记录${sessionStorage.getItem('achievements')}s`;
                fail.style.display = "block";
            }
        } else {
            x -= 3;
            ctx.fillRect(x, y + 1, 10, 30);
            cancelMove = requestAnimationFrame(() => moveWall(x, y));
        }
    }

    function jump(y, orgin, img, flag) {
        if (die) {
            return;
        }
        if (y <= -winHeight / 4) {
            die = true;
            fail.querySelector('h3').innerHTML = '您已修仙成功';
            fail.querySelector('p').innerHTML = '由于您过于渴望力量，已经飞出宇宙以外';
            fail.style.display = "block";
            clearInterval(timer);
        }
        ctx.clearRect(50, y, 48, 48);
        if (y > orgin - 10 && dist !== 20) {
            //防止图片下落过头让图片归位
            y = orgin;
            ctx.drawImage(img, 50, y);
            dist = 20;
            flag === 1 ? jumping1 = false : jumping2 = false;
        } else {
            flag === 1 ? jumping1 = true : jumping2 = true;
            dist--;
            y -= dist;
            imgY = line1 - y - 48;
            ctx.drawImage(img, 50, y);
            requestAnimationFrame(() => jump(y, orgin, img, flag));
        }
    }

    function timing() {
        ctx.clearRect(0, 0, winWidth, 30);
        time += 0.01;
        ctx.fillText(time.toFixed(2), 0, 30);
    }
})(window, document);