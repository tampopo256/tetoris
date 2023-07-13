const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
context.scale(20, 20);

// テトリスのフィールドの初期化
function createMatrix(width, height) {
    const matrix = [];
    while (height--) {
        matrix.push(new Array(width).fill(0));
    }
    return matrix;
}

// テトリミノの形状
const tetriminos = [
    [
        [0, 0, 0],
        [1, 1, 1],
        [0, 1, 0],
    ],
    [
        [2, 2],
        [2, 2],
    ],
    [
        [0, 3, 3],
        [3, 3, 0],
        [0, 0, 0],
    ],
    // 他のテトリミノの形状もここに追加できます
];

// テトリスのカラーパレット
const colors = [
    null,
    '#FF0D72',
    '#0DC2FF',
    '#0DFF72',
    '#F538FF',
    '#FF8E0D',
    '#FFE138',
    '#3877FF',
];

// テトリスの描画
function draw() {
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawMatrix(arena, { x: 0, y: 0 });
    drawMatrix(player.matrix, player.pos);
}

// マトリックスの描画
function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

// テトリミノの衝突判定
function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
                (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

// テトリミノの回転
function rotate(matrix, direction) {
    const rotated = matrix.map((_, index) =>
        matrix.map((col) => col[index])
    );
    if (direction > 0) {
        return rotated.map((row) => row.reverse());
    }
    return rotated.reverse();
}

// テトリミノの落下
function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
    }
    dropCounter = 0;
}

// テトリミノの移動
function playerMove(direction) {
    player.pos.x += direction;
    if (collide(arena, player)) {
        player.pos.x -= direction;
    }
}

// テトリミノのリセット
function playerReset() {
    const tetrimino = tetriminos[Math.floor(Math.random() * tetriminos.length)];
    player.matrix = tetrimino;
    player.pos.y = 0;
    player.pos.x = Math.floor(arena[0].length / 2) - Math.floor(player.matrix[0].length / 2);
    if (collide(arena, player)) {
        arena.forEach((row) => row.fill(0));
    }
}

// テトリミノのマージ
function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

// 行が埋まっているかどうかを確認し、消去する
function arenaSweep() {
    outer: for (let y = arena.length - 1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }
        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;
    }
}

// テトリミノの回転処理
function playerRotate(direction) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, direction);
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -direction);
            player.pos.x = pos;
            return;
        }
    }
}

let dropCounter = 0;
let dropInterval = 1000;

let lastTime = 0;
function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }

    draw();
    requestAnimationFrame(update);
}

const arena = createMatrix(12, 20);

const player = {
    pos: { x: 0, y: 0 },
    matrix: null,
}

document.addEventListener('keydown', (event) => {
    if (event.keyCode === 37) {
        playerMove(-1); // 左へ移動
    } else if (event.keyCode === 39) {
        playerMove(1); // 右へ移動
    } else if (event.keyCode === 40) {
        playerDrop(); // 下へ落下
    } else if (event.keyCode === 38) {
        playerRotate(1); // 右回転
    } else if (event.keyCode === 90) {
        playerRotate(-1); // 左回転
    }
});

playerReset();
update();
