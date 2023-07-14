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

// テトリスの描画
function draw() {
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawMatrix(arena, { x: 0, y: 0 });
    drawMatrix(player.matrix, player.pos);
}

// テトリミノの形状と色の定義
const tetriminos = [
    {
        shape: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
        color: '#FF0D72'
    }, // Iテトリミノ
    {
        shape: [[2, 0, 0], [2, 2, 2], [0, 0, 0]],
        color: '#0DC2FF'
    }, // Jテトリミノ
    {
        shape: [[3, 3], [3, 3]],
        color: '#0DFF72'
    }, // Oテトリミノ
    {
        shape: [[0, 4, 0], [4, 4, 4], [0, 0, 0]],
        color: '#F538FF'
    }, // Tテトリミノ
    {
        shape: [[0, 5, 5], [5, 5, 0], [0, 0, 0]],
        color: '#FF8E0D'
    }, // Lテトリミノ
    {
        shape: [[0, 6, 6], [6, 6, 0], [0, 0, 0]],
        color: '#FFE138'
    }, // Sテトリミノ
    {
        shape: [[7, 7, 0], [0, 7, 7], [0, 0, 0]],
        color: '#3877FF'
    } // Zテトリミノ
];

// テトリミノの生成
function createTetrimino() {
    const randomTetrimino = tetriminos[Math.floor(Math.random() * tetriminos.length)];
    const tetrimino = {
        matrix: randomTetrimino.shape,
        color: randomTetrimino.color,
        pos: { x: 0, y: 0 }
    };
    return tetrimino;
}

// テトリミノの描画
function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = tetrimino.color;
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
                context.strokeStyle = '#333';
                context.lineWidth = 0.05;
                context.strokeRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
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
    tetrimino = createTetrimino();
    player.matrix = tetrimino.matrix;
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
function rotate(matrix, direction) {
    const m = matrix;
    const len = m.length;
    const temp = [...Array(len)].map((_) => Array(len).fill(0));

    for (let i = 0; i < len; ++i) {
        for (let j = 0; j < len; ++j) {
            if (direction === 1) {
                temp[i][j] = m[len - j - 1][i];
            } else {
                temp[i][j] = m[j][len - i - 1];
            }
        }
    }

    return temp;
}

// テトリミノの回転処理
function playerRotate(direction) {
    const pos = player.pos.x;
    let offset = 1;
    const rotated = rotate(player.matrix, direction);
    player.matrix = rotated;

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

let tetrimino = createTetrimino();

const player = {
    matrix: tetrimino.matrix,
    pos: tetrimino.pos
};

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
